import React from 'react';
import { Card } from '../components/ui/Card';
import { useTradeContext } from '../context/TradeContext';
import { calculateMetrics } from '../utils/calculations';
import { Target, Activity, DollarSign, Award } from 'lucide-react';

export function Profile() {
  const { trades, formatMoney, formatPercent } = useTradeContext();
  const metrics = calculateMetrics(trades);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'var(--accent-blue-bg)', margin: '0 auto 0.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.2rem' }}>Trader</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{trades.length} total trades</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Card style={{ borderRadius: 'var(--radius-lg)' }}>
          <Activity size={16} color="var(--accent-blue)" />
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Profit Factor</p>
          <p style={{ fontSize: '1.1rem', fontWeight: '700' }}>{metrics.profitFactor.toFixed(2)}</p>
        </Card>
        <Card style={{ borderRadius: 'var(--radius-lg)' }}>
          <Target size={16} color="var(--accent-blue)" />
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Expectancy</p>
          <p style={{ fontSize: '1.1rem', fontWeight: '700', color: metrics.expectancy >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {formatMoney(metrics.expectancy)}
          </p>
        </Card>
        <Card style={{ borderRadius: 'var(--radius-lg)' }}>
          <Award size={16} color="var(--accent-blue)" />
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Avg Win</p>
          <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-green)' }}>{formatMoney(metrics.averageWin)}</p>
        </Card>
        <Card style={{ borderRadius: 'var(--radius-lg)' }}>
          <DollarSign size={16} color="var(--accent-blue)" />
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Avg Loss</p>
          <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-red)' }}>{formatMoney(metrics.averageLoss)}</p>
        </Card>
      </div>

      <Card style={{ borderRadius: 'var(--radius-lg)' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Streaks</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--accent-green-bg)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Longest Win Streak</p>
            <p style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-green)' }}>{metrics.consecutiveWins}</p>
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--accent-red-bg)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Longest Loss Streak</p>
            <p style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-red)' }}>{metrics.consecutiveLosses}</p>
          </div>
        </div>
      </Card>

      <Card style={{ borderRadius: 'var(--radius-lg)' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Risk Metrics</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem' }}>Max Drawdown</span>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-red)' }}>{formatMoney(metrics.maxDrawdown)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem' }}>Avg R Multiple</span>
          <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{metrics.avgR.toFixed(2)}R</span>
        </div>
      </Card>
    </div>
  );
}
