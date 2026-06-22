import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { useTradeContext } from '../context/TradeContext';
import { calculateMetrics } from '../utils/calculations';
import {
  AreaChart, Area, ResponsiveContainer, YAxis, Tooltip,
  BarChart, Bar, Cell, XAxis, CartesianGrid,
  PieChart, Pie, Sector,
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, X } from 'lucide-react';
import type { Trade } from '../types';

type Tab = 'Dashboard' | 'Calendar' | 'Day' | 'Entry' | 'Exit' | 'Direction' | 'Session';

export function Analytics() {
  const { trades, formatMoney } = useTradeContext();
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs: Tab[] = ['Dashboard', 'Calendar', 'Day', 'Entry', 'Exit', 'Direction', 'Session'];
  const metrics = calculateMetrics(trades);

  const totalPnL = trades.reduce((s, t) => s + t.pnl, 0);

  const chartData = useMemo(() => {
    const sorted = [...trades].sort((a, b) => new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime());
    let cum = 0;
    return sorted.map(t => {
      cum += t.pnl;
      return { date: format(new Date(t.exitDate), 'MMM dd'), balance: cum };
    });
  }, [trades]);

  const dayOfWeekData = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const perf = days.map(name => ({ name, pnl: 0, wins: 0, losses: 0 }));
    trades.forEach(t => {
      const d = new Date(t.exitDate).getDay();
      perf[d].pnl += t.pnl;
      if (t.pnl > 0) perf[d].wins++; else perf[d].losses++;
    });
    return perf;
  }, [trades]);

  const entryExitData = (key: 'strategy') => {
    const map: Record<string, { pnl: number; wins: number }> = {};
    trades.forEach(t => {
      const k = t[key];
      if (!map[k]) map[k] = { pnl: 0, wins: 0 };
      map[k].pnl += t.pnl;
      if (t.pnl > 0) map[k].wins++;
    });
    return Object.entries(map).map(([name, d]) => ({ name, pnl: d.pnl, count: d.wins })).sort((a, b) => b.pnl - a.pnl);
  };

  const directionData = useMemo(() => {
    const long = { pnl: 0, wins: 0, losses: 0 };
    const short = { pnl: 0, wins: 0, losses: 0 };
    trades.forEach(t => {
      if (t.direction === 'LONG') { long.pnl += t.pnl; if (t.pnl > 0) long.wins++; else long.losses++; }
      else { short.pnl += t.pnl; if (t.pnl > 0) short.wins++; else short.losses++; }
    });
    const longWR = long.wins + long.losses > 0 ? (long.wins / (long.wins + long.losses)) * 100 : 0;
    const shortWR = short.wins + short.losses > 0 ? (short.wins / (short.wins + short.losses)) * 100 : 0;
    return [
      { name: 'Long', pnl: long.pnl, wins: long.wins, losses: long.losses, winRate: longWR },
      { name: 'Short', pnl: short.pnl, wins: short.wins, losses: short.losses, winRate: shortWR },
    ];
  }, [trades]);

  const sessionData = useMemo(() => {
    const sessions = [
      { name: 'Pre-Market', hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], pnl: 0, wins: 0, losses: 0 },
      { name: 'Morning', hours: [10, 11, 12], pnl: 0, wins: 0, losses: 0 },
      { name: 'Afternoon', hours: [13, 14, 15], pnl: 0, wins: 0, losses: 0 },
      { name: 'Evening', hours: [16, 17, 18, 19, 20, 21, 22, 23], pnl: 0, wins: 0, losses: 0 },
    ];
    trades.forEach(t => {
      const h = new Date(t.exitDate).getHours();
      const s = sessions.find(s => s.hours.includes(h));
      if (s) { s.pnl += t.pnl; if (t.pnl > 0) s.wins++; else s.losses++; }
    });
    return sessions.filter(s => s.wins + s.losses > 0).map(s => ({
      ...s, winRate: s.wins + s.losses > 0 ? (s.wins / (s.wins + s.losses)) * 100 : 0,
    }));
  }, [trades]);

  const strategyData = entryExitData('strategy');

  const renderDonut = (data: { name: string; value: number; color: string }[], total: number) => {
    const onPieEnter = (_: any, index: number) => setActiveIndex(index);
    const renderActiveShape = (props: any) => {
      const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
      return (
        <g>
          <text x={cx} y={cy - 10} textAnchor="middle" fill="#1a1d29" fontSize="22" fontWeight="700">
            {(percent * 100).toFixed(0)}%
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#6b7185" fontSize="11">
            {payload.name}
          </text>
          <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6}
            startAngle={startAngle} endAngle={endAngle} fill={fill} />
        </g>
      );
    };

    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
        <PieChart width={220} height={220}>
          <Pie
            {...{ activeIndex } as any} activeShape={renderActiveShape}
            data={data} cx={110} cy={110} innerRadius={60} outerRadius={90}
            dataKey="value" onMouseEnter={onPieEnter}
          >
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </div>
    );
  };

  const renderBarChart = (data: any[]) => (
    <div style={{ height: '200px', width: '100%', marginTop: '0.5rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
          <XAxis dataKey="name" stroke="#9ea3b5" tick={{ fill: '#9ea3b5', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis stroke="#9ea3b5" tick={{ fill: '#9ea3b5', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ border: '1px solid #e8eaef', borderRadius: '8px', fontSize: '0.8rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            cursor={{ fill: '#f5f6fa' }}
            formatter={(val: any) => [formatMoney(val), 'PnL']}
          />
          <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
            {data.map((entry: any, idx: number) => (
              <Cell key={idx} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const winData = (label: string, wins: number, losses: number, pnl: number) => {
    const total = wins + losses;
    if (total === 0) return null;
    return (
      <Card key={label} style={{ borderRadius: 'var(--radius-lg)' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem' }}>{label}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Wins</span>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent-green)' }}>{wins}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Losses</span>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent-red)' }}>{losses}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total</span>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{total}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Net PnL</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {pnl >= 0 ? '+' : ''}{formatMoney(pnl)}
            </span>
          </div>
        </div>
      </Card>
    );
  };

  const donutData = (items: { name: string; wins: number; losses: number }[]) => {
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const total = items.reduce((s, i) => s + i.wins + i.losses, 0);
    if (total === 0) return { data: [], total: 0 };
    const data = items.map((i, idx) => ({
      name: i.name, value: i.wins + i.losses, color: colors[idx % colors.length],
    }));
    return { data, total };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
      <h1 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Analytics</h1>

      <div className="pill-tabs">
        {tabs.map(t => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {tab === 'Dashboard' && (
        <>
          {chartData.length > 1 && (
            <Card style={{ borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Account Growth</p>
              <div style={{ height: '180px', width: 'calc(100% + 2rem)', margin: '0 -1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{ border: '1px solid #e8eaef', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                      cursor={{ stroke: '#ccc', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
                    <Area type="monotone" dataKey="balance" stroke="#22c55e" strokeWidth={2.5}
                      fill="url(#greenGrad)" dot={false}
                      activeDot={{ r: 5, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Card style={{ borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Total Trades</p>
              <h2 style={{ fontSize: '1.4rem' }}>{metrics.totalTrades}</h2>
            </Card>
            <Card style={{ borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Win Rate</p>
              <h2 style={{ fontSize: '1.4rem' }}>{metrics.winRate.toFixed(1)}%</h2>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Target: 55%</p>
            </Card>
            <Card style={{ borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Win Trades</p>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--accent-green)' }}>{metrics.winningTradesCount}</h2>
            </Card>
            <Card style={{ borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Loss Trades</p>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--accent-red)' }}>{metrics.losingTradesCount}</h2>
            </Card>
          </div>

          {metrics.bestTrade && (
            <Card style={{ borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Top & Bottom Performers</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={16} color="var(--accent-green)" />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>{metrics.bestTrade.symbol}</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{format(new Date(metrics.bestTrade.exitDate), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-green)' }}>
                    +{formatMoney(metrics.bestTrade.pnl)}
                  </p>
                </div>
                {metrics.worstTrade && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-red-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingDown size={16} color="var(--accent-red)" />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>{metrics.worstTrade.symbol}</p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{format(new Date(metrics.worstTrade.exitDate), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-red)' }}>
                      {formatMoney(metrics.worstTrade.pnl)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {/* CALENDAR TAB */}
      {tab === 'Calendar' && <AnalyticsCalendar trades={trades} formatMoney={formatMoney} />}

      {/* DAY TAB */}
      {tab === 'Day' && (
        <>
          <Card style={{ borderRadius: 'var(--radius-lg)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Performance by Day</p>
            {renderBarChart(dayOfWeekData)}
          </Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {dayOfWeekData.filter(d => d.wins + d.losses > 0).slice(0, 4).map(d => winData(d.name, d.wins, d.losses, d.pnl))}
            </div>
          </div>
        </>
      )}

      {/* ENTRY TAB */}
      {tab === 'Entry' && (
        <Card style={{ borderRadius: 'var(--radius-lg)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Performance by Strategy</p>
          {renderBarChart(strategyData)}
        </Card>
      )}

      {/* EXIT TAB */}
      {tab === 'Exit' && (
        <Card style={{ borderRadius: 'var(--radius-lg)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Exit Analysis</p>
          {renderBarChart(strategyData)}
        </Card>
      )}

      {/* DIRECTION TAB */}
      {tab === 'Direction' && (
        <>
          {(() => {
            const dd = donutData(directionData);
            return dd.total > 0 ? (
              <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Direction Win Rate</p>
                {renderDonut(dd.data, dd.total)}
              </Card>
            ) : null;
          })()}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {directionData.filter(d => d.wins + d.losses > 0).map(d => winData(d.name, d.wins, d.losses, d.pnl))}
          </div>
        </>
      )}

      {/* SESSION TAB */}
      {tab === 'Session' && (
        <>
          {(() => {
            const sd = donutData(sessionData);
            return sd.total > 0 ? (
              <Card style={{ borderRadius: 'var(--radius-lg)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Session Win Rate</p>
                {renderDonut(sd.data, sd.total)}
              </Card>
            ) : null;
          })()}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {sessionData.map(s => winData(s.name, s.wins, s.losses, s.pnl))}
          </div>
        </>
      )}
    </div>
  );
}

/* ========== CALENDAR SUB-COMPONENT ========== */
function AnalyticsCalendar({ trades, formatMoney: fmt }: { trades: Trade[]; formatMoney: (v: number) => string }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{ date: Date; trades: Trade[] } | null>(null);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  }, [currentDate]);

  const calendar = useMemo(() => {
    const startOffset = getDay(daysInMonth[0]);
    const empty = Array.from({ length: startOffset }, () => null as any);
    let mx = 0, mn = 0;
    const days = daysInMonth.map(day => {
      const dayTrades = trades.filter(t => isSameDay(new Date(t.exitDate), day));
      const pnl = dayTrades.reduce((s, t) => s + t.pnl, 0);
      if (pnl > mx) mx = pnl;
      if (pnl < mn) mn = pnl;
      return { date: day, pnl, trades: dayTrades, count: dayTrades.length };
    });
    return { grid: [...empty, ...days], mx, mn };
  }, [daysInMonth, trades]);

  const monthPnl = calendar.grid.filter(Boolean).reduce((s, d) => s + (d?.pnl || 0), 0);

  const getBg = (pnl: number) => {
    if (pnl === 0) return 'transparent';
    const max = pnl > 0 ? calendar.mx : Math.abs(calendar.mn);
    const intensity = Math.max(0.06, Math.min(0.85, Math.abs(pnl) / (max || 1)));
    return pnl > 0 ? `rgba(34, 197, 94, ${intensity})` : `rgba(239, 68, 68, ${intensity})`;
  };

  return (
    <div>
      <Card style={{ borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex' }}>
              <ChevronLeft size={16} />
            </button>
            <h3 style={{ fontSize: '0.95rem', minWidth: '110px', textAlign: 'center' }}>{format(currentDate, 'MMMM yyyy')}</h3>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex' }}>
              <ChevronRight size={16} />
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', fontWeight: '600', color: monthPnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {monthPnl >= 0 ? '+' : ''}{fmt(monthPnl)}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '2px' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} style={{ textAlign: 'center', padding: '0.3rem 0', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '500' }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {calendar.grid.map((day, i) => {
            const hasTrades = day && day.count > 0;
            return (
              <div key={i}
                onClick={() => { if (hasTrades) setSelectedDay({ date: day.date, trades: day.trades }); }}
                style={{
                  aspectRatio: '1', borderRadius: '6px', cursor: hasTrades ? 'pointer' : 'default',
                  background: day ? getBg(day.pnl) : 'transparent',
                  border: day ? '1px solid var(--border)' : 'transparent',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  minHeight: '38px',
                }}>
                {day && (
                  <>
                    <span style={{ fontSize: '0.7rem', fontWeight: hasTrades ? '700' : '400', color: hasTrades ? '#fff' : 'var(--text-muted)', textShadow: hasTrades ? '0 1px 3px rgba(0,0,0,0.3)' : 'none' }}>
                      {format(day.date, 'd')}
                    </span>
                    {hasTrades && <span style={{ fontSize: '0.5rem', fontWeight: '600', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.3)', marginTop: '1px' }}>{fmt(day.pnl)}</span>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {selectedDay && (
        <div style={{ marginTop: '1rem' }}>
          <Card style={{ borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem' }}>{format(selectedDay.date, 'MMMM d, yyyy')}</h3>
              <p style={{ fontSize: '0.85rem', fontWeight: '700', color: selectedDay.trades.reduce((s, t) => s + t.pnl, 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                Net: {fmt(selectedDay.trades.reduce((s, t) => s + t.pnl, 0))}
              </p>
            </div>
            {selectedDay.trades.map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>{t.symbol}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t.strategy} &middot; {t.direction}</p>
                </div>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: t.pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {t.pnl >= 0 ? '+' : ''}{fmt(t.pnl)}
                </p>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
