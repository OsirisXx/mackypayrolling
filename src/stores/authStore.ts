import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { auditLog } from '../lib/auditLog';
import type { User } from '../types/database';

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      error: null,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (userError) throw userError;

          set({ user: userData, session: data.session, isLoading: false });
          
          // Log successful login
          await auditLog.logLogin(email, true);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'An error occurred';
          set({ error: message, isLoading: false });
          
          // Log failed login attempt
          await auditLog.logLogin(email, false);
        }
      },

      signOut: async () => {
        const currentUser = get().user;
        set({ isLoading: true });
        try {
          // Log logout before clearing session
          if (currentUser?.email) {
            await auditLog.logLogout(currentUser.email);
          }
          
          await supabase.auth.signOut();
          set({ user: null, session: null, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'An error occurred';
          set({ error: message, isLoading: false });
        }
      },

      checkSession: async () => {
        set({ isLoading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            set({ user: userData, session, isLoading: false });
          } else {
            set({ user: null, session: null, isLoading: false });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'An error occurred';
          set({ error: message, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ session: state.session, user: state.user }),
    }
  )
);
