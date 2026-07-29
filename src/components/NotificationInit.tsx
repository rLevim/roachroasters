'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// Register our own service worker, create (or reuse) a push subscription, and
// persist it to Supabase so the server can send Web Push notifications later.
export async function subscribeToPush(): Promise<void> {
  if (!VAPID_PUBLIC) return;
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
  if (Notification.permission !== 'granted') return;

  const appServerKey = urlBase64ToUint8Array(VAPID_PUBLIC) as BufferSource;

  // Clear any prior push state that could block a fresh subscription: the old
  // OneSignal worker AND its push subscription. A lingering subscription made
  // with a different VAPID key makes Chrome throw "Registration failed - push
  // service error", so we must unsubscribe it (not just unregister the worker).
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) {
      const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || '';
      if (!url.includes('/sw.js')) {
        try {
          const old = await r.pushManager.getSubscription();
          if (old) await old.unsubscribe();
        } catch {
          // best-effort
        }
        try { await r.unregister(); } catch { /* best-effort */ }
      }
    }
  } catch {
    // best-effort
  }

  const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;

  const doSubscribe = async () => {
    const existing = await reg.pushManager.getSubscription();
    if (existing) await existing.unsubscribe(); // drop any stale / wrong-key sub
    return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: appServerKey });
  };

  let sub: PushSubscription;
  try {
    sub = await doSubscribe();
  } catch {
    // Retry once after a short delay — the old FCM registration may still be
    // releasing.
    await new Promise((r) => setTimeout(r, 800));
    sub = await doSubscribe();
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return;

  const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh: string; auth: string } };
  await fetch('/api/push-subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, userAgent: navigator.userAgent }),
  });
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

    if (perm === 'granted') {
      subscribeToPush().catch((err) => console.error('Push subscribe failed:', err));
    } else if (perm === 'default') {
      setShowBanner(true);
    }
  }, [user, profile]);

  const handleAllow = async () => {
    setShowBanner(false);
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') await subscribeToPush();
    } catch (err) {
      console.error('Push permission/subscribe failed:', err);
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
