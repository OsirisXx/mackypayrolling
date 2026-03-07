export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'manager';
          full_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: 'admin' | 'manager';
          full_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'manager';
          full_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      workers: {
        Row: {
          id: string;
          employee_id: string;
          full_name: string;
          daily_rate: number;
          hourly_rate: number;
          standard_hours: number;
          qr_code: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          full_name: string;
          daily_rate: number;
          hourly_rate?: number;
          standard_hours?: number;
          qr_code?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          full_name?: string;
          daily_rate?: number;
          hourly_rate?: number;
          standard_hours?: number;
          qr_code?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          worker_id: string;
          clock_in: string;
          clock_out: string | null;
          hours_worked: number | null;
          overtime_hours: number | null;
          ot_clock_in: string | null;
          ot_clock_out: string | null;
          status: 'clocked_in' | 'clocked_out' | 'completed_quota';
          completed_by_quota: boolean;
          bags_completed: number | null;
          notes: string | null;
          scanned_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          clock_in: string;
          clock_out?: string | null;
          hours_worked?: number | null;
          overtime_hours?: number | null;
          ot_clock_in?: string | null;
          ot_clock_out?: string | null;
          status?: 'clocked_in' | 'clocked_out' | 'completed_quota';
          completed_by_quota?: boolean;
          bags_completed?: number | null;
          notes?: string | null;
          scanned_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          clock_in?: string;
          clock_out?: string | null;
          hours_worked?: number | null;
          overtime_hours?: number | null;
          ot_clock_in?: string | null;
          ot_clock_out?: string | null;
          status?: 'clocked_in' | 'clocked_out' | 'completed_quota';
          completed_by_quota?: boolean;
          bags_completed?: number | null;
          notes?: string | null;
          scanned_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      payroll: {
        Row: {
          id: string;
          worker_id: string;
          period_start: string;
          period_end: string;
          days_worked: number;
          total_hours: number;
          overtime_hours: number;
          daily_rate: number;
          hourly_rate: number;
          gross_pay: number;
          sss_deduction: number;
          other_deductions: number;
          net_pay: number;
          status: 'pending' | 'approved' | 'paid';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          period_start: string;
          period_end: string;
          days_worked: number;
          total_hours: number;
          overtime_hours?: number;
          daily_rate: number;
          hourly_rate: number;
          gross_pay: number;
          sss_deduction?: number;
          other_deductions?: number;
          net_pay: number;
          status?: 'pending' | 'approved' | 'paid';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          period_start?: string;
          period_end?: string;
          days_worked?: number;
          total_hours?: number;
          overtime_hours?: number;
          daily_rate?: number;
          hourly_rate?: number;
          gross_pay?: number;
          sss_deduction?: number;
          other_deductions?: number;
          net_pay?: number;
          status?: 'pending' | 'approved' | 'paid';
          created_at?: string;
          updated_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payroll_adjustments: {
        Row: {
          id: string;
          worker_id: string;
          period_start: string;
          period_end: string;
          days_override: number | null;
          ot_override: number | null;
          daily_rate_override: number | null;
          bonus: number;
          sss_deduction: number;
          deduction: number;
          deduction_remarks: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          period_start: string;
          period_end: string;
          days_override?: number | null;
          ot_override?: number | null;
          daily_rate_override?: number | null;
          bonus?: number;
          sss_deduction?: number;
          deduction?: number;
          deduction_remarks?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          period_start?: string;
          period_end?: string;
          days_override?: number | null;
          ot_override?: number | null;
          daily_rate_override?: number | null;
          bonus?: number;
          sss_deduction?: number;
          deduction?: number;
          deduction_remarks?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      worker_rates: {
        Row: {
          id: string;
          worker_id: string;
          daily_rate: number;
          hourly_rate: number;
          standard_hours: number;
          effective_date: string;
          created_by: string | null;
          created_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          worker_id: string;
          daily_rate: number;
          hourly_rate: number;
          standard_hours?: number;
          effective_date: string;
          created_by?: string | null;
          created_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          worker_id?: string;
          daily_rate?: number;
          hourly_rate?: number;
          standard_hours?: number;
          effective_date?: string;
          created_by?: string | null;
          created_at?: string;
          notes?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          user_email: string | null;
          user_role: string | null;
          action: string;
          category: string;
          entity_type: string | null;
          entity_id: string | null;
          entity_name: string | null;
          description: string;
          old_values: Json | null;
          new_values: Json | null;
          metadata: Json | null;
          created_at: string;
          severity: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_email?: string | null;
          user_role?: string | null;
          action: string;
          category: string;
          entity_type?: string | null;
          entity_id?: string | null;
          entity_name?: string | null;
          description: string;
          old_values?: Json | null;
          new_values?: Json | null;
          metadata?: Json | null;
          created_at?: string;
          severity?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          user_email?: string | null;
          user_role?: string | null;
          action?: string;
          category?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          entity_name?: string | null;
          description?: string;
          old_values?: Json | null;
          new_values?: Json | null;
          metadata?: Json | null;
          created_at?: string;
          severity?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Worker = Database['public']['Tables']['workers']['Row'];
export type Attendance = Database['public']['Tables']['attendance']['Row'];
export type Payroll = Database['public']['Tables']['payroll']['Row'];
export type Settings = Database['public']['Tables']['settings']['Row'];

export type AttendanceWithWorker = Attendance & {
  worker: Worker;
};

export type PayrollWithWorker = Payroll & {
  worker: Worker;
};
