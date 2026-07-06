'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { getLevelForXp } from '@/constants/badges';
import { Navbar } from '@/components/Navbar';
import { ListSkeleton } from '@/components/Skeleton';
import type { Profile } from '@/types/database';

type Tab = 'all_time' | 'weekly' | 'bravery';

export default function LeaderboardPage() {
  const userId = useAuthStore((s) => s.user?.id);
  const [tab, setTab] = useState<Tab>('all_time');
  const [roasters, setRoasters] = useState<Profile[]>([]);
  const [bugaphobes, setBugaphobes] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [tab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      if (tab === 'bravery') {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'bugaphobe')
          .order('bravery_score', { ascending: false })
          .limit(50);
        setBugaphobes((data as Profile[]) || []);
      } else {
        let query = supabase
          .from('profiles')
          .select('*')
          .eq('role', 'roach_roaster')
          .limit(50);

        if (tab === 'all_time') {
          query = query.order('roaches_killed', { ascending: false });
        } else {
          query = query.order('streak_days', { ascending: false });
        }

        const { data } = await query;
        setRoasters((data as Profile[]) || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const medals = ['1st', '2nd', '3rd'];

  return (
    <div className="min-h-screen bg-lavender">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold text-purple-ink text-center">Leaderboard</h1>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 gap-1">
          {([
            ['all_time', 'Top Roasters'],
            ['weekly', 'Best Streaks'],
            ['bravery', 'Bravest'],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                tab === key
                  ? 'bg-purple-mid text-white'
                  : 'text-gray-500 hover:text-purple-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <ListSkeleton count={5} />
        ) : tab === 'bravery' ? (
          bugaphobes.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No bugaphobes ranked yet.</p>
          ) : (
            <div className="space-y-2">
              {bugaphobes.map((user, i) => {
                const isMe = user.user_id === userId;
                return (
                  <a
                    key={user.id}
                    href={`/profile/${user.user_id}`}
                    className={`flex items-center gap-3 bg-white rounded-2xl p-4 hover:shadow-md transition-shadow ${
                      isMe ? 'ring-2 ring-purple-mid' : ''
                    }`}
                  >
                    <span className="text-lg font-black text-gray-400 w-8 text-center">
                      {i < 3 ? medals[i] : i + 1}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-purple-light flex items-center justify-center text-purple-mid font-extrabold shrink-0 overflow-hidden">
                      {user.photo_url ? (
                        <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user.display_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-purple-ink text-sm truncate">
                        {user.display_name}
                        {isMe && <span className="text-purple-mid ml-1">(you)</span>}
                      </p>
                      <p className="text-xs text-gray-500">{user.city || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-purple-ink">{user.bravery_score}</p>
                      <p className="text-[10px] text-gray-400">Bravery</p>
                    </div>
                  </a>
                );
              })}
            </div>
          )
        ) : (
          roasters.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No roasters ranked yet.</p>
          ) : (
            <div className="space-y-2">
              {roasters.map((user, i) => {
                const isMe = user.user_id === userId;
                const stat = tab === 'all_time' ? user.roaches_killed : user.streak_days;
                const statLabel = tab === 'all_time' ? 'Roasted' : 'Day Streak';
                return (
                  <a
                    key={user.id}
                    href={`/profile/${user.user_id}`}
                    className={`flex items-center gap-3 bg-white rounded-2xl p-4 hover:shadow-md transition-shadow ${
                      isMe ? 'ring-2 ring-purple-mid' : ''
                    }`}
                  >
                    <span className="text-lg font-black text-gray-400 w-8 text-center">
                      {i < 3 ? medals[i] : i + 1}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-purple-light flex items-center justify-center text-purple-mid font-extrabold shrink-0 overflow-hidden">
                      {user.photo_url ? (
                        <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user.display_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-purple-ink text-sm truncate">
                        {user.display_name}
                        {isMe && <span className="text-purple-mid ml-1">(you)</span>}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getLevelForXp(user.xp || 0)} · {user.city || 'Unknown'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-purple-ink">{stat}</p>
                      <p className="text-[10px] text-gray-400">{statLabel}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
