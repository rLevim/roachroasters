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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const slides = profile?.role === 'roach_roaster' ? ROASTER_ONBOARDING : BUGAPHOBE_ONBOARDING;
  const slide = slides[currentIndex];
  const isLast = currentIndex === slides.length - 1;

  const handleNext = async () => {
    if (isLast) {
      setLoading(true);
      try {
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
    <div className="min-h-screen bg-purple-deep flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <span className="text-6xl block mb-4">{slide.icon}</span>
          <h2 className="text-2xl font-extrabold text-purple-ink mb-3">{slide.title}</h2>
          <p className="text-gray-500 mb-8">{slide.description}</p>

          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === currentIndex ? 'bg-coral w-8' : 'bg-gray-300'
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
