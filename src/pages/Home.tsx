import React, { useState, useMemo } from 'react';
import { Plus, Target, TrendingUp, Star, Check, X } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { AddTradeModal } from '../components/trades/AddTradeModal';
import { useTrade } from '../context/TradeContext';
import { rollingWinRate } from '../utils/calculations';

const quotes = [
  "Track every trade. Find your edge. Grow consistently.",
  "A trade not journaled is a lesson not learned.",
  "Small losses, big wins — that's the formula.",
  "Discipline > Motivation. Log your trades daily.",
  "Your journal is your roadmap to profitability.",
  "The market rewards consistency, not luck.",
  "Plan the trade, trade the plan.",
  "Losses are tuition. Learn from every one.",
  "The best traders are the best students of their own mistakes.",
  "Patience is not passive — it's a trading skill.",
  "Cut losses short, let winners run.",
  "Don't let a good trade turn into a bad one by holding too long.",
  "Your edge is only as good as your discipline.",
  "The market doesn't care about your opinion — only your reaction.",
  "Every trade is a data point. Collect them all.",
  "Risk management is more important than trade selection.",
  "Be greedy when others are fearful, fearful when others are greedy.",
  "The stock market is a device for transferring money from the impatient to the patient.",
  "It's not about being right, it's about making money when you're right.",
  "The trend is your friend until the end.",
  "Don't fight the tape.",
  "What seems too high in price usually goes higher, and what seems too low usually goes lower.",
  "In trading, you must be defensively aggressive.",
  "Trading is 80% psychology and 20% strategy.",
  "The goal of a successful trader is to make the best trades. Money is secondary.",
  "If you're wrong, get out quickly. Don't turn a small loss into a big one.",
  "The key to trading success is emotional discipline.",
  "Markets can remain irrational longer than you can remain solvent.",
  "Don't catch a falling knife.",
  "Buy the rumor, sell the news.",
  "The most dangerous words in investing are 'this time is different'.",
  "Compound interest is the eighth wonder of the world.",
  "Price is what you pay, value is what you get.",
  "Winning in trading doesn't mean every trade wins — it means your strategy wins over time.",
  "Your trading journal is your most powerful tool for improvement.",
  "Review your losing trades more carefully than your winners.",
  "A good trader is a humble trader.",
  "The market will test your patience before rewarding it.",
  "Trade what you see, not what you think.",
  "Overconfidence is the most dangerous emotion in trading.",
  "Consistency beats intensity in the long run.",
  "If you can't take a small loss, you'll eventually take a large one.",
  "Trading is a marathon, not a sprint.",
  "The best trade is the one you don't take.",
  "Know when to hold, know when to fold.",
  "Adapt or die — the market changes constantly.",
  "Your risk per trade should be small enough that no single loss hurts.",
  "Trading success comes from surviving long enough to let your edge play out.",
  "Focus on process, not outcomes.",
  "A loss is only permanent if you don't learn from it.",
];

function dailyQuote() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return quotes[dayOfYear % quotes.length];
}

export function Home() {
  const { trades, fmt, goals, updateGoal } = useTrade();
  const [show, setShow] = useState(false);
  const [editGoal, setEditGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const gp = wins.reduce((s, t) => s + t.pnl, 0);
  const gl = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const pf = gl === 0 ? (gp > 0 ? 99 : 0) : gp / gl;

  const sparkline = useMemo(() => rollingWinRate(trades, 10), [trades]);

  const monthPnl = useMemo(() => {
    const now = new Date();
    return trades.filter(t => {
      const d = new Date(t.exitDate || t.entryDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, t) => s + t.pnl, 0);
  }, [trades]);

  const goal = goals.find(g => g.type === 'MONTHLY_PNL');
  const goalProgress = goal && goal.target > 0 ? Math.min(100, (monthPnl / goal.target) * 100) : 0;

  const openTrades = trades.filter(t => t.status === 'OPEN').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 2 }}>Welcome back,</p>
          <h1 style={{ fontSize: 22 }}>Trader</h1>
        </div>
        <button onClick={() => document.documentElement.setAttribute('data-theme',
          document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')}
          style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>

      <div style={{ padding: '1rem 1.25rem', borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
        <p style={{ color: '#fff', fontSize: 14, lineHeight: 1.6, opacity: 0.9 }}>
          {dailyQuote()}
        </p>
      </div>

      {goal && (
        <div className="card" style={{ padding: '0.8rem 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Target size={14} color="var(--accent)" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Monthly Goal</span>
            </div>
            {editGoal ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input type="number" value={goalInput} onChange={e => setGoalInput(e.target.value)}
                  style={{ width: 100, padding: '0.3rem 0.5rem', fontSize: '0.85rem' }} autoFocus />
                <button onClick={() => { updateGoal({ ...goal, target: Number(goalInput) || 0 }); setEditGoal(false); }}
                  style={{ padding: 4, color: 'var(--green)' }}><Check size={16} /></button>
                <button onClick={() => setEditGoal(false)} style={{ padding: 4, color: 'var(--text-muted)' }}><X size={16} /></button>
              </div>
            ) : (
              <button onClick={() => { setGoalInput(String(goal.target)); setEditGoal(true); }}
                style={{ fontSize: 12, fontWeight: 600, color: monthPnl >= 0 ? 'var(--green)' : 'var(--red)', padding: '2px 6px', borderRadius: 6, border: '1px dashed var(--border)' }}>
                {fmt(monthPnl)} / {fmt(goal.target)}
              </button>
            )}
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-input)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, goalProgress)}%`, borderRadius: 3,
              background: goalProgress >= 100 ? 'var(--green)' : 'var(--accent)', transition: 'width 0.5s ease' }} />
          </div>
        </div>
      )}

      {sparkline.length > 1 && (
        <div className="card" style={{ padding: '0.5rem 0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Rolling Win Rate (last 10)</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
              {sparkline[sparkline.length - 1]?.rate.toFixed(0)}%
            </span>
          </div>
          <div style={{ height: 50 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkline}>
                <YAxis hide domain={[0, 100]} />
                <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <div className="card" style={{ padding: '0.7rem' }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Trades</p>
          <p style={{ fontSize: 18, fontWeight: 700 }}>{trades.length}</p>
        </div>
        <div className="card" style={{ padding: '0.7rem' }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Win Rate</p>
          <p style={{ fontSize: 18, fontWeight: 700 }}>{winRate.toFixed(0)}%</p>
        </div>
        <div className="card" style={{ padding: '0.7rem' }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>PnL</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: totalPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {totalPnl >= 0 ? '+' : ''}{fmt(totalPnl)}
          </p>
        </div>
        <div className="card" style={{ padding: '0.7rem' }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>P.Factor</p>
          <p style={{ fontSize: 18, fontWeight: 700 }}>{pf.toFixed(1)}</p>
        </div>
      </div>

      {openTrades > 0 && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
          <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>{openTrades} open trade{openTrades > 1 ? 's' : ''} — close from Journal</span>
        </div>
      )}

      <button onClick={() => setShow(true)}
        style={{ width: '100%', padding: '0.9rem', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8,
          boxShadow: '0 4px 16px rgba(59,130,246,0.35)' }}>
        <Plus size={20} />
        ADD JOURNAL
      </button>

      {show && <AddTradeModal onClose={() => setShow(false)} />}
    </div>
  );
}
