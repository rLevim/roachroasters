'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useAlertStore } from '@/stores/alertStore';
import { useJobStore } from '@/stores/jobStore';
import { Button } from '@/components/Button';
import { Navbar } from '@/components/Navbar';
import type { RoachAlert, AlertResponse, Profile } from '@/types/database';

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function AlertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const role = useAuthStore((s) => s.profile?.role);
  const { respondToAlert, fetchAlertResponses, responses } = useAlertStore();
  const createJob = useJobStore((s) => s.createJob);

  const [alert, setAlert] = useState<RoachAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(false);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!id) return;
    loadAlert();

    // Real-time subscription for new responses
    const channel = supabase
      .channel(`alert-responses-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alert_responses',
        filter: `alert_id=eq.${id}`,
      }, () => {
        fetchAlertResponses(id);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  useEffect(() => {
    if (role === 'roach_roaster' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, [role]);

  // Check if roaster already responded
  useEffect(() => {
    if (userId && responses.length > 0) {
      const alreadyResponded = responses.some((r) => r.roaster_id === userId);
      if (alreadyResponded) setResponded(true);
    }
  }, [responses, userId]);

  const loadAlert = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('roach_alerts')
        .select('*')
        .eq('id', id)
        .single();
      setAlert(data as RoachAlert | null);
      if (id) await fetchAlertResponses(id);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!id) return;
    setResponding(true);
    try {
      await respondToAlert(id, "I'd be happy to help — let's talk!");
      setResponded(true);
      await fetchAlertResponses(id);
    } finally {
      setResponding(false);
    }
  };

  const handleSelectRoaster = async (roasterId: string, _roasterProfile: Profile | undefined) => {
    const job = await createJob({
      alert_id: id,
      bugaphobe_id: userId!,
      roaster_id: roasterId,
      price: 0,
    });
    if (job) {
      router.push(`/chat/${job.id}`);
    }
  };

  const distanceKm = myLocation && alert?.latitude && alert?.longitude
    ? getDistanceKm(myLocation.lat, myLocation.lng, alert.latitude, alert.longitude)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-lavender">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-mid/30 border-t-purple-mid rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-lavender">
        <Navbar />
        <p className="text-center text-gray-500 py-20">Alert not found.</p>
      </div>
    );
  }

  const isMine = alert.bugaphobe_id === userId;

  return (
    <div className="min-h-screen bg-lavender">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Alert Info */}
        <div className="bg-white rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-4xl"> </span>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-coral">{alert.status.toUpperCase()}</p>
              {alert.description && <p className="text-gray-700 mt-1">{alert.description}</p>}
            </div>
          </div>
          {distanceKm !== null && (
            <p className="text-sm text-purple-mid font-semibold">
              ~{distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`} away from you
            </p>
          )}
          {alert.photo_url && (
            <img src={alert.photo_url} alt="Roach" className="w-full h-48 object-cover rounded-xl" />
          )}
        </div>

        {/* Roaster Respond Button */}
        {role === 'roach_roaster' && !isMine && alert.status === 'open' && (
          responded ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-700 font-bold">You've responded! Waiting for the Bugaphobe to pick you.</p>
            </div>
          ) : (
            <Button title="I'll Roast It!" onClick={handleRespond} variant="coral" size="lg" loading={responding} className="w-full" />
          )
        )}

        {/* Responses (for alert owner) */}
        {isMine && (
          <>
            <h3 className="text-base font-bold text-purple-ink">Responses ({responses.length})</h3>
            {responses.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Waiting for Roach Roasters to respond...</p>
            ) : (
              responses.map((resp: AlertResponse & { profiles?: Profile }) => (
                <div
                  key={resp.id}
                  className="bg-white rounded-2xl p-4 space-y-3"
                >
                  <a href={`/profile/${resp.roaster_id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                    <div className="w-11 h-11 rounded-full bg-purple-mid flex items-center justify-center text-white text-lg font-extrabold shrink-0 overflow-hidden">
                      {resp.profiles?.photo_url ? (
                        <img src={resp.profiles.photo_url} alt={resp.profiles.display_name} className="w-full h-full object-cover" />
                      ) : (
                        resp.profiles?.display_name?.charAt(0) || '?'
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-ink">{resp.profiles?.display_name || 'Roaster'}</span>
                        {resp.profiles?.is_verified && (
                          <span className="text-xs font-bold text-coral bg-coral-light px-2 py-0.5 rounded">Verified</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {resp.profiles?.rating?.toFixed(1) || '0.0'} rating · {resp.profiles?.roaches_killed || 0} roasted
                      </p>
                    </div>
                  </a>
                  {resp.message && <p className="text-sm text-gray-600 italic pl-15">{resp.message}</p>}
                  <button
                    onClick={() => handleSelectRoaster(resp.roaster_id, resp.profiles)}
                    className="w-full bg-coral text-white font-bold py-2.5 rounded-xl hover:bg-coral-dark transition-colors cursor-pointer text-sm"
                  >
                    Select This Roaster
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {/* Cancel */}
        {isMine && alert.status === 'open' && (
          <Button
            title="Cancel Alert"
            onClick={async () => {
              await supabase.from('roach_alerts').update({ status: 'cancelled' }).eq('id', id);
              router.push('/home');
            }}
            variant="ghost"
            size="sm"
            className="w-full"
          />
        )}
      </div>
    </div>
  );
}
