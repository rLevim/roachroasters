'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function NotificationInit() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const initialized = useRef(false);
  const [showBanner, setShowBanner] = useState(false);
  const oneSignalRef = useRef<any>(null);

  useEffect(() => {
    if (!user || !profile || initialized.current) return;
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId) return;

    initialized.current = true;

    import('react-onesignal').then(({ default: OneSignal }) => {
      oneSignalRef.current = OneSignal;
      OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: { enable: false } as any,
      }).then(async () => {
        await OneSignal.login(user.id);
        if (!OneSignal.Notifications.permission) {
          setShowBanner(true);
        }
      }).catch((err) => {
        console.warn('OneSignal init error:', err);
      });
    });
  }, [user, profile]);

  const handleAllow = async () => {
    setShowBanner(false);
    const OneSignal = oneSignalRef.current;
    if (OneSignal) {
      OneSignal.Notifications.requestPermission();
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-purple-dark text-white p-3 flex items-center justify-between gap-3 shadow-lg">
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
