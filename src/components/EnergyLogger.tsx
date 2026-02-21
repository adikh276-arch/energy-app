import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/contexts/TranslationContext';

const LEVELS = [
  { level: 1, emoji: '🪫', label: 'Severely depleted', color: 'energy-1' },
  { level: 2, emoji: '😩', label: 'Low', color: 'energy-2' },
  { level: 3, emoji: '😐', label: 'Moderate', color: 'energy-3' },
  { level: 4, emoji: '⚡', label: 'Good', color: 'energy-4' },
  { level: 5, emoji: '🚀', label: 'High', color: 'energy-5' },
];

const FACTORS = [
  { emoji: '💤', label: 'Poor sleep' },
  { emoji: '💤', label: 'Good sleep' },
  { emoji: '☕', label: 'Caffeine' },
  { emoji: '🍽️', label: 'Skipped meal' },
  { emoji: '🍽️', label: 'Ate well' },
  { emoji: '💪', label: 'Exercise' },
  { emoji: '😰', label: 'Stress' },
  { emoji: '💊', label: 'Medication' },
  { emoji: '🚬', label: 'Withdrawal' },
  { emoji: '🔄', label: 'Other' },
];

const levelColorClasses: Record<number, { bg: string; border: string; text: string; glow: string }> = {
  1: { bg: 'bg-energy-1-bg', border: 'border-energy-1/30', text: 'text-energy-1', glow: 'energy-glow-1' },
  2: { bg: 'bg-energy-2-bg', border: 'border-energy-2/30', text: 'text-energy-2', glow: 'energy-glow-2' },
  3: { bg: 'bg-energy-3-bg', border: 'border-energy-3/30', text: 'text-energy-3', glow: 'energy-glow-3' },
  4: { bg: 'bg-energy-4-bg', border: 'border-energy-4/30', text: 'text-energy-4', glow: 'energy-glow-4' },
  5: { bg: 'bg-energy-5-bg', border: 'border-energy-5/30', text: 'text-energy-5', glow: 'energy-glow-5' },
};

interface Props {
  onLog: (level: number, factors: string[]) => void;
}

export function EnergyLogger({ onLog }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number | null>(null);
  const [factors, setFactors] = useState<string[]>([]);
  const [logging, setLogging] = useState(false);

  const toggleFactor = (label: string) => {
    setFactors((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    );
  };

  const handleLog = async () => {
    if (!selected) return;
    setLogging(true);
    await onLog(selected, factors);
    setSelected(null);
    setFactors([]);
    setLogging(false);
  };

  return (
    <div className="glass-card p-4 space-y-3">
      <h2 className="text-sm font-semibold text-foreground">{t('How are your energy levels?')}</h2>

      <div className="space-y-2">
        {LEVELS.map((item) => {
          const colors = levelColorClasses[item.level];
          const isSelected = selected === item.level;
          return (
            <motion.button
              key={item.level}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(item.level)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all
                ${isSelected ? `${colors.bg} ${colors.border} ${colors.glow}` : 'bg-secondary/50 border-border/30 hover:bg-secondary'}
              `}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className={`text-sm font-medium ${isSelected ? colors.text : 'text-foreground'}`}>
                {t(item.label)}
              </span>
              <span className={`ml-auto text-xs ${isSelected ? colors.text : 'text-muted-foreground'}`}>
                {item.level}/5
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{t("What might be affecting it?")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("Pick what feels relevant - we'll find patterns")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {FACTORS.map((f) => {
                const isActive = factors.includes(f.label);
                return (
                  <motion.button
                    key={f.label}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => toggleFactor(f.label)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                      ${isActive
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'bg-secondary/50 border-border/30 text-muted-foreground hover:text-foreground'}
                    `}
                  >
                    {f.emoji} {t(f.label)}
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleLog}
              disabled={logging}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm
                disabled:opacity-50 transition-opacity"
            >
              {logging ? t('Logging...') : t('Log')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
