import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@roachroasters.com',
    VAPID_PUBLIC,
    VAPID_PRIVATE
  );
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Send a Web Push notification to every stored subscription for the given users.
// Stale subscriptions (410 Gone / 404) are pruned automatically.
async function sendPush(userIds: string[], title: string, message: string, url?: string) {
  if (!userIds.length) return { sent: 0, subscriptions: 0 };

  const db = createClient(supabaseUrl, supabaseServiceKey);
  const { data: subs } = await db
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .in('user_id', userIds);

  if (!subs || subs.length === 0) return { sent: 0, subscriptions: 0 };

  const payload = JSON.stringify({ title, body: message, url: url || '/', icon: '/logo.png' });
  const stale: string[] = [];
  let sent = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        );
        sent++;
      } catch (err: unknown) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) stale.push(s.endpoint);
        else console.error('web-push error:', code, (err as Error)?.message);
      }
    })
  );

  if (stale.length) {
    await db.from('push_subscriptions').delete().in('endpoint', stale);
  }

  return { sent, subscriptions: subs.length, removed: stale.length };
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.WEBHOOK_SECRET || supabaseServiceKey;

    let authorized = false;
    if (authHeader === `Bearer ${expectedToken}`) {
      authorized = true;
    } else if (authHeader?.startsWith('Bearer ')) {
      const userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (user) authorized = true;
    }

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { type, record, table } = payload;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (table === 'test') {
      const { user_id } = record;
      const result = await sendPush(
        [user_id as string],
        'Test Notification',
        'If you see this, push notifications are working!',
        'https://www.roachroasters.com/home'
      );
      return NextResponse.json({ success: true, ...result });
    }

    if (type !== 'INSERT') {
      return NextResponse.json({ skipped: true });
    }

    if (table === 'messages') {
      const { sender_id, job_id, content, message_type } = record;
      if (message_type === 'system') {
        return NextResponse.json({ skipped: 'system message' });
      }

      const { data: job } = await supabase
        .from('jobs')
        .select('bugaphobe_id, roaster_id')
        .eq('id', job_id)
        .single();

      if (!job) {
        return NextResponse.json({ error: 'job not found' });
      }

      const recipientId = sender_id === job.bugaphobe_id ? job.roaster_id : job.bugaphobe_id;

      const { data: sender } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', sender_id)
        .single();

      const senderName = sender?.display_name || 'Someone';
      const truncated = content.length > 100 ? content.substring(0, 100) + '...' : content;

      await sendPush(
        [recipientId],
        `Message from ${senderName}`,
        truncated,
        `https://www.roachroasters.com/chat/${job_id}`
      );
    }

    if (table === 'roach_alerts') {
      const { bugaphobe_id, description, latitude, longitude } = record;

      const { data: roasters } = await supabase
        .from('profiles')
        .select('user_id, latitude, longitude, notification_radius_km')
        .eq('role', 'roach_roaster')
        .neq('user_id', bugaphobe_id)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (roasters && roasters.length > 0) {
        const nearbyIds = roasters
          .filter((r) => {
            const radius = r.notification_radius_km ?? 10;
            const dist = haversineKm(latitude, longitude, r.latitude!, r.longitude!);
            return dist <= radius;
          })
          .map((r) => r.user_id);

        if (nearbyIds.length > 0) {
          const desc = description || 'A cockroach needs handling!';
          await sendPush(
            nearbyIds,
            'New Roach Alert nearby!',
            desc,
            `https://www.roachroasters.com/alerts/${record.id}`
          );
        }

        console.log(`Alert proximity filter: ${roasters.length} roasters total, ${nearbyIds.length} within range`);
      }
    }

    if (table === 'alert_responses') {
      const { alert_id, roaster_id } = record;

      const { data: alert } = await supabase
        .from('roach_alerts')
        .select('bugaphobe_id, description')
        .eq('id', alert_id)
        .single();

      if (alert) {
        const { data: roaster } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', roaster_id)
          .single();

        const roasterName = roaster?.display_name || 'A Roach Roaster';

        await sendPush(
          [alert.bugaphobe_id],
          `${roasterName} responded to your alert!`,
          alert.description || 'Someone is coming to help!',
          `https://www.roachroasters.com/alerts/${alert_id}`
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Push notification error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
