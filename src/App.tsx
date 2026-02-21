import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { BottomNav } from '@/components/BottomNav';
import { supabase } from '@/lib/supabase';
import Index from './pages/Index';
import History from './pages/History';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

type AuthState = 'loading' | 'authenticated' | 'error';

function AuthGate({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    const run = async () => {
      // Check if already authenticated
      const existing = sessionStorage.getItem('eap_user_id');
      if (existing) {
        setAuthState('authenticated');
        return;
      }

      // Check URL for token
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        window.location.href = '/token';
        return;
      }

      try {
        const res = await fetch('https://api.mantracare.com/user/user-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) throw new Error('Auth failed');

        const data = await res.json();
        const userId = data.user_id;

        if (!userId) throw new Error('No user_id');

        sessionStorage.setItem('eap_user_id', String(userId));

        // Clean URL
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url.toString());

        // Upsert user
        await supabase.from('users').upsert({ id: userId }, { onConflict: 'id' });

        setAuthState('authenticated');
      } catch {
        window.location.href = '/token';
      }
    };

    run();
  }, []);

  if (authState === 'loading') return <LoadingScreen />;
  if (authState === 'error') return null;

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <TranslationProvider>
        <AuthGate>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/history" element={<History />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </BrowserRouter>
        </AuthGate>
      </TranslationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
