import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useTradeContext } from '../context/TradeContext';
import { calculateMetrics } from '../utils/calculations';
import { Plus, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { AddTradeModal } from '../components/trades/AddTradeModal';

const quotes = [
  '"The goal of a successful trader is to make the best trades. Money is secondary." — Alexander Elder',
  '"The market is a device for transferring money from the impatient to the patient." — Warren Buffett',
  '"It\'s not about how much you make, but how much you don\'t lose." — Unknown',
  '"The stock market is filled with individuals who know the price of everything, but the value of nothing." — Philip Fisher',
  '"The key to trading success is emotional discipline. If intelligence were the key, there would be a lot more people making money trading." — Victor Sperandeo',
];

export function Home() {
  const { trades, formatMoney, formatPercent } = useTradeContext();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const metrics = calculateMetrics(trades);
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>Good Morning,</p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Trader 👋</h1>
        </div>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'var(--bg-secondary)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <UserIcon />
        </div>
      </div>

      <Card style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ fontSize: '0.85rem', lineHeight: '1.6', fontStyle: 'italic', color: 'var(--text-primary)' }}>
          {quote}
        </p>
      </Card>

      {trades.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Card style={{ padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Trades</p>
            <h2 style={{ fontSize: '1.5rem' }}>{metrics.totalTrades}</h2>
          </Card>
          <Card style={{ padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Win Rate</p>
            <h2 style={{ fontSize: '1.5rem' }}>{metrics.winRate.toFixed(1)}%</h2>
          </Card>
          <Card style={{ padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Net P&L</p>
            <h2 style={{ fontSize: '1.5rem', color: metrics.totalPnL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {formatMoney(metrics.totalPnL)}
            </h2>
          </Card>
          <Card style={{ padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Profit Factor</p>
            <h2 style={{ fontSize: '1.5rem' }}>{metrics.profitFactor.toFixed(2)}</h2>
          </Card>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
        <Button
          variant="primary"
          size="lg"
          icon={<Plus size={20} />}
          onClick={() => setShowModal(true)}
          style={{
            padding: '1rem 2.5rem', borderRadius: 'var(--radius-lg)',
            fontSize: '1rem', fontWeight: '600',
            background: 'var(--accent-blue)',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.35)',
          }}
        >
          ADD JOURNAL
        </Button>
      </div>

      <AddTradeModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
