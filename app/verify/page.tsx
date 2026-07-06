'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';

export default function VerifyPage() {
  const profile = useAuthStore((s) => s.profile);
  const userId = useAuthStore((s) => s.user?.id);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const initialized = useAuthStore((s) => s.initialized);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    setError(null);

    try {
      const ext = file.name.split('.').pop();
      const filePath = `verification/${userId}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('Avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadErr) {
        setError(uploadErr.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('Avatars')
        .getPublicUrl(filePath);

      await supabase
        .from('profiles')
        .update({
          verification_photo_url: urlData.publicUrl,
          verification_status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      setSubmitted(true);
      await fetchProfile();
    } finally {
      setUploading(false);
    }
  };

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

  if (profile?.is_verified) {
    return (
      <div className="min-h-screen bg-lavender">
        <Navbar />
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="bg-white rounded-2xl p-8 text-center space-y-4">
            <span className="text-6xl block"> </span>
            <h2 className="text-2xl font-extrabold text-purple-ink">You are verified!</h2>
            <p className="text-gray-500 text-sm">Your identity has been confirmed. A verified badge appears on your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lavender">
      <Navbar />
      <div className="max-w-md mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold text-purple-ink text-center">Verify Your Identity</h1>

        <div className="bg-white rounded-2xl p-6 space-y-4">
          <div className="text-center space-y-2">
            <span className="text-5xl block"> </span>
            <p className="text-sm text-gray-600">
              Upload a clear photo of a government-issued ID (passport, driver license, or national ID).
              This helps build trust and shows others you are who you say you are.
            </p>
          </div>

          <div className="bg-purple-light/30 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-purple-ink">Requirements:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>- Photo must be clear and well-lit</li>
              <li>- All four corners of the ID must be visible</li>
              <li>- Name on ID must match your display name</li>
              <li>- We only use this for verification and never share it</li>
            </ul>
          </div>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center space-y-2">
              <span className="text-3xl block"> </span>
              <p className="text-green-700 font-bold">Verification submitted!</p>
              <p className="text-green-600 text-sm">We will review your ID and update your profile within 24 hours.</p>
            </div>
          ) : (
            <>
              {previewUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <img src={previewUrl} alt="ID Preview" className="w-full h-48 object-cover" />
                </div>
              )}

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleUpload}
                className="hidden"
              />

              <Button
                title={uploading ? 'Uploading...' : 'Upload ID Photo'}
                onClick={() => fileInputRef.current?.click()}
                variant="coral"
                size="lg"
                loading={uploading}
                className="w-full"
              />
            </>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center px-4">
          Your ID photo is stored securely and only accessible to our verification team.
          It will be deleted after review.
        </p>
      </div>
    </div>
  );
}
