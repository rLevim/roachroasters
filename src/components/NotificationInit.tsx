'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
  }
}

export function NotificationInit() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const initialized = useRef(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;
    if (initialized.current) return;
    initialized.current = true;

    const perm = typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied';

    loadAndInitOneSignal(user.id);

    if (perm === 'default') {
      setShowBanner(true);
    }
  }, [user, profile]);

  const handleAllow = async () => {
    setShowBanner(false);
    try {
      const OneSignal = (window as any).OneSignal;
      // Prefer OneSignal's own permission request — it grants permission AND
      // creates the push subscription. The raw Notification API grants browser
      // permission only, leaving the user unsubscribed in OneSignal.
      if (OneSignal?.Notifications?.requestPermission) {
        await OneSignal.Notifications.requestPermission();
        await OneSignal.User.PushSubscription.optIn();
      } else {
        await Notification.requestPermission();
      }
    } catch {
      // permission request unavailable / dismissed — nothing to do
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

async function loadAndInitOneSignal(userId: string) {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) return;

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      await OneSignal.init({ appId });
      await OneSignal.login(userId);
      // Granting OS-level notification permission (via our banner or a prior
      // visit) does NOT by itself create a OneSignal subscription, and
      // autoResubscribe only re-subscribes users who were already subscribed.
      // So when permission is already granted, explicitly opt in to create the
      // push subscription and register its service worker.
      if (OneSignal.Notifications.permission) {
        await OneSignal.User.PushSubscription.optIn();
      }
    } catch (err) {
      console.error('OneSignal init failed:', err);
    }
  });

  if (!document.getElementById('onesignal-sdk')) {
    const script = document.createElement('script');
    script.id = 'onesignal-sdk';
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.defer = true;
    document.head.appendChild(script);
  }
}
