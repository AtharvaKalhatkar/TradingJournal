import React, { useState } from 'react';
import { Plus, Search, TrendingUp, TrendingDown, Trash2, Star, Edit3, Camera } from 'lucide-react';
import { AddTradeModal } from '../components/trades/AddTradeModal';
import { useTrade } from '../context/TradeContext';
import type { Trade } from '../types';

export function Journal() {
  const { trades, deleteTrade, updateTrade, fmt } = useTrade();
  const [show, setShow] = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');

  const filtered = trades.filter(t => {
    const m = search.toLowerCase();
    const matchesSearch = !m || t.symbol.toLowerCase().includes(m) || t.strategy.toLowerCase().includes(m) || t.notes.toLowerCase().includes(m) || t.tags.some(tag => tag.toLowerCase().includes(m));
    const matchesTab = tab === 'ALL' || (tab === 'OPEN' ? t.status === 'OPEN' : t.status === 'CLOSED' || t.status === 'PARTIAL');
    return matchesSearch && matchesTab;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20 }}>Journal</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{trades.length} entries</p>
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search symbol, strategy, notes..."
          style={{ paddingLeft: 32, fontSize: '0.85rem' }} />
      </div>

      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
        {(['ALL', 'OPEN', 'CLOSED'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '0.4rem', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600,
              background: tab === t ? 'var(--bg-card)' : 'transparent',
              color: tab === t ? 'var(--text)' : 'var(--text-secondary)',
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
            {t === 'ALL' ? `All (${trades.length})` : t === 'OPEN' ? `Open (${trades.filter(x => x.status === 'OPEN').length})` : `Closed (${trades.filter(x => x.status !== 'OPEN').length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>{trades.length === 0 ? 'No entries yet' : 'No matches found'}</p>
        </div>
      )}

      {filtered.map(t => (
        <div className="card" key={t.id} style={{ padding: '0.8rem 1rem', border: t.status === 'OPEN' ? '1px solid #f59e0b' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8,
                background: t.direction === 'LONG' ? 'var(--green-bg)' : 'var(--red-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t.direction === 'LONG' ? <TrendingUp size={16} color="var(--green)" /> : <TrendingDown size={16} color="var(--red)" />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{t.symbol}</span>
                  <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, fontWeight: 600,
                    background: t.direction === 'LONG' ? 'var(--green-bg)' : 'var(--red-bg)',
                    color: t.direction === 'LONG' ? 'var(--green)' : 'var(--red)' }}>
                    {t.direction === 'LONG' ? 'Long' : 'Short'}
                  </span>
                  {t.status === 'OPEN' && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 600 }}>OPEN</span>}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {t.entryPrice.toFixed(0)} {t.exitPrice ? `→ ${t.exitPrice.toFixed(0)}` : ''} | {t.quantity} qty
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: t.status === 'OPEN' ? '#f59e0b' : (t.pnl >= 0 ? 'var(--green)' : 'var(--red)') }}>
                {t.status === 'OPEN' ? '--' : `${t.pnl >= 0 ? '+' : ''}${fmt(t.pnl)}`}
              </p>
              {t.status !== 'OPEN' && (
                <p style={{ fontSize: 11, fontWeight: 500, color: t.pnlPercent >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {t.pnlPercent >= 0 ? '+' : ''}{t.pnlPercent.toFixed(2)}%
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '6px 0' }}>
            <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: 'var(--accent-bg)', color: 'var(--accent)' }}>{t.strategy}</span>
            <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: 'var(--bg-input)', color: 'var(--text-muted)' }}>{t.instrumentType}</span>
            {t.duration && <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: 'var(--bg-input)', color: 'var(--text-muted)' }}>{t.duration}</span>}
            {t.stopLoss && t.takeProfit && (
              <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: 'var(--green-bg)', color: 'var(--green)' }}>
                R:R {((t.takeProfit - t.entryPrice) / (t.entryPrice - t.stopLoss)).toFixed(2)}
              </span>
            )}
          </div>

          {t.rating && t.rating > 0 && (
            <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} size={12} fill={n <= (t.rating || 0) ? '#f59e0b' : 'none'} color={n <= (t.rating || 0) ? '#f59e0b' : 'var(--text-muted)'} />
              ))}
            </div>
          )}

          {t.notes && (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 4 }}>
              {t.notes}
            </p>
          )}

          {t.screenshot && (
            <div style={{ marginTop: 6 }}>
              <img src={t.screenshot} alt="chart" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8 }} />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {new Date(t.status === 'OPEN' ? t.entryDate : (t.exitDate || t.entryDate)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setEditTrade(t); setShow(true); }} style={{ padding: 4, color: 'var(--text-muted)' }}><Edit3 size={13} /></button>
              <button onClick={() => { if (confirm('Delete?')) deleteTrade(t.id); }} style={{ padding: 4, color: 'var(--text-muted)' }}><Trash2 size={13} /></button>
            </div>
          </div>
        </div>
      ))}

      <button onClick={() => { setEditTrade(undefined); setShow(true); }}
        style={{ position: 'fixed', bottom: 75, right: 16, width: 54, height: 54, borderRadius: 27,
          background: 'var(--accent)', color: '#fff', border: '3px solid var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(59,130,246,0.4)', zIndex: 50 }}>
        <Plus size={24} />
      </button>

      {show && <AddTradeModal onClose={() => { setShow(false); setEditTrade(undefined); }} editTrade={editTrade} />}
    </div>
  );
}
