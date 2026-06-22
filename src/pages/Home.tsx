import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';
import { AddTradeModal } from '../components/trades/AddTradeModal';
import { useTradeContext } from '../context/TradeContext';

function calcMetrics(trades: any[]) {
  if (!trades.length) return { totalTrades: 0, winRate: 0, totalPnL: 0, profitFactor: 0, wins: 0, losses: 0 };
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  const gp = wins.reduce((s, t) => s + t.pnl, 0);
  const gl = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  return {
    totalTrades: trades.length,
    winRate: (wins.length / trades.length) * 100,
    totalPnL: trades.reduce((s, t) => s + t.pnl, 0),
    profitFactor: gl === 0 ? (gp > 0 ? 99 : 0) : gp / gl,
    wins: wins.length,
    losses: losses.length,
  };
}

const inspirations = [
  'Track every trade. Find your edge. Grow consistently.',
  'A trade not journaled is a lesson not learned.',
  'Small losses, big wins — that\'s the formula.',
  'Discipline > Motivation. Log your trades daily.',
  'Your journal is your roadmap to profitability.',
];

export function Home() {
  const { trades, formatMoney } = useTradeContext();
  const [showModal, setShowModal] = useState(false);
  const m = calcMetrics(trades);
  const quote = inspirations[Math.floor(Math.random() * inspirations.length)];
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 2 }}>Welcome back,</p>
          <h1 style={{ fontSize: '1.4rem' }}>Trader</h1>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--accent-bg)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none' }}>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', lineHeight: 1.6, fontStyle: 'italic' }}>
          {quote}
        </p>
      </div>

      {trades.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="card">
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Net P&L</p>
            <h2 style={{ color: m.totalPnL >= 0 ? 'var(--green)' : 'var(--red)', fontSize: '1.4rem' }}>
              {m.totalPnL >= 0 ? '+' : ''}{formatMoney(m.totalPnL)}
            </h2>
          </div>
          <div className="card">
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Win Rate</p>
            <h2 style={{ fontSize: '1.4rem' }}>{m.winRate.toFixed(1)}%</h2>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.wins}W / {m.losses}L</p>
          </div>
          <div className="card">
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total Trades</p>
            <h2 style={{ fontSize: '1.4rem' }}>{m.totalTrades}</h2>
          </div>
          <div className="card">
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Profit Factor</p>
            <h2 style={{ fontSize: '1.4rem' }}>{m.profitFactor.toFixed(2)}</h2>
          </div>
        </div>
      )}

      {trades.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: 12 }}>No trades yet. Start your trading journal today!</p>
        </div>
      )}

      <button
        onClick={() => setShowModal(true)}
        style={{
          width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)',
          background: 'var(--accent)', color: '#fff', fontSize: '1.05rem',
          fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, marginTop: 8,
          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)',
        }}
      >
        <Plus size={22} />
        ADD JOURNAL
      </button>

      {showModal && <AddTradeModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
