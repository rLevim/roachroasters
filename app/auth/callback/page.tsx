'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!exchangeError) {
          router.replace('/');
          return;
        }
        setError(exchangeError.message);
        return;
      }

      // Fallback: check for hash-based tokens (legacy implicit flow links)
      const hash = window.location.hash.substring(1);
      if (hash) {
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!sessionError) {
            router.replace('/');
            return;
          }
          setError(sessionError.message);
          return;
        }
      }

      // Last resort: wait for Supabase to auto-detect session
      await new Promise(r => setTimeout(r, 1500));
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/');
        return;
      }

      setError('Login could not complete. Please try again.');
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-deep">
      <div className="text-center px-4">
        {error ? (
          <div className="bg-white rounded-2xl p-8 max-w-md space-y-4">
            <p className="text-red-600 font-bold">Sign in failed</p>
            <p className="text-sm text-gray-500">{error}</p>
            <a
              href="/login"
              className="inline-block bg-purple-mid text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-dark transition-colors"
            >
              Back to Login
            </a>
          </div>
        ) : (
          <div>
            <img src="/logo.png" alt="RoachRoasters" className="w-32 h-32 mx-auto object-contain" />
            <p className="text-white font-semibold mt-4">Signing you in...</p>
            <div className="mt-4 w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
