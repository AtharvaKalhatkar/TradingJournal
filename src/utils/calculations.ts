import type { Trade } from '../types';

export function calculateMetrics(trades: Trade[]) {
  if (trades.length === 0) {
    return {
      winRate: 0,
      profitFactor: 0,
      totalPnL: 0,
      averageWin: 0,
      averageLoss: 0,
      totalTrades: 0,
    };
  }

  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl <= 0);

  const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));

  const winRate = (winningTrades.length / trades.length) * 100;
  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? 999 : 0) : grossProfit / grossLoss;
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);

  const averageWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
  const averageLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;

  let bestTrade: Trade | null = null;
  let worstTrade: Trade | null = null;

  if (trades.length > 0) {
    bestTrade = trades.reduce((prev, current) => (prev.pnl > current.pnl) ? prev : current);
    worstTrade = trades.reduce((prev, current) => (prev.pnl < current.pnl) ? prev : current);
  }

  return {
    winRate,
    profitFactor,
    totalPnL,
    averageWin,
    averageLoss,
    totalTrades: trades.length,
    winningTradesCount: winningTrades.length,
    losingTradesCount: losingTrades.length,
    bestTrade,
    worstTrade,
  };
}

export function formatCurrency(value: number, currency: string = 'USD'): string {
  const locales: Record<string, string> = {
    'USD': 'en-US',
    'INR': 'en-IN',
    'EUR': 'en-DE',
    'GBP': 'en-GB'
  };
  
  return new Intl.NumberFormat(locales[currency] || 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}
