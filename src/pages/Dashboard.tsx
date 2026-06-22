import React, { useMemo, useState } from 'react';
import { useTradeContext } from '../context/TradeContext';
import { calculateMetrics } from '../utils/calculations';
import { ArrowUp, ArrowDown, Star } from 'lucide-react';
import { 
  AreaChart, Area, ResponsiveContainer, YAxis, Tooltip,
  BarChart, Bar, XAxis, CartesianGrid, Cell
} from 'recharts';
import { format } from 'date-fns';
import { CalendarView } from './CalendarView';

const CustomTooltip = ({ active, payload }: any) => {
  const { formatMoney } = useTradeContext();
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#161618',
        padding: '4px 12px',
        borderRadius: '16px',
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {formatMoney(payload[0].value).replace('.00', '')}
      </div>
    );
  }
  return null;
};

const MetricBarChart = ({ data, title }: { data: any[], title: string }) => {
  const { formatMoney } = useTradeContext();
  return (
    <div style={{ backgroundColor: '#1A1A1C', borderRadius: '16px', padding: '1.5rem', position: 'relative' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{title}</p>
      <div style={{ height: '300px', width: 'calc(100% + 3rem)', margin: '0 -1.5rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)', fontSize: 12}} axisLine={false} tickLine={false} />
            <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
            <Tooltip 
              cursor={{fill: 'rgba(255,255,255,0.05)'}}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value as number;
                  return (
                    <div style={{ backgroundColor: '#161618', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{payload[0].payload.name}</p>
                      <p style={{ fontSize: '1rem', fontWeight: '600', color: val >= 0 ? 'var(--accent-win)' : 'var(--accent-loss)' }}>
                        {val > 0 ? '+' : ''}{formatMoney(val)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="pnl" radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#00ff88' : '#ff3366'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export function Dashboard() {
  const { trades, formatMoney, baseCurrency } = useTradeContext();
  const metrics = calculateMetrics(trades);
  const [activePill, setActivePill] = useState('Dashboard');

  const chartData = useMemo(() => {
    const sorted = [...trades].sort((a, b) => new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime());
    let cumulative = baseCurrency === 'INR' ? 1000000 : 25000;
    return sorted.map(t => {
      cumulative += t.pnl;
      return { date: format(new Date(t.exitDate), 'MMM dd'), balance: cumulative };
    });
  }, [trades, baseCurrency]);

  const setupPerformance = useMemo(() => {
    const perf: Record<string, { pnl: number }> = {};
    trades.forEach(t => {
      if (!perf[t.setup]) perf[t.setup] = { pnl: 0 };
      perf[t.setup].pnl += t.pnl;
    });
    return Object.entries(perf).map(([name, data]) => ({ name, pnl: data.pnl })).sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  const weekdayPerformance = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const perf = days.map(name => ({ name, pnl: 0 }));
    trades.forEach(t => { perf[new Date(t.exitDate).getDay()].pnl += t.pnl; });
    return perf.filter(p => p.pnl !== 0 || (p.name !== 'Sun' && p.name !== 'Sat'));
  }, [trades]);

  const marketPerformance = useMemo(() => {
    const perf: Record<string, { pnl: number }> = {};
    trades.forEach(t => {
      const type = t.assetClass || 'Stocks';
      if (!perf[type]) perf[type] = { pnl: 0 };
      perf[type].pnl += t.pnl;
    });
    return Object.entries(perf).map(([name, data]) => ({ name, pnl: data.pnl })).sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  const directionPerformance = useMemo(() => {
    const perf: Record<string, { pnl: number }> = { 'LONG': { pnl: 0 }, 'SHORT': { pnl: 0 } };
    trades.forEach(t => { if (perf[t.type]) perf[t.type].pnl += t.pnl; });
    return Object.entries(perf).map(([name, data]) => ({ name, pnl: data.pnl })).sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  const entryPerformance = useMemo(() => {
    const perf = Array.from({length: 24}, (_, i) => ({ name: `${i}:00`, pnl: 0 }));
    trades.forEach(t => { perf[new Date(t.entryDate).getHours()].pnl += t.pnl; });
    return perf.filter(p => p.pnl !== 0);
  }, [trades]);
  
  const exitPerformance = useMemo(() => {
    const perf = Array.from({length: 24}, (_, i) => ({ name: `${i}:00`, pnl: 0 }));
    trades.forEach(t => { perf[new Date(t.exitDate).getHours()].pnl += t.pnl; });
    return perf.filter(p => p.pnl !== 0);
  }, [trades]);

  const sessionPerformance = useMemo(() => {
    const perf = { 'Morning': 0, 'Afternoon': 0, 'Evening': 0 };
    trades.forEach(t => {
      const hour = new Date(t.entryDate).getHours();
      if (hour < 12) perf['Morning'] += t.pnl;
      else if (hour < 16) perf['Afternoon'] += t.pnl;
      else perf['Evening'] += t.pnl;
    });
    return Object.entries(perf).map(([name, pnl]) => ({ name, pnl })).filter(p => p.pnl !== 0);
  }, [trades]);

  const pills = ['Dashboard', 'Calendar', 'Day', 'Entry', 'Exit', 'Strategies', 'Market', 'Direction', 'Session'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: '600' }}>Dashboard</h1>
        <select style={{ 
          background: 'transparent', border: 'none', color: 'var(--text-primary)', 
          fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', fontWeight: '500', cursor: 'pointer', outline: 'none',
          width: 'auto', padding: '0.5rem'
        }}>
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="week">This Week</option>
        </select>
      </div>

      {/* Horizontal Pills */}
      <div style={{ 
        display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem',
        scrollbarWidth: 'none', msOverflowStyle: 'none'
      }}>
        {pills.map(pill => (
          <button 
            key={pill}
            onClick={() => setActivePill(pill)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              backgroundColor: activePill === pill ? 'var(--accent-primary)' : 'transparent',
              color: activePill === pill ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {pill}
          </button>
        ))}
      </div>

      {activePill === 'Dashboard' && (
        <>
          {/* Chart Section */}
          <div style={{ backgroundColor: '#1A1A1C', borderRadius: '16px', padding: '1.5rem', position: 'relative' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Dashboard Analysis</p>
            <div style={{ height: '200px', width: 'calc(100% + 3rem)', margin: '0 -1.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4b4b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ff4b4b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#ff4b4b" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRed)" 
                    activeDot={{ r: 6, fill: '#ff4b4b', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2x2 Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#1A1A1C', borderRadius: '16px', padding: '1.25rem' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', marginBottom: '0.25rem' }}>Total Trades</p>
              <h2 style={{ fontSize: 'clamp(1.4rem, 6vw, 1.8rem)', fontWeight: '600' }}>{metrics.totalTrades}</h2>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', marginBottom: '0.25rem' }}>Win Rate</p>
              <h2 style={{ fontSize: 'clamp(1.4rem, 6vw, 1.8rem)', fontWeight: '600' }}>{metrics.winRate.toFixed(0)}%</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.1rem' }}>Target: 55%</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', marginBottom: '0.25rem' }}>Win Trades</p>
              <h2 style={{ fontSize: 'clamp(1.4rem, 6vw, 1.8rem)', fontWeight: '600', color: 'var(--accent-win)' }}>{metrics.winningTradesCount}</h2>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', marginBottom: '0.25rem' }}>Loss Trades</p>
              <h2 style={{ fontSize: 'clamp(1.4rem, 6vw, 1.8rem)', fontWeight: '600', color: 'var(--accent-loss)' }}>{metrics.losingTradesCount}</h2>
            </div>
          </div>

          {/* Top & Bottom Performers */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Star size={16} fill="var(--accent-primary)" color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '500' }}>Top & Bottom Performers</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {metrics.bestTrade && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(0, 255, 136, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowUp size={20} color="var(--accent-win)" />
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Best Trade</p>
                      <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', fontWeight: '500', marginTop: '0.1rem' }}>{metrics.bestTrade.symbol}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--accent-win)', fontSize: 'clamp(0.9rem, 4vw, 1rem)', fontWeight: '600' }}>+{formatMoney(metrics.bestTrade.pnl)}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.1rem' }}>{format(new Date(metrics.bestTrade.exitDate), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              )}

              {metrics.worstTrade && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255, 51, 102, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowDown size={20} color="var(--accent-loss)" />
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Worst Trade</p>
                      <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', fontWeight: '500', marginTop: '0.1rem' }}>{metrics.worstTrade.symbol}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--accent-loss)', fontSize: 'clamp(0.9rem, 4vw, 1rem)', fontWeight: '600' }}>{formatMoney(metrics.worstTrade.pnl)}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.1rem' }}>{format(new Date(metrics.worstTrade.exitDate), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activePill === 'Calendar' && <CalendarView />}
      {activePill === 'Day' && <MetricBarChart data={weekdayPerformance} title="Net PnL by Day of Week" />}
      {activePill === 'Strategies' && <MetricBarChart data={setupPerformance} title="Net PnL by Strategy (Setup)" />}
      {activePill === 'Market' && <MetricBarChart data={marketPerformance} title="Net PnL by Asset Class" />}
      {activePill === 'Direction' && <MetricBarChart data={directionPerformance} title="Long vs Short Performance" />}
      {activePill === 'Entry' && <MetricBarChart data={entryPerformance} title="PnL by Entry Hour" />}
      {activePill === 'Exit' && <MetricBarChart data={exitPerformance} title="PnL by Exit Hour" />}
      {activePill === 'Session' && <MetricBarChart data={sessionPerformance} title="PnL by Trading Session" />}

    </div>
  );
}
