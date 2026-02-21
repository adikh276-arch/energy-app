import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import type { Discovery } from '@/hooks/useEnergyLogs';

interface Props {
  discoveries: Discovery[];
  totalEntries: number;
}

export function DiscoveriesCard({ discoveries, totalEntries }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | null>(null);
  const unlocked = totalEntries >= 10;

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{t('Your Discoveries')}</h3>
      </div>

      {!unlocked ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {t('Log more entries to unlock patterns')}
            </span>
            <span className="text-primary font-semibold">{totalEntries}/10</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(totalEntries / 10) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            ✨ {t("We're building your personal energy profile")}
          </p>
        </div>
      ) : discoveries.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {t('Keep logging consistently — patterns will emerge soon')}
        </p>
      ) : (
        <div className="space-y-2">
          {discoveries.map((d, i) => (
            <motion.div
              key={d.factor}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <button
                onClick={() => setExpanded(expanded === d.factor ? null : d.factor)}
                className={`w-full text-left p-3 rounded-lg border transition-all
                  ${d.direction === 'up'
                    ? 'bg-energy-5-bg border-energy-5/20'
                    : 'bg-energy-2-bg border-energy-2/20'}
                `}
              >
                <div className="flex items-center gap-2">
                  {d.direction === 'up' ? (
                    <ArrowUp className="w-4 h-4 text-energy-5 shrink-0" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-energy-2 shrink-0" />
                  )}
                  <span className="text-sm text-foreground">
                    {t('You feel')} <strong className={d.direction === 'up' ? 'text-energy-5' : 'text-energy-2'}>
                      {d.percentage}% {d.direction === 'up' ? t('better') : t('worse')}
                    </strong> {t('when:')} {t(d.factor)}
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {expanded === d.factor && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 text-xs text-muted-foreground space-y-1 bg-secondary/30 rounded-b-lg">
                      <p>{t('Average with')} {t(d.factor)}: <span className="text-foreground font-medium">{d.avgWith}/5</span></p>
                      <p>{t('Average without')}: <span className="text-foreground font-medium">{d.avgWithout}/5</span></p>
                      <p>{t('Based on')} {d.sampleSize} {t('entries')}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
