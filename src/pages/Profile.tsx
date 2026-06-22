import React, { useMemo } from 'react';
import { useTradeContext } from '../context/TradeContext';
import { Target, Activity, DollarSign, Award, TrendingUp, TrendingDown } from 'lucide-react';
import { calculateMetrics } from '../utils/calculations';

export function Profile() {
  const { trades, formatMoney, playbooks } = useTradeContext();
  const m = calculateMetrics(trades);

  const strategyPerf = useMemo(() => {
    const map: Record<string, { pnl: number, wins: number, losses: number }> = {};
    trades.forEach(t => {
      if (!map[t.strategy]) map[t.strategy] = { pnl: 0, wins: 0, losses: 0 };
      map[t.strategy].pnl += t.pnl;
      if (t.pnl > 0) map[t.strategy].wins++; else map[t.strategy].losses++;
    });
    return Object.entries(map).map(([name, d]) => ({ name, ...d, wr: d.wins + d.losses > 0 ? (d.wins / (d.wins + d.losses)) * 100 : 0 }));
  }, [trades]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-bg)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <h2>Trader</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{trades.length} trades &middot; {playbooks.length} strategies</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card" style={{ borderRadius: 'var(--radius-md)' }}>
          <Activity size={16} color="var(--accent)" />
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>Profit Factor</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>{m.profitFactor.toFixed(2)}</p>
        </div>
        <div className="card" style={{ borderRadius: 'var(--radius-md)' }}>
          <Target size={16} color="var(--accent)" />
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>Expectancy</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: m.expectancy >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatMoney(m.expectancy)}</p>
        </div>
        <div className="card" style={{ borderRadius: 'var(--radius-md)' }}>
          <TrendingUp size={16} color="var(--green)" />
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>Avg Win</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--green)' }}>{formatMoney(m.averageWin)}</p>
        </div>
        <div className="card" style={{ borderRadius: 'var(--radius-md)' }}>
          <TrendingDown size={16} color="var(--red)" />
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>Avg Loss</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--red)' }}>{formatMoney(m.averageLoss)}</p>
        </div>
      </div>

      <div className="card">
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>Streaks</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ padding: '0.65rem', background: 'var(--green-bg)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Longest Win Streak</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--green)' }}>{m.consecutiveWins}</p>
          </div>
          <div style={{ padding: '0.65rem', background: 'var(--red-bg)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Longest Loss Streak</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--red)' }}>{m.consecutiveLosses}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>Risk Metrics</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '0.4rem 0' }}>
          <span style={{ fontSize: '0.8rem' }}>Max Drawdown</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--red)' }}>{formatMoney(m.maxDrawdown)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
          <span style={{ fontSize: '0.8rem' }}>Avg R Multiple</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{m.avgR.toFixed(2)}R</span>
        </div>
      </div>

      {strategyPerf.length > 0 && (
        <div className="card">
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>Strategy Performance</p>
          {strategyPerf.map(s => (
            <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{s.name}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 6 }}>{s.wins}W-{s.losses}L</span>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: s.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {s.pnl >= 0 ? '+' : ''}{formatMoney(s.pnl)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
