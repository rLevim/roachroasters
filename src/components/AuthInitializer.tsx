'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

export function AuthInitializer() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const handleOAuthCode = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }
      initialize();
    };
    handleOAuthCode();
  }, [initialize]);

  return null;
}
