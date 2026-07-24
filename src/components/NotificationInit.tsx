'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function NotificationInit() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const initialized = useRef(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      setShowBanner(true);
    }

    if (initialized.current) return;
    initialized.current = true;

    initOneSignal(user.id);
  }, [user, profile]);

  const handleAllow = async () => {
    setShowBanner(false);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted' && user) {
        initOneSignal(user.id);
      }
    } catch (err) {
      console.warn('Notification permission error:', err);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="sticky top-0 left-0 right-0 z-[60] bg-coral text-white p-3 flex items-center justify-between gap-3 shadow-lg">
      <p className="text-sm font-semibold flex-1">
        Enable notifications to get alerts when a roaster is nearby or someone messages you.
      </p>
      <button
        onClick={handleAllow}
        className="bg-coral text-white text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap hover:bg-coral-dark transition-colors"
      >
        Allow
      </button>
      <button
        onClick={() => setShowBanner(false)}
        className="text-white/60 hover:text-white text-lg leading-none"
      >
        ✕
      </button>
    </div>
  );
}

function initOneSignal(userId: string) {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) return;

  import('react-onesignal').then(({ default: OneSignal }) => {
    OneSignal.init({
      appId,
      allowLocalhostAsSecureOrigin: true,
      notifyButton: { enable: false } as any,
    }).then(() => {
      OneSignal.login(userId);
    }).catch((err) => {
      if (!String(err).includes('already initialized')) {
        console.warn('OneSignal init error:', err);
      }
    });
  });
}
