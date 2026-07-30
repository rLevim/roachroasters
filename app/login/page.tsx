'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/Button';

type AuthMode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const initialized = useAuthStore((s) => s.initialized);
  const [authMode, setAuthMode] = useState<AuthMode>('signup');

  useEffect(() => {
    if (initialized && session) {
      router.replace('/');
    }
  }, [initialized, session, router]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) { setErrorMsg(error.message); setLoading(false); }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo },
    });
    if (error) { setErrorMsg(error.message); setLoading(false); }
  };

  const handleEmailAuth = async () => {
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) {
          setErrorMsg(error.message);
        } else {
          router.push('/');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) {
          setErrorMsg(error.message);
        } else {
          router.push('/');
        }
      }
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-deep flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="RoachRoasters" className="w-48 h-48 mx-auto object-contain" />
          <p className="text-purple-light text-lg mt-1">Fear no roach.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 space-y-5 shadow-xl">
          <h2 className="text-2xl font-extrabold text-purple-ink text-center">
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm font-semibold text-center">{errorMsg}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-purple-ink block mb-1">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
              className="w-full border border-gray-300 rounded-xl p-4 text-base bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-mid"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-purple-ink block mb-1">Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
              className="w-full border border-gray-300 rounded-xl p-4 text-base bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-mid"
            />
          </div>

          <Button
            title={authMode === 'login' ? 'Sign In' : 'Create Account'}
            onClick={handleEmailAuth}
            variant="coral"
            size="lg"
            loading={loading}
            className="w-full"
          />

          <button
            onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setErrorMsg(''); }}
            className="w-full text-center text-purple-mid text-sm font-semibold hover:underline cursor-pointer"
          >
            {authMode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>

          <div className="flex items-center gap-4 my-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-300 rounded-xl px-8 py-4 text-lg font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <button
            onClick={handleFacebookLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] transition-all cursor-pointer disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </button>
        </div>
        <p className="text-center text-purple-light/70 text-xs mt-4">
          <a href="/terms-of-use" className="hover:text-white underline">Terms of Use</a>
          {' · '}
          <a href="/privacy" className="hover:text-white underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
