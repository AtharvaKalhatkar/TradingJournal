import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Trash2, BarChart3 } from 'lucide-react';
import { AddTradeModal } from '../components/trades/AddTradeModal';
import { useTradeContext } from '../context/TradeContext';

export function Journal() {
  const { trades, deleteTrade, formatMoney } = useTradeContext();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div>
          <h1 style={{ fontSize: '1.3rem' }}>Journal</h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{trades.length} entries</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/analytics')}
            style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
            <BarChart3 size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Stats
          </button>
        </div>
      </div>

      {trades.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No journal entries yet</p>
          <button onClick={() => setShowModal(true)}
            style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600 }}>
            <Plus size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Add First Entry
          </button>
        </div>
      )}

      {trades.map((t, i) => (
        <div className="card" key={t.id} style={{ padding: '0.85rem 1rem', animation: `fadeIn 0.3s ease ${i * 0.05}s` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                background: t.direction === 'LONG' ? 'var(--green-bg)' : 'var(--red-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {t.direction === 'LONG' ? <TrendingUp size={18} color="var(--green)" /> : <TrendingDown size={18} color="var(--red)" />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>{t.symbol}</span>
                  <span className="badge" style={{
                    background: t.direction === 'LONG' ? 'var(--green-bg)' : 'var(--red-bg)',
                    color: t.direction === 'LONG' ? 'var(--green)' : 'var(--red)',
                  }}>
                    {t.direction === 'LONG' ? 'Long' : 'Short'}
                  </span>
                  <span className="badge" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                    {t.marketType}
                  </span>
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {t.entryPrice.toFixed(2)} &rarr; {t.exitPrice.toFixed(2)} | {t.quantity} shares
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: t.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {t.pnl >= 0 ? '+' : ''}{formatMoney(t.pnl)}
              </p>
              <p style={{ fontSize: '0.7rem', fontWeight: 500, color: t.pnlPercent >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {t.pnlPercent >= 0 ? '+' : ''}{t.pnlPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span className="badge" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{t.strategy}</span>
            <span className="badge" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>{t.instrumentType}</span>
            <span className="badge" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>{t.duration}</span>
          </div>

          {t.notes && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 4 }}>
              {t.notes}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {new Date(t.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <button onClick={() => { if (confirm('Delete this entry?')) deleteTrade(t.id); }}
              style={{ padding: 4, color: 'var(--text-muted)' }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      {/* FAB */}
      <button onClick={() => setShowModal(true)}
        style={{
          position: 'fixed', bottom: 80, right: 16,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--accent)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
          zIndex: 50, border: '3px solid #fff',
        }}>
        <Plus size={26} />
      </button>

      {showModal && <AddTradeModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
