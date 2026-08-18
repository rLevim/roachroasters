'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { getLevelForXp } from '@/constants/badges';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { useToastStore } from '@/components/Toast';
import { useI18n } from '@/lib/i18n';
import type { Review } from '@/types/database';

interface ReviewWithProfile extends Review {
  profiles?: { display_name: string; photo_url: string | null };
}

export default function ProfilePage() {
  const { t, lang } = useI18n();
  const dateLocale = lang === 'he' ? 'he-IL' : 'en-US';
  const { profile, updateProfile, fetchProfile } = useAuthStore();
  const userId = useAuthStore((s) => s.user?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [city, setCity] = useState('');
  const [paypalMe, setPaypalMe] = useState('');
  const [notificationRadius, setNotificationRadius] = useState(10);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);

  const addToast = useToastStore((s) => s.addToast);
  const isRoaster = profile?.role === 'roach_roaster';
  const isBugaphobe = profile?.role === 'bugaphobe';

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setSocialLink(profile.social_link || '');
      setCity(profile.city || '');
      setPaypalMe(profile.paypal_me || '');
      setNotificationRadius(profile.notification_radius_km ?? 10);
      setPhotoUrl(profile.photo_url);
    }
  }, [profile]);

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('edit')) {
      setEditing(true);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
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
    })();
  }, [userId]);

  const needsAttention = !profile?.bio || !profile?.photo_url;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_SIZE = 5 * 1024 * 1024;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError(t('prof.errImageType'));
      return;
    }
    if (file.size > MAX_SIZE) {
      setUploadError(t('prof.errImageSize'));
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const EXT_MAP: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
      const ext = EXT_MAP[file.type];
      const filePath = `${userId}.${ext}`;

      const { error: err } = await supabase.storage
        .from('Avatars')
        .upload(filePath, file, { upsert: true });

      if (err) {
        if (err.message.includes('Bucket not found')) {
          setUploadError(t('prof.errBucket'));
        } else {
          setUploadError(err.message);
        }
        return;
      }

      const { data: urlData } = supabase.storage
        .from('Avatars')
        .getPublicUrl(filePath);

      const url = urlData.publicUrl + '?t=' + Date.now();
      setPhotoUrl(url);
      await updateProfile({ photo_url: url });
      addToast(t('prof.photoUpdated'), 'success');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {
        display_name: displayName.trim(),
        bio: bio.trim(),
        social_link: socialLink.trim() || null,
        city: city.trim() || null,
      };
      if (isRoaster) {
        updates.paypal_me = paypalMe.trim() || null;
        updates.notification_radius_km = notificationRadius;
      }
      await updateProfile(updates);
      setEditing(false);
      addToast(t('prof.saved'), 'success');
    } finally {
      setSaving(false);
    }
  };

  const initialized = useAuthStore((s) => s.initialized);

  if (!profile) {
    return (
      <div className="min-h-screen bg-lavender">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          {initialized ? (
            <div className="text-center space-y-4">
              <p className="text-gray-500">{t('prof.loginPrompt')}</p>
              <a
                href="/login?mode=login"
                className="inline-block bg-purple-mid text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-dark transition-colors"
              >
                {t('prof.signIn')}
              </a>
            </div>
          ) : (
            <div className="w-8 h-8 border-4 border-purple-mid/30 border-t-purple-mid rounded-full animate-spin" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lavender">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Prompt to complete profile */}
        {needsAttention && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-4 text-center">
            <p className="text-yellow-800 font-bold text-sm">
              {!profile.photo_url && !profile.bio
                ? t('prof.needPhotoBio')
                : !profile.photo_url
                  ? t('prof.needPhoto')
                  : t('prof.needBio')}
            </p>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-6 text-center space-y-4">
          {/* Photo */}
          <div className="relative inline-block">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 rounded-full mx-auto overflow-hidden bg-purple-light flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity border-4 border-purple-mid"
            >
              {uploading ? (
                <div className="w-8 h-8 border-4 border-purple-mid/30 border-t-purple-mid rounded-full animate-spin" />
              ) : photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-purple-mid">
                  {profile.display_name?.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-coral text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-coral-dark transition-colors shadow-md"
            >
              +
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {uploadError && (
            <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2 text-left">{uploadError}</p>
          )}

          <div>
            <h2 className="text-2xl font-extrabold text-purple-ink">{profile.display_name}</h2>
            <p className="text-sm text-gray-500">
              {isBugaphobe ? t('landing.twoSides.bugaphobes') : getLevelForXp(profile.xp || 0)}
              {profile.city && ` · ${profile.city}`}
            </p>
            {profile.is_verified && (
              <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                {t('prof.verified')}
              </span>
            )}
          </div>

          {/* Trust Stats */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {isRoaster ? (
              <>
                <div className="text-center">
                  <p className="text-xl font-black text-purple-ink">{profile.roaches_killed}</p>
                  <p className="text-[11px] text-gray-500">{t('prof.roasted')}</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-purple-ink">{profile.rating?.toFixed(1) || '0.0'}</p>
                  <p className="text-[11px] text-gray-500">{t('prof.rating')}</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-purple-ink">{profile.total_reviews}</p>
                  <p className="text-[11px] text-gray-500">{t('prof.reviews')}</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-xl font-black text-purple-ink">{profile.bravery_score}</p>
                  <p className="text-[11px] text-gray-500">{t('prof.bravery')}</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-purple-ink">{profile.rating?.toFixed(1) || '0.0'}</p>
                  <p className="text-[11px] text-gray-500">{t('prof.rating')}</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-purple-ink">{profile.total_reviews}</p>
                  <p className="text-[11px] text-gray-500">{t('prof.reviews')}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bio Section */}
        {!editing && (
          <div className="bg-white rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-purple-ink">{t('prof.about')}</h3>
              <button
                onClick={() => setEditing(true)}
                className="text-sm font-semibold text-purple-mid hover:text-purple-dark cursor-pointer"
              >
                {t('prof.edit')}
              </button>
            </div>
            {profile.bio ? (
              <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>
            ) : (
              <p className="text-gray-400 text-sm italic">
                {t('prof.noBio')}
              </p>
            )}

            {isRoaster && (
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">PayPal.me</span>
                  <span className="font-bold text-purple-ink">{profile.paypal_me || t('prof.notSet')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">XP</span>
                  <span className="font-bold text-purple-ink">{profile.xp} XP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('prof.streak')}</span>
                  <span className="font-bold text-purple-ink">{profile.streak_days} {t('prof.days')}</span>
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400">
                {t('prof.memberSince')} {new Date(profile.created_at).toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editing && (
          <div className="bg-white rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-purple-ink">{t('prof.editProfile')}</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('prof.displayName')}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-mid"
                placeholder={t('prof.yourName')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                {t('prof.bioLabel')}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-mid resize-none"
                placeholder={isRoaster ? t('prof.bioPhRoaster') : t('prof.bioPhBug')}
              />
              <p className="text-xs text-gray-400 mt-1">
                {t('prof.bioHint')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('prof.city')}</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-mid"
                placeholder={t('prof.cityPh')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('prof.socialLabel')}</label>
              <input
                type="url"
                value={socialLink}
                onChange={(e) => setSocialLink(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-mid"
                placeholder={t('prof.socialPh')}
              />
              <p className="text-xs text-gray-400 mt-1">
                {t('prof.socialHint')}
              </p>
            </div>

            {isRoaster && (
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">{t('prof.paypalLabel')}</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-mid">
                  <span className="text-sm text-gray-400 pl-4 shrink-0">paypal.me/</span>
                  <input
                    type="text"
                    value={paypalMe}
                    onChange={(e) => setPaypalMe(e.target.value)}
                    className="flex-1 px-1 py-3 text-sm focus:outline-none"
                    placeholder={t('prof.paypalPh')}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {t('prof.paypalHint')}
                </p>
              </div>
            )}

            {isRoaster && (
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  {t('prof.radiusLabel')} — {notificationRadius} km
                </label>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={notificationRadius}
                  onChange={(e) => setNotificationRadius(Number(e.target.value))}
                  className="w-full accent-purple-mid"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 km</span>
                  <span>50 km</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {t('prof.radiusHint')}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                title={t('prof.save')}
                onClick={handleSave}
                variant="primary"
                loading={saving}
                className="flex-1"
              />
              <Button
                title={t('prof.cancel')}
                onClick={() => {
                  setEditing(false);
                  if (profile) {
                    setDisplayName(profile.display_name || '');
                    setBio(profile.bio || '');
                    setCity(profile.city || '');
                    setPaypalMe(profile.paypal_me || '');
                    setNotificationRadius(profile.notification_radius_km ?? 10);
                  }
                }}
                variant="ghost"
                className="flex-1"
              />
            </div>
          </div>
        )}

        {/* Trust & Safety Section */}
        <div className="bg-white rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-purple-ink">{t('prof.trustSafety')}</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`text-lg ${profile.photo_url ? '' : 'opacity-30'}`}>
                {profile.photo_url ? '✓' : '—'}
              </span>
              <span className="text-sm text-gray-700">{t('prof.checkPhoto')}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-lg ${profile.bio ? '' : 'opacity-30'}`}>
                {profile.bio ? '✓' : '—'}
              </span>
              <span className="text-sm text-gray-700">{t('prof.checkBio')}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-lg ${profile.is_verified ? '' : 'opacity-30'}`}>
                {profile.is_verified ? '✓' : '—'}
              </span>
              {profile.is_verified ? (
                <span className="text-sm text-gray-700">{t('prof.checkVerified')}</span>
              ) : (
                <a href="/verify" className="text-sm text-purple-mid font-semibold hover:text-purple-dark">
                  {t('prof.getVerified')}
                </a>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-lg ${(profile.total_reviews || 0) > 0 ? '' : 'opacity-30'}`}>
                {(profile.total_reviews || 0) > 0 ? '✓' : '—'}
              </span>
              <span className="text-sm text-gray-700">{t('prof.checkReviews')}</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-purple-ink">{t('prof.reviewsTitle')} ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm italic">{t('prof.noReviews')}</p>
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
                  <span className="text-sm font-semibold text-purple-ink">{rev.profiles?.display_name || t('prof.user')}</span>
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
                  {new Date(rev.created_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
