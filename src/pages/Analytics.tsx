import React, { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { useTradeContext } from '../context/TradeContext';
import { calculateMetrics, formatCurrency } from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';

export function Analytics() {
  const { trades } = useTradeContext();
  
  const setupPerformance = useMemo(() => {
    const perf: Record<string, { pnl: number, wins: number, losses: number }> = {};
    
    trades.forEach(t => {
      if (!perf[t.setup]) perf[t.setup] = { pnl: 0, wins: 0, losses: 0 };
      perf[t.setup].pnl += t.pnl;
      if (t.pnl > 0) perf[t.setup].wins++;
      else perf[t.setup].losses++;
    });

    return Object.entries(perf).map(([setup, data]) => ({
      name: setup,
      pnl: data.pnl,
      winRate: (data.wins / (data.wins + data.losses)) * 100
    })).sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  const weekdayPerformance = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const perf = days.map(day => ({ day, pnl: 0 }));
    
    trades.forEach(t => {
      const dayIndex = new Date(t.exitDate).getDay();
      perf[dayIndex].pnl += t.pnl;
    });
    
    // remove saturday/sunday if 0
    return perf.filter(p => p.pnl !== 0 || p.day !== 'Sunday' && p.day !== 'Saturday');
  }, [trades]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem' }}>Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        <Card>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Performance by Setup</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={setupPerformance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  cursor={{fill: 'var(--bg-secondary)'}}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {setupPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'var(--accent-win)' : 'var(--accent-loss)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>PnL by Day of Week</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayPerformance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  cursor={{fill: 'var(--bg-secondary)'}}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {weekdayPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'var(--accent-win)' : 'var(--accent-loss)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </div>
  );
}
