'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/Navbar';
import { useI18n } from '@/lib/i18n';
import type { Job } from '@/types/database';

export default function EarningsPage() {
  const { t, lang } = useI18n();
  const dateLocale = lang === 'he' ? 'he-IL' : 'en-US';
  const userId = useAuthStore((s) => s.user?.id);
  const profile = useAuthStore((s) => s.profile);
  const initialized = useAuthStore((s) => s.initialized);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('roaster_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });
      setJobs((data as Job[]) || []);
      setLoading(false);
    })();
  }, [userId]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-lavender">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-mid/30 border-t-purple-mid rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (profile?.role !== 'roach_roaster') {
    return (
      <div className="min-h-screen bg-lavender">
        <Navbar />
        <p className="text-center text-gray-500 py-20">{t('earn.onlyRoasters')}</p>
      </div>
    );
  }

  const paypalMe = profile?.paypal_me;

  return (
    <div className="min-h-screen bg-lavender">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold text-purple-ink text-center">{t('earn.myStats')}</h1>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-purple-ink">{jobs.length}</p>
            <p className="text-xs text-gray-500 mt-1">{t('earn.jobsDone')}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-purple-ink">{profile.roaches_killed}</p>
            <p className="text-xs text-gray-500 mt-1">{t('earn.roasted')}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-coral">{profile.xp}</p>
            <p className="text-xs text-gray-500 mt-1">XP</p>
          </div>
        </div>

        {/* PayPal Tip Link */}
        <div className="bg-white rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-purple-ink">{t('earn.coffeeLink')}</h3>
          {paypalMe ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-fuchsia-50 rounded-xl p-4">
                <span className="text-2xl">☕</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-purple-ink">PayPal.me</p>
                  <p className="text-sm text-gray-600">paypal.me/{paypalMe}</p>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">{t('earn.active')}</span>
              </div>
              <p className="text-xs text-gray-500 text-center">
                {t('earn.coffeeHint')}
              </p>
              <a
                href="/profile"
                className="block text-center text-sm font-semibold text-purple-mid hover:text-purple-dark"
              >
                {t('earn.changePaypal')}
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-fuchsia-50 border border-fuchsia-300 rounded-xl p-4 text-center">
                <p className="text-fuchsia-800 font-bold text-sm">{t('earn.noPaypal')}</p>
                <p className="text-fuchsia-700 text-xs mt-1">{t('earn.noPaypalHint')}</p>
              </div>
              <a
                href="/profile"
                className="block w-full bg-purple-mid text-white font-bold py-3 rounded-xl text-center hover:bg-purple-dark transition-colors"
              >
                {t('earn.setupPaypal')}
              </a>
            </div>
          )}
        </div>

        {/* Job History */}
        <div className="bg-white rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-purple-ink">{t('earn.completedJobs')}</h3>
          {loading ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-3 border-purple-mid/30 border-t-purple-mid rounded-full animate-spin mx-auto" />
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-gray-400 text-sm italic text-center py-4">{t('earn.noJobs')}</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-purple-ink">{t('earn.roachEliminated')}</p>
                  <p className="text-[11px] text-gray-400">
                    {job.completed_at
                      ? new Date(job.completed_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })
                      : new Date(job.updated_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span className="font-bold text-purple-ink text-xs bg-purple-light/50 px-2 py-1 rounded-full">+XP</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
