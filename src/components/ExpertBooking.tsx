import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface Props {
  show: boolean;
}

export function ExpertBooking({ show }: Props) {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 border-energy-2/30 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4 text-energy-2" />
        <h3 className="text-sm font-semibold text-foreground">{t('Support Available')}</h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {t('Persistent low energy can increase relapse risk. Support is available.')}
      </p>
      <button className="w-full py-2.5 rounded-lg bg-energy-2-bg border border-energy-2/30 text-energy-2 font-semibold text-sm transition-opacity hover:opacity-80">
        {t('Talk to someone')}
      </button>
    </motion.div>
  );
}
