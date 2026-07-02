'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { getLevelForXp } from '@/constants/badges';
import { Navbar } from '@/components/Navbar';
import type { Profile, Review } from '@/types/database';

interface ReviewWithProfile extends Review {
  profiles?: { display_name: string; photo_url: string | null };
}

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const myUserId = useAuthStore((s) => s.user?.id);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      setProfile(data as Profile | null);

      const { data: revData } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', userId)
        .eq('is_removed', false)
        .order('created_at', { ascending: false })
        .limit(20);
      if (revData && revData.length > 0) {
        const reviewerIds = [...new Set(revData.map((r: Review) => r.reviewer_id))];
        const { data: reviewerProfiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, photo_url')
          .in('user_id', reviewerIds);
        const profileMap: Record<string, { display_name: string; photo_url: string | null }> = {};
        if (reviewerProfiles) {
          for (const p of reviewerProfiles) {
            profileMap[p.user_id] = { display_name: p.display_name, photo_url: p.photo_url };
          }
        }
        setReviews(revData.map((r: Review) => ({ ...r, profiles: profileMap[r.reviewer_id] })) as ReviewWithProfile[]);
      }

      setLoading(false);
    })();
  }, [userId]);

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-lavender">
        <Navbar />
        <p className="text-center text-gray-500 py-20">User not found.</p>
      </div>
    );
  }

  const isRoaster = profile.role === 'roach_roaster';
  const isOwnProfile = myUserId === userId;

  return (
    <div className="min-h-screen bg-lavender">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-6 text-center space-y-4">
          <div className="w-28 h-28 rounded-full mx-auto overflow-hidden bg-purple-light flex items-center justify-center border-4 border-purple-mid">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.display_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl text-purple-mid">
                {profile.display_name?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-purple-ink">{profile.display_name}</h2>
            <p className="text-sm text-gray-500">
              {isRoaster ? getLevelForXp(profile.xp || 0) : 'Bugaphobe'}
              {profile.city && ` · ${profile.city}`}
            </p>
            {profile.is_verified && (
              <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                Verified
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {isRoaster ? (
              <>
                <div className="text-center">
                  <p className="text-xl font-black text-purple-ink">{profile.roaches_killed}</p>
                  <p className="text-[11px] text-gray-500">Roasted</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-purple-ink">{profile.rating?.toFixed(1) || '0.0'}</p>
                  <p className="text-[11px] text-gray-500">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-purple-ink">{profile.total_reviews}</p>
                  <p className="text-[11px] text-gray-500">Reviews</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-xl font-black text-purple-ink">{profile.bravery_score}</p>
                  <p className="text-[11px] text-gray-500">Bravery</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-purple-ink">{profile.rating?.toFixed(1) || '0.0'}</p>
                  <p className="text-[11px] text-gray-500">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-purple-ink">{profile.total_reviews}</p>
                  <p className="text-[11px] text-gray-500">Reviews</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-purple-ink">About</h3>
          {profile.bio ? (
            <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>
          ) : (
            <p className="text-gray-400 text-sm italic">This user hasn't written a bio yet.</p>
          )}

          {isRoaster && (
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Price per job</span>
                <span className="font-bold text-purple-ink">{profile.price ? `$${profile.price}` : 'Not set'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">XP</span>
                <span className="font-bold text-purple-ink">{profile.xp} XP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Streak</span>
                <span className="font-bold text-purple-ink">{profile.streak_days} days</span>
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400">
              Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Trust & Safety */}
        <div className="bg-white rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-purple-ink">Trust & Safety</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`text-lg ${profile.photo_url ? '' : 'opacity-30'}`}>
                {profile.photo_url ? '✅' : '⬜'}
              </span>
              <span className="text-sm text-gray-700">Profile photo added</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-lg ${profile.bio ? '' : 'opacity-30'}`}>
                {profile.bio ? '✅' : '⬜'}
              </span>
              <span className="text-sm text-gray-700">Bio written</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-lg ${profile.is_verified ? '' : 'opacity-30'}`}>
                {profile.is_verified ? '✅' : '⬜'}
              </span>
              <span className="text-sm text-gray-700">Identity verified</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-lg ${(profile.total_reviews || 0) > 0 ? '' : 'opacity-30'}`}>
                {(profile.total_reviews || 0) > 0 ? '✅' : '⬜'}
              </span>
              <span className="text-sm text-gray-700">Has reviews from others</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-purple-ink">Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No reviews yet.</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-light flex items-center justify-center text-xs font-bold text-purple-mid overflow-hidden shrink-0">
                    {rev.profiles?.photo_url ? (
                      <img src={rev.profiles.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      rev.profiles?.display_name?.charAt(0).toUpperCase() || '?'
                    )}
                  </div>
                  <span className="text-sm font-semibold text-purple-ink">{rev.profiles?.display_name || 'User'}</span>
                  <div className="flex gap-0.5 ml-auto">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`text-sm ${star <= rev.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                    ))}
                  </div>
                </div>
                {rev.content && (
                  <p className="text-sm text-gray-600 pl-9">{rev.content}</p>
                )}
                <p className="text-[10px] text-gray-400 pl-9">
                  {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))
          )}
        </div>

        {isOwnProfile && (
          <a
            href="/profile"
            className="block text-center text-sm font-semibold text-purple-mid hover:text-purple-dark py-2"
          >
            Edit your profile
          </a>
        )}
      </div>
    </div>
  );
}
