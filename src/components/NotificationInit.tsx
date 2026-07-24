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

    console.log('[Notif] User loaded:', user.id, 'Permission:', typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'N/A');

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
      console.log('[Notif] Requesting permission...');
      const permission = await Notification.requestPermission();
      console.log('[Notif] Permission result:', permission);
      if (permission === 'granted' && user) {
        initOneSignal(user.id);
      }
    } catch (err) {
      console.warn('[Notif] Permission error:', err);
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
        className="bg-white text-coral text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap"
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
  if (!appId) {
    console.warn('[Notif] No OneSignal app ID');
    return;
  }

  console.log('[Notif] Initializing OneSignal for user:', userId);

  import('react-onesignal').then(({ default: OneSignal }) => {
    OneSignal.init({
      appId,
      allowLocalhostAsSecureOrigin: true,
      notifyButton: { enable: false } as any,
    }).then(async () => {
      console.log('[Notif] OneSignal initialized, logging in...');
      await OneSignal.login(userId);
      console.log('[Notif] OneSignal login done. Permission:', OneSignal.Notifications.permission, 'Subscription ID:', OneSignal.User.PushSubscription.id);
    }).catch((err) => {
      if (String(err).includes('already initialized')) {
        console.log('[Notif] OneSignal already initialized, logging in...');
        OneSignal.login(userId);
      } else {
        console.warn('[Notif] OneSignal init error:', err);
      }
    });
  });
}
