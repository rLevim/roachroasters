'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useJobStore } from '@/stores/jobStore';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { ListSkeleton } from '@/components/Skeleton';
import type { Job, Profile, RoachAlert } from '@/types/database';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-light text-purple-ink',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  disputed: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

export default function ActivityPage() {
  const { myJobs, loading, fetchMyJobs } = useJobStore();
  const userId = useAuthStore((s) => s.user?.id);
  const role = useAuthStore((s) => s.profile?.role);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [myAlerts, setMyAlerts] = useState<RoachAlert[]>([]);
  const [tab, setTab] = useState<'active' | 'past'>('active');

  useEffect(() => { fetchMyJobs(); }, [fetchMyJobs]);

  // A bugaphobe's own alerts that haven't turned into a job yet (open) — plus
  // cancelled ones — otherwise a freshly posted alert wouldn't appear here.
  useEffect(() => {
    if (!userId) return;
    supabase
      .from('roach_alerts')
      .select('*')
      .eq('bugaphobe_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setMyAlerts(data as RoachAlert[]); });
  }, [userId]);

  useEffect(() => {
    if (myJobs.length === 0) return;
    const otherIds = [...new Set(myJobs.map(j =>
      j.bugaphobe_id === userId ? j.roaster_id : j.bugaphobe_id
    ))];
    if (otherIds.length === 0) return;

    supabase
      .from('profiles')
      .select('*')
      .in('user_id', otherIds)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, Profile> = {};
          for (const p of data) map[(p as Profile).user_id] = p as Profile;
          setProfiles(map);
        }
      });
  }, [myJobs, userId]);

  const activeStatuses = ['pending', 'accepted', 'in_progress'];
  const activeJobs = myJobs.filter(j => activeStatuses.includes(j.status));
  const pastJobs = myJobs.filter(j => !activeStatuses.includes(j.status));
  const displayJobs = tab === 'active' ? activeJobs : pastJobs;

  // Open alerts (not yet matched to a job) show as Active; cancelled as Past.
  const openAlerts = myAlerts.filter(a => a.status === 'open');
  const cancelledAlerts = myAlerts.filter(a => a.status === 'cancelled');
  const displayAlerts = tab === 'active' ? openAlerts : cancelledAlerts;
  const activeCount = activeJobs.length + openAlerts.length;
  const pastCount = pastJobs.length + cancelledAlerts.length;

  return (
    <div className="min-h-screen bg-lavender">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold text-purple-ink">Activity</h1>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('active')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              tab === 'active'
                ? 'bg-purple-mid text-white'
                : 'bg-white text-purple-mid border border-purple-mid'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setTab('past')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              tab === 'past'
                ? 'bg-purple-mid text-white'
                : 'bg-white text-purple-mid border border-purple-mid'
            }`}
          >
            Past ({pastCount})
          </button>
        </div>

        {loading ? (
          <ListSkeleton count={3} />
        ) : displayJobs.length === 0 && displayAlerts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3"> </p>
            <p className="text-gray-500">
              {tab === 'active' ? 'No active jobs or alerts right now.' : 'Nothing here yet.'}
            </p>
          </div>
        ) : (
          <>
          {displayAlerts.map((alert) => (
            <Link
              key={alert.id}
              href={`/alerts/${alert.id}`}
              className="block bg-white rounded-2xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-coral flex items-center justify-center text-white text-2xl shrink-0">🚨</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-purple-ink">Your Roach Alert</p>
                  <p className="text-sm text-gray-500 truncate">{alert.description || 'Waiting for a Roaster...'}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${alert.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {alert.status === 'open' ? 'Open' : 'Cancelled'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2 pl-16">
                {new Date(alert.created_at).toLocaleDateString()} · {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </Link>
          ))}
          {displayJobs.map((job) => {
            const otherId = job.bugaphobe_id === userId ? job.roaster_id : job.bugaphobe_id;
            const otherProfile = profiles[otherId];
            const otherName = otherProfile?.display_name || 'User';
            const isRoaster = role === 'roach_roaster';

            return (
              <Link
                key={job.id}
                href={`/chat/${job.id}`}
                className="block bg-white rounded-2xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-mid flex items-center justify-center text-white text-xl font-extrabold shrink-0">
                    {otherName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-purple-ink">{otherName}</p>
                    <p className="text-sm text-gray-500">
                      {isRoaster ? 'Bugaphobe' : 'Roach Roaster'} · ${job.price}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[job.status] || 'bg-gray-100 text-gray-500'}`}>
                    {statusLabels[job.status] || job.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2 pl-16">
                  {new Date(job.created_at).toLocaleDateString()} · {new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </Link>
            );
          })}
          </>
        )}
      </div>
    </div>
  );
}
