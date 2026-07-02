'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function SplashPage() {
  const router = useRouter();
  const { initialized, session, profile, loading } = useAuthStore();

  useEffect(() => {
    if (!initialized || loading) return;

    if (!session) {
      router.replace('/login');
      return;
    }

    if (!profile) {
      router.replace('/role-select');
      return;
    }

    if (!profile.terms_accepted_at) {
      router.replace('/terms');
      return;
    }

    if (!profile.role) {
      router.replace('/role-select');
      return;
    }

    if (!profile.onboarding_completed) {
      router.replace('/onboarding');
      return;
    }

    router.replace('/home');
  }, [initialized, session, profile, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-deep">
      <div className="text-center">
        <img src="/logo.png" alt="RoachRoasters" className="w-64 h-64 mx-auto object-contain" />
        <div className="mt-4 w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}
