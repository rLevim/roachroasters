'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      // Surface any error the OAuth provider returned in the URL (query or hash)
      // instead of silently spinning. Facebook/Google send back e.g.
      // ?error=...&error_description=... when something goes wrong (a common one
      // is Facebook not returning an email address).
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const providerError =
        query.get('error_description') || query.get('error') ||
        hash.get('error_description') || hash.get('error');
      if (providerError) {
        setError(decodeURIComponent(providerError.replace(/\+/g, ' ')));
        return;
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      if (session) {
        router.replace('/');
        return;
      }

      // Give detectSessionInUrl a moment to process the code/hash
      await new Promise(r => setTimeout(r, 2000));
      const { data: { session: retrySession } } = await supabase.auth.getSession();
      if (retrySession) {
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
