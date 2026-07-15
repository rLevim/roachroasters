'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { BUGAPHOBE_ONBOARDING, ROASTER_ONBOARDING } from '@/constants/onboarding';
import { Button } from '@/components/Button';

export default function OnboardingPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paypalMe, setPaypalMe] = useState('');

  const isRoaster = profile?.role === 'roach_roaster';
  const slides = isRoaster ? ROASTER_ONBOARDING : BUGAPHOBE_ONBOARDING;
  const slide = slides[currentIndex];
  const isLast = currentIndex === slides.length - 1;

  const handleNext = async () => {
    if (isLast) {
      setLoading(true);
      try {
        if (isRoaster && paypalMe.trim()) {
          await updateProfile({ paypal_me: paypalMe.trim() });
        }
        await completeOnboarding();
        router.push('/home');
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-purple-deep flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <span className="text-5xl sm:text-6xl block mb-4">{slide.icon}</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-purple-ink mb-3">{slide.title}</h2>
          <p className="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8">{slide.description}</p>

          {isLast && isRoaster && (
            <div className="mb-6 text-left">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Your PayPal.me Username</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-mid">
                <span className="text-sm text-gray-400 pl-4 shrink-0">paypal.me/</span>
                <input
                  type="text"
                  value={paypalMe}
                  onChange={(e) => setPaypalMe(e.target.value)}
                  className="flex-1 px-1 py-3 text-sm focus:outline-none"
                  placeholder="yourUsername"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Optional — you can always add this later in your profile.</p>
            </div>
          )}

          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                  i === currentIndex ? 'bg-coral w-6 sm:w-8' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            title={isLast ? "Let's Go!" : 'Next'}
            onClick={handleNext}
            variant="coral"
            size="lg"
            loading={loading}
            className="w-full"
          />

          {!isLast && (
            <button
              onClick={async () => {
                setLoading(true);
                await completeOnboarding();
                router.push('/home');
                setLoading(false);
              }}
              className="mt-3 text-purple-mid text-sm font-semibold hover:underline cursor-pointer"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
