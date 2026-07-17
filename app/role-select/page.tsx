'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/Button';
import { useI18n } from '@/lib/i18n';
import type { UserRole } from '@/types/database';

export default function RoleSelectPage() {
  const router = useRouter();
  const selectRole = useAuthStore((s) => s.selectRole);
  const { t, lang } = useI18n();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await selectRole(selected);
      router.push('/onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-deep flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-4xl font-black text-white">{t('role.title')}</h1>
        <p className="text-purple-light mt-2 mb-8">{t('role.subtitle')}</p>

        <div className="space-y-4 mb-8">
          <button
            onClick={() => setSelected('bugaphobe')}
            className={`w-full bg-white rounded-3xl p-6 text-center border-3 transition-all cursor-pointer ${
              selected === 'bugaphobe' ? 'border-coral bg-coral-light' : 'border-transparent'
            }`}
          >
            <span className="text-5xl block mb-2"> </span>
            <h3 className="text-xl font-extrabold text-purple-ink">{t('landing.twoSides.bugaphobes')}</h3>
            <p className="text-gray-500 text-sm mt-1">
              {t('role.bugaphobe')}
            </p>
          </button>

          <button
            onClick={() => setSelected('roach_roaster')}
            className={`w-full bg-white rounded-3xl p-6 text-center border-3 transition-all cursor-pointer ${
              selected === 'roach_roaster' ? 'border-coral bg-coral-light' : 'border-transparent'
            }`}
          >
            <span className="text-5xl block mb-2"> </span>
            <h3 className="text-xl font-extrabold text-purple-ink">{t('landing.twoSides.roasters')}</h3>
            <p className="text-gray-500 text-sm mt-1">
              {t('role.roaster')}
            </p>
          </button>
        </div>

        <Button
          title="Continue"
          onClick={handleContinue}
          variant="primary"
          size="lg"
          loading={loading}
          disabled={!selected}
          className="w-full"
        />
      </div>
    </div>
  );
}
