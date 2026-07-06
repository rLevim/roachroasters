'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { useToastStore } from '@/components/Toast';
import type { SupportMessage } from '@/types/database';

const SUBJECT_OPTIONS = [
  'Report a user',
  'Payment issue',
  'Bug or technical problem',
  'Safety concern',
  'Account issue',
  'Other',
];

export default function SupportPage() {
  const userId = useAuthStore((s) => s.user?.id);
  const initialized = useAuthStore((s) => s.initialized);
  const addToast = useToastStore((s) => s.addToast);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [myTickets, setMyTickets] = useState<SupportMessage[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchMyTickets();
  }, [userId]);

  const fetchMyTickets = async () => {
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setMyTickets(data as SupportMessage[]);
  };

  const handleSubmit = async () => {
    if (!subject || !message.trim() || !userId) return;
    setSending(true);
    try {
      const { error } = await supabase.from('support_messages').insert({
        user_id: userId,
        subject,
        message: message.trim(),
        status: 'open',
      });
      if (error) {
        addToast('Failed to send message. Please try again.', 'error');
        return;
      }
      addToast('Message sent! We will get back to you soon.', 'success');
      setSubject('');
      setMessage('');
      setShowForm(false);
      fetchMyTickets();
    } finally {
      setSending(false);
    }
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

  if (!userId) {
    return (
      <div className="min-h-screen bg-lavender">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <p className="text-gray-500">Please log in to contact support.</p>
            <a href="/login" className="inline-block bg-purple-mid text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-dark transition-colors">
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    open: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
  };

  const statusLabel: Record<string, string> = {
    open: 'Waiting for reply',
    in_progress: 'Being reviewed',
    resolved: 'Resolved',
  };

  return (
    <div className="min-h-screen bg-lavender">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-purple-ink">Help & Support</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-coral text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-coral-dark cursor-pointer"
            >
              + New Message
            </button>
          )}
        </div>

        {/* New Message Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-purple-ink">Contact Support</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">What is this about?</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-mid bg-white"
              >
                <option value="">Select a topic...</option>
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Your message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or question in detail..."
                rows={5}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-mid resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!subject || !message.trim() || sending}
              className="w-full bg-purple-mid text-white font-bold py-3 rounded-xl hover:bg-purple-dark cursor-pointer disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        )}

        {/* My Tickets */}
        {myTickets.length === 0 && !showForm ? (
          <div className="text-center py-10 space-y-3">
            <p className="text-5xl">💬</p>
            <p className="text-gray-500">No messages yet.</p>
            <p className="text-sm text-gray-400">Need help? Tap "New Message" to reach our team.</p>
          </div>
        ) : (
          myTickets.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-purple-ink text-sm">{t.subject}</p>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor[t.status]}`}>
                  {statusLabel[t.status]}
                </span>
              </div>
              <p className="text-sm text-gray-600">{t.message}</p>
              <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleString()}</p>

              {t.admin_reply && (
                <div className="bg-purple-light rounded-xl p-3 mt-2">
                  <p className="text-xs font-semibold text-purple-ink mb-1">Support reply:</p>
                  <p className="text-sm text-purple-ink">{t.admin_reply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
