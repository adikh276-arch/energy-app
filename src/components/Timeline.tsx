import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/contexts/TranslationContext';
import type { EnergyLog } from '@/lib/supabase';

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6AM to 11PM

const dotColors: Record<number, string> = {
  1: 'bg-energy-1',
  2: 'bg-energy-2',
  3: 'bg-energy-3',
  4: 'bg-energy-4',
  5: 'bg-energy-5',
};

interface Props {
  logs: EnergyLog[];
}

export function Timeline({ logs }: Props) {
  const { t } = useTranslation();
  const [selectedLog, setSelectedLog] = useState<EnergyLog | null>(null);

  if (logs.length === 0) return null;

  return (
    <div className="glass-card p-4 space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{t("Today's Timeline")}</h3>

      <div className="relative overflow-x-auto scrollbar-hide">
        <div className="flex items-end gap-0 min-w-[500px] h-16 relative">
          {/* Hour marks */}
          {HOURS.map((hour) => (
            <div key={hour} className="flex-1 flex flex-col items-center justify-end">
              <div className="w-px h-3 bg-border/40" />
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {hour % 12 || 12}{hour < 12 ? 'a' : 'p'}
              </span>
            </div>
          ))}

          {/* Dots */}
          {logs.map((log, i) => {
            const time = new Date(log.timestamp);
            const hour = time.getHours() + time.getMinutes() / 60;
            const position = ((hour - 6) / 17) * 100;
            if (position < 0 || position > 100) return null;

            return (
              <motion.button
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute bottom-8 w-3.5 h-3.5 rounded-full ${dotColors[log.level]} 
                  border-2 border-background cursor-pointer z-10`}
                style={{ left: `${position}%` }}
                onClick={() => setSelectedLog(selectedLog === log ? null : log)}
              />
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedLog && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="bg-secondary/50 rounded-lg p-3 text-xs space-y-1"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${dotColors[selectedLog.level]}`} />
              <span className="font-medium text-foreground">
                {t('Level')} {selectedLog.level}/5
              </span>
              <span className="text-muted-foreground">
                {new Date(selectedLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {selectedLog.factors.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedLog.factors.map((f) => (
                  <span key={f} className="px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                    {t(f)}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
