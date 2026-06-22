import type { Trade } from '../types';

export function calculateMetrics(trades: Trade[]) {
  if (trades.length === 0) {
    return {
      winRate: 0, profitFactor: 0, totalPnL: 0, averageWin: 0, averageLoss: 0,
      totalTrades: 0, winningTradesCount: 0, losingTradesCount: 0,
      bestTrade: null as Trade | null, worstTrade: null as Trade | null,
      avgR: 0, expectancy: 0, maxDrawdown: 0, consecutiveWins: 0, consecutiveLosses: 0,
    };
  }

  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  const gp = wins.reduce((s, t) => s + t.pnl, 0);
  const gl = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const winRate = (wins.length / trades.length) * 100;
  const profitFactor = gl === 0 ? (gp > 0 ? 999 : 0) : gp / gl;
  const totalPnL = trades.reduce((s, t) => s + t.pnl, 0);
  const averageWin = wins.length > 0 ? gp / wins.length : 0;
  const averageLoss = losses.length > 0 ? gl / losses.length : 0;
  const bestTrade = trades.reduce((b, t) => t.pnl > b.pnl ? t : b);
  const worstTrade = trades.reduce((w, t) => t.pnl < w.pnl ? t : w);
  const avgR = averageLoss > 0 ? averageWin / averageLoss : 0;
  const expectancy = (winRate / 100) * averageWin - ((100 - winRate) / 100) * averageLoss;

  let maxDrawdown = 0, peak = 0, cum = 0;
  [...trades].sort((a, b) => new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime()).forEach(t => {
    cum += t.pnl;
    if (cum > peak) peak = cum;
    const dd = peak - cum;
    if (dd > maxDrawdown) maxDrawdown = dd;
  });

  let curW = 0, curL = 0, conW = 0, conL = 0;
  [...trades].sort((a, b) => new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime()).forEach(t => {
    if (t.pnl > 0) { curW++; curL = 0; if (curW > conW) conW = curW; }
    else { curL++; curW = 0; if (curL > conL) conL = curL; }
  });

  return {
    winRate, profitFactor, totalPnL, averageWin, averageLoss,
    totalTrades: trades.length, winningTradesCount: wins.length, losingTradesCount: losses.length,
    bestTrade, worstTrade, avgR, expectancy, maxDrawdown, consecutiveWins: conW, consecutiveLosses: conL,
  };
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(value);
}
