import React, { type ReactNode, createContext, useContext, useState, useEffect } from 'react';
import type { Trade, Playbook, Direction, MarketType, InstrumentType, MistakeType } from '../types';
import { format } from 'date-fns';

interface TradeContextType {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'pnl' | 'pnlPercent' | 'investment' | 'duration'>) => void;
  deleteTrade: (id: string) => void;
  playbooks: Playbook[];
  addPlaybook: (playbook: Omit<Playbook, 'id'>) => void;
  deletePlaybook: (id: string) => void;
  formatMoney: (value: number) => string;
  formatPercent: (value: number) => string;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

const initialTrades: Trade[] = [
  {
    id: '1', symbol: 'AAPL', marketType: 'STOCK', instrumentType: 'EQUITY', direction: 'LONG',
    entryDate: new Date(Date.now() - 5 * 86400000).toISOString(), exitDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    entryPrice: 175.50, exitPrice: 180.20, quantity: 100, fees: 2.50,
    strategy: 'Breakout', emotion: 'CONFIDENT', mistakes: [], tags: ['momentum'], notes: 'Textbook breakout with volume confirmation.',
    pnl: 467.50, pnlPercent: 2.66, investment: 17550, duration: '1d', status: 'CLOSED',
  },
  {
    id: '2', symbol: 'BTC', marketType: 'CRYPTO', instrumentType: 'FUTURES', direction: 'SHORT',
    entryDate: new Date(Date.now() - 3 * 86400000).toISOString(), exitDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    entryPrice: 65000, exitPrice: 66000, quantity: 0.5, fees: 15.00,
    strategy: 'Reversal', emotion: 'FOMO', mistakes: ['EARLY_ENTRY', 'NO_STOPLOSS'], tags: ['mistake'], notes: 'Entered too early, got stopped out.',
    pnl: -515.00, pnlPercent: -1.58, investment: 32500, duration: '4h', status: 'CLOSED',
  },
  {
    id: '3', symbol: 'NIFTY', marketType: 'STOCK', instrumentType: 'OPTIONS', direction: 'LONG',
    entryDate: new Date(Date.now() - 1 * 86400000).toISOString(), exitDate: new Date().toISOString(),
    entryPrice: 150.00, exitPrice: 160.00, quantity: 2, fees: 5.00,
    strategy: 'Earnings', emotion: 'DISCIPLINED', mistakes: [], tags: ['earnings'], notes: 'Held through volatility, hit target.',
    pnl: 995.00, pnlPercent: 6.63, investment: 15000, duration: '1d', status: 'CLOSED',
  },
];

const initialPlaybooks: Playbook[] = [
  {
    id: '1', name: 'Breakout',
    description: 'Trading a clear break of resistance with volume.',
    rules: [
      { id: 'r1', text: 'Price must consolidate for at least 3 periods' },
      { id: 'r2', text: 'Breakout candle must have above-average volume' },
      { id: 'r3', text: 'Stop loss placed below the breakout candle' },
    ],
  },
  {
    id: '2', name: 'Reversal',
    description: 'Catching trend reversals at key levels.',
    rules: [
      { id: 'r4', text: 'RSI must be oversold (<30)' },
      { id: 'r5', text: 'Price at key support level' },
      { id: 'r6', text: 'Bullish divergence on RSI' },
    ],
  },
];

function calcDuration(entry: string, exit: string): string {
  const ms = new Date(exit).getTime() - new Date(entry).getTime();
  const hrs = Math.round(ms / 3600000);
  if (hrs < 1) return `${Math.round(ms / 60000)}m`;
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}

export function TradeProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('tj_trades');
    return saved ? JSON.parse(saved) : initialTrades;
  });

  const [playbooks, setPlaybooks] = useState<Playbook[]>(() => {
    const saved = localStorage.getItem('tj_playbooks');
    return saved ? JSON.parse(saved) : initialPlaybooks;
  });

  useEffect(() => { localStorage.setItem('tj_trades', JSON.stringify(trades)); }, [trades]);
  useEffect(() => { localStorage.setItem('tj_playbooks', JSON.stringify(playbooks)); }, [playbooks]);

  const addTrade = (data: Omit<Trade, 'id' | 'pnl' | 'pnlPercent' | 'investment' | 'duration'>) => {
    const isLong = data.direction === 'LONG';
    const priceDiff = isLong ? (data.exitPrice - data.entryPrice) : (data.entryPrice - data.exitPrice);
    const rawPnl = priceDiff * data.quantity;
    const pnl = rawPnl - data.fees;
    const investment = data.entryPrice * data.quantity;
    const pnlPercent = investment > 0 ? (pnl / investment) * 100 : 0;
    const duration = calcDuration(data.entryDate, data.exitDate);
    setTrades([{
      ...data, id: crypto.randomUUID(), pnl, pnlPercent, investment, duration, status: 'CLOSED',
    }, ...trades]);
  };

  const deleteTrade = (id: string) => setTrades(trades.filter(t => t.id !== id));

  const addPlaybook = (data: Omit<Playbook, 'id'>) => {
    setPlaybooks([...playbooks, { ...data, id: crypto.randomUUID() }]);
  };

  const deletePlaybook = (id: string) => setPlaybooks(playbooks.filter(p => p.id !== id));

  const formatMoney = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 1000) return '$' + (abs / 1000).toFixed(1) + 'K';
    return '$' + abs.toFixed(2);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <TradeContext.Provider value={{ trades, addTrade, deleteTrade, playbooks, addPlaybook, deletePlaybook, formatMoney, formatPercent }}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTradeContext() {
  const context = useContext(TradeContext);
  if (context === undefined) throw new Error('useTradeContext must be used within a TradeProvider');
  return context;
}
