import { useState, useEffect, useCallback } from 'react';
import { supabase, setUserContext, type EnergyLog, type CrossTrackerData } from '@/lib/supabase';

export interface Discovery {
  factor: string;
  percentage: number;
  direction: 'up' | 'down';
  avgWith: number;
  avgWithout: number;
  sampleSize: number;
}

export function useEnergyLogs(userId: number | null) {
  const [logs, setLogs] = useState<EnergyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [crossTracker, setCrossTracker] = useState<CrossTrackerData>({});

  const fetchLogs = useCallback(async () => {
    if (!userId) return;
    try {
      await setUserContext(userId);
      const { data } = await supabase
        .from('energy_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      setLogs(data || []);
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const logEnergy = useCallback(
    async (level: number, factors: string[]) => {
      if (!userId) return;
      await setUserContext(userId);
      const entry: Omit<EnergyLog, 'id'> = {
        user_id: userId,
        timestamp: new Date().toISOString(),
        level,
        factors,
      };
      const { error } = await supabase.from('energy_logs').insert(entry);
      if (!error) {
        await fetchLogs();
      }
    },
    [userId, fetchLogs]
  );

  const fetchCrossTracker = useCallback(async () => {
    if (!userId) return;
    try {
      await setUserContext(userId);

      // Sleep insight
      const { data: sleepData } = await supabase
        .from('sleep_logs')
        .select('score')
        .eq('user_id', userId);

      if (sleepData && sleepData.length > 0) {
        const goodSleep = logs.filter((l) => {
          const sleepLog = sleepData.find((s: any) => {
            // simplified: just check if any good sleep exists
            return s.score >= 75;
          });
          return sleepLog && l.factors.includes('Good sleep');
        });
        const badSleep = logs.filter((l) => !l.factors.includes('Good sleep'));
        
        if (goodSleep.length > 0 && badSleep.length > 0) {
          const avgGood = goodSleep.reduce((s, l) => s + l.level, 0) / goodSleep.length;
          const avgBad = badSleep.reduce((s, l) => s + l.level, 0) / badSleep.length;
          setCrossTracker((prev) => ({
            ...prev,
            sleepInsight: `After good sleep (score 75+), energy averages ${avgGood.toFixed(1)}/5 vs ${avgBad.toFixed(1)}/5`,
          }));
        }
      }

      // Consumption insight
      const { data: consumptionData } = await supabase
        .from('consumption_logs')
        .select('*')
        .eq('user_id', userId);

      if (consumptionData && consumptionData.length > 0) {
        const tobaccoDays = new Set(consumptionData.map((c: any) => c.timestamp?.split('T')[0]));
        const withTobacco = logs.filter((l) => tobaccoDays.has(l.timestamp.split('T')[0]));
        const withoutTobacco = logs.filter((l) => !tobaccoDays.has(l.timestamp.split('T')[0]));
        
        if (withTobacco.length > 0 && withoutTobacco.length > 0) {
          const avgWith = withTobacco.reduce((s, l) => s + l.level, 0) / withTobacco.length;
          const avgWithout = withoutTobacco.reduce((s, l) => s + l.level, 0) / withoutTobacco.length;
          const pct = Math.round(((avgWithout - avgWith) / avgWith) * 100);
          if (pct > 0) {
            setCrossTracker((prev) => ({
              ...prev,
              consumptionInsight: `Your energy is ${pct}% lower on days you log tobacco use`,
            }));
          }
        }
      }

      // Withdrawal insight
      const { data: withdrawalData } = await supabase
        .from('withdrawal_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true });

      if (withdrawalData && withdrawalData.length > 1) {
        const firstDate = withdrawalData[0].timestamp;
        const earlyLogs = logs.filter((l) => {
          const diff = new Date(l.timestamp).getTime() - new Date(firstDate).getTime();
          return diff < 7 * 86400000 && diff >= 0;
        });
        const recentLogs = logs.filter((l) => {
          const diff = Date.now() - new Date(l.timestamp).getTime();
          return diff < 7 * 86400000;
        });
        
        if (earlyLogs.length > 0 && recentLogs.length > 0) {
          const avgEarly = earlyLogs.reduce((s, l) => s + l.level, 0) / earlyLogs.length;
          const avgRecent = recentLogs.reduce((s, l) => s + l.level, 0) / recentLogs.length;
          const pct = Math.round(((avgRecent - avgEarly) / avgEarly) * 100);
          if (pct > 0) {
            setCrossTracker((prev) => ({
              ...prev,
              withdrawalInsight: `Average energy has increased ${pct}% since day 1 of cessation`,
            }));
          }
        }
      }
    } catch {
      // Cross-tracker tables may not exist
    }
  }, [userId, logs]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (logs.length > 0) {
      fetchCrossTracker();
    }
  }, [logs.length, fetchCrossTracker]);

  // Compute discoveries
  const discoveries: Discovery[] = (() => {
    if (logs.length < 10) return [];

    const allFactors = new Set<string>();
    logs.forEach((l) => l.factors.forEach((f) => allFactors.add(f)));

    const results: Discovery[] = [];

    allFactors.forEach((factor) => {
      const withFactor = logs.filter((l) => l.factors.includes(factor));
      const withoutFactor = logs.filter((l) => !l.factors.includes(factor));

      if (withFactor.length <= 5 || withoutFactor.length === 0) return;

      const avgWith = withFactor.reduce((s, l) => s + l.level, 0) / withFactor.length;
      const avgWithout = withoutFactor.reduce((s, l) => s + l.level, 0) / withoutFactor.length;
      const percentage = ((avgWith - avgWithout) / avgWithout) * 100;

      if (Math.abs(percentage) > 15) {
        results.push({
          factor,
          percentage: Math.round(Math.abs(percentage)),
          direction: percentage > 0 ? 'up' : 'down',
          avgWith: Math.round(avgWith * 10) / 10,
          avgWithout: Math.round(avgWithout * 10) / 10,
          sampleSize: withFactor.length,
        });
      }
    });

    return results.sort((a, b) => b.percentage - a.percentage).slice(0, 4);
  })();

  // Today's logs
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter((l) => l.timestamp.startsWith(today));

  // Weekly averages
  const weeklyData = (() => {
    const days: { date: string; avg: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = logs.filter((l) => l.timestamp.startsWith(dateStr));
      days.push({
        date: d.toLocaleDateString('en', { weekday: 'short' }),
        avg: dayLogs.length > 0
          ? Math.round((dayLogs.reduce((s, l) => s + l.level, 0) / dayLogs.length) * 10) / 10
          : 0,
      });
    }
    return days;
  })();

  const weeklyTrend = (() => {
    const withData = weeklyData.filter((d) => d.avg > 0);
    if (withData.length < 2) return null;
    const first = withData.slice(0, Math.ceil(withData.length / 2));
    const second = withData.slice(Math.ceil(withData.length / 2));
    const avgFirst = first.reduce((s, d) => s + d.avg, 0) / first.length;
    const avgSecond = second.reduce((s, d) => s + d.avg, 0) / second.length;
    return avgSecond > avgFirst ? 'up' : avgSecond < avgFirst ? 'down' : null;
  })();

  // Check for consecutive low days
  const hasConsecutiveLow = (() => {
    const sortedByDate = [...logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const dailyAvgs = new Map<string, number[]>();
    sortedByDate.forEach((l) => {
      const d = l.timestamp.split('T')[0];
      if (!dailyAvgs.has(d)) dailyAvgs.set(d, []);
      dailyAvgs.get(d)!.push(l.level);
    });

    const dates = Array.from(dailyAvgs.keys()).sort().reverse();
    let consecutive = 0;
    for (const date of dates) {
      const levels = dailyAvgs.get(date)!;
      const avg = levels.reduce((s, l) => s + l, 0) / levels.length;
      if (avg <= 2) {
        consecutive++;
        if (consecutive >= 5) return true;
      } else {
        break;
      }
    }
    return false;
  })();

  return {
    logs,
    todayLogs,
    loading,
    logEnergy,
    discoveries,
    weeklyData,
    weeklyTrend,
    crossTracker,
    hasConsecutiveLow,
    totalEntries: logs.length,
  };
}
