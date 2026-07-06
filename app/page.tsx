'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

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
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
          See a roach?<br />
          <span className="text-coral">Get it handled.</span>
        </h1>
        <p className="text-lg sm:text-xl text-purple-light max-w-2xl mx-auto mb-10 leading-relaxed">
          RoachRoasters connects people who spot cockroaches with brave heroes
          who eliminate them — fast, affordable, and on demand.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-purple-ink/50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-14">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Spot a Roach',
                desc: 'Post an alert with your location and how urgent it is. Nearby Roasters get notified instantly.',
              },
              {
                step: '2',
                title: 'Get Matched',
                desc: 'A verified Roach Roaster accepts your alert and heads your way. Chat in real-time to coordinate.',
              },
              {
                step: '3',
                title: 'Problem Solved',
                desc: 'The roach is gone. Rate your Roaster, pay securely, and get on with your roach-free life.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white/5 backdrop-blur rounded-2xl p-8 text-center hover:bg-white/10 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-coral text-white text-lg font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-purple-light text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Sides */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-14">
            Two Sides, One Platform
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-purple-mid/30 to-purple-dark/30 rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-3">Bugaphobes</h3>
              <p className="text-purple-light mb-4 leading-relaxed">
                Terrified of cockroaches? You&apos;re not alone. Post an alert and a
                Roach Roaster will come save the day — no judgment, just relief.
              </p>
              <ul className="space-y-2 text-sm text-purple-light">
                <li className="flex items-center gap-2">
                  <span className="text-coral font-bold">+</span> Post alerts in seconds
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-coral font-bold">+</span> Real-time chat with your Roaster
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-coral font-bold">+</span> Secure payment after the job
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-coral/20 to-coral-dark/20 rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-3">Roach Roasters</h3>
              <p className="text-purple-light mb-4 leading-relaxed">
                Not afraid of a few roaches? Turn your bravery into cash.
                Accept alerts, eliminate roaches, and earn money on your own schedule.
              </p>
              <ul className="space-y-2 text-sm text-purple-light">
                <li className="flex items-center gap-2">
                  <span className="text-coral font-bold">+</span> Set your own price
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-coral font-bold">+</span> Get paid for every job
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-coral font-bold">+</span> Climb the leaderboard
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Trust */}
      <section className="bg-purple-ink/50 py-16">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '24/7', label: 'Available' },
            { value: 'Fast', label: 'Response Time' },
            { value: 'Safe', label: 'Verified Roasters' },
            { value: 'Easy', label: 'Secure Payments' },
          ].map((stat) => (
            <div key={stat.label}>
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
