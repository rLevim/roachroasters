'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function findNonAscii(s: string): string {
  const bad: string[] = [];
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) > 127) {
      bad.push(`pos ${i}: U+${s.charCodeAt(i).toString(16).padStart(4, '0')}`);
    }
  }
  return bad.length ? bad.join(', ') : 'all ASCII';
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState('Initializing...');

  useEffect(() => {
    const handleAuth = async () => {
      // Diagnostic: check env vars for non-ASCII
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const urlCheck = findNonAscii(url);
      const keyCheck = findNonAscii(key);
      const envDiag = `URL(${url.length}ch): ${urlCheck} | Key(${key.length}ch): ${keyCheck}`;

      // Try PKCE code exchange
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');

      if (code) {
        setDebugInfo('Exchanging code...');
        try {
          const { data, error: codeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!codeError && data.session) {
            router.replace('/');
            return;
          }
          setError(`Exchange failed: ${codeError?.message || 'No session returned'}. Env: ${envDiag}`);
        } catch (e: unknown) {
          setError(`Exception: ${e instanceof Error ? e.message : String(e)}. Env: ${envDiag}`);
        }
        return;
      }

      // Try implicit flow (hash tokens)
      const hash = window.location.hash.substring(1);
      if (hash) {
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken && refreshToken) {
          setDebugInfo('Setting session...');
          try {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!sessionError) {
              router.replace('/');
              return;
            }
            setError(`Session error: ${sessionError.message}. Env: ${envDiag}`);
          } catch (e: unknown) {
            setError(`Exception: ${e instanceof Error ? e.message : String(e)}. Env: ${envDiag}`);
          }
          return;
        }
      }

      setError(`No auth tokens found. Query: ${window.location.search || 'empty'}, Hash: ${hash ? 'present' : 'none'}. Env: ${envDiag}`);
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-deep">
      <div className="text-center px-4">
        {error ? (
          <div className="bg-white rounded-2xl p-8 max-w-md space-y-4">
            <p className="text-red-600 font-bold">Sign in failed</p>
            <p className="text-sm text-gray-500 break-all">{error}</p>
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
