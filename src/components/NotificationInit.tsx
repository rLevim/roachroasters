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

    const perm = typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'N/A';
    console.log('[Notif] User loaded:', user.id, 'Permission:', perm);

    if (perm === 'default') {
      setShowBanner(true);
    }

    if (initialized.current) return;
    initialized.current = true;

    if (perm === 'granted') {
      loadAndInitOneSignal(user.id);
    }
  }, [user, profile]);

  const handleAllow = async () => {
    setShowBanner(false);
    try {
      console.log('[Notif] Requesting permission...');
      const permission = await Notification.requestPermission();
      console.log('[Notif] Permission result:', permission);
      if (permission === 'granted' && user) {
        loadAndInitOneSignal(user.id);
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

function loadAndInitOneSignal(userId: string) {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) {
    console.warn('[Notif] No OneSignal app ID');
    return;
  }

  console.log('[Notif] Loading OneSignal SDK for user:', userId);

  // Load OneSignal Web SDK directly (bypass react-onesignal)
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      console.log('[Notif] SDK loaded, initializing...');
      await OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: true,
      });
      console.log('[Notif] Initialized, logging in...');
      await OneSignal.login(userId);
      console.log('[Notif] Login done. Permission:', OneSignal.Notifications.permission, 'SubID:', OneSignal.User?.PushSubscription?.id);
    } catch (err) {
      console.warn('[Notif] OneSignal error:', err);
    }
  });

  // Add the script tag if not already present
  if (!document.getElementById('onesignal-sdk')) {
    const script = document.createElement('script');
    script.id = 'onesignal-sdk';
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.defer = true;
    script.onerror = () => console.error('[Notif] Failed to load OneSignal SDK script');
    document.head.appendChild(script);
    console.log('[Notif] SDK script tag added');
  }
}
