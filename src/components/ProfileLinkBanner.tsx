'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

// Magenta prompt shown on every app entry until the user adds a social/profile
// link. A social link makes a profile look real, which builds trust and leads
// to more help (for bugaphobes) and more jobs (for roasters).
export function ProfileLinkBanner() {
  const profile = useAuthStore((s) => s.profile);
  const [dismissed, setDismissed] = useState(false);

  if (!profile) return null;
  if (profile.social_link) return null;
  if (dismissed) return null;

  return (
    <div className="sticky top-0 left-0 right-0 z-[55] bg-fuchsia-600 text-white p-3 flex items-center justify-between gap-3 shadow-lg">
      <p className="text-sm font-semibold flex-1">
        Add a social profile link to your account — it shows people you&apos;re real, so you get more help and more jobs.
      </p>
      <Link
        href="/profile?edit=1"
        onClick={() => setDismissed(true)}
        className="bg-white text-fuchsia-700 text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap"
      >
        Add link
      </Link>
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
