import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { triggerPushNotification } from '@/lib/notify';
import { getLevelForXp } from '@/constants/badges';
import type { Job, Message } from '@/types/database';

interface JobState {
  currentJob: Job | null;
  messages: Message[];
  myJobs: Job[];
  loading: boolean;

  createJob: (data: {
    alert_id?: string;
    bugaphobe_id: string;
    roaster_id: string;
    price: number;
  }) => Promise<Job | null>;
  fetchJob: (jobId: string) => Promise<void>;
  fetchMyJobs: () => Promise<void>;
  updateJobStatus: (jobId: string, status: Job['status']) => Promise<void>;
  updateMyStatsOnComplete: (role: 'roach_roaster' | 'bugaphobe') => Promise<void>;
  refreshMyReviewStats: () => Promise<void>;
  shareLocation: (jobId: string, lat: number, lng: number) => Promise<void>;
  approveRoast: (jobId: string) => Promise<void>;
  sendMessage: (jobId: string, content: string, type?: Message['message_type'], metadata?: Record<string, unknown>) => Promise<void>;
  fetchMessages: (jobId: string) => Promise<void>;
  subscribeToMessages: (jobId: string) => () => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  currentJob: null,
  messages: [],
  myJobs: [],
  loading: false,

  createJob: async ({ alert_id, bugaphobe_id, roaster_id, price }) => {
    const platformFee = Math.round(price * 0.2 * 100) / 100;
    const totalCharged = price + platformFee;

    const { data } = await supabase
      .from('jobs')
      .insert({
        alert_id,
        bugaphobe_id,
        roaster_id,
        price,
        platform_fee: platformFee,
        total_charged: totalCharged,
        status: 'pending',
      })
      .select()
      .single();

    if (data) {
      set({ currentJob: data as Job });
      if (alert_id) {
        await supabase
          .from('roach_alerts')
          .update({ status: 'matched', updated_at: new Date().toISOString() })
          .eq('id', alert_id);
      }
      // Send automatic system message so roaster sees the chat
      await supabase.from('messages').insert({
        job_id: data.id,
        sender_id: bugaphobe_id,
        content: 'Chat started — discuss the details before accepting the deal.',
        message_type: 'system',
        metadata: null,
      });
    }

    return data as Job | null;
  },

  fetchJob: async (jobId) => {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    set({ currentJob: data as Job | null });
  },

  fetchMyJobs: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('jobs')
        .select('*')
        .or(`bugaphobe_id.eq.${user.id},roaster_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      set({ myJobs: (data as Job[]) || [] });
    } finally {
      set({ loading: false });
    }
  },

  updateJobStatus: async (jobId, status) => {
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === 'completed') updates.completed_at = new Date().toISOString();

    const { data } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();

    if (data) set({ currentJob: data as Job });
  },

  updateMyStatsOnComplete: async (role: 'roach_roaster' | 'bugaphobe') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (role === 'roach_roaster') {
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('roaches_killed, xp, streak_days, last_job_date')
        .eq('user_id', user.id)
        .single();

      if (myProfile) {
        const newKills = (myProfile.roaches_killed || 0) + 1;
        const newXp = (myProfile.xp || 0) + 100;
        const today = new Date().toISOString().split('T')[0];
        const lastDate = myProfile.last_job_date?.split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const newStreak = lastDate === yesterday
          ? (myProfile.streak_days || 0) + 1
          : lastDate === today
            ? myProfile.streak_days || 1
            : 1;

        await supabase
          .from('profiles')
          .update({
            roaches_killed: newKills,
            xp: newXp,
            level: getLevelForXp(newXp),
            streak_days: newStreak,
            last_job_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      }
    } else {
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('bravery_score')
        .eq('user_id', user.id)
        .single();

      if (myProfile) {
        await supabase
          .from('profiles')
          .update({
            bravery_score: (myProfile.bravery_score || 0) + 10,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      }
    }
  },

  refreshMyReviewStats: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: myReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', user.id)
      .eq('is_removed', false);

    if (myReviews) {
      const count = myReviews.length;
      const avg = count > 0
        ? Math.round((myReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / count) * 10) / 10
        : 0;
      await supabase
        .from('profiles')
        .update({ rating: avg, total_reviews: count, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    }
  },

  shareLocation: async (jobId, lat, lng) => {
    const { data } = await supabase
      .from('jobs')
      .update({
        location_lat: lat,
        location_lng: lng,
        location_shared_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .select()
      .single();

    if (data) set({ currentJob: data as Job });

    await get().sendMessage(jobId, 'Location shared', 'location', { lat, lng });
  },

  approveRoast: async (jobId) => {
    await get().updateJobStatus(jobId, 'completed');
  },

  sendMessage: async (jobId, content, type = 'text', metadata = undefined) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: msg } = await supabase.from('messages').insert({
      job_id: jobId,
      sender_id: user.id,
      content,
      message_type: type,
      metadata: metadata || null,
    }).select().single();

    if (msg && type !== 'system') {
      triggerPushNotification('messages', msg);
    }
  },

  fetchMessages: async (jobId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    set({ messages: (data as Message[]) || [] });
  },

  subscribeToMessages: (jobId) => {
    const channel = supabase
      .channel(`job-messages-${jobId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `job_id=eq.${jobId}`,
      }, (payload) => {
        set((state) => ({ messages: [...state.messages, payload.new as Message] }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  },
}));
