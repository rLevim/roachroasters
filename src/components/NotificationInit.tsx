'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function NotificationInit() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const initialized = useRef(false);

  useEffect(() => {
    if (!user || !profile || initialized.current) return;
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId) return;

    initialized.current = true;

    import('react-onesignal').then(({ default: OneSignal }) => {
      OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: true,
      }).then(() => {
        OneSignal.login(user.id);
      });
    });
  }, [user, profile]);

  return null;
}
