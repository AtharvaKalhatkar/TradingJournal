import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { useTradeContext } from '../context/TradeContext';
import { format } from 'date-fns';
import { Plus, TrendingUp, TrendingDown, CheckCircle, Trash2 } from 'lucide-react';
import { AddTradeModal } from '../components/trades/AddTradeModal';

export function Journal() {
  const { trades, formatMoney, formatPercent, deleteTrade } = useTradeContext();
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0 0.5rem' }}>
        <h1 style={{ fontSize: '1.3rem' }}>Journal</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{trades.length} entries</p>
      </div>

      {trades.length === 0 && (
        <Card style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No trades yet. Tap + to add your first journal entry.</p>
        </Card>
      )}

      {trades.map((trade, idx) => (
        <Card key={trade.id} style={{
          borderRadius: 'var(--radius-lg)', padding: '1rem',
          animation: 'fadeIn 0.3s ease',
          animationDelay: `${idx * 0.05}s`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
                background: trade.direction === 'LONG' ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {trade.direction === 'LONG' ? (
                  <TrendingUp size={18} color="var(--accent-green)" />
                ) : (
                  <TrendingDown size={18} color="var(--accent-red)" />
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{trade.symbol}</h3>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: '600', padding: '0.15rem 0.45rem',
                    borderRadius: '6px',
                    background: trade.direction === 'LONG' ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                    color: trade.direction === 'LONG' ? 'var(--accent-green)' : 'var(--accent-red)',
                  }}>
                    {trade.direction === 'LONG' ? 'Long' : 'Short'}
                  </span>
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  {trade.marketType} &middot; {trade.instrumentType}
                </p>
              </div>
            </div>
            <button onClick={() => { if (confirm('Delete this entry?')) deleteTrade(trade.id); }}
              style={{ padding: '0.3rem', color: 'var(--text-muted)' }}>
              <Trash2 size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Investment</p>
              <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>{formatMoney(trade.investment)}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Duration</p>
              <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>{trade.duration}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Status</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <CheckCircle size={12} color="var(--accent-blue)" />
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-blue)' }}>Closed</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {format(new Date(trade.entryDate), 'MMM dd, yyyy')}
              </p>
              {trade.strategy && (
                <span style={{
                  fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px',
                  background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)',
                  display: 'inline-block', marginTop: '0.25rem',
                }}>
                  {trade.strategy}
                </span>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{
                fontSize: '1rem', fontWeight: '700',
                color: trade.pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
              }}>
                {trade.pnl >= 0 ? '+' : ''}{formatMoney(trade.pnl)}
              </p>
              <p style={{
                fontSize: '0.7rem', fontWeight: '500',
                color: trade.pnlPercent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
              }}>
                {formatPercent(trade.pnlPercent)}
              </p>
            </div>
          </div>
        </Card>
      ))}

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed', bottom: '5.5rem', right: 'calc(50% - 200px)',
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--accent-blue)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.35)',
          zIndex: 50,
        }}
      >
        <Plus size={24} />
      </button>

      <AddTradeModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
