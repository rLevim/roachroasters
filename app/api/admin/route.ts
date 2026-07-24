import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_EMAILS = ['rotem.levim@gmail.com'];

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) return false;
  return true;
}

function adminClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const resource = searchParams.get('resource');
  const db = adminClient();

  if (resource === 'health') {
    const { count, error } = await db.from('profiles').select('*', { count: 'exact', head: true });
    return NextResponse.json({
      supabaseUrl: supabaseUrl ? 'set' : 'missing',
      serviceKey: supabaseServiceKey ? `set (${supabaseServiceKey.substring(0, 10)}...)` : 'missing',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing',
      profileCount: count,
      error: error?.message || null,
    });
  }

  if (resource === 'stats') {
    const [profiles, jobs, activeJobs, completedJobs, completedJobData, openTickets] = await Promise.all([
      db.from('profiles').select('*', { count: 'exact', head: true }),
      db.from('jobs').select('*', { count: 'exact', head: true }),
      db.from('jobs').select('*', { count: 'exact', head: true }).in('status', ['pending', 'accepted', 'in_progress']),
      db.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      db.from('jobs').select('price, platform_fee').eq('status', 'completed'),
      db.from('support_messages').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    ]);

    if (profiles.error) {
      console.error('[Admin] Stats query errors:', {
        profiles: profiles.error?.message,
        jobs: jobs.error?.message,
      });
    }

    const totalRevenue = completedJobData.data?.reduce((sum: number, j: any) => sum + (j.platform_fee || 0), 0) || 0;
    return NextResponse.json({
      totalUsers: profiles.count ?? 0,
      totalJobs: jobs.count ?? 0,
      activeJobs: activeJobs.count ?? 0,
      completedJobs: completedJobs.count ?? 0,
      totalRevenue,
      openTickets: openTickets.count ?? 0,
    });
  }

  if (resource === 'profiles') {
    const { data, error } = await db.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (data && data.length > 0) {
      const { data: { users: authUsers } } = await db.auth.admin.listUsers({ perPage: 1000 });
      const emailMap: Record<string, string> = {};
      if (authUsers) for (const u of authUsers) emailMap[u.id] = u.email || '';
      return NextResponse.json(data.map((p: any) => ({ ...p, email: emailMap[p.user_id] || '' })));
    }
    return NextResponse.json(data);
  }

  if (resource === 'alerts') {
    const { data, error } = await db
      .from('roach_alerts')
      .select('*, profiles!roach_alerts_bugaphobe_id_fkey(display_name)')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (resource === 'jobs') {
    const { data, error } = await db.from('jobs').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (data && data.length > 0) {
      const allIds = [...new Set(data.flatMap((j: any) => [j.bugaphobe_id, j.roaster_id]))];
      const alertIds = [...new Set(data.map((j: any) => j.alert_id).filter(Boolean))];
      const [{ data: profiles }, { data: alertsData }] = await Promise.all([
        db.from('profiles').select('user_id, display_name').in('user_id', allIds),
        alertIds.length > 0
          ? db.from('roach_alerts').select('id, description').in('id', alertIds)
          : Promise.resolve({ data: [] }),
      ]);
      const nameMap: Record<string, string> = {};
      if (profiles) for (const p of profiles) nameMap[p.user_id] = p.display_name;
      const alertMap: Record<string, string> = {};
      if (alertsData) for (const a of alertsData as any[]) alertMap[a.id] = a.description || '';
      return NextResponse.json(data.map((j: any) => ({
        ...j,
        bugaphobe_name: nameMap[j.bugaphobe_id] || 'Unknown',
        roaster_name: nameMap[j.roaster_id] || 'Unknown',
        alert_description: j.alert_id ? (alertMap[j.alert_id] || 'No description') : null,
      })));
    }
    return NextResponse.json(data);
  }

  if (resource === 'support') {
    const { data, error } = await db.from('support_messages').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((t: any) => t.user_id))];
      const { data: profilesData } = await db.from('profiles').select('user_id, display_name, photo_url').in('user_id', userIds);
      const profileMap: Record<string, any> = {};
      if (profilesData) {
        for (const p of profilesData) profileMap[p.user_id] = { display_name: p.display_name, photo_url: p.photo_url };
      }
      return NextResponse.json(data.map((t: any) => ({ ...t, profiles: profileMap[t.user_id] })));
    }
    return NextResponse.json([]);
  }

  return NextResponse.json({ error: 'Invalid resource' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { action } = body;
  const db = adminClient();

  if (action === 'ban' || action === 'unban') {
    const { error } = await db.from('profiles').update({
      is_banned: action === 'ban',
      updated_at: new Date().toISOString(),
    }).eq('user_id', body.userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'suspend' || action === 'unsuspend') {
    const { error } = await db.from('profiles').update({
      is_suspended: action === 'suspend',
      updated_at: new Date().toISOString(),
    }).eq('user_id', body.userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'verify' || action === 'unverify') {
    const { error } = await db.from('profiles').update({
      is_verified: action === 'verify',
      updated_at: new Date().toISOString(),
    }).eq('user_id', body.userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'delete_user') {
    const { error } = await db.from('profiles').delete().eq('user_id', body.userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'cancel_alert') {
    const { error } = await db.from('roach_alerts').update({ status: 'cancelled' }).eq('id', body.alertId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'reply_ticket') {
    const { error } = await db.from('support_messages').update({
      admin_reply: body.reply,
      status: 'resolved',
      updated_at: new Date().toISOString(),
    }).eq('id', body.ticketId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'ticket_status') {
    const { error } = await db.from('support_messages').update({
      status: body.status,
      updated_at: new Date().toISOString(),
    }).eq('id', body.ticketId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
