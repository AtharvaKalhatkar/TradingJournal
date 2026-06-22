import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Trade, Playbook, TradeGoal } from '../types';

interface CtxType {
  trades: Trade[];
  addTrade: (t: Trade) => void;
  updateTrade: (t: Trade) => void;
  deleteTrade: (id: string) => void;
  playbooks: Playbook[];
  addPlaybook: (p: Playbook) => void;
  deletePlaybook: (id: string) => void;
  goals: TradeGoal[];
  addGoal: (g: TradeGoal) => void;
  updateGoal: (g: TradeGoal) => void;
  importData: (data: string) => void;
  exportData: () => string;
  clearAll: () => void;
  fmt: (n: number) => string;
  isDark: boolean;
  toggleDark: () => void;
}

const Ctx = createContext<CtxType>({
  trades: [],
  addTrade: () => {},
  updateTrade: () => {},
  deleteTrade: () => {},
  playbooks: [],
  addPlaybook: () => {},
  deletePlaybook: () => {},
  goals: [],
  addGoal: () => {},
  updateGoal: () => {},
  importData: () => {},
  exportData: () => '',
  clearAll: () => {},
  fmt: (n: number) => '₹' + Math.abs(n).toFixed(0),
  isDark: false,
  toggleDark: () => {},
});

const now = Date.now();
const d = 86400000;

const defaultTrades: Trade[] = [
  {
    id: '1', symbol: 'RELIANCE', marketType: 'STOCK', instrumentType: 'EQUITY', direction: 'LONG',
    entryDate: new Date(now - 5 * d).toISOString(), exitDate: new Date(now - 4 * d).toISOString(),
    entryPrice: 2850, exitPrice: 2945, stopLoss: 2790, takeProfit: 2960, quantity: 10, fees: 45,
    strategy: 'Breakout', emotion: 'CONFIDENT', mistakes: [], tags: ['momentum'],
    notes: 'Clean breakout on volume.', pnl: 950, pnlPercent: 3.33, investment: 28500, duration: '1d', status: 'CLOSED',
  },
  {
    id: '2', symbol: 'BTC', marketType: 'CRYPTO', instrumentType: 'FNO', direction: 'SHORT',
    entryDate: new Date(now - 3 * d).toISOString(), exitDate: new Date(now - 2 * d).toISOString(),
    entryPrice: 65000, exitPrice: 67200, stopLoss: 66000, takeProfit: 63500, quantity: 0.5, fees: 25,
    strategy: 'Reversal', emotion: 'FOMO', mistakes: ['EARLY_ENTRY', 'NO_SL'], tags: [],
    notes: 'Entered too early.', pnl: -1125, pnlPercent: -3.46, investment: 32500, duration: '4h', status: 'CLOSED',
  },
  {
    id: '3', symbol: 'TCS', marketType: 'STOCK', instrumentType: 'EQUITY', direction: 'LONG',
    entryDate: new Date(now - 2 * d).toISOString(), exitDate: new Date(now - 1 * d).toISOString(),
    entryPrice: 3890, exitPrice: 4010, stopLoss: 3820, takeProfit: 4050, quantity: 5, fees: 30,
    strategy: 'Earnings', emotion: 'DISCIPLINED', mistakes: [], tags: ['earnings'],
    notes: 'Earnings breakout.', pnl: 570, pnlPercent: 2.93, investment: 19450, duration: '1d', status: 'CLOSED',
  },
];

const defaultPlaybooks: Playbook[] = [
  { id: '1', name: 'Breakout', description: 'Break of key level with volume.', rules: [{ id: 'r1', text: 'Price above 20 EMA' }, { id: 'r2', text: 'Volume > 1.5x avg' }] },
  { id: '2', name: 'Reversal', description: 'Catch reversals at support.', rules: [{ id: 'r3', text: 'RSI < 30' }, { id: 'r4', text: 'Bullish divergence' }] },
];

const defaultGoals: TradeGoal[] = [
  { id: 'g1', type: 'MONTHLY_PNL', target: 5000, current: 0, period: 'Monthly' },
];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function load<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch { return fallback; }
}

export function TradeProvider({ children }: { children: React.ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>(() => load('tj_t', defaultTrades));
  const [playbooks, setPlaybooks] = useState<Playbook[]>(() => load('tj_p', defaultPlaybooks));
  const [goals, setGoals] = useState<TradeGoal[]>(() => load('tj_g', defaultGoals));
  const [isDark, setIsDark] = useState(() => load('tj_dark', false));

  useEffect(() => { localStorage.setItem('tj_t', JSON.stringify(trades)); }, [trades]);
  useEffect(() => { localStorage.setItem('tj_p', JSON.stringify(playbooks)); }, [playbooks]);
  useEffect(() => { localStorage.setItem('tj_g', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('tj_dark', JSON.stringify(isDark)); }, [isDark]);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const addTrade = (t: Trade) => setTrades(prev => [t, ...prev]);
  const updateTrade = (t: Trade) => setTrades(prev => prev.map(x => x.id === t.id ? t : x));
  const deleteTrade = (id: string) => setTrades(prev => prev.filter(t => t.id !== id));
  const addPlaybook = (p: Playbook) => setPlaybooks(prev => [...prev, p]);
  const deletePlaybook = (id: string) => setPlaybooks(prev => prev.filter(p => p.id !== id));
  const addGoal = (g: TradeGoal) => setGoals(prev => [...prev, g]);
  const updateGoal = (g: TradeGoal) => setGoals(prev => prev.map(x => x.id === g.id ? g : x));

  const importData = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.trades) setTrades(parsed.trades);
      if (parsed.playbooks) setPlaybooks(parsed.playbooks);
      if (parsed.goals) setGoals(parsed.goals);
    } catch { throw new Error('Invalid data format'); }
  };

  const exportData = () => JSON.stringify({ trades, playbooks, goals, exportedAt: new Date().toISOString() }, null, 2);

  const clearAll = () => { setTrades([]); setPlaybooks([]); setGoals([]); };

  const toggleDark = () => setIsDark(p => !p);

  const fmt = (n: number) => {
    const a = Math.abs(n);
    if (a >= 100000) return '₹' + (a / 100000).toFixed(1) + 'L';
    if (a >= 1000) return '₹' + (a / 1000).toFixed(1) + 'K';
    return '₹' + a.toFixed(0);
  };

  return (
    <Ctx.Provider value={{
      trades, addTrade, updateTrade, deleteTrade,
      playbooks, addPlaybook, deletePlaybook,
      goals, addGoal, updateGoal,
      importData, exportData, clearAll, fmt, isDark, toggleDark,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTrade = () => useContext(Ctx);
