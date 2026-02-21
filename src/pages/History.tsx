import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Download, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/contexts/TranslationContext';
import { useEnergyLogs } from '@/hooks/useEnergyLogs';
import { LanguageSelector } from '@/components/LanguageSelector';

const dotColors: Record<number, string> = {
  1: 'bg-energy-1',
  2: 'bg-energy-2',
  3: 'bg-energy-3',
  4: 'bg-energy-4',
  5: 'bg-energy-5',
};

export default function History() {
  const { t } = useTranslation();
  const userId = Number(sessionStorage.getItem('eap_user_id')) || 0;
  const { logs, discoveries } = useEnergyLogs(userId);
  const [showAll, setShowAll] = useState(false);

  // Build 30-day chart data
  const chartData = (() => {
    const days: { date: string; avg: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = logs.filter((l) => l.timestamp.startsWith(dateStr));
      days.push({
        date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        avg: dayLogs.length > 0
          ? Math.round((dayLogs.reduce((s, l) => s + l.level, 0) / dayLogs.length) * 10) / 10
          : 0,
      });
    }
    return days;
  })();

  const exportData = () => {
    const csv = [
      'Timestamp,Level,Factors',
      ...logs.map((l) => `${l.timestamp},${l.level},"${l.factors.join(', ')}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'energy-logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayLogs = showAll ? logs : logs.slice(0, 20);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-base font-bold text-foreground">{t('History')}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={exportData}
              className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* 30-day chart */}
        <div className="glass-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">{t('30-Day Trend')}</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: 'hsl(220 15% 55%)' }}
                  interval={6}
                />
                <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(220 15% 55%)' }} width={20} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(222 25% 10%)',
                    border: '1px solid hsl(222 20% 18%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'hsl(220 20% 92%)',
                  }}
                />
                <Line type="monotone" dataKey="avg" stroke="hsl(172 66% 50%)" strokeWidth={2} dot={false} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Discoveries */}
        {discoveries.length > 0 && (
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{t('All Discoveries')}</h3>
            {discoveries.map((d) => (
              <div
                key={d.factor}
                className={`p-3 rounded-lg border text-sm ${
                  d.direction === 'up' ? 'bg-energy-5-bg border-energy-5/20' : 'bg-energy-2-bg border-energy-2/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {d.direction === 'up' ? (
                    <ArrowUp className="w-4 h-4 text-energy-5" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-energy-2" />
                  )}
                  <span className="text-foreground">
                    <strong className={d.direction === 'up' ? 'text-energy-5' : 'text-energy-2'}>
                      {d.percentage}% {d.direction === 'up' ? t('better') : t('worse')}
                    </strong> {t('when:')} {t(d.factor)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('Avg with')}: {d.avgWith}/5 · {t('Without')}: {d.avgWithout}/5 · {d.sampleSize} {t('entries')}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Log list */}
        <div className="glass-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">{t('All Entries')}</h3>
          <div className="space-y-2">
            {displayLogs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-3 p-2.5 bg-secondary/30 rounded-lg"
              >
                <div className={`w-3 h-3 rounded-full shrink-0 ${dotColors[log.level]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{t('Level')} {log.level}/5</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {log.factors.length > 0 && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {log.factors.map((f) => t(f)).join(' · ')}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          {logs.length > 20 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full text-xs text-primary font-medium py-2"
            >
              {t('Show all')} ({logs.length})
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
