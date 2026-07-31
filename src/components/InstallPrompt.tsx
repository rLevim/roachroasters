'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Prompts the user to install the PWA. Chrome fires `beforeinstallprompt` on
// (almost) every visit while the app is installable and not yet installed, so
// this re-appears each time until they install — dismissable per session.
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already installed / running as an installed app → never prompt.
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const handler = (e: Event) => {
      e.preventDefault(); // stop Chrome's mini-infobar; we show our own
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    const onInstalled = () => setDeferred(null);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  if (!deferred || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-md bg-fuchsia-600 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3">
      <img src="/logo.png" alt="" className="w-10 h-10 rounded-lg object-contain shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">Install RoachRoasters</p>
        <p className="text-xs text-fuchsia-100">Add it to your home screen for a full-screen app and reliable notifications.</p>
      </div>
      <button
        onClick={install}
        className="bg-white text-fuchsia-700 text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap"
      >
        Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-white/70 hover:text-white text-lg leading-none"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
