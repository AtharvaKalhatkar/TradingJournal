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
      winningTradesCount: 0,
      losingTradesCount: 0,
      bestTrade: null as Trade | null,
      worstTrade: null as Trade | null,
      avgR: 0,
      expectancy: 0,
      maxDrawdown: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
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

  const bestTrade = trades.length > 0 ? trades.reduce((prev, current) => (prev.pnl > current.pnl) ? prev : current) : null;
  const worstTrade = trades.length > 0 ? trades.reduce((prev, current) => (prev.pnl < current.pnl) ? prev : current) : null;

  const avgR = averageLoss > 0 ? averageWin / averageLoss : 0;
  const expectancy = (winRate / 100) * averageWin - ((100 - winRate) / 100) * averageLoss;

  let maxDrawdown = 0;
  let peak = 0;
  let cumSum = 0;
  const sorted = [...trades].sort((a, b) => new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime());
  for (const t of sorted) {
    cumSum += t.pnl;
    if (cumSum > peak) peak = cumSum;
    const dd = peak - cumSum;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  let consecutiveWins = 0, consecutiveLosses = 0, curWins = 0, curLosses = 0;
  const byDate = [...trades].sort((a, b) => new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime());
  for (const t of byDate) {
    if (t.pnl > 0) { curWins++; curLosses = 0; consecutiveWins = Math.max(consecutiveWins, curWins); }
    else { curLosses++; curWins = 0; consecutiveLosses = Math.max(consecutiveLosses, curLosses); }
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
    avgR,
    expectancy,
    maxDrawdown,
    consecutiveWins,
    consecutiveLosses,
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
