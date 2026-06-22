import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Trade, Playbook } from '../types';

interface TradeContextType {
  trades: Trade[];
  addTrade: (trade: Trade) => void;
  deleteTrade: (id: string) => void;
  playbooks: Playbook[];
  addPlaybook: (p: Playbook) => void;
  deletePlaybook: (id: string) => void;
  formatMoney: (n: number) => string;
}

const Ctx = createContext<TradeContextType>(null!);

const now = Date.now();
const day = 86400000;

const defaultTrades: Trade[] = [
  {
    id: '1', symbol: 'RELIANCE', marketType: 'STOCK', instrumentType: 'EQUITY', direction: 'LONG',
    entryDate: new Date(now - 5 * day).toISOString(), exitDate: new Date(now - 4 * day).toISOString(),
    entryPrice: 2850, exitPrice: 2945, quantity: 10, fees: 45,
    strategy: 'Breakout', emotion: 'CONFIDENT', mistakes: [], tags: ['momentum'],
    notes: 'Clean breakout on volume, held for target.', pnl: 950, pnlPercent: 3.33, investment: 28500, duration: '1d', status: 'CLOSED',
  },
  {
    id: '2', symbol: 'BTC', marketType: 'CRYPTO', instrumentType: 'FUTURES', direction: 'SHORT',
    entryDate: new Date(now - 3 * day).toISOString(), exitDate: new Date(now - 2 * day).toISOString(),
    entryPrice: 65000, exitPrice: 67200, quantity: 0.5, fees: 25,
    strategy: 'Reversal', emotion: 'FOMO', mistakes: ['EARLY_ENTRY', 'NO_STOPLOSS'], tags: [],
    notes: 'Entered too early, got stopped out for a loss.', pnl: -1125, pnlPercent: -3.46, investment: 32500, duration: '4h', status: 'CLOSED',
  },
  {
    id: '3', symbol: 'TCS', marketType: 'STOCK', instrumentType: 'EQUITY', direction: 'LONG',
    entryDate: new Date(now - 2 * day).toISOString(), exitDate: new Date(now - 1 * day).toISOString(),
    entryPrice: 3890, exitPrice: 4010, quantity: 5, fees: 30,
    strategy: 'Earnings Play', emotion: 'DISCIPLINED', mistakes: [], tags: ['earnings'],
    notes: 'Earnings breakout, hit target in 2 sessions.', pnl: 570, pnlPercent: 2.93, investment: 19450, duration: '1d', status: 'CLOSED',
  },
];

const defaultPlaybooks: Playbook[] = [
  { id: '1', name: 'Breakout', description: 'Break of key level with volume confirmation.', rules: [{ id: 'r1', text: 'Price above 20 EMA' }, { id: 'r2', text: 'Volume > 1.5x average' }] },
  { id: '2', name: 'Reversal', description: 'Catch trend reversals at support/resistance.', rules: [{ id: 'r3', text: 'RSI oversold (<30)' }, { id: 'r4', text: 'Bullish divergence' }] },
];

export function TradeProvider({ children }: { children: React.ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>(() => {
    try { const s = localStorage.getItem('tj_trades'); return s ? JSON.parse(s) : defaultTrades; }
    catch { return defaultTrades; }
  });

  const [playbooks, setPlaybooks] = useState<Playbook[]>(() => {
    try { const s = localStorage.getItem('tj_playbooks'); return s ? JSON.parse(s) : defaultPlaybooks; }
    catch { return defaultPlaybooks; }
  });

  useEffect(() => { localStorage.setItem('tj_trades', JSON.stringify(trades)); }, [trades]);
  useEffect(() => { localStorage.setItem('tj_playbooks', JSON.stringify(playbooks)); }, [playbooks]);

  const addTrade = useCallback((t: Trade) => setTrades(prev => [t, ...prev]), []);
  const deleteTrade = useCallback((id: string) => setTrades(prev => prev.filter(t => t.id !== id)), []);
  const addPlaybook = useCallback((p: Playbook) => setPlaybooks(prev => [...prev, p]), []);
  const deletePlaybook = useCallback((id: string) => setPlaybooks(prev => prev.filter(p => p.id !== id)), []);

  const formatMoney = useCallback((n: number) => {
    const abs = Math.abs(n);
    if (abs >= 100000) return '$' + (abs / 100000).toFixed(1) + 'L';
    if (abs >= 1000) return '$' + (abs / 1000).toFixed(1) + 'K';
    return '$' + n.toFixed(2);
  }, []);

  return (
    <Ctx.Provider value={{ trades, addTrade, deleteTrade, playbooks, addPlaybook, deletePlaybook, formatMoney }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTradeContext = () => useContext(Ctx);
