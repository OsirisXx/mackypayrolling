import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { auditLog } from '../lib/auditLog';
import type { Attendance, AttendanceWithWorker } from '../types/database';
import { differenceInMinutes, startOfDay, endOfDay } from 'date-fns';
import { isShiftStale, buildAutoTimeoutPayload, isShiftDurationValid } from '../lib/attendanceHelpers';

// Track whether auto-timeout has already run this session
let autoTimeoutRanThisSession = false;

// Track which workers have been auto-clocked out this session
const autoClockOutSessionTracker = new Set<string>();

interface AttendanceState {
  attendanceRecords: AttendanceWithWorker[];
  todayRecords: AttendanceWithWorker[];
  isLoading: boolean;
  error: string | null;
  fetchAttendance: (startDate?: Date, endDate?: Date) => Promise<void>;
  fetchTodayAttendance: () => Promise<void>;
  clockIn: (workerId: string, scannedBy: string) => Promise<Attendance | null>;
  clockOut: (attendanceId: string) => Promise<void>;
  markCompletedByQuota: (attendanceId: string, bagsCompleted: number, notes?: string) => Promise<void>;
  otClockIn: (workerId: string) => Promise<boolean>;
  otClockOut: (workerId: string) => Promise<boolean>;
  getActiveAttendance: (workerId: string) => AttendanceWithWorker | undefined;
  softDeleteAttendance: (attendanceId: string, reason: string) => Promise<void>;
  clearError: () => void;
}

export function mergeAttendanceRecords(
  todayData: AttendanceWithWorker[],
  openData: AttendanceWithWorker[]
): AttendanceWithWorker[] {
  const merged = [...todayData];
  const existingIds = new Set(todayData.map(r => r.id));
  for (const record of openData) {
    if (!existingIds.has(record.id)) {
      merged.push(record);
    }
  }
  return merged;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  attendanceRecords: [],
  todayRecords: [],
  isLoading: false,
  error: null,

  fetchAttendance: async (startDate?: Date, endDate?: Date) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          worker:workers(*)
        `)
        .is('deleted_at', null)
        .order('clock_in', { ascending: false });

      if (startDate) {
        query = query.gte('clock_in', startOfDay(startDate).toISOString());
      }
      if (endDate) {
        query = query.lte('clock_in', endOfDay(endDate).toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ attendanceRecords: data || [], isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      set({ error: message, isLoading: false });
    }
  },

  fetchTodayAttendance: async () => {
    set({ isLoading: true, error: null });
    try {
      const today = new Date();

      // Query 1: Today's records (existing behavior)
      const { data: todayData, error: todayError } = await supabase
        .from('attendance')
        .select(`
          *,
          worker:workers(*)
        `)
        .gte('clock_in', startOfDay(today).toISOString())
        .lte('clock_in', endOfDay(today).toISOString())
        .is('deleted_at', null)
        .order('clock_in', { ascending: false });

      if (todayError) throw todayError;

      // Query 2: Open shifts from any day (catches overnight shifts)
      const { data: openData, error: openError } = await supabase
        .from('attendance')
        .select(`
          *,
          worker:workers(*)
        `)
        .eq('status', 'clocked_in')
        .is('deleted_at', null)
        .order('clock_in', { ascending: false });

      if (openError) throw openError;

      // Auto-close stale open shifts from PREVIOUS days only (not today)
      // Runs once per browser session to avoid repeated closures
      const STALE_SHIFT_THRESHOLD_HOURS = 16;
      if (!autoTimeoutRanThisSession) {
        autoTimeoutRanThisSession = true;

        const now = new Date();
        const todayStart = startOfDay(today);
        const staleRecords = (openData || []).filter(
          (r) => isShiftStale(new Date(r.clock_in), now, todayStart, STALE_SHIFT_THRESHOLD_HOURS)
        );

        if (staleRecords.length > 0) {
          for (const stale of staleRecords) {
            try {
              const clockIn = new Date(stale.clock_in);
              const hasOpenOT = Boolean(stale.ot_clock_in && !stale.ot_clock_out);
              const otClockIn = stale.ot_clock_in ? new Date(stale.ot_clock_in) : null;
              const updatePayload = buildAutoTimeoutPayload(clockIn, stale.notes ?? null, hasOpenOT, otClockIn);

              await supabase
                .from('attendance')
                .update(updatePayload)
                .eq('id', stale.id);
            } catch (err) {
              console.error(`Auto-timeout failed for shift ${stale.id}:`, err);
            }
          }

          // Re-fetch after auto-closing
          const { data: freshOpenData, error: freshOpenError } = await supabase
            .from('attendance')
            .select('*, worker:workers(*)')
            .eq('status', 'clocked_in')
            .is('deleted_at', null)
            .order('clock_in', { ascending: false });

          if (freshOpenError) throw freshOpenError;

          const { data: freshTodayData, error: freshTodayError } = await supabase
            .from('attendance')
            .select('*, worker:workers(*)')
            .gte('clock_in', startOfDay(today).toISOString())
            .lte('clock_in', endOfDay(today).toISOString())
            .is('deleted_at', null)
            .order('clock_in', { ascending: false });

          if (freshTodayError) throw freshTodayError;

          const allRecords = mergeAttendanceRecords(freshTodayData || [], freshOpenData || []);
          set({ todayRecords: allRecords, isLoading: false });
          return;
        }
      }

      // Smart auto clock-out with tiered thresholds
      // Same-day shifts: 16h threshold (960 minutes) - high threshold to only catch "forgot to clock out"
      // Workers who exceed 8h should scan for OT, not get auto-clocked out
      // Overnight shifts: 10h threshold (600 minutes)
      // Excludes shifts with open OT sessions
      const SAME_DAY_THRESHOLD_MINUTES = 960; // 16h for same-day shifts (only catches forgotten clock-outs)
      const OVERNIGHT_THRESHOLD_MINUTES = 600; // 10h for overnight shifts
      const now = new Date();
      const todayStart = startOfDay(today);
      
      const recordsToAutoClockOut = (openData || []).filter((r) => {
        if (r.status !== 'clocked_in') return false;
        
        // Skip if already auto-clocked out this session
        if (autoClockOutSessionTracker.has(r.id)) return false;
        
        const clockIn = new Date(r.clock_in);
        const clockInDay = startOfDay(clockIn);
        const minutesElapsed = differenceInMinutes(now, clockIn);
        
        // Exclude shifts with open OT sessions
        if (r.ot_clock_in && !r.ot_clock_out) return false;
        
        // Same-day shift: 8h15m threshold
        if (clockInDay.getTime() === todayStart.getTime()) {
          return minutesElapsed >= SAME_DAY_THRESHOLD_MINUTES;
        }
        
        // Overnight shift (previous day): 10h threshold
        if (clockInDay.getTime() < todayStart.getTime()) {
          return minutesElapsed >= OVERNIGHT_THRESHOLD_MINUTES;
        }
        
        return false;
      });
      
      // Auto clock-out eligible records
      if (recordsToAutoClockOut.length > 0) {
        for (const record of recordsToAutoClockOut) {
          try {
            const clockIn = new Date(record.clock_in);
            const clockInDay = startOfDay(clockIn);
            const autoClockOut = new Date(clockIn.getTime() + 8 * 60 * 60 * 1000); // 8h after clock-in
            const minutesElapsed = differenceInMinutes(now, clockIn);
            
            // Calculate actual overtime: time past 8 hours
            const otMinutesWorked = Math.max(0, minutesElapsed - 480); // minutes past 8h
            const overtimeHours = Math.round((otMinutesWorked / 60) * 100) / 100;
            
            // If there was an open OT session, calculate OT from ot_clock_in instead
            let finalOT = overtimeHours;
            const updatePayload: Record<string, unknown> = {};
            if (record.ot_clock_in && !record.ot_clock_out) {
              const otClockIn = new Date(record.ot_clock_in);
              const otSessionMinutes = differenceInMinutes(now, otClockIn);
              finalOT = Math.max(0, Math.round((otSessionMinutes / 60) * 100) / 100);
              updatePayload.ot_clock_out = now.toISOString();
            }
            
            const currentNotes = record.notes || '';
            const isSameDay = clockInDay.getTime() === todayStart.getTime();
            const auditNote = isSameDay 
              ? 'Auto-clocked out at 16h (same-day shift - forgot to clock out)'
              : 'Auto-clocked out at 10h (overnight shift)';
            const updatedNotes = currentNotes ? `${currentNotes}\n${auditNote}` : auditNote;
            
            await supabase
              .from('attendance')
              .update({
                clock_out: autoClockOut.toISOString(),
                hours_worked: 8,
                overtime_hours: finalOT,
                status: 'clocked_out',
                notes: updatedNotes,
                ...updatePayload
              })
              .eq('id', record.id);
            
            // Add to session tracker to prevent repeated auto-closures
            autoClockOutSessionTracker.add(record.id);
          } catch (err) {
            console.error(`Smart auto clock-out failed for shift ${record.id}:`, err);
          }
        }
        
        // Re-fetch after auto-closing
        const { data: freshOpenData, error: freshOpenError } = await supabase
          .from('attendance')
          .select('*, worker:workers(*)')
          .eq('status', 'clocked_in')
          .is('deleted_at', null)
          .order('clock_in', { ascending: false });

        if (freshOpenError) throw freshOpenError;

        const { data: freshTodayData, error: freshTodayError } = await supabase
          .from('attendance')
          .select('*, worker:workers(*)')
          .gte('clock_in', startOfDay(today).toISOString())
          .lte('clock_in', endOfDay(today).toISOString())
          .is('deleted_at', null)
          .order('clock_in', { ascending: false });

        if (freshTodayError) throw freshTodayError;

        const allRecords = mergeAttendanceRecords(freshTodayData || [], freshOpenData || []);
        set({ todayRecords: allRecords, isLoading: false });
        return;
      }

      // Merge and deduplicate
      const allRecords = mergeAttendanceRecords(todayData || [], openData || []);

      set({ todayRecords: allRecords, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      set({ error: message, isLoading: false });
    }
  },

  clockIn: async (workerId: string, scannedBy: string) => {
    set({ isLoading: true, error: null });
    try {
      const existingActive = get().todayRecords.find(
        (r) => r.worker_id === workerId && r.status === 'clocked_in'
      );

      if (existingActive) {
        throw new Error('Worker is already clocked in');
      }

      const { data, error } = await supabase
        .from('attendance')
        // @ts-ignore - Supabase type inference issue
        .insert({
          worker_id: workerId,
          clock_in: new Date().toISOString(),
          scanned_by: scannedBy,
          status: 'clocked_in',
        })
        .select(`
          *,
          worker:workers(*)
        `)
        .single();

      if (error) throw error;
      set((state) => ({
        todayRecords: [data, ...state.todayRecords],
        isLoading: false,
      }));
      
      // Log clock in
      const workerName = data.worker?.full_name || 'Unknown';
      await auditLog.logClockIn(workerId, workerName, scannedBy);
      
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  clockOut: async (attendanceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const record = get().todayRecords.find((r) => r.id === attendanceId);
      if (!record) throw new Error('Attendance record not found');

      const clockOut = new Date();
      const clockIn = new Date(record.clock_in);
      const minutesWorked = differenceInMinutes(clockOut, clockIn);

      // Prevent instant clock-out (less than 60 seconds since clock-in)
      const MINIMUM_SHIFT_DURATION_SECONDS = 60;
      if (!isShiftDurationValid(clockIn.getTime(), clockOut.getTime(), MINIMUM_SHIFT_DURATION_SECONDS)) {
        throw new Error('Cannot clock out within 60 seconds of clocking in. Please try again later.');
      }

      const actualHoursWorked = Math.round((minutesWorked / 60) * 100) / 100;
      // 15-minute grace period: if 7h45m+ (7.75h), round up to 8
      const gracedHours = actualHoursWorked >= 7.75 ? Math.max(actualHoursWorked, 8) : actualHoursWorked;
      // Cap regular hours at 8 max - OT requires manager approval via OT scan
      const hoursWorked = Math.min(gracedHours, 8);
      
      // Finalize any open OT session: if ot_clock_in is set but ot_clock_out is not,
      // calculate OT hours from ot_clock_in to now
      let overtimeHours = record.overtime_hours || 0;
      const otUpdate: Record<string, unknown> = {};
      if (record.ot_clock_in && !record.ot_clock_out) {
        // OT session still open — close it and calculate hours
        const otClockIn = new Date(record.ot_clock_in);
        const otMinutes = differenceInMinutes(clockOut, otClockIn);
        const otHours = Math.max(0, Math.round((otMinutes / 60) * 100) / 100);
        overtimeHours = (record.overtime_hours || 0) + otHours;
        otUpdate.ot_clock_out = clockOut.toISOString();
      } else if (record.ot_clock_in && record.ot_clock_out) {
        // OT session already closed — recalculate from stored timestamps
        // to prevent overwriting overtime_hours with 0
        const otClockIn = new Date(record.ot_clock_in);
        const otClockOut = new Date(record.ot_clock_out);
        const otMinutes = differenceInMinutes(otClockOut, otClockIn);
        overtimeHours = Math.max(0, Math.round((otMinutes / 60) * 100) / 100);
      }

      const { data, error } = await supabase
        .from('attendance')
        .update({
          clock_out: clockOut.toISOString(),
          hours_worked: hoursWorked,
          overtime_hours: overtimeHours,
          status: 'clocked_out',
          ...otUpdate,
        })
        .eq('id', attendanceId)
        .select(`
          *,
          worker:workers(*)
        `)
        .single();

      if (error) throw error;
      set((state) => ({
        todayRecords: state.todayRecords.map((r) =>
          r.id === attendanceId ? data : r
        ),
        isLoading: false,
      }));
      
      // Log clock out
      const workerName = data.worker?.full_name || 'Unknown';
      await auditLog.logClockOut(record.worker_id, workerName, hoursWorked, overtimeHours);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      set({ error: message, isLoading: false });
    }
  },

  markCompletedByQuota: async (attendanceId: string, bagsCompleted: number, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const record = get().todayRecords.find((r) => r.id === attendanceId);
      if (!record) throw new Error('Attendance record not found');

      const clockOut = new Date();
      const clockIn = new Date(record.clock_in);
      const minutesWorked = differenceInMinutes(clockOut, clockIn);
      const hoursWorked = Math.round((minutesWorked / 60) * 100) / 100;

      const { data, error } = await supabase
        .from('attendance')
        .update({
          clock_out: clockOut.toISOString(),
          hours_worked: hoursWorked,
          overtime_hours: 0,
          status: 'completed_quota',
          completed_by_quota: true,
          bags_completed: bagsCompleted,
          notes: notes || null,
        })
        .eq('id', attendanceId)
        .select(`
          *,
          worker:workers(*)
        `)
        .single();

      if (error) throw error;
      set((state) => ({
        todayRecords: state.todayRecords.map((r) =>
          r.id === attendanceId ? data : r
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  otClockIn: async (workerId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Find today's attendance record for this worker
      const record = get().todayRecords.find(
        (r) => r.worker_id === workerId && (r.status === 'clocked_in' || r.status === 'clocked_out')
      );

      if (!record) {
        throw new Error('No attendance record found for today. Worker must clock in first.');
      }

      // Check if already in OT
      if (record.ot_clock_in && !record.ot_clock_out) {
        throw new Error('Worker is already clocked in for overtime.');
      }

      // First, update the record
      // @ts-ignore - Supabase type inference issue
      const { error: updateError } = await supabase
        .from('attendance')
        .update({
          ot_clock_in: new Date().toISOString(),
        })
        .eq('id', record.id);

      if (updateError) {
        console.error('OT Clock In update error:', updateError);
        throw new Error(`Failed to start overtime: ${updateError.message}`);
      }

      // Then fetch the updated record with worker data
      const { data, error: fetchError } = await supabase
        .from('attendance')
        .select(`
          *,
          worker:workers(*)
        `)
        .eq('id', record.id)
        .single();

      if (fetchError) {
        console.error('OT Clock In fetch error:', fetchError);
        throw new Error(`Failed to fetch updated record: ${fetchError.message}`);
      }

      set((state) => ({
        todayRecords: state.todayRecords.map((r) =>
          r.id === record.id ? data : r
        ),
        isLoading: false,
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      console.error('OT Clock In error:', message);
      set({ error: message, isLoading: false });
      return false;
    }
  },

  otClockOut: async (workerId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Find today's attendance record with active OT
      const record = get().todayRecords.find(
        (r) => r.worker_id === workerId && r.ot_clock_in && !r.ot_clock_out
      );

      if (!record) {
        throw new Error('No active overtime session found for this worker.');
      }

      const otClockOut = new Date();
      const otClockIn = new Date(record.ot_clock_in!);
      const otMinutes = differenceInMinutes(otClockOut, otClockIn);
      const otHours = Math.round((otMinutes / 60) * 100) / 100;

      // Add to existing overtime hours
      const currentOT = record.overtime_hours || 0;
      const totalOT = currentOT + otHours;

      const { data, error } = await supabase
        .from('attendance')
        .update({
          ot_clock_out: otClockOut.toISOString(),
          overtime_hours: totalOT,
        })
        .eq('id', record.id)
        .select(`
          *,
          worker:workers(*)
        `)
        .single();

      if (error) throw error;

      set((state) => ({
        todayRecords: state.todayRecords.map((r) =>
          r.id === record.id ? data : r
        ),
        isLoading: false,
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  getActiveAttendance: (workerId: string) => {
    return get().todayRecords.find(
      (r) => r.worker_id === workerId && r.status === 'clocked_in'
    );
  },

  softDeleteAttendance: async (attendanceId: string, reason: string) => {
    set({ isLoading: true, error: null });
    try {
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch existing attendance record with worker details
      const { data: existingRecord, error: fetchError } = await supabase
        .from('attendance')
        .select(`
          *,
          worker:workers(*)
        `)
        .eq('id', attendanceId)
        .single();

      if (fetchError) throw fetchError;
      if (!existingRecord) {
        throw new Error('Attendance record not found');
      }

      // Check if record is already deleted
      if (existingRecord.deleted_at) {
        throw new Error('This record has already been deleted');
      }

      // Update record with soft delete fields
      const { error: updateError } = await supabase
        .from('attendance')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user.id,
          deletion_reason: reason.trim()
        })
        .eq('id', attendanceId);

      if (updateError) throw updateError;

      // Log to audit system
      await auditLog.logAttendanceDelete(
        existingRecord.worker_id,
        existingRecord.worker?.full_name || 'Unknown',
        existingRecord.clock_in,
        existingRecord.clock_out,
        reason.trim()
      );

      // Remove deleted record from state
      set((state) => ({
        todayRecords: state.todayRecords.filter((r) => r.id !== attendanceId),
        attendanceRecords: state.attendanceRecords.filter((r) => r.id !== attendanceId),
        isLoading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
