import { supabase } from '@/lib/supabase';

export async function triggerPushNotification(table: string, record: Record<string, unknown>) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    await fetch('/api/push-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ type: 'INSERT', table, record }),
    });
  } catch {
    // Push notifications are best-effort — don't block the user flow
  }
}
