'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState('Initializing...');

  useEffect(() => {
    const handleAuth = async () => {
      // Parse tokens from the hash fragment — no decoding (JWTs are ASCII)
      const hash = window.location.hash.substring(1);
      if (hash) {
        const hashObj: Record<string, string> = {};
        for (const part of hash.split('&')) {
          const eqIdx = part.indexOf('=');
          if (eqIdx > 0) {
            hashObj[part.substring(0, eqIdx)] = part.substring(eqIdx + 1);
          }
        }
        const accessToken = hashObj['access_token'];
        const refreshToken = hashObj['refresh_token'];

        if (accessToken && refreshToken) {
          setDebugInfo('Setting session...');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!sessionError) {
            window.location.hash = '';
            router.replace('/');
            return;
          }
          setError(`Session error: ${sessionError.message}`);
          return;
        }
      }

      // Try code exchange (PKCE flow)
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      if (code) {
        setDebugInfo('Exchanging code...');
        const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!codeError) {
          router.replace('/');
          return;
        }
        setError(`Code exchange failed: ${codeError.message}`);
        return;
      }

      // No tokens found at all
      setError('No authentication tokens found in URL.');
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
            <p className="text-white/50 text-xs mt-2">{debugInfo}</p>
            <div className="mt-4 w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
