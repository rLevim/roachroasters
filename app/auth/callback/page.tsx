'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState('Initializing...');

  useEffect(() => {
    let handled = false;

    // Listen for auth state changes — most reliable way to detect login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (handled) return;
      setDebugInfo(`Auth event: ${event}`);
      if (event === 'SIGNED_IN' && session) {
        handled = true;
        router.replace('/');
      }
    });

    // Also try to handle manually after a delay
    const handleAuth = async () => {
      // Give Supabase time to process URL tokens
      await new Promise(r => setTimeout(r, 1000));
      if (handled) return;

      // Check if session was established
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        handled = true;
        router.replace('/');
        return;
      }

      // Try code exchange (PKCE flow)
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        setDebugInfo('Exchanging code...');
        const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!codeError) {
          handled = true;
          router.replace('/');
          return;
        }
        setDebugInfo(`Code exchange failed: ${codeError.message}`);
      }

      // After 5 seconds, show error with debug info
      await new Promise(r => setTimeout(r, 4000));
      if (!handled) {
        const hash = window.location.hash ? 'Has hash' : 'No hash';
        const search = window.location.search || 'No query params';
        setError(`Login could not complete. Debug: ${hash}, ${search}`);
      }
    };

    handleAuth();

    return () => { subscription.unsubscribe(); };
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
