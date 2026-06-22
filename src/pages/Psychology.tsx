import React, { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { useTradeContext } from '../context/TradeContext';
import { format } from 'date-fns';

export function Psychology() {
  const { trades } = useTradeContext();

  const emotionStats = useMemo(() => {
    const stats: Record<string, { count: number, pnl: number }> = {};
    trades.forEach(t => {
      if (!stats[t.emotion]) stats[t.emotion] = { count: 0, pnl: 0 };
      stats[t.emotion].count++;
      stats[t.emotion].pnl += t.pnl;
    });
    return Object.entries(stats).map(([emotion, data]) => ({
      emotion,
      ...data
    })).sort((a, b) => b.count - a.count);
  }, [trades]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem' }}>Psychology & Journal</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Emotion Impact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {emotionStats.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No data yet.</p>}
              {emotionStats.map(stat => (
                <div key={stat.emotion} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '500' }}>{stat.emotion}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({stat.count} trades)</span>
                  </div>
                  <span style={{ fontWeight: '600', color: stat.pnl >= 0 ? 'var(--accent-win)' : 'var(--accent-loss)' }}>
                    {stat.pnl > 0 ? '+' : ''}${stat.pnl.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem' }}>Recent Journal Entries</h3>
          {trades.filter(t => t.notes && t.notes.trim() !== '').length === 0 && (
            <Card><p style={{ color: 'var(--text-muted)' }}>No journal notes found in recent trades.</p></Card>
          )}
          
          {trades.filter(t => t.notes && t.notes.trim() !== '').slice(0, 10).map(trade => (
            <Card key={trade.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600' }}>{trade.symbol}</span>
                  <span style={{ 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px', 
                    backgroundColor: 'var(--bg-secondary)', 
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {trade.emotion}
                  </span>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {format(new Date(trade.exitDate), 'MMM dd, yyyy')}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                "{trade.notes}"
              </p>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
