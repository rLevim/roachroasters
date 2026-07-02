import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types/database';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  acceptTerms: () => Promise<void>;
  selectRole: (role: UserRole) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null });

      if (session?.user) {
        await get().fetchProfile();
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null });
        if (session?.user) {
          get().fetchProfile();
        } else {
          set({ profile: null });
        }
      });
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    set({ profile: data as Profile | null });
  },

  updateProfile: async (updates) => {
    const { user, profile } = get();
    if (!user || !profile) return;

    const { data } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single();

    if (data) set({ profile: data as Profile });
  },

  acceptTerms: async () => {
    await get().updateProfile({ terms_accepted_at: new Date().toISOString() } as Partial<Profile>);
  },

  selectRole: async (role) => {
    await get().updateProfile({ role } as Partial<Profile>);
  },

  completeOnboarding: async () => {
    await get().updateProfile({ onboarding_completed: true } as Partial<Profile>);
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },
}));
