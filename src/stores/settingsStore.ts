import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { auditLog } from '../lib/auditLog';
import type { Settings, Json } from '../types/database';

interface RateSettings {
  defaultDailyRate: number;
  defaultHourlyRate: number;
  overtimeMultiplier: number;
  standardWorkHours: number;
}

interface SettingsState {
  settings: Settings[];
  rateSettings: RateSettings;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSetting: (key: string, value: Json, description?: string) => Promise<void>;
  getRateSettings: () => RateSettings;
  clearError: () => void;
}

const DEFAULT_RATE_SETTINGS: RateSettings = {
  defaultDailyRate: 400,
  defaultHourlyRate: 50,
  overtimeMultiplier: 1.25,
  standardWorkHours: 8,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: [],
  rateSettings: DEFAULT_RATE_SETTINGS,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) throw error;

      const rateSettingsData = data?.find((s) => s.key === 'rate_settings');
      const rateSettings = rateSettingsData
        ? (rateSettingsData.value as unknown as RateSettings)
        : DEFAULT_RATE_SETTINGS;

      set({ settings: data || [], rateSettings, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      set({ error: message, isLoading: false });
    }
  },

  updateSetting: async (key: string, value: Json, description?: string) => {
    set({ isLoading: true, error: null });
    try {
      const existing = get().settings.find((s) => s.key === key);

      if (existing) {
        const { data, error } = await supabase
          .from('settings')
          // @ts-ignore - Supabase type inference issue
          .update({ value, description })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        set((state) => ({
          settings: state.settings.map((s) => (s.id === existing.id ? data : s)),
          isLoading: false,
        }));
      } else {
        const { data, error } = await supabase
          .from('settings')
          // @ts-ignore - Supabase type inference issue
          .insert({ key, value, description })
          .select()
          .single();

        if (error) throw error;
        set((state) => ({
          settings: [...state.settings, data],
          isLoading: false,
        }));
      }

      if (key === 'rate_settings') {
        set({ rateSettings: value as unknown as RateSettings });
      }
      
      // Log settings update
      const oldValue = existing?.value;
      await auditLog.logSettingsUpdate(key, oldValue, value);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      set({ error: message, isLoading: false });
    }
  },

  getRateSettings: () => get().rateSettings,

  clearError: () => set({ error: null }),
}));
