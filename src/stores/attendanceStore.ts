import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { auditLog } from '../lib/auditLog';
import type { Attendance, AttendanceWithWorker } from '../types/database';
import { differenceInMinutes, startOfDay, endOfDay } from 'date-fns';

// Track whether auto-timeout has already run this session
let autoTimeoutRanThisSession = false;

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
        .order('clock_in', { ascending: false });

      if (openError) throw openError;

      // Auto-close stale open shifts from PREVIOUS days only (not today)
      // Runs once per browser session to avoid repeated closures
      if (!autoTimeoutRanThisSession) {
        autoTimeoutRanThisSession = true;

        const todayStart = startOfDay(today);
        const staleRecords = (openData || []).filter(
          (r) => new Date(r.clock_in) < todayStart
        );

        if (staleRecords.length > 0) {
          for (const stale of staleRecords) {
            const clockIn = new Date(stale.clock_in);
            // Set clock_out to 8 hours after clock_in
            const autoClockOut = new Date(clockIn.getTime() + 8 * 60 * 60 * 1000);

            const updatePayload: Record<string, unknown> = {
              clock_out: autoClockOut.toISOString(),
              hours_worked: 8,
              overtime_hours: stale.overtime_hours || 0,
              status: 'clocked_out',
              notes: `Auto-timed out (forgot to clock out)${stale.notes ? ' | ' + stale.notes : ''}`,
            };

            // Close any dangling OT session too
            if (stale.ot_clock_in && !stale.ot_clock_out) {
              updatePayload.ot_clock_out = autoClockOut.toISOString();
            }

            await supabase
              .from('attendance')
              .update(updatePayload)
              .eq('id', stale.id);
          }

          // Re-fetch after auto-closing
          const { data: freshOpenData, error: freshOpenError } = await supabase
            .from('attendance')
            .select('*, worker:workers(*)')
            .eq('status', 'clocked_in')
            .order('clock_in', { ascending: false });

          if (freshOpenError) throw freshOpenError;

          const { data: freshTodayData, error: freshTodayError } = await supabase
            .from('attendance')
            .select('*, worker:workers(*)')
            .gte('clock_in', startOfDay(today).toISOString())
            .lte('clock_in', endOfDay(today).toISOString())
            .order('clock_in', { ascending: false });

          if (freshTodayError) throw freshTodayError;

          const allRecords = mergeAttendanceRecords(freshTodayData || [], freshOpenData || []);
          set({ todayRecords: allRecords, isLoading: false });
          return;
        }
      }

      // Merge and deduplicate
      const allRecords = mergeAttendanceRecords(todayData || [], openData || []);

      // Auto clock-out shifts open for 8h15m+ (today's records)
      const now = new Date();
      const autoCloseThresholdMinutes = 8 * 60 + 15; // 8 hours 15 minutes
      const overdueRecords = allRecords.filter(
        (r) => r.status === 'clocked_in' && differenceInMinutes(now, new Date(r.clock_in)) >= autoCloseThresholdMinutes
      );

      if (overdueRecords.length > 0) {
        for (const overdue of overdueRecords) {
          const clockIn = new Date(overdue.clock_in);
          const autoClockOut = new Date(clockIn.getTime() + 8 * 60 * 60 * 1000);

          const updatePayload: Record<string, unknown> = {
            clock_out: autoClockOut.toISOString(),
            hours_worked: 8,
            overtime_hours: overdue.overtime_hours || 0,
            status: 'clocked_out',
            notes: `Auto clock-out (8h15m limit)${overdue.notes ? ' | ' + overdue.notes : ''}`,
          };

          if (overdue.ot_clock_in && !overdue.ot_clock_out) {
            updatePayload.ot_clock_out = autoClockOut.toISOString();
          }

          await supabase
            .from('attendance')
            .update(updatePayload)
            .eq('id', overdue.id);
        }

        // Re-fetch after auto-closing
        const { data: refreshedToday, error: refreshTodayErr } = await supabase
          .from('attendance')
          .select('*, worker:workers(*)')
          .gte('clock_in', startOfDay(today).toISOString())
          .lte('clock_in', endOfDay(today).toISOString())
          .order('clock_in', { ascending: false });

        if (refreshTodayErr) throw refreshTodayErr;

        const { data: refreshedOpen, error: refreshOpenErr } = await supabase
          .from('attendance')
          .select('*, worker:workers(*)')
          .eq('status', 'clocked_in')
          .order('clock_in', { ascending: false });

        if (refreshOpenErr) throw refreshOpenErr;

        set({ todayRecords: mergeAttendanceRecords(refreshedToday || [], refreshedOpen || []), isLoading: false });
        return;
      }

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
      const actualHoursWorked = Math.round((minutesWorked / 60) * 100) / 100;
      // 15-minute grace period: if 7h45m+ (7.75h), round up to 8
      const gracedHours = actualHoursWorked >= 7.75 ? Math.max(actualHoursWorked, 8) : actualHoursWorked;
      // Cap regular hours at 8 max - OT requires manager approval via OT scan
      const hoursWorked = Math.min(gracedHours, 8);
      // OT is NOT automatically calculated - manager must use OT scan mode
      const overtimeHours = record.overtime_hours || 0;

      const { data, error } = await supabase
        .from('attendance')
        .update({
          clock_out: clockOut.toISOString(),
          hours_worked: hoursWorked,
          overtime_hours: overtimeHours,
          status: 'clocked_out',
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

  clearError: () => set({ error: null }),
}));
