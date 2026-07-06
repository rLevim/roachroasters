'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/Navbar';
import type { Job } from '@/types/database';

export default function EarningsPage() {
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
        <p className="text-center text-gray-500 py-20">Earnings are only available for Roach Roasters.</p>
      </div>
    );
  }

  const totalEarned = jobs.reduce((sum, j) => sum + (j.price || 0), 0);
  const pendingPayout = totalEarned; // In a real app, subtract already-paid amounts
  const paypalEmail = profile?.paypal_email;

  return (
    <div className="min-h-screen bg-lavender">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold text-purple-ink text-center">Earnings</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-5 text-center">
            <p className="text-3xl font-black text-purple-ink">${totalEarned.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Total Earned</p>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center">
            <p className="text-3xl font-black text-coral">${pendingPayout.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Available Balance</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 text-center">
          <p className="text-lg font-black text-purple-ink">{jobs.length}</p>
          <p className="text-xs text-gray-500">Completed Jobs</p>
        </div>

        {/* PayPal Payout Section */}
        <div className="bg-white rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-purple-ink">Payout Method</h3>
          {paypalEmail ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-purple-light/50 rounded-xl p-4">
                <span className="text-2xl"> </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-purple-ink">PayPal</p>
                  <p className="text-sm text-gray-600">{paypalEmail}</p>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Connected</span>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Payouts are sent to your PayPal at the end of every month. Contact support if you have questions about a payout.
              </p>
              <a
                href="/profile"
                className="block text-center text-sm font-semibold text-purple-mid hover:text-purple-dark"
              >
                Change PayPal email
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 text-center">
                <p className="text-yellow-800 font-bold text-sm">No PayPal email set</p>
                <p className="text-yellow-700 text-xs mt-1">Add your PayPal email to receive payouts for completed jobs.</p>
              </div>
              <a
                href="/profile"
                className="block w-full bg-purple-mid text-white font-bold py-3 rounded-xl text-center hover:bg-purple-dark transition-colors"
              >
                Set Up PayPal in Profile
              </a>
            </div>
          )}
        </div>

        {/* Job History */}
        <div className="bg-white rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-purple-ink">Earnings History</h3>
          {loading ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-3 border-purple-mid/30 border-t-purple-mid rounded-full animate-spin mx-auto" />
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-gray-400 text-sm italic text-center py-4">No completed jobs yet. Start roasting to earn!</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm font-bold shrink-0">
                  $
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-purple-ink">Job completed</p>
                  <p className="text-[11px] text-gray-400">
                    {job.completed_at
                      ? new Date(job.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : new Date(job.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span className="font-black text-green-600 text-sm">+${job.price.toFixed(2)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
