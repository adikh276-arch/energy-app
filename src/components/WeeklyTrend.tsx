import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface Props {
  data: { date: string; avg: number }[];
  trend: 'up' | 'down' | null;
}

export function WeeklyTrend({ data, trend }: Props) {
  const { t } = useTranslation();
  const hasData = data.some((d) => d.avg > 0);

  if (!hasData) return null;

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t('Weekly Trend')}</h3>
        {trend === 'up' && (
          <span className="flex items-center gap-1 text-xs font-medium text-energy-5 bg-energy-5-bg px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3" /> {t('Trending up')}
          </span>
        )}
        {trend === 'down' && (
          <span className="flex items-center gap-1 text-xs font-medium text-energy-2 bg-energy-2-bg px-2 py-0.5 rounded-full">
            <TrendingDown className="w-3 h-3" /> {t('Trending down')}
          </span>
        )}
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(220 15% 55%)' }}
            />
            <YAxis
              domain={[0, 5]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(220 15% 55%)' }}
              width={20}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(222 25% 10%)',
                border: '1px solid hsl(222 20% 18%)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(220 20% 92%)',
              }}
              formatter={(value: number) => [value.toFixed(1), t('Avg Energy')]}
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="hsl(172 66% 50%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(172 66% 50%)', r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
