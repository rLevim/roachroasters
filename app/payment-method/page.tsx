'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CardForm() {
  const stripe = useStripe();
  const elements = useElements();
  const userId = useAuthStore((s) => s.user?.id);
  const profile = useAuthStore((s) => s.profile);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [savedCard, setSavedCard] = useState<{ brand: string; last4: string } | null>(null);

  useEffect(() => {
    if (profile?.stripe_card_last4) {
      setSavedCard({
        brand: profile.stripe_card_brand || 'Card',
        last4: profile.stripe_card_last4,
      });
    }
  }, [profile]);

  const handleSubmit = async () => {
    if (!stripe || !elements || !userId) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (pmError) {
        setError(pmError.message || 'Failed to save card.');
        return;
      }

      if (paymentMethod) {
        await updateProfile({
          stripe_payment_method_id: paymentMethod.id,
          stripe_card_last4: paymentMethod.card?.last4 || '',
          stripe_card_brand: paymentMethod.card?.brand || '',
        });

        setSavedCard({
          brand: paymentMethod.card?.brand || 'Card',
          last4: paymentMethod.card?.last4 || '****',
        });
        setSuccess(true);
        cardElement.clear();
      }
    } finally {
      setSaving(false);
    }
  };

  const brandIcons: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'Amex',
    discover: 'Discover',
  };

  return (
    <div className="space-y-4">
      {/* Current Card */}
      {savedCard && (
        <div className="bg-purple-light/50 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl"> </span>
          <div className="flex-1">
            <p className="text-sm font-bold text-purple-ink">
              {brandIcons[savedCard.brand] || savedCard.brand}
            </p>
            <p className="text-sm text-gray-600">•••• •••• •••• {savedCard.last4}</p>
          </div>
          <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <p className="text-green-700 font-bold text-sm">Card saved successfully!</p>
        </div>
      )}

      {/* Card Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-2">
          {savedCard ? 'Update card' : 'Add a card'}
        </label>
        <div className="border border-gray-200 rounded-xl px-4 py-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#26215C',
                  '::placeholder': { color: '#9CA3AF' },
                },
                invalid: { color: '#EF4444' },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!stripe || saving}
        className="w-full bg-purple-mid text-white font-bold py-3 rounded-xl hover:bg-purple-dark transition-colors cursor-pointer disabled:opacity-50"
      >
        {saving ? 'Saving...' : savedCard ? 'Update Card' : 'Save Card'}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <span> </span>
        <span>Secured by Stripe. We never see or store your full card number.</span>
      </div>
    </div>
  );
}

export default function PaymentMethodPage() {
  const profile = useAuthStore((s) => s.profile);
  const initialized = useAuthStore((s) => s.initialized);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-lavender">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-mid/30 border-t-purple-mid rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lavender">
      <Navbar />
      <div className="max-w-md mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold text-purple-ink text-center">Payment Method</h1>

        <div className="bg-white rounded-2xl p-5">
          <Elements stripe={stripePromise}>
            <CardForm />
          </Elements>
        </div>

        <p className="text-xs text-gray-400 text-center px-4">
          Your card will be charged when you accept a deal with a Roach Roaster.
          You can update or change your card at any time.
        </p>
      </div>
    </div>
  );
}
