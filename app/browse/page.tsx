'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useAlertStore } from '@/stores/alertStore';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { ListSkeleton } from '@/components/Skeleton';
import type { Profile, RoachAlert } from '@/types/database';

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export default function BrowsePage() {
  const profile = useAuthStore((s) => s.profile);
  const isBugaphobe = profile?.role === 'bugaphobe';

  return (
    <div className="min-h-screen bg-lavender">
      <Navbar />
      {isBugaphobe ? <BrowseRoasters /> : <BrowseAlerts />}
    </div>
  );
}

function BrowseRoasters() {
  const [roasters, setRoasters] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchRoasters = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'roach_roaster')
        .eq('is_suspended', false)
        .eq('is_banned', false)
        .order('rating', { ascending: false });
      setRoasters((data as Profile[]) || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoasters(); }, [fetchRoasters]);

  const filtered = roasters.filter((r) =>
    !filter || r.display_name.toLowerCase().includes(filter.toLowerCase()) || r.city?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-3">
      <input
        type="text"
        placeholder="Search by name or city..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-purple-mid"
      />

      {loading ? (
        <ListSkeleton count={4} />
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No Roach Roasters found nearby.</p>
      ) : (
        filtered.map((roaster) => (
          <div
            key={roaster.id}
            className="bg-white rounded-2xl p-4"
          >
            <a href={`/profile/${roaster.user_id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-purple-mid flex items-center justify-center text-white text-xl font-extrabold shrink-0 overflow-hidden">
                {roaster.photo_url ? (
                  <img src={roaster.photo_url} alt={roaster.display_name} className="w-full h-full object-cover" />
                ) : (
                  roaster.display_name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-ink">{roaster.display_name}</span>
                  {roaster.is_verified && (
                    <span className="text-xs font-bold text-coral bg-coral-light px-2 py-0.5 rounded">Verified</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{roaster.city || 'Unknown city'}</p>
              </div>
              <span className="bg-purple-mid text-white font-extrabold text-sm px-3 py-1 rounded-full">
                ${roaster.price || '?'}
              </span>
            </a>
            <div className="flex gap-4 mt-2 pl-16 text-sm text-gray-600">
              <span>⭐ {roaster.rating?.toFixed(1) || '0.0'}</span>
              <span>🪳 {roaster.roaches_killed} killed</span>
              <span>📝 {roaster.total_reviews} reviews</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function BrowseAlerts() {
  const { alerts, loading, fetchNearbyAlerts } = useAlertStore();
  const respondToAlert = useAlertStore((s) => s.respondToAlert);
  const userId = useAuthStore((s) => s.user?.id);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [respondedIds, setRespondedIds] = useState<Set<string>>(new Set());
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [alertJobMap, setAlertJobMap] = useState<Record<string, string>>({});

  const fetchMyAlertJobs = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('jobs')
      .select('id, alert_id, status')
      .eq('roaster_id', userId)
      .in('status', ['pending', 'accepted', 'in_progress']);
    if (data) {
      const map: Record<string, string> = {};
      for (const job of data) {
        if (job.alert_id) map[job.alert_id] = job.id;
      }
      setAlertJobMap(map);
    }
  };

  useEffect(() => {
    fetchNearbyAlerts();
    fetchMyAlertJobs();

    const channel = supabase
      .channel('browse-alerts')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'roach_alerts',
      }, () => { fetchNearbyAlerts(); })
      .subscribe();

    const jobChannel = supabase
      .channel('browse-jobs')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'jobs',
      }, () => { fetchMyAlertJobs(); })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(jobChannel);
    };
  }, [fetchNearbyAlerts, userId]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const handleRespond = async (alertId: string) => {
    setRespondingId(alertId);
    try {
      await respondToAlert(alertId, "I'd be happy to help — let's talk!");
      setRespondedIds((prev) => new Set(prev).add(alertId));
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-3">
      <h2 className="text-xl font-extrabold text-purple-ink">Nearby Roach Alerts</h2>

      {loading ? (
        <ListSkeleton count={4} />
      ) : alerts.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No active Roach Alerts nearby. Check back soon!</p>
      ) : (
        alerts.map((alert: RoachAlert & { profiles?: Profile }) => {
          const distanceKm = myLocation && alert.latitude && alert.longitude
            ? getDistanceKm(myLocation.lat, myLocation.lng, alert.latitude, alert.longitude)
            : null;
          const hasResponded = respondedIds.has(alert.id);
          const activeJobId = alertJobMap[alert.id];

          return (
            <div key={alert.id} className="bg-white rounded-2xl p-4 space-y-3">
              <Link href={`/alerts/${alert.id}`} className="flex items-center gap-4">
                <span className="text-4xl">🪳</span>
                <div className="flex-1">
                  <p className="font-bold text-purple-ink">{alert.profiles?.display_name || 'A Bugaphobe'}</p>
                  <p className="text-sm text-gray-500">{alert.description || 'Needs help with a roach!'}</p>
                  {distanceKm !== null && (
                    <p className="text-sm text-purple-mid font-semibold mt-1">📍 ~{formatDistance(distanceKm)} away</p>
                  )}
                </div>
                <span className="bg-coral text-white font-extrabold text-sm px-3 py-1 rounded-full">OPEN</span>
              </Link>
              {activeJobId ? (
                <Link
                  href={`/chat/${activeJobId}`}
                  className="block w-full bg-purple-mid text-white font-extrabold py-3 rounded-xl text-center hover:bg-purple-dark transition-colors"
                >
                  💬 Go to Chat
                </Link>
              ) : hasResponded ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-green-700 font-bold text-sm">You've responded! Waiting to be picked.</p>
                </div>
              ) : (
                <button
                  onClick={() => handleRespond(alert.id)}
                  disabled={respondingId === alert.id}
                  className="w-full bg-coral text-white font-extrabold py-3 rounded-xl hover:bg-coral-dark transition-colors cursor-pointer disabled:opacity-50"
                >
                  {respondingId === alert.id ? (
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "🔥 I'll Roast It!"
                  )}
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
