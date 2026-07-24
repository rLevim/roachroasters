'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { useToastStore } from '@/components/Toast';
import type { Profile, Job, RoachAlert, SupportMessage } from '@/types/database';

const ADMIN_EMAIL = 'rotem.levim@gmail.com';

type Tab = 'overview' | 'users' | 'alerts' | 'jobs' | 'support';

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

async function adminGet(resource: string) {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`/api/admin?resource=${resource}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function adminPost(action: string, data: Record<string, string>) {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, ...data }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export default function AdminPage() {
  const userEmail = useAuthStore((s) => s.user?.email);
  const initialized = useAuthStore((s) => s.initialized);
  const addToast = useToastStore((s) => s.addToast);

  const [tab, setTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<Profile[]>([]);
  const [alerts, setAlerts] = useState<(RoachAlert & { profiles?: { display_name: string } })[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tickets, setTickets] = useState<(SupportMessage & { profiles?: { display_name: string; photo_url: string | null } })[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, activeJobs: 0, completedJobs: 0, totalRevenue: 0, openTickets: 0 });
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const isAdmin = userEmail === ADMIN_EMAIL;

  useEffect(() => {
    if (!isAdmin) return;
    fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, alertsData, jobsData, ticketsData] = await Promise.all([
        adminGet('stats'),
        adminGet('profiles'),
        adminGet('alerts'),
        adminGet('jobs'),
        adminGet('support'),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setAlerts(alertsData);
      setJobs(jobsData);
      setTickets(ticketsData);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (targetUserId: string, ban: boolean) => {
    const action = ban ? 'ban' : 'unban';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    await adminPost(action, { userId: targetUserId });
    addToast(`User ${ban ? 'banned' : 'unbanned'}`, 'success');
    const data = await adminGet('profiles');
    setUsers(data);
  };

  const handleSuspendUser = async (targetUserId: string, suspend: boolean) => {
    await adminPost(suspend ? 'suspend' : 'unsuspend', { userId: targetUserId });
    addToast(`User ${suspend ? 'suspended' : 'unsuspended'}`, 'success');
    const data = await adminGet('profiles');
    setUsers(data);
  };

  const handleVerifyUser = async (targetUserId: string, verify: boolean) => {
    await adminPost(verify ? 'verify' : 'unverify', { userId: targetUserId });
    addToast(`User ${verify ? 'verified' : 'unverified'}`, 'success');
    const data = await adminGet('profiles');
    setUsers(data);
  };

  const handleDeleteUser = async (targetUserId: string) => {
    if (!window.confirm('Are you sure you want to DELETE this user? This cannot be undone.')) return;
    if (!window.confirm('Really delete? All their data will be lost.')) return;
    await adminPost('delete_user', { userId: targetUserId });
    addToast('User deleted', 'success');
    const data = await adminGet('profiles');
    setUsers(data);
  };

  const handleCancelAlert = async (alertId: string) => {
    if (!window.confirm('Cancel this alert?')) return;
    await adminPost('cancel_alert', { alertId });
    addToast('Alert cancelled', 'success');
    const [alertsData, statsData] = await Promise.all([adminGet('alerts'), adminGet('stats')]);
    setAlerts(alertsData);
    setStats(statsData);
  };

  const handleReplyTicket = async (ticketId: string) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      await adminPost('reply_ticket', { ticketId, reply: replyText.trim() });
      addToast('Reply sent', 'success');
      setReplyingTo(null);
      setReplyText('');
      const [ticketsData, statsData] = await Promise.all([adminGet('support'), adminGet('stats')]);
      setTickets(ticketsData);
      setStats(statsData);
    } finally {
      setSendingReply(false);
    }
  };

  const handleTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'resolved') => {
    await adminPost('ticket_status', { ticketId, status });
    addToast('Status updated', 'success');
    const [ticketsData, statsData] = await Promise.all([adminGet('support'), adminGet('stats')]);
    setTickets(ticketsData);
    setStats(statsData);
  };

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-lavender">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <p className="text-5xl"> </p>
            <p className="text-gray-500 font-semibold">Admin access only.</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) =>
    !userFilter ||
    u.display_name.toLowerCase().includes(userFilter.toLowerCase()) ||
    u.city?.toLowerCase().includes(userFilter.toLowerCase()) ||
    u.user_id.includes(userFilter)
  );

  const statusColor: Record<string, string> = {
    open: 'bg-red-100 text-red-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
  };

  return (
    <div className="min-h-screen bg-lavender">
      <Navbar />
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold text-purple-ink">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 gap-1">
          {([
            ['overview', 'Overview'],
            ['users', 'Users'],
            ['alerts', 'Alerts'],
            ['jobs', 'Jobs'],
            ['support', `Support${stats.openTickets > 0 ? ` (${stats.openTickets})` : ''}`],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                tab === key ? 'bg-purple-mid text-white' : 'text-gray-500 hover:text-purple-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-purple-mid/30 border-t-purple-mid rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Overview */}
            {tab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-2xl p-5 text-center">
                    <p className="text-3xl font-black text-purple-ink">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Users</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center">
                    <p className="text-3xl font-black text-purple-ink">{stats.totalJobs}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Jobs</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center">
                    <p className="text-3xl font-black text-purple-ink">{stats.activeJobs}</p>
                    <p className="text-xs text-gray-500 mt-1">Active Jobs</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center">
                    <p className="text-3xl font-black text-purple-ink">{stats.completedJobs}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center">
                    <p className="text-3xl font-black text-coral">${stats.totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">Platform Revenue</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center">
                    <p className="text-3xl font-black text-purple-ink">{stats.openTickets}</p>
                    <p className="text-xs text-gray-500 mt-1">Open Tickets</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 space-y-3">
                  <h3 className="font-bold text-purple-ink">Notification Diagnostics</h3>
                  <button
                    onClick={async () => {
                      const perm = 'Notification' in window ? Notification.permission : 'N/A';
                      const regs = await navigator.serviceWorker?.getRegistrations() || [];
                      const swInfo = regs.map(r => r.active?.scriptURL || r.installing?.scriptURL || 'unknown').join(', ') || 'None';
                      const osState = (window as any).OneSignal ? 'loaded' : 'not loaded';
                      let subId = 'N/A';
                      try {
                        if ((window as any).OneSignal?.User?.PushSubscription?.id) subId = (window as any).OneSignal.User.PushSubscription.id;
                      } catch {}
                      addToast(`Permission: ${perm} | SW: ${swInfo} | OneSignal: ${osState} | SubID: ${subId}`, 'info');
                    }}
                    className="bg-gray-200 text-purple-ink text-sm font-bold px-4 py-2 rounded-full hover:bg-gray-300 transition-colors"
                  >
                    Check Status
                  </button>
                  <button
                    onClick={async () => {
                      const token = await getToken();
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!token || !user) { addToast('Not logged in', 'error'); return; }
                      try {
                        const res = await fetch('/api/push-notification', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ type: 'INSERT', table: 'test', record: { user_id: user.id } }),
                        });
                        const result = await res.json();
                        addToast(`Result: ${JSON.stringify(result)}`, res.ok ? 'success' : 'error');
                      } catch (err) {
                        addToast(`Error: ${err}`, 'error');
                      }
                    }}
                    className="bg-purple-mid text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-purple-dark transition-colors"
                  >
                    Send Test Notification
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-5 space-y-3">
                  <h3 className="font-bold text-purple-ink">Recent Users</h3>
                  {users.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                      <div className="w-9 h-9 rounded-full bg-purple-light flex items-center justify-center text-purple-mid font-bold text-sm shrink-0 overflow-hidden">
                        {u.photo_url ? <img src={u.photo_url} alt="" className="w-full h-full object-cover" /> : u.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-purple-ink text-sm truncate">{u.display_name}</p>
                        <p className="text-xs text-gray-400">{u.role === 'bugaphobe' ? 'Bugaphobe' : 'Roaster'} · {u.city || 'No city'}</p>
                      </div>
                      <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users */}
            {tab === 'users' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Search by name, city, or ID..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-purple-mid"
                />
                <p className="text-sm text-gray-500">{filteredUsers.length} users</p>
                {filteredUsers.map((u) => (
                  <div key={u.id} className="bg-white rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <a href={`/profile/${u.user_id}`} className="shrink-0">
                        <div className="w-11 h-11 rounded-full bg-purple-light flex items-center justify-center text-purple-mid font-bold overflow-hidden">
                          {u.photo_url ? <img src={u.photo_url} alt="" className="w-full h-full object-cover" /> : u.display_name.charAt(0).toUpperCase()}
                        </div>
                      </a>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a href={`/profile/${u.user_id}`} className="font-bold text-purple-ink text-sm hover:underline">{u.display_name}</a>
                          {u.is_verified && <span className="text-[10px] font-bold text-coral bg-coral-light px-1.5 py-0.5 rounded">Verified</span>}
                          {u.is_banned && <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">Banned</span>}
                          {u.is_suspended && <span className="text-[10px] font-bold text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded">Suspended</span>}
                        </div>
                        <p className="text-xs text-gray-400">
                          {u.role === 'bugaphobe' ? 'Bugaphobe' : 'Roaster'} · {u.city || 'No city'} · Joined {new Date(u.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {u.rating.toFixed(1)} rating · {u.total_reviews} reviews
                          {u.role === 'roach_roaster' && ` · ${u.roaches_killed} killed · ${u.notification_radius_km}km radius`}
                        </p>
                        {(u as any).email && (
                          <p className="text-xs text-gray-400">
                            <a href={`mailto:${(u as any).email}`} className="text-purple-mid hover:underline">{(u as any).email}</a>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {!u.is_verified ? (
                        <button onClick={() => handleVerifyUser(u.user_id, true)} className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 cursor-pointer">
                          ✓ Verify
                        </button>
                      ) : (
                        <button onClick={() => handleVerifyUser(u.user_id, false)} className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer">
                          Remove Verified
                        </button>
                      )}
                      {!u.is_suspended ? (
                        <button onClick={() => handleSuspendUser(u.user_id, true)} className="text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg hover:bg-yellow-100 cursor-pointer">
                          Suspend
                        </button>
                      ) : (
                        <button onClick={() => handleSuspendUser(u.user_id, false)} className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 cursor-pointer">
                          Unsuspend
                        </button>
                      )}
                      {!u.is_banned ? (
                        <button onClick={() => handleBanUser(u.user_id, true)} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 cursor-pointer">
                          Ban
                        </button>
                      ) : (
                        <button onClick={() => handleBanUser(u.user_id, false)} className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 cursor-pointer">
                          Unban
                        </button>
                      )}
                      <button onClick={() => handleDeleteUser(u.user_id)} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 cursor-pointer ml-auto">
                        Delete User
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Alerts */}
            {tab === 'alerts' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">{alerts.length} alerts</p>
                {alerts.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No alerts yet.</p>
                  </div>
                ) : (
                  alerts.map((a) => {
                    const alertStatusStyle: Record<string, string> = {
                      open: 'bg-green-100 text-green-700',
                      matched: 'bg-blue-100 text-blue-700',
                      in_progress: 'bg-yellow-100 text-yellow-700',
                      completed: 'bg-purple-light text-purple-ink',
                      cancelled: 'bg-gray-100 text-gray-500',
                    };
                    return (
                      <div key={a.id} className="bg-white rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-purple-ink text-sm">{(a as any).profiles?.display_name || 'Unknown'}</p>
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${alertStatusStyle[a.status] || 'bg-gray-100 text-gray-500'}`}>
                                {a.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{a.description || 'No description'}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(a.created_at).toLocaleString()} · Lat: {a.latitude?.toFixed(4)}, Lng: {a.longitude?.toFixed(4)}
                            </p>
                          </div>
                          {a.status === 'open' && (
                            <button
                              onClick={() => handleCancelAlert(a.id)}
                              className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 cursor-pointer shrink-0"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Jobs */}
            {tab === 'jobs' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">{jobs.length} jobs (latest 100)</p>
                {jobs.map((j) => {
                  const jAny = j as any;
                  const statusStyle: Record<string, string> = {
                    pending: 'bg-yellow-100 text-yellow-700',
                    accepted: 'bg-blue-100 text-blue-700',
                    in_progress: 'bg-purple-light text-purple-ink',
                    completed: 'bg-green-100 text-green-700',
                    cancelled: 'bg-gray-100 text-gray-500',
                    disputed: 'bg-red-100 text-red-700',
                  };
                  return (
                    <div key={j.id} className="bg-white rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-purple-ink text-sm">Job #{j.id.slice(0, 8)}</p>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyle[j.status] || 'bg-gray-100 text-gray-500'}`}>
                              {j.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(j.created_at).toLocaleString()}
                            {j.completed_at && ` · Completed ${new Date(j.completed_at).toLocaleString()}`}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-purple-light/20 rounded-lg p-2">
                          <p className="text-gray-500">Bugaphobe</p>
                          <p className="font-semibold text-purple-ink">{jAny.bugaphobe_name || j.bugaphobe_id.slice(0, 8)}</p>
                        </div>
                        <div className="bg-coral-light/40 rounded-lg p-2">
                          <p className="text-gray-500">Roaster</p>
                          <p className="font-semibold text-purple-ink">{jAny.roaster_name || j.roaster_id.slice(0, 8)}</p>
                        </div>
                      </div>
                      {jAny.alert_description && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                          {jAny.alert_description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Support */}
            {tab === 'support' && (
              <div className="space-y-3">
                {tickets.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-4xl mb-3"> </p>
                    <p className="text-gray-500">No support messages yet.</p>
                  </div>
                ) : (
                  tickets.map((t) => (
                    <div key={t.id} className="bg-white rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-light flex items-center justify-center text-purple-mid font-bold text-sm shrink-0 overflow-hidden">
                          {t.profiles?.photo_url ? <img src={t.profiles.photo_url} alt="" className="w-full h-full object-cover" /> : (t.profiles?.display_name?.charAt(0).toUpperCase() || '?')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-purple-ink text-sm">{t.profiles?.display_name || 'User'}</p>
                          <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleString()}</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor[t.status]}`}>
                          {t.status}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-purple-ink text-sm">{t.subject}</p>
                        <p className="text-sm text-gray-600 mt-1">{t.message}</p>
                      </div>
                      {t.admin_reply && (
                        <div className="bg-purple-light rounded-xl p-3">
                          <p className="text-xs font-semibold text-purple-ink mb-1">Your reply:</p>
                          <p className="text-sm text-purple-ink">{t.admin_reply}</p>
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {t.status !== 'resolved' && (
                          <>
                            <button
                              onClick={() => { setReplyingTo(replyingTo === t.id ? null : t.id); setReplyText(''); }}
                              className="text-xs font-bold text-purple-mid bg-purple-light px-3 py-1.5 rounded-lg hover:bg-purple-mid hover:text-white cursor-pointer"
                            >
                              Reply
                            </button>
                            {t.status === 'open' && (
                              <button onClick={() => handleTicketStatus(t.id, 'in_progress')} className="text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg hover:bg-yellow-100 cursor-pointer">
                                Mark In Progress
                              </button>
                            )}
                            <button onClick={() => handleTicketStatus(t.id, 'resolved')} className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 cursor-pointer">
                              Resolve
                            </button>
                          </>
                        )}
                        {t.status === 'resolved' && (
                          <button onClick={() => handleTicketStatus(t.id, 'open')} className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer">
                            Reopen
                          </button>
                        )}
                      </div>
                      {replyingTo === t.id && (
                        <div className="space-y-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                            rows={3}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-mid resize-none"
                          />
                          <button
                            onClick={() => handleReplyTicket(t.id)}
                            disabled={!replyText.trim() || sendingReply}
                            className="bg-purple-mid text-white font-bold text-sm px-5 py-2 rounded-xl hover:bg-purple-dark cursor-pointer disabled:opacity-50"
                          >
                            {sendingReply ? 'Sending...' : 'Send Reply'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
