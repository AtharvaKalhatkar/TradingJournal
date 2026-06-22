import type { Trade, Mistake, Emotion } from '../types';

export function calculateMetrics(trades: Trade[]) {
  const closed = trades.filter(t => t.status !== 'OPEN');
  if (closed.length === 0) {
    return {
      winRate: 0, profitFactor: 0, totalPnL: 0, averageWin: 0, averageLoss: 0,
      totalTrades: 0, winningTradesCount: 0, losingTradesCount: 0,
      bestTrade: null as Trade | null, worstTrade: null as Trade | null,
      avgR: 0, expectancy: 0, maxDrawdown: 0, consecutiveWins: 0, consecutiveLosses: 0,
      sharpe: 0, sortino: 0, avgRR: 0, winLossRatio: 0,
    };
  }

  const wins = closed.filter(t => t.pnl > 0);
  const losses = closed.filter(t => t.pnl <= 0);
  const gp = wins.reduce((s, t) => s + t.pnl, 0);
  const gl = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const winRate = (wins.length / closed.length) * 100;
  const profitFactor = gl === 0 ? (gp > 0 ? 999 : 0) : gp / gl;
  const totalPnL = closed.reduce((s, t) => s + t.pnl, 0);
  const averageWin = wins.length > 0 ? gp / wins.length : 0;
  const averageLoss = losses.length > 0 ? gl / losses.length : 0;
  const bestTrade = closed.reduce((b, t) => t.pnl > b.pnl ? t : b);
  const worstTrade = closed.reduce((w, t) => t.pnl < w.pnl ? t : w);
  const avgR = averageLoss > 0 ? averageWin / averageLoss : 0;
  const expectancy = (winRate / 100) * averageWin - ((100 - winRate) / 100) * averageLoss;
  const winLossRatio = losses.length > 0 ? wins.length / losses.length : wins.length;

  let maxDrawdown = 0, peak = 0, cum = 0;
  [...closed].sort((a, b) => new Date(a.exitDate || a.entryDate).getTime() - new Date(b.exitDate || b.entryDate).getTime()).forEach(t => {
    cum += t.pnl;
    if (cum > peak) peak = cum;
    const dd = peak - cum;
    if (dd > maxDrawdown) maxDrawdown = dd;
  });

  let curW = 0, curL = 0, conW = 0, conL = 0;
  [...closed].sort((a, b) => new Date(a.exitDate || a.entryDate).getTime() - new Date(b.exitDate || b.entryDate).getTime()).forEach(t => {
    if (t.pnl > 0) { curW++; curL = 0; if (curW > conW) conW = curW; }
    else { curL++; curW = 0; if (curL > conL) conL = curL; }
  });

  const returns = [...closed]
    .sort((a, b) => new Date(a.exitDate || a.entryDate).getTime() - new Date(b.exitDate || b.entryDate).getTime())
    .filter(t => t.investment > 0)
    .map(t => t.pnl / t.investment);

  const avgReturn = returns.length > 0 ? returns.reduce((s, r) => s + r, 0) / returns.length : 0;
  const variance = returns.length > 0 ? returns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / returns.length : 0;
  const stdDev = Math.sqrt(variance);

  const negReturns = returns.filter(r => r < 0);
  const downVariance = negReturns.length > 0 ? negReturns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / negReturns.length : 0;
  const downDev = Math.sqrt(downVariance);

  const sharpe = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;
  const sortino = downDev > 0 ? (avgReturn / downDev) * Math.sqrt(252) : 0;

  const rrPerTrade = closed.filter(t => t.stopLoss && t.takeProfit).map(t => {
    const dir = t.direction === 'LONG' ? 1 : -1;
    const risk = dir * (t.entryPrice - (t.stopLoss || 0));
    const reward = dir * ((t.takeProfit || 0) - t.entryPrice);
    return risk > 0 ? reward / risk : 0;
  });
  const avgRR = rrPerTrade.length > 0 ? rrPerTrade.reduce((s, r) => s + r, 0) / rrPerTrade.length : 0;

  return {
    winRate, profitFactor, totalPnL, averageWin, averageLoss,
    totalTrades: closed.length, winningTradesCount: wins.length, losingTradesCount: losses.length,
    bestTrade, worstTrade, avgR, expectancy, maxDrawdown, consecutiveWins: conW, consecutiveLosses: conL,
    sharpe, sortino, avgRR, winLossRatio,
  };
}

export function rollingWinRate(trades: Trade[], window = 20) {
  const closed = trades.filter(t => t.status !== 'OPEN')
    .sort((a, b) => new Date(a.exitDate || a.entryDate).getTime() - new Date(b.exitDate || b.entryDate).getTime());
  if (closed.length === 0) return [];
  const result: { index: number; rate: number; label: string }[] = [];
  for (let i = 0; i < closed.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = closed.slice(start, i + 1);
    const wins = slice.filter(t => t.pnl > 0).length;
    result.push({ index: i, rate: (wins / slice.length) * 100, label: `#${i + 1}` });
  }
  return result;
}

export function mistakeCostAnalysis(trades: Trade[]) {
  const closed = trades.filter(t => t.status !== 'OPEN' && t.mistakes.length > 0);
  const map: Record<string, { count: number; totalPnl: number; wins: number; losses: number }> = {};
  closed.forEach(t => {
    t.mistakes.forEach(m => {
      if (!map[m]) map[m] = { count: 0, totalPnl: 0, wins: 0, losses: 0 };
      map[m].count++;
      map[m].totalPnl += t.pnl;
      if (t.pnl > 0) map[m].wins++; else map[m].losses++;
    });
  });
  return Object.entries(map)
    .map(([mistake, data]) => ({ mistake, ...data }))
    .sort((a, b) => Math.abs(b.totalPnl) - Math.abs(a.totalPnl));
}

export function emotionTrends(trades: Trade[]) {
  const closed = trades.filter(t => t.status !== 'OPEN');
  const map: Record<string, { count: number; totalPnl: number; avgPnl: number }> = {};
  closed.forEach(t => {
    const e = t.emotion || 'NEUTRAL';
    if (!map[e]) map[e] = { count: 0, totalPnl: 0, avgPnl: 0 };
    map[e].count++;
    map[e].totalPnl += t.pnl;
  });
  return Object.entries(map).map(([emotion, data]) => ({
    emotion,
    count: data.count,
    totalPnl: data.totalPnl,
    avgPnl: data.totalPnl / data.count,
  })).sort((a, b) => Math.abs(b.totalPnl) - Math.abs(a.totalPnl));
}

export function calculateRR(trade: Trade): number {
  if (!trade.stopLoss || !trade.takeProfit) return 0;
  const dir = trade.direction === 'LONG' ? 1 : -1;
  const risk = dir * (trade.entryPrice - trade.stopLoss);
  const reward = dir * (trade.takeProfit - trade.entryPrice);
  return risk > 0 ? reward / risk : 0;
}
