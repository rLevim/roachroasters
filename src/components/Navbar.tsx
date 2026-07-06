'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useJobStore } from '@/stores/jobStore';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, signOut } = useAuthStore();
  const userId = useAuthStore((s) => s.user?.id);
  const isBugaphobe = profile?.role === 'bugaphobe';
  const isRoaster = profile?.role === 'roach_roaster';
  const { myJobs, fetchMyJobs } = useJobStore();

  const [alertCount, setAlertCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('navbar-jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        fetchMyJobs();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!isRoaster) return;

    const fetchAlertCount = async () => {
      const { count } = await supabase
        .from('roach_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');
      setAlertCount(count || 0);
    };

    fetchAlertCount();

    const channel = supabase
      .channel('navbar-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'roach_alerts' }, () => {
        fetchAlertCount();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isRoaster]);

  const activeJobCount = myJobs.filter(j =>
    j.status === 'pending' || j.status === 'accepted' || j.status === 'in_progress'
  ).length;

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const navLink = (href: string, label: string, badge?: number) => (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-semibold relative block ${
        pathname === href ? 'bg-white/20' : 'hover:bg-white/10'
      }`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-coral text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );

  return (
    <nav className="bg-purple-dark text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="RoachRoasters" className="w-9 h-9 object-contain" />
          <span className="text-lg font-black tracking-wide hidden sm:inline">RoachRoasters</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLink('/home', 'Home')}
          {navLink('/browse', isBugaphobe ? 'Roasters' : 'Alerts', isRoaster ? alertCount : undefined)}
          {navLink('/activity', 'Activity', activeJobCount)}
          {isRoaster && navLink('/earnings', 'Earnings')}
          {isBugaphobe && navLink('/payment-method', 'Payment')}
          {navLink('/profile', 'Profile')}
          <button
            onClick={handleSignOut}
            className="ml-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 cursor-pointer relative"
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className={`block h-0.5 bg-white transition-transform ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block h-0.5 bg-white transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-white transition-transform ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
          {(activeJobCount + (isRoaster ? alertCount : 0)) > 0 && !menuOpen && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-coral rounded-full" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-purple-deep border-t border-white/10 px-4 py-3 space-y-1 animate-slide-up">
          {navLink('/home', 'Home')}
          {navLink('/browse', isBugaphobe ? 'Roasters' : 'Alerts', isRoaster ? alertCount : undefined)}
          {navLink('/activity', 'Activity', activeJobCount)}
          {isRoaster && navLink('/earnings', 'Earnings')}
          {isBugaphobe && navLink('/payment-method', 'Payment')}
          {navLink('/profile', 'Profile')}
          {navLink('/leaderboard', 'Leaderboard')}
          {navLink('/support', 'Help & Support')}
          {navLink('/verify', 'Get Verified')}
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold cursor-pointer mt-2"
          >
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
