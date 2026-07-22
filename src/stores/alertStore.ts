import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { triggerPushNotification } from '@/lib/notify';
import type { RoachAlert, AlertResponse, Profile } from '@/types/database';

interface AlertWithProfile extends RoachAlert {
  profiles?: Profile;
}

interface ResponseWithProfile extends AlertResponse {
  profiles?: Profile;
}

interface AlertState {
  alerts: AlertWithProfile[];
  currentAlert: AlertWithProfile | null;
  responses: ResponseWithProfile[];
  loading: boolean;

  fetchNearbyAlerts: () => Promise<void>;
  createAlert: (data: { description?: string; photo_url?: string; latitude: number; longitude: number }) => Promise<RoachAlert | null>;
  respondToAlert: (alertId: string, message?: string) => Promise<void>;
  fetchAlertResponses: (alertId: string) => Promise<void>;
  cancelAlert: (alertId: string) => Promise<void>;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  currentAlert: null,
  responses: [],
  loading: false,

  fetchNearbyAlerts: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('roach_alerts')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        set({ alerts: [] });
        return;
      }

      const alerts = (data || []) as RoachAlert[];
      const bugaphobeIds = [...new Set(alerts.map(a => a.bugaphobe_id))];

      let profileMap: Record<string, Profile> = {};
      if (bugaphobeIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', bugaphobeIds);

        if (profiles) {
          for (const p of profiles) {
            profileMap[(p as Profile).user_id] = p as Profile;
          }
        }
      }

      const alertsWithProfiles = alerts.map(a => ({
        ...a,
        profiles: profileMap[a.bugaphobe_id] || undefined,
      }));

      set({ alerts: alertsWithProfiles });
    } finally {
      set({ loading: false });
    }
  },

  createAlert: async ({ description, photo_url, latitude, longitude }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('roach_alerts')
      .insert({
        bugaphobe_id: user.id,
        description,
        photo_url,
        latitude,
        longitude,
        radius_km: 3,
        status: 'open',
      })
      .select()
      .single();

    if (data) {
      triggerPushNotification('roach_alerts', data);
    }

    return data as RoachAlert | null;
  },

  respondToAlert: async (alertId, message) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('alert_responses')
      .insert({
        alert_id: alertId,
        roaster_id: user.id,
        message,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to respond to alert:', error.message);
    } else if (data) {
      triggerPushNotification('alert_responses', data);
    }
  },

  fetchAlertResponses: async (alertId) => {
    const { data: responses, error } = await supabase
      .from('alert_responses')
      .select('*')
      .eq('alert_id', alertId)
      .order('created_at', { ascending: true });

    if (error || !responses) {
      console.error('Failed to fetch alert responses:', error?.message);
      set({ responses: [] });
      return;
    }

    const roasterIds = [...new Set(responses.map(r => r.roaster_id))];
    let profileMap: Record<string, Profile> = {};
    if (roasterIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', roasterIds);

      if (profiles) {
        for (const p of profiles) {
          profileMap[(p as Profile).user_id] = p as Profile;
        }
      }
    }

    const responsesWithProfiles = responses.map(r => ({
      ...r,
      profiles: profileMap[r.roaster_id] || undefined,
    }));

    set({ responses: responsesWithProfiles as ResponseWithProfile[] });
  },

  cancelAlert: async (alertId) => {
    await supabase
      .from('roach_alerts')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', alertId);
  },
}));
