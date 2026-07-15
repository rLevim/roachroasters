import { supabase } from './supabase';

export async function registerPushSubscription(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.warn('NEXT_PUBLIC_VAPID_PUBLIC_KEY not set — push notifications disabled');
      return false;
    }

    const subscription = await registration.pushManager.subscribe({
      userActivated: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    } as PushSubscriptionOptionsInit);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      endpoint: subscription.endpoint,
      keys: JSON.stringify(subscription.toJSON().keys),
      created_at: new Date().toISOString(),
    }, { onConflict: 'endpoint' });

    return true;
  } catch (err) {
    console.error('Push registration failed:', err);
    return false;
  }
}

export function showLocalNotification(title: string, body: string, url?: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (document.visibilityState === 'visible') return;

  navigator.serviceWorker?.ready.then((reg) => {
    reg.showNotification(title, {
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      data: { url: url || '/' },
      tag: `local-${Date.now()}`,
    });
  });
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
