'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/Button';

export default function TermsPage() {
  const router = useRouter();
  const acceptTerms = useAuthStore((s) => s.acceptTerms);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await acceptTerms();
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-deep flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-xl">
        <h1 className="text-2xl font-extrabold text-purple-ink text-center mb-6">Terms of Service</h1>

        <div className="h-64 overflow-y-auto bg-gray-100 rounded-xl p-4 text-sm text-gray-600 mb-6 space-y-3">
          <p><strong>1. Acceptance.</strong> By using RoachRoasters, you agree to these terms.</p>
          <p><strong>2. Service.</strong> RoachRoasters connects people who need help with cockroaches (&quot;Bugaphobes&quot;) with people willing to help (&quot;Roach Roasters&quot;).</p>
          <p><strong>3. Safety.</strong> Never share your exact address in chat. Use the in-app location pin. Meet in safe, well-lit areas when possible.</p>
          <p><strong>4. Payments.</strong> Bugaphobes pay through the platform. Roach Roasters receive monthly payouts to their PayPal. A 20% platform fee applies.</p>
          <p><strong>5. Conduct.</strong> Be respectful. No harassment, discrimination, or illegal activity. Violations result in account suspension.</p>
          <p><strong>6. Reviews.</strong> Leave honest reviews. Fake reviews will be removed and may result in bans.</p>
          <p><strong>7. Liability.</strong> RoachRoasters is a marketplace platform. We are not responsible for the quality of pest control services.</p>
          <p><strong>8. Privacy.</strong> We collect location data only when you create alerts or share location with a Roaster. We do not sell your data.</p>
        </div>

        <Button
          title="I Accept the Terms"
          onClick={handleAccept}
          variant="coral"
          size="lg"
          loading={loading}
          className="w-full"
        />
      </div>
    </div>
  );
}
