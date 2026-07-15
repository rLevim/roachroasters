'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { registerPushSubscription } from '@/lib/notifications';

export function NotificationInit() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const asked = useRef(false);

  useEffect(() => {
    if (!user || !profile || asked.current) return;
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      registerPushSubscription();
      asked.current = true;
    } else if (Notification.permission === 'default') {
      const timer = setTimeout(() => {
        registerPushSubscription();
        asked.current = true;
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [user, profile]);

  return null;
}
