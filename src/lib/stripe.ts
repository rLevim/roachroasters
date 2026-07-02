import { supabase } from './supabase';

export async function createPaymentIntent(jobId: string): Promise<{
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
} | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase.functions.invoke('stripe-create-payment', {
    body: { jobId },
  });

  if (error) {
    console.error('Payment intent error:', error);
    return null;
  }

  return data as { clientSecret: string; paymentIntentId: string; amount: number };
}

export async function confirmPaymentSuccess(jobId: string, paymentIntentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('jobs')
    .update({
      payment_intent_id: paymentIntentId,
      status: 'accepted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  return !error;
}

export async function getEarningsSummary(): Promise<{
  pendingEarnings: number;
  totalEarned: number;
  totalJobs: number;
  lastPayout: string | null;
} | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: jobs } = await supabase
    .from('jobs')
    .select('price, platform_fee, completed_at')
    .eq('roaster_id', user.id)
    .eq('status', 'completed');

  const { data: payouts } = await supabase
    .from('payouts')
    .select('payout_amount, paid_at')
    .eq('roaster_id', user.id)
    .eq('status', 'paid')
    .order('paid_at', { ascending: false })
    .limit(1);

  const totalEarned = (jobs || []).reduce((sum, j) => sum + (j.price || 0), 0);
  const totalPaidOut = (payouts || []).reduce((sum, p) => sum + (p.payout_amount || 0), 0);

  return {
    pendingEarnings: Math.max(0, totalEarned - totalPaidOut),
    totalEarned,
    totalJobs: (jobs || []).length,
    lastPayout: payouts?.[0]?.paid_at || null,
  };
}

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
