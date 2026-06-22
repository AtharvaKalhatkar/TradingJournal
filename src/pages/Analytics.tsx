import React, { useState, useMemo } from 'react';
import { useTrade } from '../context/TradeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Sector, AreaChart, Area, LineChart, Line } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, AlertTriangle, Brain } from 'lucide-react';
import { rollingWinRate, mistakeCostAnalysis, emotionTrends } from '../utils/calculations';

type Tab = 'Dashboard' | 'Calendar' | 'Day' | 'Direction' | 'Session' | 'Psychology';

export function Analytics() {
  const { trades, fmt } = useTrade();
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [activePie, setActivePie] = useState(0);
  const tabs: Tab[] = ['Dashboard', 'Calendar', 'Day', 'Direction', 'Session', 'Psychology'];

  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  const totalPnL = trades.reduce((s, t) => s + t.pnl, 0);
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;

  const gp = wins.reduce((s, t) => s + t.pnl, 0);
  const gl = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const pf = gl === 0 ? (gp > 0 ? 99 : 0) : gp / gl;

  const eqData = useMemo(() => {
    const sorted = [...trades].filter(t => t.status !== 'OPEN').sort((a, b) => new Date(a.exitDate || a.entryDate).getTime() - new Date(b.exitDate || b.entryDate).getTime());
    let cum = 0;
    return sorted.map(t => { cum += t.pnl; return { date: format(new Date(t.exitDate || t.entryDate), 'MMM dd'), value: cum }; });
  }, [trades]);

  const dayData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = days.map(name => ({ name, pnl: 0, w: 0, l: 0 }));
    trades.forEach(t => {
      const idx = new Date(t.exitDate || t.entryDate).getDay();
      d[idx].pnl += t.pnl;
      if (t.pnl > 0) d[idx].w++; else d[idx].l++;
    });
    return d;
  }, [trades]);

  const dirData = useMemo(() => {
    const long = { pnl: 0, w: 0, l: 0 };
    const short = { pnl: 0, w: 0, l: 0 };
    trades.forEach(t => {
      if (t.direction === 'LONG') { long.pnl += t.pnl; t.pnl > 0 ? long.w++ : long.l++; }
      else { short.pnl += t.pnl; t.pnl > 0 ? short.w++ : short.l++; }
    });
    return [{ name: 'Long', ...long, wr: long.w + long.l > 0 ? (long.w / (long.w + long.l)) * 100 : 0 },
      { name: 'Short', ...short, wr: short.w + short.l > 0 ? (short.w / (short.w + short.l)) * 100 : 0 },
    ].filter(d => d.w + d.l > 0);
  }, [trades]);

  const sessionData = useMemo(() => {
    const s = [
      { name: 'Pre-Market', h: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], pnl: 0, w: 0, l: 0 },
      { name: 'Morning', h: [10, 11, 12], pnl: 0, w: 0, l: 0 },
      { name: 'Afternoon', h: [13, 14, 15], pnl: 0, w: 0, l: 0 },
      { name: 'Evening', h: [16, 17, 18, 19, 20, 21, 22, 23], pnl: 0, w: 0, l: 0 },
    ];
    trades.forEach(t => {
      const hour = new Date(t.exitDate || t.entryDate).getHours();
      const se = s.find(x => x.h.includes(hour));
      if (se) { se.pnl += t.pnl; t.pnl > 0 ? se.w++ : se.l++; }
    });
    return s.filter(x => x.w + x.l > 0).map(x => ({ ...x, wr: (x.w / (x.w + x.l)) * 100 }));
  }, [trades]);

  const mistakes = useMemo(() => mistakeCostAnalysis(trades), [trades]);
  const emotions = useMemo(() => emotionTrends(trades), [trades]);
  const rollData = useMemo(() => rollingWinRate(trades, 20), [trades]);

  const renderBar = (data: any[]) => (
    <div style={{ height: 200, width: '100%', marginTop: 8 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.8rem', background: 'var(--bg-card)', color: 'var(--text)' }}
            cursor={{ fill: 'var(--bg-hover)' }}
            formatter={(val: any) => [fmt(val), 'PnL']} />
          <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
            {data.map((e: any, i: number) => <Cell key={i} fill={e.pnl >= 0 ? '#22c55e' : '#ef4444'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderDonut = (data: { name: string; value: number; color: string }[]) => {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (!total) return null;
    const renderActiveShape = (props: any) => {
      const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
      return (<g>
        <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--text)" fontSize={20} fontWeight={700}>
          {(percent * 100).toFixed(0)}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-secondary)" fontSize={10}>
          {payload.name}
        </text>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 4}
          startAngle={startAngle} endAngle={endAngle} fill={fill} />
      </g>);
    };
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
        <PieChart width={220} height={220}>
          <Pie {...{ activeIndex: activePie } as any} activeShape={renderActiveShape}
            data={data} cx={110} cy={110} innerRadius={60} outerRadius={90}
            dataKey="value" onMouseEnter={(_: any, i: number) => setActivePie(i)}>
            {data.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Pie>
        </PieChart>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ fontSize: '1.3rem' }}>Analytics</h1>

      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '0.4rem 1rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500,
              whiteSpace: 'nowrap', background: tab === t ? 'var(--accent)' : 'var(--bg-input)',
              color: tab === t ? '#fff' : 'var(--text-secondary)' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Dashboard' && (
        <>
          {eqData.length > 1 && (
            <div className="card">
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>Account Growth</p>
              <div style={{ height: 160, width: 'calc(100% + 2rem)', margin: '0 -1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={eqData}>
                    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.2}/><stop offset="100%" stopColor="#22c55e" stopOpacity={0}/></linearGradient></defs>
                    <Tooltip contentStyle={{ border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.8rem', background: 'var(--bg-card)' }} cursor={{ stroke: '#ccc', strokeDasharray: '3 3' }} />
                    <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
                    <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2.5} fill="url(#g)" dot={false} activeDot={{ r: 5, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="card"><p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Trades</p><h2 style={{ fontSize: '1.5rem' }}>{trades.length}</h2></div>
            <div className="card"><p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Win Rate</p><h2 style={{ fontSize: '1.5rem' }}>{winRate.toFixed(1)}%</h2><p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{wins.length}W / {losses.length}L</p></div>
            <div className="card"><p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Net PnL</p><h2 style={{ fontSize: '1.5rem', color: totalPnL >= 0 ? 'var(--green)' : 'var(--red)' }}>{totalPnL >= 0 ? '+' : ''}{fmt(totalPnL)}</h2></div>
            <div className="card"><p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Profit Factor</p><h2 style={{ fontSize: '1.5rem' }}>{pf.toFixed(2)}</h2></div>
          </div>

          {rollData.length > 1 && (
            <div className="card">
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Rolling Win Rate (last 20)</p>
              <div style={{ height: 80 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rollData}>
                    <YAxis hide domain={[0, 100]} />
                    <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {trades.length > 0 && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 8 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Best Trade</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--green)' }}>
                  {trades.reduce((b, t) => (t.pnl || 0) > (b.pnl || 0) ? t : b).symbol} +{fmt(trades.reduce((b, t) => (t.pnl || 0) > (b.pnl || 0) ? t : b).pnl || 0)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Worst Trade</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--red)' }}>
                  {trades.reduce((w, t) => (t.pnl || 0) < (w.pnl || 0) ? t : w).symbol} -{fmt(Math.abs(trades.reduce((w, t) => (t.pnl || 0) < (w.pnl || 0) ? t : w).pnl || 0))}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'Calendar' && <CalView trades={trades} fmt={fmt} />}

      {tab === 'Day' && (
        <div className="card">
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>PnL by Day of Week</p>
          {renderBar(dayData.filter(d => d.w + d.l > 0))}
        </div>
      )}

      {tab === 'Direction' && dirData.length > 0 && (
        <>
          <div className="card">
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Direction Win Rate</p>
            {renderDonut(dirData.map(d => ({ name: d.name, value: d.w + d.l, color: d.name === 'Long' ? '#22c55e' : '#ef4444' })))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {dirData.map(d => (
              <div className="card" key={d.name}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: 6 }}>{d.name}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Wins</span><span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--green)' }}>{d.w}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Losses</span><span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--red)' }}>{d.l}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 4 }}><span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Net PnL</span><span style={{ fontSize: '0.82rem', fontWeight: 700, color: d.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>{d.pnl >= 0 ? '+' : ''}{fmt(d.pnl)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'Session' && sessionData.length > 0 && (
        <>
          <div className="card">
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Session Win Rate</p>
            {renderDonut(sessionData.map(s => ({ name: s.name, value: s.w + s.l, color: s.name === 'Morning' ? '#3b82f6' : s.name === 'Afternoon' ? '#f59e0b' : s.name === 'Evening' ? '#8b5cf6' : '#6b7280' })))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {sessionData.map(s => (
              <div className="card" key={s.name}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: 6 }}>{s.name}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Wins</span><span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--green)' }}>{s.w}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Losses</span><span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--red)' }}>{s.l}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 4 }}><span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Net PnL</span><span style={{ fontSize: '0.82rem', fontWeight: 700, color: s.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>{s.pnl >= 0 ? '+' : ''}{fmt(s.pnl)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'Psychology' && (
        <>
          {mistakes.length > 0 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <AlertTriangle size={16} color="var(--red)" />
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Mistake Cost Analysis</p>
              </div>
              {mistakes.map(m => (
                <div key={m.mistake} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{m.mistake.replace(/_/g, ' ')}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 6 }}>{m.count}x ({m.wins}W / {m.losses}L)</span>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: m.totalPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {m.totalPnl >= 0 ? '+' : ''}{fmt(m.totalPnl)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {emotions.length > 0 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Brain size={16} color="var(--accent)" />
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Emotion Performance</p>
              </div>
              {emotions.map(e => (
                <div key={e.emotion} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{e.emotion.charAt(0) + e.emotion.slice(1).toLowerCase()}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 6 }}>{e.count} trades</span>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: e.totalPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {e.totalPnl >= 0 ? '+' : ''}{fmt(e.totalPnl)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {rollData.length > 1 && (
            <div className="card">
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Win Rate Trend</p>
              <div style={{ height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rollData}>
                    <YAxis hide domain={[0, 100]} />
                    <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {mistakes.length === 0 && emotions.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>Journal more trades to see psychology insights</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* Calendar sub-component */
function CalView({ trades, fmt }: { trades: any[]; fmt: (n: number) => string }) {
  const [date, setDate] = useState(new Date());
  const [selected, setSelected] = useState<any>(null);

  const days = eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) });
  const offset = getDay(days[0]);
  const empty = Array.from({ length: offset }, () => null as any);
  let mx = 0, mn = 0;
  const grid = days.map(d => {
    const dayTrades = trades.filter((t: any) => isSameDay(new Date(t.exitDate || t.entryDate), d));
    const pnl = dayTrades.reduce((s: number, t: any) => s + (t.pnl || 0), 0);
    if (pnl > mx) mx = pnl; if (pnl < mn) mn = pnl;
    return { date: d, pnl, trades: dayTrades, count: dayTrades.length };
  });
  const allDays = [...empty, ...grid];
  const monthPnl = grid.reduce((s, d) => s + d.pnl, 0);

  const getBg = (pnl: number) => {
    if (pnl === 0) return 'transparent';
    const max = pnl > 0 ? mx : Math.abs(mn);
    const intensity = Math.max(0.06, Math.min(0.8, Math.abs(pnl) / (max || 1)));
    return pnl > 0 ? `rgba(34, 197, 94, ${intensity})` : `rgba(239, 68, 68, ${intensity})`;
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}
              style={{ padding: 4, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex' }}><ChevronLeft size={16} /></button>
            <h3 style={{ fontSize: '0.9rem', minWidth: 100, textAlign: 'center' }}>{format(date, 'MMMM yyyy')}</h3>
            <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}
              style={{ padding: 4, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex' }}><ChevronRight size={16} /></button>
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: monthPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {monthPnl >= 0 ? '+' : ''}{fmt(monthPnl)}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} style={{ textAlign: 'center', padding: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 500 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {allDays.map((day, i) => (
            <div key={i} onClick={() => { if (day?.count) setSelected(day); }}
              style={{ aspectRatio: '1', borderRadius: 6, cursor: day?.count ? 'pointer' : 'default',
                background: day ? getBg(day.pnl) : 'transparent', border: day ? '1px solid var(--border)' : 'transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 36 }}>
              {day && (
                <>
                  <span style={{ fontSize: '0.68rem', fontWeight: day.count ? 700 : 400, color: day.count ? '#fff' : 'var(--text-muted)', textShadow: day.count ? '0 1px 2px rgba(0,0,0,0.3)' : 'none' }}>
                    {format(day.date, 'd')}
                  </span>
                  {day.count > 0 && <span style={{ fontSize: '0.48rem', fontWeight: 600, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{fmt(day.pnl)}</span>}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ fontSize: '0.95rem' }}>{format(selected.date, 'MMMM d, yyyy')}</h3>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: selected.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
              Net: {selected.pnl >= 0 ? '+' : ''}{fmt(selected.pnl)}
            </span>
          </div>
          {selected.trades.map((t: any) => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.symbol}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 6 }}>{t.strategy}</span>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: (t.pnl || 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {(t.pnl || 0) >= 0 ? '+' : ''}{fmt(t.pnl || 0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
