import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, Clock } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const tabs = [
    { path: '/', icon: Activity, label: 'Track' },
    { path: '/history', icon: Clock, label: 'History' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border/50 z-40">
      <div className="flex max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors
                ${active ? 'text-primary' : 'text-muted-foreground'}
              `}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{t(tab.label)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
