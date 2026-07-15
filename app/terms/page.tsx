'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/Button';

export default function TermsPage() {
  const router = useRouter();
  const acceptTerms = useAuthStore((s) => s.acceptTerms);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    if (!accepted) return;
    setLoading(true);
    try {
      await acceptTerms();
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-deep flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl font-extrabold text-purple-ink text-center mb-2">Before You Begin</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Please read and accept the following to continue</p>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 mb-4">
          <h2 className="text-base font-bold text-red-800 mb-2">Use at Your Own Risk</h2>
          <p className="text-sm text-red-700 leading-relaxed">
            RoachRoasters connects people but does not verify, employ, or certify any user.
            By using this service, you acknowledge that all interactions happen at your own risk.
            RoachRoasters is not responsible for any damage, injury, theft, or loss that may occur
            during or as a result of using the platform.
          </p>
        </div>

        <div className="h-48 overflow-y-auto bg-gray-50 rounded-xl p-4 text-sm text-gray-600 mb-5 space-y-3 border border-gray-200">
          <p><strong>1. Service.</strong> RoachRoasters is a free community platform connecting people who need help with cockroaches (&quot;Bugaphobes&quot;) with people willing to help (&quot;Roach Roasters&quot;). All Roach Roasters are independent individuals, not employees of RoachRoasters.</p>
          <p><strong>2. Safety.</strong> Never share your exact address in chat. Use the in-app location pin. Inform someone you trust when meeting a Roach Roaster. Trust your instincts.</p>
          <p><strong>3. Tipping.</strong> The platform is free. Tips via PayPal are optional and occur outside the platform. We bear no responsibility for payment disputes.</p>
          <p><strong>4. Conduct.</strong> Be respectful. No harassment, discrimination, or illegal activity. Violations result in account suspension.</p>
          <p><strong>5. Reviews.</strong> Leave honest reviews. Fake reviews will be removed and may result in bans.</p>
          <p><strong>6. Liability.</strong> RoachRoasters is a marketplace platform provided &quot;as is.&quot; We are not liable for any damages arising from use of the service or interactions between users.</p>
          <p><strong>7. Privacy.</strong> We collect location data only when you create alerts or share location. We do not sell your data.</p>
          <p><strong>8. Age.</strong> You must be at least 18 years old to use RoachRoasters.</p>
        </div>

        <a
          href="/terms-of-use"
          target="_blank"
          className="block text-center text-purple-mid text-sm font-semibold hover:text-purple-dark mb-5 underline"
        >
          Read Full Terms of Use
        </a>

        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded border-gray-300 text-coral focus:ring-coral accent-coral cursor-pointer shrink-0"
          />
          <span className="text-sm text-gray-700 leading-snug">
            I have read and agree to the <a href="/terms-of-use" target="_blank" className="text-purple-mid font-semibold underline">Terms of Use</a>.
            I understand that I use this service at my own risk.
          </span>
        </label>

        <Button
          title="I Accept — Let's Go"
          onClick={handleAccept}
          variant="coral"
          size="lg"
          loading={loading}
          disabled={!accepted}
          className="w-full"
        />
      </div>
    </div>
  );
}
