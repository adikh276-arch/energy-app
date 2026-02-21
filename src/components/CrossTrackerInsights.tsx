import { Lightbulb } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import type { CrossTrackerData } from '@/lib/supabase';

interface Props {
  data: CrossTrackerData;
}

export function CrossTrackerInsights({ data }: Props) {
  const { t } = useTranslation();
  const insights = [data.sleepInsight, data.consumptionInsight, data.withdrawalInsight].filter(Boolean);

  if (insights.length === 0) return null;

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-warning" />
        <h3 className="text-sm font-semibold text-foreground">{t('Cross-Tracker Insights')}</h3>
      </div>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="p-3 bg-secondary/50 rounded-lg text-xs text-foreground leading-relaxed"
          >
            {t(insight!)}
          </div>
        ))}
      </div>
    </div>
  );
}
