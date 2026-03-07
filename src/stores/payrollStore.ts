import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Payroll, PayrollWithWorker } from '../types/database';
import { startOfDay, endOfDay } from 'date-fns';

interface PayrollState {
  payrolls: PayrollWithWorker[];
  isLoading: boolean;
  error: string | null;
  fetchPayrolls: (startDate?: Date, endDate?: Date) => Promise<void>;
  generatePayroll: (periodStart: Date, periodEnd: Date) => Promise<void>;
  updatePayrollStatus: (id: string, status: 'pending' | 'approved' | 'paid') => Promise<void>;
  clearError: () => void;
}

export const usePayrollStore = create<PayrollState>((set, get) => ({
  payrolls: [],
  isLoading: false,
  error: null,

  fetchPayrolls: async (startDate?: Date, endDate?: Date) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('payroll')
        .select(`
          *,
          worker:workers(*)
        `)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('period_start', startOfDay(startDate).toISOString());
      }
      if (endDate) {
        query = query.lte('period_end', endOfDay(endDate).toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ payrolls: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  generatePayroll: async (periodStart: Date, periodEnd: Date) => {
    set({ isLoading: true, error: null });
    try {
      const { data: workers, error: workersError } = await supabase
        .from('workers')
        .select('*')
        .eq('is_active', true);

      if (workersError) throw workersError;

      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .gte('clock_in', startOfDay(periodStart).toISOString())
        .lte('clock_in', endOfDay(periodEnd).toISOString())
        .in('status', ['clocked_out', 'completed_quota']);

      if (attendanceError) throw attendanceError;

      const payrollRecords: Omit<Payroll, 'id' | 'created_at' | 'updated_at'>[] = [];

      for (const worker of workers || []) {
        const workerAttendance = attendance?.filter((a) => a.worker_id === worker.id) || [];
        
        if (workerAttendance.length === 0) continue;

        const uniqueDays = new Set(
          workerAttendance.map((a) => startOfDay(new Date(a.clock_in)).toISOString())
        );
        const daysWorked = uniqueDays.size;

        const totalHours = workerAttendance.reduce(
          (sum, a) => sum + (a.hours_worked || 0),
          0
        );
        const overtimeHours = workerAttendance.reduce(
          (sum, a) => sum + (a.overtime_hours || 0),
          0
        );

        const grossPay = daysWorked * worker.daily_rate + overtimeHours * worker.hourly_rate;
        const sssDeduction = 0;
        const otherDeductions = 0;
        const netPay = grossPay - sssDeduction - otherDeductions;

        payrollRecords.push({
          worker_id: worker.id,
          period_start: startOfDay(periodStart).toISOString(),
          period_end: endOfDay(periodEnd).toISOString(),
          days_worked: daysWorked,
          total_hours: Math.round(totalHours * 100) / 100,
          overtime_hours: Math.round(overtimeHours * 100) / 100,
          daily_rate: worker.daily_rate,
          hourly_rate: worker.hourly_rate,
          gross_pay: Math.round(grossPay * 100) / 100,
          sss_deduction: sssDeduction,
          other_deductions: otherDeductions,
          net_pay: Math.round(netPay * 100) / 100,
          status: 'pending',
        });
      }

      if (payrollRecords.length > 0) {
        const { data, error } = await supabase
          .from('payroll')
          // @ts-ignore - Supabase type inference issue
          .insert(payrollRecords)
          .select(`
            *,
            worker:workers(*)
          `);

        if (error) throw error;
        set((state) => ({
          payrolls: [...(data || []), ...state.payrolls],
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updatePayrollStatus: async (id: string, status: 'pending' | 'approved' | 'paid') => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('payroll')
        // @ts-ignore - Supabase type inference issue
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          worker:workers(*)
        `)
        .single();

      if (error) throw error;
      set((state) => ({
        payrolls: state.payrolls.map((p) => (p.id === id ? data : p)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
