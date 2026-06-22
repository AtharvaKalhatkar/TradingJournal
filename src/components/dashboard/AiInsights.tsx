import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { useTradeContext } from '../../context/TradeContext';
import { BrainCircuit, TrendingUp, AlertTriangle } from 'lucide-react';

export function AiInsights() {
  const { trades, formatMoney } = useTradeContext();

  const insights = useMemo(() => {
    if (trades.length < 3) {
      return [
        { type: 'info', text: 'Not enough data yet. Log a few more trades to unlock AI Insights.', icon: BrainCircuit, color: 'var(--text-secondary)' }
      ];
    }

    const generatedInsights = [];

    // Analyze setups
    const setupPerf: Record<string, number> = {};
    trades.forEach(t => {
      setupPerf[t.setup] = (setupPerf[t.setup] || 0) + t.pnl;
    });
    
    let bestSetup = { name: '', pnl: -Infinity };
    let worstSetup = { name: '', pnl: Infinity };
    
    Object.entries(setupPerf).forEach(([setup, pnl]) => {
      if (pnl > bestSetup.pnl) bestSetup = { name: setup, pnl };
      if (pnl < worstSetup.pnl) worstSetup = { name: setup, pnl };
    });

    if (bestSetup.pnl > 0) {
      generatedInsights.push({
        type: 'positive',
        text: `Your strongest setup is "${bestSetup.name}", generating ${formatMoney(bestSetup.pnl)}. Consider increasing size on this setup.`,
        icon: TrendingUp,
        color: 'var(--accent-win)'
      });
    }

    if (worstSetup.pnl < 0) {
      generatedInsights.push({
        type: 'warning',
        text: `The "${worstSetup.name}" setup is costing you ${formatMoney(worstSetup.pnl)}. Review your rules or pause trading this setup.`,
        icon: AlertTriangle,
        color: 'var(--accent-loss)'
      });
    }

    // Analyze emotions
    const tiltedTrades = trades.filter(t => t.emotion === 'TILTED' || t.emotion === 'FOMO');
    const tiltedPnl = tiltedTrades.reduce((sum, t) => sum + t.pnl, 0);
    
    if (tiltedPnl < 0) {
      generatedInsights.push({
        type: 'warning',
        text: `Emotional trading (Tilt/FOMO) has cost you ${formatMoney(Math.abs(tiltedPnl))}. Implement a hard stop-loss rule after 2 consecutive losses.`,
        icon: BrainCircuit,
        color: 'var(--accent-loss)'
      });
    }

    return generatedInsights.length > 0 ? generatedInsights : [
      { type: 'info', text: 'Keep trading! Your performance is stable. No critical warnings at this time.', icon: BrainCircuit, color: 'var(--accent-primary)' }
    ];

  }, [trades]);

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <BrainCircuit color="var(--accent-primary)" />
        <h3 style={{ fontSize: '1.2rem' }}>Zella AI Insights</h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {insights.map((insight, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            gap: '1rem', 
            alignItems: 'flex-start',
            padding: '1rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--border-radius-sm)',
            borderLeft: `4px solid ${insight.color}`
          }}>
            <insight.icon size={20} color={insight.color} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {insight.text}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
