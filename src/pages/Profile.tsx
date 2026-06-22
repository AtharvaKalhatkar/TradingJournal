import React, { useRef, useMemo } from 'react';
import { useTrade } from '../context/TradeContext';
import { Target, Activity, TrendingUp, TrendingDown, Download, Upload, AlertCircle, AlertTriangle, Brain } from 'lucide-react';
import { calculateMetrics, mistakeCostAnalysis, emotionTrends } from '../utils/calculations';

export function Profile() {
  const { trades, fmt, playbooks, importData, exportData, clearAll, isDark, toggleDark } = useTrade();
  const m = calculateMetrics(trades);
  const fileRef = useRef<HTMLInputElement>(null);

  const mistakes = useMemo(() => mistakeCostAnalysis(trades), [trades]);
  const emotions = useMemo(() => emotionTrends(trades), [trades]);

  const strategyPerf = useMemo(() => {
    const map: Record<string, { pnl: number; wins: number; losses: number }> = {};
    trades.forEach(t => {
      if (!map[t.strategy]) map[t.strategy] = { pnl: 0, wins: 0, losses: 0 };
      map[t.strategy].pnl += t.pnl;
      if (t.pnl > 0) map[t.strategy].wins++; else map[t.strategy].losses++;
    });
    return Object.entries(map).map(([name, d]) => ({ name, ...d, wr: d.wins + d.losses > 0 ? (d.wins / (d.wins + d.losses)) * 100 : 0 }));
  }, [trades]);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `trading-journal-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { importData(reader.result as string); alert('Data imported successfully!'); }
      catch { alert('Invalid file format.'); }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-bg)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <h2>Trader</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{trades.length} trades · {playbooks.length} strategies</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card" style={{ borderRadius: 'var(--radius-md)' }}>
          <Activity size={16} color="var(--accent)" />
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>Profit Factor</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>{m.profitFactor.toFixed(2)}</p>
        </div>
        <div className="card" style={{ borderRadius: 'var(--radius-md)' }}>
          <Target size={16} color="var(--accent)" />
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>Expectancy</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: m.expectancy >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(m.expectancy)}</p>
        </div>
        <div className="card" style={{ borderRadius: 'var(--radius-md)' }}>
          <TrendingUp size={16} color="var(--green)" />
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>Avg Win</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--green)' }}>{fmt(m.averageWin)}</p>
        </div>
        <div className="card" style={{ borderRadius: 'var(--radius-md)' }}>
          <TrendingDown size={16} color="var(--red)" />
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>Avg Loss</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--red)' }}>{fmt(m.averageLoss)}</p>
        </div>
        <div className="card" style={{ borderRadius: 'var(--radius-md)' }}>
          <Activity size={16} color="#8b5cf6" />
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>Sharpe Ratio</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>{m.sharpe.toFixed(2)}</p>
        </div>
        <div className="card" style={{ borderRadius: 'var(--radius-md)' }}>
          <Activity size={16} color="#8b5cf6" />
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>Sortino Ratio</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>{m.sortino.toFixed(2)}</p>
        </div>
      </div>

      <div className="card">
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>Streaks</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ padding: '0.65rem', background: 'var(--green-bg)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Win Streak</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--green)' }}>{m.consecutiveWins}</p>
          </div>
          <div style={{ padding: '0.65rem', background: 'var(--red-bg)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Loss Streak</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--red)' }}>{m.consecutiveLosses}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>Risk Metrics</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '0.4rem 0' }}>
          <span style={{ fontSize: '0.8rem' }}>Max Drawdown</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--red)' }}>{fmt(m.maxDrawdown)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '0.4rem 0' }}>
          <span style={{ fontSize: '0.8rem' }}>Avg R Multiple</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{m.avgR.toFixed(2)}R</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '0.4rem 0' }}>
          <span style={{ fontSize: '0.8rem' }}>Avg R:R</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{m.avgRR.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
          <span style={{ fontSize: '0.8rem' }}>Win/Loss Ratio</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{m.winLossRatio.toFixed(2)}</span>
        </div>
      </div>

      {mistakes.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <AlertTriangle size={14} color="var(--red)" />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Mistakes Cost</p>
          </div>
          {mistakes.slice(0, 5).map(m => (
            <div key={m.mistake} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem' }}>{m.mistake.replace(/_/g, ' ')}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: m.totalPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {m.count}x · {m.totalPnl >= 0 ? '+' : ''}{fmt(m.totalPnl)}
              </span>
            </div>
          ))}
        </div>
      )}

      {emotions.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Brain size={14} color="var(--accent)" />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Emotions</p>
          </div>
          {emotions.map(e => (
            <div key={e.emotion} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem' }}>{e.emotion.charAt(0) + e.emotion.slice(1).toLowerCase()}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: e.totalPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {e.count}t · {e.totalPnl >= 0 ? '+' : ''}{fmt(e.totalPnl)}
              </span>
            </div>
          ))}
        </div>
      )}

      {strategyPerf.length > 0 && (
        <div className="card">
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>Strategy Performance</p>
          {strategyPerf.map(s => (
            <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{s.name}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 6 }}>{s.wins}W-{s.losses}L</span>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: s.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {s.pnl >= 0 ? '+' : ''}{fmt(s.pnl)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>Settings</p>

        <button onClick={toggleDark}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>

        <button onClick={handleExport}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text)' }}>
          <Download size={16} />
          Export Backup (JSON)
        </button>

        <button onClick={() => fileRef.current?.click()}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text)' }}>
          <Upload size={16} />
          Import Backup (JSON)
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />

        <button onClick={() => { if (confirm('Are you sure? This will delete ALL your trading data.')) clearAll(); }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 0', fontSize: '0.85rem', color: 'var(--red)' }}>
          <AlertCircle size={16} />
          Clear All Data
        </button>
      </div>
    </div>
  );
}
