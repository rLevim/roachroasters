'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

function PhoneMockup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative mx-auto ${className}`} style={{ width: 180 }}>
      <div className="rounded-[1.5rem] border-[5px] border-purple-ink/80 bg-purple-ink/80 shadow-2xl overflow-hidden">
        <div className="h-5 bg-purple-ink/80 flex justify-center items-end pb-0.5">
          <div className="w-12 h-2.5 bg-black/40 rounded-full" />
        </div>
        <div className="bg-lavender overflow-hidden" style={{ height: 340 }}>
          {children}
        </div>
        <div className="h-2 bg-purple-ink/80" />
      </div>
    </div>
  );
}

function MockupHome() {
  return (
    <div className="text-[9px]">
      <div className="bg-purple-dark px-2.5 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 rounded-full bg-white/20" />
          <span className="text-white font-bold text-[8px]">RoachRoasters</span>
        </div>
      </div>
      <div className="p-2.5 space-y-2">
        <div className="bg-purple-dark rounded-lg p-2.5 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-[10px]">R</div>
          <div>
            <p className="text-white font-bold text-[10px]">Hey, Rotem!</p>
            <p className="text-purple-light text-[7px]">Bugaphobe</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="bg-white rounded-md p-1.5 text-center">
            <p className="font-black text-purple-ink text-xs">70</p>
            <p className="text-gray-400 text-[6px]">Bravery</p>
          </div>
          <div className="bg-white rounded-md p-1.5 text-center">
            <p className="font-black text-purple-ink text-xs">5</p>
            <p className="text-gray-400 text-[6px]">Reviews</p>
          </div>
          <div className="bg-white rounded-md p-1.5 text-center">
            <p className="font-black text-purple-ink text-xs">5.0</p>
            <p className="text-gray-400 text-[6px]">Rating</p>
          </div>
        </div>
        <div className="bg-coral rounded-lg py-2 text-center">
          <p className="text-white font-extrabold text-[10px]">Post a Roach Alert</p>
        </div>
        <div>
          <p className="font-bold text-purple-ink text-[9px] mb-1">My Alerts</p>
          {['Kitchen emergency', 'Bathroom roach'].map((t, i) => (
            <div key={i} className="bg-white rounded-md p-1.5 mb-1 flex items-center justify-between">
              <div>
                <p className="font-semibold text-purple-ink text-[8px]">{t}</p>
                <p className="text-gray-400 text-[6px]">Today</p>
              </div>
              <span className="bg-coral text-white text-[6px] font-bold px-1 py-0.5 rounded-full">{i + 1} resp</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockupChat() {
  return (
    <div className="text-[9px] h-full flex flex-col">
      <div className="bg-purple-dark px-2.5 py-1.5 flex items-center gap-2">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        <div className="w-4 h-4 rounded-full bg-coral/40" />
        <div>
          <p className="text-white font-bold text-[8px]">MikeBugSlayer</p>
          <p className="text-green-300 text-[6px]">Online</p>
        </div>
      </div>
      <div className="flex-1 p-2.5 space-y-1.5 bg-gray-50">
        <div className="flex justify-end"><div className="bg-purple-mid text-white rounded-lg rounded-tr-sm px-2 py-1 max-w-[75%] text-[8px]">Help! Huge roach in my kitchen!</div></div>
        <div className="flex justify-start"><div className="bg-white text-purple-ink rounded-lg rounded-tl-sm px-2 py-1 max-w-[75%] text-[8px] shadow-sm">On my way! 10 min</div></div>
        <div className="flex justify-end"><div className="bg-purple-mid text-white rounded-lg rounded-tr-sm px-2 py-1 max-w-[75%] text-[8px]">Thank you so much!</div></div>
        <div className="flex justify-start"><div className="bg-white text-purple-ink rounded-lg rounded-tl-sm px-2 py-1 max-w-[75%] text-[8px] shadow-sm">Location shared - Open Maps</div></div>
        <div className="flex justify-start"><div className="bg-white text-purple-ink rounded-lg rounded-tl-sm px-2 py-1 max-w-[75%] text-[8px] shadow-sm">Im downstairs</div></div>
        <div className="flex justify-end"><div className="bg-purple-mid text-white rounded-lg rounded-tr-sm px-2 py-1 max-w-[75%] text-[8px]">Opening the door!</div></div>
        <div className="mx-auto text-center"><div className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-[7px] font-semibold inline-block">Job completed</div></div>
      </div>
      <div className="bg-white border-t border-gray-200 px-2 py-1.5 flex gap-1.5 items-center">
        <div className="flex-1 bg-gray-100 rounded-full px-2.5 py-1 text-gray-400 text-[8px]">Type a message...</div>
        <div className="w-5 h-5 rounded-full bg-coral flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
        </div>
      </div>
    </div>
  );
}

function MockupBrowse() {
  return (
    <div className="text-[9px]">
      <div className="bg-purple-dark px-2.5 py-1.5">
        <p className="text-white font-bold text-[10px] text-center">Nearby Alerts</p>
      </div>
      <div className="p-2.5 space-y-1.5">
        {[
          { loc: 'Tel Aviv, Kitchen', dist: '0.3 km', urgency: 'Urgent', time: '2m ago' },
          { loc: 'Ramat Gan, Bedroom', dist: '1.2 km', urgency: 'Normal', time: '8m ago' },
          { loc: 'Herzliya, Bathroom', dist: '3.5 km', urgency: 'Urgent', time: '15m ago' },
          { loc: 'Givatayim, Office', dist: '2.1 km', urgency: 'Normal', time: '22m ago' },
        ].map((a, i) => (
          <div key={i} className="bg-white rounded-lg p-2 shadow-sm">
            <div className="flex justify-between items-start mb-0.5">
              <p className="font-bold text-purple-ink text-[9px]">{a.loc}</p>
              <span className={`text-[6px] font-bold px-1 py-0.5 rounded-full ${a.urgency === 'Urgent' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{a.urgency}</span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-[7px]">{a.dist} - {a.time}</p>
              <div className="bg-coral text-white text-[7px] font-bold px-1.5 py-0.5 rounded-md">Respond</div>
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
  const { t, lang, setLang } = useI18n();

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
          <img src="/logo.png" alt="RoachRoasters" className="w-48 h-48 sm:w-64 sm:h-64 mx-auto object-contain" />
          <div className="mt-4 w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-deep text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="RoachRoasters" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
          <span className="text-lg sm:text-xl font-black tracking-wide">RoachRoasters</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setLang(lang === 'en' ? 'he' : 'en')}
            className="px-2 py-1.5 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors cursor-pointer"
          >
            {lang === 'en' ? 'עברית' : 'English'}
          </button>
          <Link
            href="/login"
            className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
          >
            {t('landing.login')}
          </Link>
          <Link
            href="/login"
            className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-bold bg-coral text-white hover:bg-coral-dark transition-colors"
          >
            {t('landing.signup')}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-14 sm:pb-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-4 sm:mb-6">
              {t('landing.hero.title1')}<br />
              <span className="text-coral">{t('landing.hero.title2')}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-purple-light max-w-lg mx-auto md:mx-0 mb-8 sm:mb-10 leading-relaxed">
              {t('landing.hero.desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
              <Link
                href="/login"
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-extrabold bg-coral text-white hover:bg-coral-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-center"
              >
                {t('landing.hero.cta')}
              </Link>
              <a
                href="#how-it-works"
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-extrabold bg-white/10 hover:bg-white/20 transition-all text-center"
              >
                {t('landing.hero.howItWorks')}
              </a>
            </div>
            <p className="text-sm text-purple-light/70 mt-4">{t('landing.hero.free')}</p>
          </div>
          <div className="hidden md:block relative">
            <img src="/images/bugaphobe-hero.png" alt="Scared of a cockroach" className="w-full max-w-md mx-auto rounded-3xl shadow-2xl" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-purple-ink/50 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-3 sm:mb-4">
            {t('landing.howItWorks.title')}
          </h2>
          <p className="text-purple-light text-center mb-10 sm:mb-14 max-w-xl mx-auto text-sm sm:text-base">
            {t('landing.howItWorks.desc')}
          </p>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                step: '1',
                title: t('landing.howItWorks.step1.title'),
                desc: t('landing.howItWorks.step1.desc'),
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                ),
              },
              {
                step: '2',
                title: t('landing.howItWorks.step2.title'),
                desc: t('landing.howItWorks.step2.desc'),
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                ),
              },
              {
                step: '3',
                title: t('landing.howItWorks.step3.title'),
                desc: t('landing.howItWorks.step3.desc'),
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white/5 backdrop-blur rounded-2xl p-6 sm:p-8 text-center hover:bg-white/10 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-coral/20 text-coral mb-3 sm:mb-4">
                  {item.icon}
                </div>
                <div className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-coral text-white text-xs font-bold mb-2 sm:mb-3">
                  {item.step}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-purple-light text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-3 sm:mb-4">
            {t('landing.preview.title')}
          </h2>
          <p className="text-purple-light text-center mb-10 sm:mb-14 max-w-xl mx-auto text-sm sm:text-base">
            {t('landing.preview.desc')}
          </p>
          <div className="flex justify-center gap-4 sm:gap-8">
            <div className="text-center">
              <PhoneMockup>
                <MockupBrowse />
              </PhoneMockup>
              <p className="text-purple-light text-xs sm:text-sm font-semibold mt-3 sm:mt-4">{t('landing.preview.browse')}</p>
            </div>
            <div className="text-center -mt-3 sm:-mt-4">
              <PhoneMockup>
                <MockupChat />
              </PhoneMockup>
              <p className="text-purple-light text-xs sm:text-sm font-semibold mt-3 sm:mt-4">{t('landing.preview.chat')}</p>
            </div>
            <div className="text-center hidden sm:block">
              <PhoneMockup>
                <MockupHome />
              </PhoneMockup>
              <p className="text-purple-light text-xs sm:text-sm font-semibold mt-3 sm:mt-4">{t('landing.preview.dashboard')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Two Sides */}
      <section className="bg-purple-ink/50 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-10 sm:mb-14">
            {t('landing.twoSides.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
            <div className="bg-gradient-to-br from-purple-mid/30 to-purple-dark/30 rounded-2xl overflow-hidden border border-white/10">
              <div className="h-32 sm:h-56 overflow-hidden">
                <img src="/images/bugaphobe-hero.png" alt="Bugaphobe" className="w-full h-full object-cover" />
              </div>
              <div className="p-5 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{t('landing.twoSides.bugaphobes')}</h3>
                <p className="text-purple-light mb-4 sm:mb-5 leading-relaxed text-sm sm:text-base">
                  {t('landing.twoSides.bugaphobes.desc')}
                </p>
                <ul className="space-y-2 sm:space-y-2.5 text-sm text-purple-light">
                  <li className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 rounded-full bg-coral/20 flex items-center justify-center shrink-0"><svg className="w-3 h-3 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                    {t('landing.twoSides.bugaphobes.1')}
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 rounded-full bg-coral/20 flex items-center justify-center shrink-0"><svg className="w-3 h-3 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                    {t('landing.twoSides.bugaphobes.2')}
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 rounded-full bg-coral/20 flex items-center justify-center shrink-0"><svg className="w-3 h-3 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                    {t('landing.twoSides.bugaphobes.3')}
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-gradient-to-br from-coral/20 to-coral-dark/20 rounded-2xl overflow-hidden border border-white/10">
              <div className="h-32 sm:h-56 overflow-hidden">
                <img src="/images/roaster-hero.png" alt="Roach Roaster" className="w-full h-full object-cover" />
              </div>
              <div className="p-5 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{t('landing.twoSides.roasters')}</h3>
                <p className="text-purple-light mb-4 sm:mb-5 leading-relaxed text-sm sm:text-base">
                  {t('landing.twoSides.roasters.desc')}
                </p>
                <ul className="space-y-2 sm:space-y-2.5 text-sm text-purple-light">
                  <li className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 rounded-full bg-coral/20 flex items-center justify-center shrink-0"><svg className="w-3 h-3 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                    {t('landing.twoSides.roasters.1')}
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 rounded-full bg-coral/20 flex items-center justify-center shrink-0"><svg className="w-3 h-3 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                    {t('landing.twoSides.roasters.2')}
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 rounded-full bg-coral/20 flex items-center justify-center shrink-0"><svg className="w-3 h-3 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                    {t('landing.twoSides.roasters.3')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Trust */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          {[
            { value: '24/7', label: t('landing.stats.available'), icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { value: 'Fast', label: t('landing.stats.response'), icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg> },
            { value: 'Safe', label: t('landing.stats.verified'), icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg> },
            { value: 'Free', label: t('landing.stats.fees'), icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-coral/20 text-coral mb-2 sm:mb-3">
                {stat.icon}
              </div>
              <p className="text-2xl sm:text-3xl font-black text-coral">{stat.value}</p>
              <p className="text-xs sm:text-sm text-purple-light mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-full overflow-hidden shadow-lg">
            <img src="/images/roach-dead.jpg" alt="Problem solved" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-purple-light text-base sm:text-lg mb-6 sm:mb-8">
            {t('landing.cta.desc')}
          </p>
          <Link
            href="/login"
            className="inline-block px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-extrabold bg-coral text-white hover:bg-coral-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            {t('landing.cta.button')}
          </Link>
        </div>
      </section>

      {/* Support the Platform */}
      <section className="py-10 sm:py-12 bg-purple-ink/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-base sm:text-lg font-bold mb-2">{t('landing.support.title')}</p>
          <p className="text-purple-light text-xs sm:text-sm mb-4 sm:mb-6">
            {t('landing.support.desc')}
          </p>
          <a
            href="https://www.paypal.com/paypalme/rLevim"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-2xl font-bold bg-yellow-400 text-yellow-900 hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {t('landing.support.button')}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-sm text-purple-light">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="RoachRoasters" className="w-6 h-6 object-contain" />
            <span className="font-bold text-white">RoachRoasters</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms-of-use" className="hover:text-white transition-colors">{t('landing.footer.terms')}</Link>
            <span>&copy; {new Date().getFullYear()} RoachRoasters</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
