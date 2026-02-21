import { EnergyLogger } from '@/components/EnergyLogger';
import { Timeline } from '@/components/Timeline';
import { DiscoveriesCard } from '@/components/DiscoveriesCard';
import { WeeklyTrend } from '@/components/WeeklyTrend';
import { CrossTrackerInsights } from '@/components/CrossTrackerInsights';
import { ExpertBooking } from '@/components/ExpertBooking';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useTranslation } from '@/contexts/TranslationContext';
import { useEnergyLogs } from '@/hooks/useEnergyLogs';

export default function Index() {
  const { t } = useTranslation();
  const userId = Number(sessionStorage.getItem('eap_user_id')) || 0;
  const energyData = useEnergyLogs(userId);
  const {
    todayLogs,
    logEnergy,
    discoveries,
    weeklyData,
    crossTracker,
    hasConsecutiveLow,
    totalEntries,
  } = energyData;
  const weeklyTrend = energyData.weeklyTrend as 'up' | 'down' | null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-base font-bold text-foreground">{t('Energy Patterns')}</h1>
            <p className="text-[11px] text-muted-foreground">{t('Discover what drives your energy')}</p>
          </div>
          <LanguageSelector />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <EnergyLogger onLog={logEnergy} />
        <Timeline logs={todayLogs} />
        <DiscoveriesCard discoveries={discoveries} totalEntries={totalEntries} />
        <WeeklyTrend data={weeklyData} trend={weeklyTrend} />
        <CrossTrackerInsights data={crossTracker} />
        <ExpertBooking show={hasConsecutiveLow} />
      </main>
    </div>
  );
}
