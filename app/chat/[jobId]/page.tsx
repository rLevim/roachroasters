'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useJobStore } from '@/stores/jobStore';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { useToastStore } from '@/components/Toast';
import type { Profile, Message, Review } from '@/types/database';

const statusLabels: Record<string, string> = {
  pending: 'Negotiating — discuss details',
  accepted: 'Deal accepted — roaster is on the way',
  in_progress: 'In Progress — roaster is working',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

export default function ChatPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const role = useAuthStore((s) => s.profile?.role);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const {
    currentJob, messages, fetchJob, fetchMessages,
    subscribeToMessages, sendMessage, updateJobStatus, updateMyStatsOnComplete, refreshMyReviewStats, approveRoast, shareLocation,
  } = useJobStore();

  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [locationDetails, setLocationDetails] = useState({
    address: '',
    entrance: '',
    floor: '',
    apartment: '',
    entranceCode: '',
    comments: '',
  });
  const [sharingLocation, setSharingLocation] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [otherReview, setOtherReview] = useState<Review | null>(null);
  const addToast = useToastStore((s) => s.addToast);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!jobId) return;
    fetchJob(jobId);
    fetchMessages(jobId);
    const unsubMessages = subscribeToMessages(jobId);

    // Subscribe to job status changes
    const jobChannel = supabase
      .channel(`job-status-${jobId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'jobs',
        filter: `id=eq.${jobId}`,
      }, () => { fetchJob(jobId); })
      .subscribe();

    return () => {
      unsubMessages();
      supabase.removeChannel(jobChannel);
    };
  }, [jobId]);

  useEffect(() => {
    if (!currentJob || !userId) return;
    const otherId = currentJob.bugaphobe_id === userId ? currentJob.roaster_id : currentJob.bugaphobe_id;
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', otherId)
      .single()
      .then(({ data }) => { if (data) setOtherProfile(data as Profile); });
  }, [currentJob, userId]);

  useEffect(() => {
    if (!jobId || !userId || currentJob?.status !== 'completed') return;
    (async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('job_id', jobId);
      if (data) {
        const mine = data.find((r: Review) => r.reviewer_id === userId);
        const theirs = data.find((r: Review) => r.reviewer_id !== userId);
        if (mine) setMyReview(mine as Review);
        if (theirs) setOtherReview(theirs as Review);
      }
      // Refresh own rating/review count in case someone reviewed us
      await refreshMyReviewStats();
      await fetchProfile();
    })();
  }, [jobId, userId, currentJob?.status]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !jobId) return;
    setSending(true);
    try {
      await sendMessage(jobId, newMessage.trim());
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isRoaster = role === 'roach_roaster';
  const otherName = otherProfile?.display_name || 'User';
  const otherId = currentJob ? (currentJob.bugaphobe_id === userId ? currentJob.roaster_id : currentJob.bugaphobe_id) : null;

  const roasterConfirmed = messages.some(m => m.message_type === 'system' && m.content === 'ROASTER_CONFIRMED_DONE');
  const bugaphobeConfirmed = messages.some(m => m.message_type === 'system' && m.content === 'BUGAPHOBE_CONFIRMED_DONE');

  if (!currentJob) {
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
    <div className="min-h-screen bg-lavender flex flex-col">
      <Navbar />

      {/* Job Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/activity')} className="text-purple-mid font-bold cursor-pointer">
            ←
          </button>
          <a href={otherId ? `/profile/${otherId}` : '#'} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-purple-mid flex items-center justify-center text-white font-extrabold shrink-0">
              {otherProfile?.photo_url ? (
                <img src={otherProfile.photo_url} alt={otherName} className="w-full h-full object-cover rounded-full" />
              ) : (
                otherName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-purple-ink">{otherName}</p>
              <p className="text-xs text-gray-500">{statusLabels[currentJob.status] || currentJob.status}</p>
            </div>
          </a>
          {currentJob.price > 0 && (
            <span className="text-sm font-bold text-purple-mid">${currentJob.price}</span>
          )}
        </div>
      </div>

      {/* Action Bar */}
      {currentJob.status !== 'completed' && currentJob.status !== 'cancelled' && (
        <div className="bg-white border-b border-gray-100 px-4 py-2">
          <div className="max-w-2xl mx-auto flex gap-2 flex-wrap">
            {/* Pending = negotiation phase */}
            {!isRoaster && currentJob.status === 'pending' && (
              <Button
                title={`Accept Deal — $${currentJob.price + currentJob.platform_fee}`}
                onClick={async () => {
                  await updateJobStatus(jobId, 'accepted');
                  await sendMessage(jobId, `Deal accepted! $${currentJob.price} + $${currentJob.platform_fee} fee. Roaster is on the way.`, 'system');
                  addToast('Deal accepted!', 'success');
                }}
                variant="coral"
                size="sm"
                className="flex-1"
              />
            )}
            {/* Bugaphobe can share location after accepting */}
            {!isRoaster && currentJob.status === 'accepted' && !currentJob.location_lat && (
              <Button
                title="📍 Share My Location"
                onClick={() => setShowLocationForm(true)}
                variant="primary"
                size="sm"
                className="flex-1"
              />
            )}
            {!isRoaster && currentJob.status === 'accepted' && currentJob.location_lat && (
              <span className="flex-1 text-center text-sm text-green-700 font-semibold py-2">
                📍 Location shared
              </span>
            )}
            {/* Accepted = roaster heading over */}
            {isRoaster && currentJob.status === 'accepted' && (
              <Button
                title="I'm Here — Start Job"
                onClick={async () => {
                  await updateJobStatus(jobId, 'in_progress');
                  await sendMessage(jobId, 'Roaster has arrived and started the job.', 'system');
                }}
                variant="coral"
                size="sm"
                className="flex-1"
              />
            )}
            {/* In progress — both sides must confirm */}
            {isRoaster && currentJob.status === 'in_progress' && !roasterConfirmed && (
              <Button
                title="Mark as Done"
                onClick={async () => {
                  await sendMessage(jobId, 'ROASTER_CONFIRMED_DONE', 'system');
                  await sendMessage(jobId, 'Roaster marked the job as done.', 'system');
                  await updateMyStatsOnComplete('roach_roaster');
                  await fetchProfile();
                  const { data: msgs } = await supabase.from('messages').select('content').eq('job_id', jobId).eq('content', 'BUGAPHOBE_CONFIRMED_DONE');
                  if (msgs && msgs.length > 0) {
                    await updateJobStatus(jobId, 'completed');
                    await sendMessage(jobId, 'Both sides confirmed — job completed! 🎉', 'system');
                  }
                }}
                variant="coral"
                size="sm"
                className="flex-1"
              />
            )}
            {isRoaster && currentJob.status === 'in_progress' && roasterConfirmed && (
              <span className="flex-1 text-center text-sm text-green-700 font-semibold py-2">
                ✓ You confirmed — waiting for bugaphobe
              </span>
            )}
            {!isRoaster && currentJob.status === 'in_progress' && !bugaphobeConfirmed && (
              <Button
                title="Confirm Job Done"
                onClick={async () => {
                  await sendMessage(jobId, 'BUGAPHOBE_CONFIRMED_DONE', 'system');
                  await sendMessage(jobId, 'Bugaphobe confirmed the job is done.', 'system');
                  await updateMyStatsOnComplete('bugaphobe');
                  await fetchProfile();
                  const { data: msgs } = await supabase.from('messages').select('content').eq('job_id', jobId).eq('content', 'ROASTER_CONFIRMED_DONE');
                  if (msgs && msgs.length > 0) {
                    await updateJobStatus(jobId, 'completed');
                    await sendMessage(jobId, 'Both sides confirmed — job completed! 🎉', 'system');
                  }
                }}
                variant="coral"
                size="sm"
                className="flex-1"
              />
            )}
            {!isRoaster && currentJob.status === 'in_progress' && bugaphobeConfirmed && (
              <span className="flex-1 text-center text-sm text-green-700 font-semibold py-2">
                ✓ You confirmed — waiting for roaster
              </span>
            )}
            <Button
              title="Cancel"
              onClick={() => updateJobStatus(jobId, 'cancelled')}
              variant="ghost"
              size="sm"
            />
          </div>
        </div>
      )}

      {/* Location Details Form */}
      {showLocationForm && (
        <div className="bg-purple-light border-b border-purple-mid/20 px-4 py-4">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-purple-ink text-sm">📍 Share Your Location</h3>
              <button
                onClick={() => setShowLocationForm(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              placeholder="Street address *"
              value={locationDetails.address}
              onChange={(e) => setLocationDetails({ ...locationDetails, address: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-mid bg-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Entrance (e.g. B)"
                value={locationDetails.entrance}
                onChange={(e) => setLocationDetails({ ...locationDetails, entrance: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-mid bg-white"
              />
              <input
                type="text"
                placeholder="Floor"
                value={locationDetails.floor}
                onChange={(e) => setLocationDetails({ ...locationDetails, floor: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-mid bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Apartment"
                value={locationDetails.apartment}
                onChange={(e) => setLocationDetails({ ...locationDetails, apartment: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-mid bg-white"
              />
              <input
                type="text"
                placeholder="Entrance code"
                value={locationDetails.entranceCode}
                onChange={(e) => setLocationDetails({ ...locationDetails, entranceCode: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-mid bg-white"
              />
            </div>
            <textarea
              placeholder="Additional comments (e.g. ring doorbell twice, dog is friendly)"
              value={locationDetails.comments}
              onChange={(e) => setLocationDetails({ ...locationDetails, comments: e.target.value })}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-mid bg-white resize-none"
            />
            <Button
              title={sharingLocation ? 'Sharing...' : '📍 Confirm & Share Location'}
              onClick={async () => {
                if (!locationDetails.address.trim()) {
                  window.alert('Please enter a street address.');
                  return;
                }
                setSharingLocation(true);
                try {
                  const details = [
                    locationDetails.address.trim(),
                    locationDetails.entrance && `Entrance: ${locationDetails.entrance.trim()}`,
                    locationDetails.floor && `Floor: ${locationDetails.floor.trim()}`,
                    locationDetails.apartment && `Apt: ${locationDetails.apartment.trim()}`,
                    locationDetails.entranceCode && `Code: ${locationDetails.entranceCode.trim()}`,
                    locationDetails.comments && `Notes: ${locationDetails.comments.trim()}`,
                  ].filter(Boolean).join('\n');

                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        await shareLocation(jobId, pos.coords.latitude, pos.coords.longitude);
                        await sendMessage(jobId, `📍 Location details:\n${details}`);
                        setShowLocationForm(false);
                        setSharingLocation(false);
                        addToast('Location shared!', 'success');
                      },
                      async () => {
                        await shareLocation(jobId, 0, 0);
                        await sendMessage(jobId, `📍 Location details:\n${details}`);
                        setShowLocationForm(false);
                        setSharingLocation(false);
                        addToast('Location shared!', 'success');
                      }
                    );
                  } else {
                    await shareLocation(jobId, 0, 0);
                    await sendMessage(jobId, `📍 Location details:\n${details}`);
                    setShowLocationForm(false);
                    setSharingLocation(false);
                  }
                } catch {
                  setSharingLocation(false);
                }
              }}
              variant="coral"
              size="sm"
              loading={sharingLocation}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* System message at start */}
          <div className="text-center">
            <p className="text-xs text-gray-400 bg-gray-100 rounded-full px-4 py-1 inline-block">
              Job created · ${currentJob.price} + ${currentJob.platform_fee} fee
            </p>
          </div>

          {messages.map((msg: Message) => {
            const isMine = msg.sender_id === userId;

            if (msg.message_type === 'system') {
              if (msg.content === 'ROASTER_CONFIRMED_DONE' || msg.content === 'BUGAPHOBE_CONFIRMED_DONE') {
                return null;
              }
              return (
                <div key={msg.id} className="text-center">
                  <p className="text-xs text-gray-400 bg-gray-100 rounded-full px-4 py-1 inline-block">
                    {msg.content}
                  </p>
                </div>
              );
            }

            if (msg.message_type === 'location' && msg.metadata) {
              const lat = msg.metadata.lat as number;
              const lng = msg.metadata.lng as number;
              return (
                <div key={msg.id} className="text-center">
                  <a
                    href={`https://www.google.com/maps?q=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-purple-light text-purple-ink rounded-2xl px-5 py-3 text-sm font-semibold hover:bg-purple-mid hover:text-white transition-colors"
                  >
                    📍 Location shared — Open in Google Maps
                  </a>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMine
                    ? 'bg-purple-mid text-white rounded-br-md'
                    : 'bg-white text-gray-800 rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      {currentJob.status !== 'completed' && currentJob.status !== 'cancelled' && (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="max-w-2xl mx-auto flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-mid"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="bg-purple-mid text-white font-bold px-5 py-3 rounded-xl hover:bg-purple-dark transition-colors cursor-pointer disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Completed — Review Section */}
      {currentJob.status === 'completed' && (
        <div className="bg-green-50 border-t border-green-200 px-4 py-4">
          <div className="max-w-2xl mx-auto space-y-4">
            <p className="text-green-700 font-bold text-center">Job completed! 🎉</p>

            {/* Other person's review of you */}
            {otherReview && (
              <div className="bg-white rounded-2xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500">{otherName} reviewed you</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-xl ${star <= otherReview.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
                {otherReview.content && (
                  <p className="text-sm text-gray-700 italic">{otherReview.content}</p>
                )}
              </div>
            )}

            {/* Your review */}
            {myReview ? (
              <div className="bg-white rounded-2xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500">Your review</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-xl ${star <= myReview.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
                {myReview.content && (
                  <p className="text-sm text-gray-700 italic">{myReview.content}</p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-4 space-y-3">
                <p className="text-sm font-bold text-purple-ink">How was your experience with {otherName}?</p>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="text-3xl cursor-pointer hover:scale-110 transition-transform"
                    >
                      <span className={star <= reviewRating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write a short review (optional)"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-mid resize-none"
                />
                <button
                  onClick={async () => {
                    if (reviewRating === 0) return;
                    setSubmittingReview(true);
                    try {
                      const { data } = await supabase.from('reviews').insert({
                        job_id: jobId,
                        reviewer_id: userId,
                        reviewee_id: otherId,
                        rating: reviewRating,
                        content: reviewText.trim() || null,
                      }).select().single();
                      if (data) setMyReview(data as Review);
                      addToast('Review submitted!', 'success');

                      await refreshMyReviewStats();
                      await fetchProfile();
                    } finally {
                      setSubmittingReview(false);
                    }
                  }}
                  disabled={reviewRating === 0 || submittingReview}
                  className="w-full bg-purple-mid text-white font-bold py-3 rounded-xl hover:bg-purple-dark transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
