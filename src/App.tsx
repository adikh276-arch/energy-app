import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { AuthProvider } from '@/contexts/AuthProvider';
import { LoadingScreen } from '@/components/LoadingScreen';
import { BottomNav } from '@/components/BottomNav';
import Index from './pages/Index';
import History from './pages/History';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <TranslationProvider>
        <AuthProvider>
          <BrowserRouter basename="/energy-app">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/history" element={<History />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </BrowserRouter>
        </AuthProvider>
      </TranslationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
