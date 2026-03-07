import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { auditLog } from '../lib/auditLog';
import type { Worker } from '../types/database';
import { v4 as uuidv4 } from 'uuid';

interface WorkerInput {
  employee_id: string;
  full_name: string;
  daily_rate: number;
  standard_hours?: number;
  is_active: boolean;
}

interface WorkerState {
  workers: Worker[];
  isLoading: boolean;
  error: string | null;
  fetchWorkers: () => Promise<void>;
  addWorker: (worker: WorkerInput) => Promise<void>;
  updateWorker: (id: string, updates: Partial<Worker>) => Promise<void>;
  deleteWorker: (id: string) => Promise<void>;
  getWorkerByQR: (qrCode: string) => Worker | undefined;
  clearError: () => void;
}

export const useWorkerStore = create<WorkerState>((set, get) => ({
  workers: [],
  isLoading: false,
  error: null,

  fetchWorkers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      set({ workers: data || [], isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      set({ error: message, isLoading: false });
    }
  },

  addWorker: async (worker) => {
    set({ isLoading: true, error: null });
    try {
      const workerId = `WRK-${uuidv4()}`;
      // QR code now includes worker ID, name, and employee ID in JSON format
      const qrData = JSON.stringify({
        id: workerId,
        name: worker.full_name,
        employeeId: worker.employee_id,
      });
      const standardHours = worker.standard_hours || 8;
      const hourlyRate = worker.daily_rate / standardHours;
      
      const { data, error } = await supabase
        .from('workers')
        // @ts-ignore - Supabase type inference issue
        .insert({
          ...worker,
          qr_code: qrData,
          hourly_rate: hourlyRate,
          standard_hours: standardHours,
        })
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ workers: [...state.workers, data], isLoading: false }));
      
      // Log worker creation
      await auditLog.logWorkerCreate({
        id: data.id,
        full_name: data.full_name,
        employee_id: data.employee_id,
        daily_rate: data.daily_rate
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      set({ error: message, isLoading: false });
    }
  },

  updateWorker: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updateData = { ...updates };
      
      // Recalculate hourly rate if daily_rate or standard_hours changed
      if (updates.daily_rate || updates.standard_hours) {
        const currentWorker = get().workers.find(w => w.id === id);
        if (currentWorker) {
          const dailyRate = updates.daily_rate ?? currentWorker.daily_rate;
          const standardHours = updates.standard_hours ?? currentWorker.standard_hours;
          updateData.hourly_rate = dailyRate / standardHours;
        }
      }

      const { data, error } = await supabase
        .from('workers')
        // @ts-ignore - Supabase type inference issue
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const oldWorker = get().workers.find(w => w.id === id);
      set((state) => ({
        workers: state.workers.map((w) => (w.id === id ? data : w)),
        isLoading: false,
      }));
      
      // Log worker update
      if (oldWorker) {
        await auditLog.logWorkerUpdate(
          id,
          data.full_name,
          { daily_rate: oldWorker.daily_rate, full_name: oldWorker.full_name },
          { daily_rate: data.daily_rate, full_name: data.full_name, ...updates }
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      set({ error: message, isLoading: false });
    }
  },

  deleteWorker: async (id) => {
    set({ isLoading: true, error: null });
    const workerToDelete = get().workers.find(w => w.id === id);
    try {
      const { error } = await supabase
        .from('workers')
        // @ts-ignore - Supabase type inference issue
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        workers: state.workers.filter((w) => w.id !== id),
        isLoading: false,
      }));
      
      // Log worker deletion (deactivation)
      if (workerToDelete) {
        await auditLog.logWorkerDelete(id, workerToDelete.full_name);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      set({ error: message, isLoading: false });
    }
  },

  getWorkerByQR: (qrCode) => {
    return get().workers.find((w) => w.qr_code === qrCode);
  },

  clearError: () => set({ error: null }),
}));
