import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useUserStore } from './useUserStore';

interface AuthState {
    session: Session | null;
    user: User | null;
    loading: boolean;
    isGuest: boolean;
    error: string | null;

    // Actions
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    continueAsGuest: () => void;
    clearError: () => void;
    _setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            session: null,
            user: null,
            loading: true,
            isGuest: false,
            error: null,

            _setSession: (session) =>
                set((state) => ({
                    session,
                    user: session?.user ?? null,
                    loading: false,
                    isGuest: session ? false : state.isGuest,
                })),

            signUp: async (email, password) => {
                set({ error: null, loading: true });
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) set({ error: error.message, loading: false });
                // Başarılı olursa onAuthStateChange session'ı set edecek
            },

            signIn: async (email, password) => {
                set({ error: null, loading: true });
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) set({ error: error.message, loading: false });
            },

            signInWithGoogle: async () => {
                set({ error: null, loading: true });
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: globalThis.location.origin,
                    },
                });
                if (error) set({ error: error.message, loading: false });
            },

            signOut: async () => {
                set({ loading: true });
                await supabase.auth.signOut();
                useUserStore.getState().clearAll();
                set({ session: null, user: null, loading: false, isGuest: false });
            },

            continueAsGuest: () => {
                set({ isGuest: true, loading: false });
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'markform-auth-store',
            partialize: (state) => ({ isGuest: state.isGuest }),
        }
    )
);

// Uygulama başladığında session'ı restore et
const { data: { session } } = await supabase.auth.getSession();
useAuthStore.getState()._setSession(session);

// Auth değişikliklerini dinle
supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState()._setSession(session);
});
