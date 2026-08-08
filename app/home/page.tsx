'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useJobStore } from '@/stores/jobStore';
import { useAlertStore } from '@/stores/alertStore';
import { supabase } from '@/lib/supabase';
import { getLevelForXp, getNextLevel } from '@/constants/badges';
import { Navbar } from '@/components/Navbar';
import type { RoachAlert } from '@/types/database';
import { showLocalNotification } from '@/lib/notifications';
import { useI18n } from '@/lib/i18n';

export default function HomePage() {
  const { t } = useI18n();
  const profile = useAuthStore((s) => s.profile);
  const userId = useAuthStore((s) => s.user?.id);
  const isBugaphobe = profile?.role === 'bugaphobe';
  const isRoaster = profile?.role === 'roach_roaster';
  const { myJobs, fetchMyJobs } = useJobStore();
  const { alerts, fetchNearbyAlerts } = useAlertStore();

  const [pendingJobCount, setPendingJobCount] = useState(0);
  const [myAlerts, setMyAlerts] = useState<(RoachAlert & { response_count: number })[]>([]);

  const nextLevel = isRoaster ? getNextLevel(profile?.xp || 0) : null;
  const xpProgress = nextLevel ? ((profile?.xp || 0) / nextLevel.minXp) * 100 : 100;

  const fetchMyAlerts = async () => {
    if (!userId || !isBugaphobe) return;
    const { data } = await supabase
      .from('roach_alerts')
      .select('*')
      .eq('bugaphobe_id', userId)
      .in('status', ['open', 'matched'])
      .order('created_at', { ascending: false });
    if (data) {
      const alertIds = data.map((a: RoachAlert) => a.id);
      if (alertIds.length > 0) {
        const { data: responses } = await supabase
          .from('alert_responses')
          .select('alert_id')
          .in('alert_id', alertIds);
        const countMap: Record<string, number> = {};
        if (responses) {
          for (const r of responses) {
            countMap[r.alert_id] = (countMap[r.alert_id] || 0) + 1;
          }
        }
        setMyAlerts(data.map((a: RoachAlert) => ({ ...a, response_count: countMap[a.id] || 0 })));
      } else {
        setMyAlerts([]);
      }
    }
  };

  useEffect(() => {
    fetchMyJobs();
    if (isRoaster) fetchNearbyAlerts();
    if (isBugaphobe) fetchMyAlerts();

    if (userId && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          supabase.from('profiles').update({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }).eq('user_id', userId).then(() => {});
        },
        () => {}
      );
    }
  }, [isRoaster, isBugaphobe, userId]);

  // Real-time: listen for new alerts and new jobs
  useEffect(() => {
    const channels: ReturnType<typeof supabase.channel>[] = [];

    if (isRoaster) {
      const alertChannel = supabase
        .channel('home-alerts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'roach_alerts' }, (payload) => {
          fetchNearbyAlerts();
          const alert = payload.new as RoachAlert;
          if (alert.bugaphobe_id !== userId) {
            showLocalNotification(
              'New Roach Alert nearby!',
              alert.description || 'A bugaphobe needs your help!',
              `/alerts/${alert.id}`,
            );
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'roach_alerts' }, () => {
          fetchNearbyAlerts();
        })
        .subscribe();
      channels.push(alertChannel);
    }

    if (isBugaphobe) {
      const myAlertChannel = supabase
        .channel('home-my-alerts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'alert_responses' }, () => {
          fetchMyAlerts();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'roach_alerts' }, () => {
          fetchMyAlerts();
        })
        .subscribe();
      channels.push(myAlertChannel);
    }

    if (isBugaphobe && userId) {
      const msgChannel = supabase
        .channel('home-bugaphobe-msgs')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const msg = payload.new as { sender_id: string; content: string; job_id: string; message_type: string };
          if (msg.sender_id !== userId && msg.message_type !== 'system') {
            showLocalNotification(
              'New message from your Roach Roaster',
              msg.content,
              `/chat/${msg.job_id}`,
            );
          }
        })
        .subscribe();
      channels.push(msgChannel);
    }

    const jobChannel = supabase
      .channel('home-jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        fetchMyJobs();
      })
      .subscribe();
    channels.push(jobChannel);

    return () => { channels.forEach(c => supabase.removeChannel(c)); };
  }, [isRoaster]);

  // Count pending jobs (negotiation chats waiting for attention)
  useEffect(() => {
    const pending = myJobs.filter(j =>
      j.status === 'pending' || j.status === 'accepted' || j.status === 'in_progress'
    ).length;
    setPendingJobCount(pending);
  }, [myJobs]);

  const openAlertCount = alerts.length;

  return (
    <div className="min-h-screen bg-lavender">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Welcome Card */}
        <div className="bg-purple-dark rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-black overflow-hidden">
            {profile?.photo_url ? (
              <img src={profile.photo_url} alt={profile.display_name || ''} className="w-full h-full object-cover" />
            ) : (
              (profile?.display_name || '?')[0].toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold text-white">
              {t('home.welcome')} {profile?.display_name || 'there'}!
            </h2>
            <p className="text-purple-light text-sm">
              {isBugaphobe ? t('home.bugaphobe') : getLevelForXp(profile?.xp || 0)}
            </p>
          </div>
          {profile?.is_verified && (
            <span className="bg-coral text-white text-xs font-bold px-3 py-1 rounded-full">Verified</span>
          )}
        </div>

        {/* Roaster: New alerts notification */}
        {isRoaster && openAlertCount > 0 && (
          <Link
            href="/browse"
            className="block bg-coral text-white rounded-2xl p-4 text-center hover:bg-coral-dark transition-colors"
          >
            <p className="text-lg font-extrabold">{openAlertCount} active alert{openAlertCount !== 1 ? 's' : ''} nearby!</p>
            <p className="text-sm text-white/80 mt-1">Tap to view and respond</p>
          </Link>
        )}

        {/* Active jobs notification */}
        {pendingJobCount > 0 && (
          <Link
            href="/activity"
            className="block bg-purple-mid text-white rounded-2xl p-4 text-center hover:bg-purple-dark transition-colors"
          >
            <p className="text-lg font-extrabold">{pendingJobCount} active job{pendingJobCount !== 1 ? 's' : ''}</p>
            <p className="text-sm text-white/80 mt-1">Tap to view conversations</p>
          </Link>
        )}

        {/* Roaster Stats */}
        {isRoaster && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-purple-ink">{profile?.roaches_killed || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Roasted</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-purple-ink">{profile?.streak_days || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Day Streak</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-purple-ink">{profile?.rating?.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-gray-500 mt-1">Rating</p>
            </div>
          </div>
        )}

        {/* XP Progress */}
        {isRoaster && (
          <div className="bg-white rounded-2xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-base font-bold text-purple-ink">{profile?.xp || 0} XP</span>
              {nextLevel && <span className="text-sm text-gray-500">Next: {nextLevel.name}</span>}
            </div>
            <div className="h-2 bg-lavender rounded-full overflow-hidden">
              <div className="h-full bg-purple-mid rounded-full transition-all" style={{ width: `${Math.min(xpProgress, 100)}%` }} />
            </div>
          </div>
        )}

        {/* Bugaphobe Stats */}
        {isBugaphobe && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-purple-ink">{profile?.bravery_score || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{t('home.bravery')}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-purple-ink">{profile?.total_reviews || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{t('home.reviews')}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-purple-ink">{profile?.rating?.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-gray-500 mt-1">{t('home.rating')}</p>
            </div>
          </div>
        )}

        {/* Primary Action */}
        {isBugaphobe && (
          <Link
            href="/alerts/create"
            className="block bg-coral text-white text-center text-lg font-extrabold py-4 rounded-2xl hover:bg-coral-dark transition-colors"
          >
            {t('home.postAlert')}
          </Link>
        )}

        {/* My Alerts (Bugaphobe) */}
        {isBugaphobe && myAlerts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-extrabold text-purple-ink">{t('home.myAlerts')}</h3>
            {myAlerts.map((alert) => (
              <Link
                key={alert.id}
                href={`/alerts/${alert.id}`}
                className="block bg-white rounded-2xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-light/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-purple-ink text-sm">
                      {alert.description || 'Roach Alert'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(alert.created_at).toLocaleDateString()} · {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {alert.response_count > 0 ? (
                      <span className="bg-coral text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        {alert.response_count} response{alert.response_count !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-full">
                        Waiting...
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid gap-3 grid-cols-4">
          <Link href="/leaderboard" className="bg-white rounded-2xl p-4 text-center hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-purple-light/30 flex items-center justify-center mx-auto mb-1">
              <svg className="w-5 h-5 text-purple-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m6 0h6m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v10m6 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4" /></svg>
            </div>
            <span className="text-xs font-semibold text-purple-ink">{t('nav.leaderboard')}</span>
          </Link>
          <Link href="/browse" className="bg-white rounded-2xl p-4 text-center hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-full bg-purple-light/30 flex items-center justify-center mx-auto mb-1">
              <svg className="w-5 h-5 text-purple-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <span className="text-xs font-semibold text-purple-ink">{isBugaphobe ? t('nav.roasters') : t('nav.alerts')}</span>
            {isRoaster && openAlertCount > 0 && (
              <span className="absolute top-2 right-2 bg-coral text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {openAlertCount}
              </span>
            )}
          </Link>
          <Link href="/activity" className="bg-white rounded-2xl p-4 text-center hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-full bg-purple-light/30 flex items-center justify-center mx-auto mb-1">
              <svg className="w-5 h-5 text-purple-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6" /></svg>
            </div>
            <span className="text-xs font-semibold text-purple-ink">My Jobs</span>
            {pendingJobCount > 0 && (
              <span className="absolute top-2 right-2 bg-coral text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {pendingJobCount}
              </span>
            )}
          </Link>
          <Link href="/profile" className="bg-white rounded-2xl p-4 text-center hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-purple-light/30 flex items-center justify-center mx-auto mb-1">
              <svg className="w-5 h-5 text-purple-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            </div>
            <span className="text-xs font-semibold text-purple-ink">{t('nav.profile')}</span>
          </Link>
        </div>

        {/* Support the Platform */}
        <a
          href="https://www.paypal.com/paypalme/rLevim"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-fuchsia-50 border border-fuchsia-200 rounded-2xl p-4 text-center hover:shadow-md transition-shadow"
        >
          <p className="text-sm font-bold text-fuchsia-800">{t('landing.support.title')} {t('landing.support.button')}!</p>
          <p className="text-xs text-fuchsia-600 mt-1">{t('landing.support.desc')}</p>
        </a>
      </div>
    </div>
  );
}
