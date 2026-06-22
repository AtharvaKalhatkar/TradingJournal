import React, { type ReactNode, createContext, useContext, useState, useEffect } from 'react';
import type { Trade, Playbook } from '../types';
import { formatCurrency } from '../utils/calculations';

interface TradeContextType {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'pnl' | 'pnlPercent'>) => void;
  deleteTrade: (id: string) => void;
  accountBalance: number;
  playbooks: Playbook[];
  addPlaybook: (playbook: Omit<Playbook, 'id'>) => void;
  deletePlaybook: (id: string) => void;
  baseCurrency: string;
  setBaseCurrency: (currency: string) => void;
  formatMoney: (value: number) => string;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

const initialTrades: Trade[] = [
  {
    id: '1', symbol: 'AAPL', assetClass: 'STOCKS', type: 'LONG',
    entryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), exitDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    entryPrice: 175.50, exitPrice: 180.20, quantity: 100, multiplier: 1, fees: 2.50, setup: 'Breakout', emotion: 'CONFIDENT', notes: 'Textbook ascending triangle breakout.', pnl: 467.50, pnlPercent: 2.68
  },
  {
    id: '2', symbol: 'BTC/USD', assetClass: 'CRYPTO', type: 'SHORT',
    entryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), exitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    entryPrice: 65000, exitPrice: 66000, quantity: 0.5, multiplier: 1, fees: 15.00, setup: 'Reversal', emotion: 'FOMO', notes: 'Entered too early, got stopped out.', pnl: -515.00, pnlPercent: -1.54
  },
  {
    id: '3', symbol: 'NIFTY', assetClass: 'OPTIONS', type: 'LONG',
    entryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), exitDate: new Date().toISOString(),
    entryPrice: 150.00, exitPrice: 160.00, quantity: 2, multiplier: 50, fees: 5.00, setup: 'Earnings Play', emotion: 'DISCIPLINED', notes: 'Held through initial volatility, hit target.', pnl: 995.00, pnlPercent: 6.63
  }
];

const initialPlaybooks: Playbook[] = [
  {
    id: '1',
    name: 'Breakout',
    description: 'Trading a clear break of resistance with volume.',
    rules: [
      { id: 'r1', text: 'Price must consolidate for at least 3 periods.' },
      { id: 'r2', text: 'Breakout candle must have above-average volume.' },
      { id: 'r3', text: 'Stop loss placed below the breakout candle.' }
    ]
  }
];

export function TradeProvider({ children }: { children: ReactNode }) {
  const [baseCurrency, setBaseCurrency] = useState(() => {
    return localStorage.getItem('tradelog_currency') || 'USD';
  });

  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('tradelog_trades');
    return saved ? JSON.parse(saved) : initialTrades;
  });

  const [playbooks, setPlaybooks] = useState<Playbook[]>(() => {
    const saved = localStorage.getItem('tradelog_playbooks');
    return saved ? JSON.parse(saved) : initialPlaybooks;
  });

  useEffect(() => {
    localStorage.setItem('tradelog_currency', baseCurrency);
  }, [baseCurrency]);

  useEffect(() => {
    localStorage.setItem('tradelog_trades', JSON.stringify(trades));
    localStorage.setItem('tradelog_playbooks', JSON.stringify(playbooks));
  }, [trades, playbooks]);

  const addTrade = (tradeData: Omit<Trade, 'id' | 'pnl' | 'pnlPercent'>) => {
    const isLong = tradeData.type === 'LONG';
    const priceDiff = isLong ? (tradeData.exitPrice - tradeData.entryPrice) : (tradeData.entryPrice - tradeData.exitPrice);
    
    // Phase 3: Raw Pnl = Price Diff * Quantity * Multiplier
    const rawPnl = (priceDiff * tradeData.quantity * tradeData.multiplier);
    const pnl = rawPnl - tradeData.fees;
    const investment = tradeData.entryPrice * tradeData.quantity * tradeData.multiplier;
    const pnlPercent = investment > 0 ? (pnl / investment) * 100 : 0;

    setTrades([{ ...tradeData, id: crypto.randomUUID(), pnl, pnlPercent }, ...trades]);
  };

  const deleteTrade = (id: string) => setTrades(trades.filter(t => t.id !== id));

  const addPlaybook = (playbookData: Omit<Playbook, 'id'>) => {
    setPlaybooks([...playbooks, { ...playbookData, id: crypto.randomUUID() }]);
  };

  const deletePlaybook = (id: string) => setPlaybooks(playbooks.filter(p => p.id !== id));

  const formatMoney = (value: number) => formatCurrency(value, baseCurrency);

  const initialBalance = baseCurrency === 'INR' ? 1000000 : 25000;
  const accountBalance = initialBalance + trades.reduce((sum, t) => sum + t.pnl, 0);

  return (
    <TradeContext.Provider value={{ trades, addTrade, deleteTrade, accountBalance, playbooks, addPlaybook, deletePlaybook, baseCurrency, setBaseCurrency, formatMoney }}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTradeContext() {
  const context = useContext(TradeContext);
  if (context === undefined) throw new Error('useTradeContext must be used within a TradeProvider');
  return context;
}
