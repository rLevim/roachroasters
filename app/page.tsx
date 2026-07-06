'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

function PhoneMockup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative mx-auto ${className}`} style={{ width: 220 }}>
      <div className="rounded-[2rem] border-[6px] border-purple-ink/80 bg-purple-ink/80 shadow-2xl overflow-hidden">
        <div className="h-6 bg-purple-ink/80 flex justify-center items-end pb-0.5">
          <div className="w-16 h-3 bg-black/40 rounded-full" />
        </div>
        <div className="bg-lavender overflow-hidden" style={{ height: 420 }}>
          {children}
        </div>
        <div className="h-3 bg-purple-ink/80" />
      </div>
    </div>
  );
}

function MockupHome() {
  return (
    <div className="text-[10px]">
      <div className="bg-purple-dark px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-white/20" />
          <span className="text-white font-bold text-[9px]">RoachRoasters</span>
        </div>
        <div className="flex gap-1">
          <div className="px-1.5 py-0.5 rounded bg-white/20 text-white text-[7px]">Home</div>
          <div className="px-1.5 py-0.5 rounded text-white/60 text-[7px]">Activity</div>
        </div>
      </div>
      <div className="p-3 space-y-2.5">
        <div className="bg-purple-dark rounded-xl p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">R</div>
          <div>
            <p className="text-white font-bold text-xs">Hey, Rotem!</p>
            <p className="text-purple-light text-[8px]">Bugaphobe</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="font-black text-purple-ink text-sm">70</p>
            <p className="text-gray-400 text-[7px]">Bravery</p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="font-black text-purple-ink text-sm">5</p>
            <p className="text-gray-400 text-[7px]">Reviews</p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="font-black text-purple-ink text-sm">5.0</p>
            <p className="text-gray-400 text-[7px]">Rating</p>
          </div>
        </div>
        <div className="bg-coral rounded-xl py-2.5 text-center">
          <p className="text-white font-extrabold text-xs">Post a Roach Alert</p>
        </div>
        <div>
          <p className="font-bold text-purple-ink text-[10px] mb-1.5">My Alerts</p>
          {['Kitchen emergency', 'Bathroom roach', 'Living room'].map((t, i) => (
            <div key={i} className="bg-white rounded-lg p-2 mb-1 flex items-center justify-between">
              <div>
                <p className="font-semibold text-purple-ink text-[9px]">{t}</p>
                <p className="text-gray-400 text-[7px]">Today</p>
              </div>
              <span className="bg-coral text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full">{i + 1} resp</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockupChat() {
  return (
    <div className="text-[10px] h-full flex flex-col">
      <div className="bg-purple-dark px-3 py-2 flex items-center gap-2">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        <div className="w-5 h-5 rounded-full bg-coral/40" />
        <div>
          <p className="text-white font-bold text-[9px]">MikeBugSlayer</p>
          <p className="text-green-300 text-[7px]">Online</p>
        </div>
      </div>
      <div className="flex-1 p-3 space-y-2 bg-gray-50">
        <div className="flex justify-end"><div className="bg-purple-mid text-white rounded-xl rounded-tr-sm px-2.5 py-1.5 max-w-[70%] text-[9px]">Help! Theres a huge roach in my kitchen!</div></div>
        <div className="flex justify-start"><div className="bg-white text-purple-ink rounded-xl rounded-tl-sm px-2.5 py-1.5 max-w-[70%] text-[9px] shadow-sm">On my way! Be there in 10 min</div></div>
        <div className="flex justify-end"><div className="bg-purple-mid text-white rounded-xl rounded-tr-sm px-2.5 py-1.5 max-w-[70%] text-[9px]">Thank you so much!</div></div>
        <div className="flex justify-start"><div className="bg-white text-purple-ink rounded-xl rounded-tl-sm px-2.5 py-1.5 max-w-[70%] text-[9px] shadow-sm">Location shared - Open in Maps</div></div>
        <div className="flex justify-start"><div className="bg-white text-purple-ink rounded-xl rounded-tl-sm px-2.5 py-1.5 max-w-[70%] text-[9px] shadow-sm">Im downstairs, buzzing now</div></div>
        <div className="flex justify-end"><div className="bg-purple-mid text-white rounded-xl rounded-tr-sm px-2.5 py-1.5 max-w-[70%] text-[9px]">Coming to open the door!</div></div>
        <div className="mx-auto text-center"><div className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-[8px] font-semibold inline-block">Roach eliminated! Job completed</div></div>
      </div>
      <div className="bg-white border-t border-gray-200 px-3 py-2 flex gap-2 items-center">
        <div className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-gray-400 text-[9px]">Type a message...</div>
        <div className="w-6 h-6 rounded-full bg-coral flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
        </div>
      </div>
    </div>
  );
}

function MockupBrowse() {
  return (
    <div className="text-[10px]">
      <div className="bg-purple-dark px-3 py-2">
        <p className="text-white font-bold text-xs text-center">Nearby Alerts</p>
      </div>
      <div className="p-3 space-y-2">
        {[
          { loc: 'Tel Aviv, Kitchen', dist: '0.3 km', urgency: 'Urgent', time: '2 min ago' },
          { loc: 'Ramat Gan, Bedroom', dist: '1.2 km', urgency: 'Normal', time: '8 min ago' },
          { loc: 'Herzliya, Bathroom', dist: '3.5 km', urgency: 'Urgent', time: '15 min ago' },
          { loc: 'Givatayim, Office', dist: '2.1 km', urgency: 'Normal', time: '22 min ago' },
        ].map((a, i) => (
          <div key={i} className="bg-white rounded-xl p-2.5 shadow-sm">
            <div className="flex justify-between items-start mb-1">
              <p className="font-bold text-purple-ink text-[10px]">{a.loc}</p>
              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${a.urgency === 'Urgent' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{a.urgency}</span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-[8px]">{a.dist} away - {a.time}</p>
              <div className="bg-coral text-white text-[8px] font-bold px-2 py-1 rounded-lg">Respond</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { initialized, session, profile, loading } = useAuthStore();

  useEffect(() => {
    if (!initialized || loading) return;
    if (!session) return;

    if (!profile) { router.replace('/role-select'); return; }
    if (!profile.terms_accepted_at) { router.replace('/terms'); return; }
    if (!profile.role) { router.replace('/role-select'); return; }
    if (!profile.onboarding_completed) { router.replace('/onboarding'); return; }
    router.replace('/home');
  }, [initialized, session, profile, loading, router]);

  if (!initialized || loading || session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-deep">
        <div className="text-center">
          <img src="/logo.png" alt="RoachRoasters" className="w-64 h-64 mx-auto object-contain" />
          <div className="mt-4 w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-deep text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="RoachRoasters" className="w-10 h-10 object-contain" />
          <span className="text-xl font-black tracking-wide">RoachRoasters</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-coral text-white hover:bg-coral-dark transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
              See a roach?<br />
              <span className="text-coral">Get it handled.</span>
            </h1>
            <p className="text-lg sm:text-xl text-purple-light max-w-lg mb-10 leading-relaxed">
              RoachRoasters connects people who spot cockroaches with brave heroes
              who eliminate them — fast, affordable, and on demand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/login"
                className="px-8 py-4 rounded-2xl text-lg font-extrabold bg-coral text-white hover:bg-coral-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 rounded-2xl text-lg font-extrabold bg-white/10 hover:bg-white/20 transition-all"
              >
                How It Works
              </a>
            </div>
          </div>
          <div className="hidden md:block">
            <PhoneMockup>
              <MockupHome />
            </PhoneMockup>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-purple-ink/50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
            How It Works
          </h2>
          <p className="text-purple-light text-center mb-14 max-w-xl mx-auto">
            From spotting a roach to getting it handled — the whole process takes minutes.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Spot a Roach',
                desc: 'Post an alert with your location and how urgent it is. Nearby Roasters get notified instantly.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                ),
              },
              {
                step: '2',
                title: 'Get Matched',
                desc: 'A verified Roach Roaster accepts your alert and heads your way. Chat in real-time to coordinate.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                ),
              },
              {
                step: '3',
                title: 'Problem Solved',
                desc: 'The roach is gone. Rate your Roaster, pay securely, and get on with your roach-free life.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white/5 backdrop-blur rounded-2xl p-8 text-center hover:bg-white/10 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-coral/20 text-coral mb-4">
                  {item.icon}
                </div>
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-coral text-white text-xs font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-purple-light text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
            See It in Action
          </h2>
          <p className="text-purple-light text-center mb-14 max-w-xl mx-auto">
            Real-time chat, instant alerts, and seamless coordination — all from your phone.
          </p>
          <div className="flex justify-center gap-6 sm:gap-10 overflow-x-auto pb-4">
            <div className="text-center shrink-0">
              <PhoneMockup>
                <MockupBrowse />
              </PhoneMockup>
              <p className="text-purple-light text-sm font-semibold mt-4">Browse Alerts</p>
            </div>
            <div className="text-center shrink-0 -mt-4">
              <PhoneMockup>
                <MockupChat />
              </PhoneMockup>
              <p className="text-purple-light text-sm font-semibold mt-4">Real-time Chat</p>
            </div>
            <div className="text-center shrink-0 hidden sm:block">
              <PhoneMockup>
                <MockupHome />
              </PhoneMockup>
              <p className="text-purple-light text-sm font-semibold mt-4">Your Dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* Two Sides */}
      <section className="bg-purple-ink/50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-14">
            Two Sides, One Platform
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-purple-mid/30 to-purple-dark/30 rounded-2xl p-8 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-purple-mid/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Bugaphobes</h3>
              <p className="text-purple-light mb-5 leading-relaxed">
                Terrified of cockroaches? You&apos;re not alone. Post an alert and a
                Roach Roaster will come save the day — no judgment, just relief.
              </p>
              <ul className="space-y-2.5 text-sm text-purple-light">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-coral/20 flex items-center justify-center shrink-0"><svg className="w-3 h-3 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                  Post alerts in seconds
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-coral/20 flex items-center justify-center shrink-0"><svg className="w-3 h-3 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                  Real-time chat with your Roaster
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-coral/20 flex items-center justify-center shrink-0"><svg className="w-3 h-3 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                  Secure payment after the job
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-coral/20 to-coral-dark/20 rounded-2xl p-8 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-coral/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Roach Roasters</h3>
              <p className="text-purple-light mb-5 leading-relaxed">
                Not afraid of a few roaches? Turn your bravery into cash.
                Accept alerts, eliminate roaches, and earn money on your own schedule.
              </p>
              <ul className="space-y-2.5 text-sm text-purple-light">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-coral/20 flex items-center justify-center shrink-0"><svg className="w-3 h-3 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                  Set your own price
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-coral/20 flex items-center justify-center shrink-0"><svg className="w-3 h-3 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                  Get paid for every job
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-coral/20 flex items-center justify-center shrink-0"><svg className="w-3 h-3 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                  Climb the leaderboard
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Trust */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '24/7', label: 'Available', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { value: 'Fast', label: 'Response Time', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg> },
            { value: 'Safe', label: 'Verified Roasters', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg> },
            { value: 'Easy', label: 'Secure Payments', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg> },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-coral/20 text-coral mb-3">
                {stat.icon}
              </div>
              <p className="text-3xl font-black text-coral">{stat.value}</p>
              <p className="text-sm text-purple-light mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Ready to live roach-free?
          </h2>
          <p className="text-purple-light text-lg mb-8">
            Join RoachRoasters today — whether you need help or want to be the hero.
          </p>
          <Link
            href="/login"
            className="inline-block px-10 py-4 rounded-2xl text-lg font-extrabold bg-coral text-white hover:bg-coral-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-purple-light">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="RoachRoasters" className="w-6 h-6 object-contain" />
            <span className="font-bold text-white">RoachRoasters</span>
          </div>
          <p>&copy; {new Date().getFullYear()} RoachRoasters. Fear no roach.</p>
        </div>
      </footer>
    </div>
  );
}
