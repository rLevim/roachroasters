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
    console.log('[Notif] User loaded:', user.id, 'Permission:', perm);

    loadAndInitOneSignal(user.id);

    if (perm === 'default') {
      setShowBanner(true);
    }
  }, [user, profile]);

  const handleAllow = async () => {
    setShowBanner(false);
    try {
      console.log('[Notif] Requesting permission...');
      const permission = await Notification.requestPermission();
      console.log('[Notif] Permission result:', permission);
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

async function loadAndInitOneSignal(userId: string) {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) {
    console.warn('[Notif] No OneSignal app ID');
    return;
  }

  console.log('[Notif] Loading OneSignal SDK for user:', userId);

  if (navigator.serviceWorker) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        const swUrl = reg.active?.scriptURL || '';
        if (swUrl.includes('sw.js') && !swUrl.includes('OneSignal')) {
          console.log('[Notif] Unregistering old SW:', swUrl);
          await reg.unregister();
        }
      }
      console.log('[Notif] Testing SW registration...');
      const testReg = await navigator.serviceWorker.register('/OneSignalSDKWorker.js', { scope: '/' });
      console.log('[Notif] SW registered:', testReg.active?.scriptURL || testReg.installing?.scriptURL || testReg.waiting?.scriptURL || 'unknown');
      if (testReg.installing) {
        testReg.installing.addEventListener('statechange', (e: any) => {
          console.log('[Notif] SW state:', e.target.state);
        });
      }
    } catch (e) {
      console.error('[Notif] SW registration FAILED:', e);
    }
  }

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      console.log('[Notif] SDK loaded, initializing with appId:', appId);
      const initPromise = OneSignal.init({ appId });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Init timeout after 15s')), 15000));
      await Promise.race([initPromise, timeoutPromise]);
      console.log('[Notif] Initialized. Permission:', OneSignal.Notifications?.permission);
      await OneSignal.login(userId);
      const subId = OneSignal.User?.PushSubscription?.id;
      const token = OneSignal.User?.PushSubscription?.token;
      console.log('[Notif] Login done. SubID:', subId, 'Token:', token ? 'yes' : 'no');
    } catch (err) {
      console.error('[Notif] OneSignal error:', err);
      try {
        const regs = await navigator.serviceWorker?.getRegistrations();
        console.log('[Notif] Current SWs:', regs?.map(r => r.active?.scriptURL || r.installing?.scriptURL));
      } catch {}
    }
  });

  if (!document.getElementById('onesignal-sdk')) {
    const script = document.createElement('script');
    script.id = 'onesignal-sdk';
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.defer = true;
    script.onload = () => console.log('[Notif] SDK script loaded successfully');
    script.onerror = (e) => console.error('[Notif] Failed to load OneSignal SDK script:', e);
    document.head.appendChild(script);
    console.log('[Notif] SDK script tag added to head');
  }
}
