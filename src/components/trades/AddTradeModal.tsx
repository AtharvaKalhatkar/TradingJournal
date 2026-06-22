import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Save } from 'lucide-react';
import { useTradeContext } from '../../context/TradeContext';
import type { MarketType, InstrumentType, Direction, Emotion, Mistake, Trade } from '../../types';

interface Props { onClose: () => void }

const MARKETS: MarketType[] = ['STOCK', 'CRYPTO', 'FOREX', 'COMMODITY'];
const EMOTIONS: Emotion[] = ['NEUTRAL', 'CONFIDENT', 'DISCIPLINED', 'ANXIOUS', 'FOMO', 'TILTED', 'GREEDY', 'REVENGE', 'SATISFIED'];
const MISTAKES: Mistake[] = ['EARLY_ENTRY', 'LATE_ENTRY', 'EARLY_EXIT', 'LATE_EXIT', 'OVERSIZED', 'NO_SL', 'NO_PLAN', 'FOMO', 'REVENGE', 'OVERTRADE', 'OTHER'];

export function AddTradeModal({ onClose }: Props) {
  const { addTrade, playbooks } = useTradeContext();

  const [market, setMarket] = useState<MarketType>('STOCK');
  const [instrument, setInstrument] = useState<InstrumentType>('EQUITY');
  const [direction, setDirection] = useState<Direction>('LONG');
  const [symbol, setSymbol] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 16));
  const [exitDate, setExitDate] = useState(new Date().toISOString().slice(0, 16));
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [fees, setFees] = useState('0');
  const [strategy, setStrategy] = useState(playbooks[0]?.name || '');
  const [emotion, setEmotion] = useState<Emotion>('NEUTRAL');
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [customMistakesInput, setCustomMistakesInput] = useState('');
  const [customStrategy, setCustomStrategy] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');

  const toggleMistake = (m: Mistake) => setMistakes(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = Number(entryPrice);
    const exit = Number(exitPrice);
    const qty = Number(quantity);
    const fee = Number(fees);
    const isLong = direction === 'LONG';
    const diff = isLong ? (exit - entry) : (entry - exit);
    const rawPnl = diff * qty;
    const pnl = rawPnl - fee;
    const investment = entry * qty;
    const pnlPct = investment > 0 ? (pnl / investment) * 100 : 0;
    const ms = new Date(exitDate).getTime() - new Date(entryDate).getTime();
    const hrs = Math.round(ms / 3600000);
    const duration = hrs < 1 ? `${Math.round(ms / 60000)}m` : hrs < 24 ? `${hrs}h` : `${Math.round(hrs / 24)}d`;

    const finalMistakes = [...mistakes];
    if (customMistakesInput.trim()) {
      customMistakesInput.split(',').forEach(m => {
        if (m.trim()) finalMistakes.push(m.trim().toUpperCase().replace(/\s+/g, '_') as Mistake);
      });
    }

    const trade: Trade = {
      id: crypto.randomUUID(),
      symbol: symbol.toUpperCase(), marketType: market, instrumentType: instrument, direction,
      entryDate: new Date(entryDate).toISOString(), exitDate: new Date(exitDate).toISOString(),
      entryPrice: entry, exitPrice: exit, quantity: qty, fees: fee,
      strategy: strategy === 'Other' && customStrategy.trim() ? customStrategy.trim() : (strategy || 'None'), 
      emotion, mistakes: finalMistakes, tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      notes, pnl, pnlPercent: pnlPct, investment, duration, status: 'CLOSED',
    };
    addTrade(trade);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div className="fade-in" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />

      <div className="slide-up" style={{
        width: '100%', maxWidth: 480, maxHeight: '92vh',
        background: '#fff', borderRadius: '20px 20px 0 0',
        zIndex: 201, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '1.25rem 1.25rem 0.75rem', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>New Journal Entry</h2>
          <button onClick={onClose} style={{ padding: 4, color: 'var(--text-muted)', borderRadius: '50%', background: 'var(--bg-input)', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Market Selector */}
          <div>
            <label>Market</label>
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
              {MARKETS.map(m => (
                <button key={m} type="button" onClick={() => setMarket(m)}
                  style={{
                    flex: 1, padding: '0.5rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 500,
                    background: market === m ? '#fff' : 'transparent',
                    color: market === m ? 'var(--text)' : 'var(--text-secondary)',
                    boxShadow: market === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}>
                  {m.charAt(0) + m.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Direction + Instrument */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Direction</label>
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
                <button type="button" onClick={() => setDirection('LONG')}
                  style={{
                    flex: 1, padding: '0.5rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 500,
                    background: direction === 'LONG' ? 'var(--green)' : 'transparent',
                    color: direction === 'LONG' ? '#fff' : 'var(--text-secondary)',
                  }}>Long</button>
                <button type="button" onClick={() => setDirection('SHORT')}
                  style={{
                    flex: 1, padding: '0.5rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 500,
                    background: direction === 'SHORT' ? 'var(--red)' : 'transparent',
                    color: direction === 'SHORT' ? '#fff' : 'var(--text-secondary)',
                  }}>Short</button>
              </div>
            </div>
            <div>
              <label>Type</label>
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
                {(['EQUITY', 'FNO'] as InstrumentType[]).map(inst => (
                  <button key={inst} type="button" onClick={() => setInstrument(inst)}
                    style={{
                      flex: 1, padding: '0.5rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 500,
                      background: instrument === inst ? 'var(--accent)' : 'transparent',
                      color: instrument === inst ? '#fff' : 'var(--text-secondary)',
                    }}>{inst === 'EQUITY' ? 'Equity' : 'F&O'}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Symbol */}
          <div>
            <label>Symbol / Underlying</label>
            <input required value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="e.g. AAPL, BTC, NIFTY" />
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Entry Date & Time</label>
              <input type="datetime-local" required value={entryDate} onChange={e => setEntryDate(e.target.value)} />
            </div>
            <div>
              <label>Exit Date & Time</label>
              <input type="datetime-local" required value={exitDate} onChange={e => setExitDate(e.target.value)} />
            </div>
          </div>

          {/* Prices */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Entry Price</label>
              <input type="number" step="0.01" required value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label>Exit Price</label>
              <input type="number" step="0.01" required value={exitPrice} onChange={e => setExitPrice(e.target.value)} placeholder="0.00" />
            </div>
          </div>

          {/* Qty + Fees */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Quantity</label>
              <input type="number" step="any" required value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label>Fees</label>
              <input type="number" step="0.01" value={fees} onChange={e => setFees(e.target.value)} placeholder="0" />
            </div>
          </div>

          {/* Strategy + Emotion */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Strategy</label>
              <select value={strategy} onChange={e => setStrategy(e.target.value)}>
                {playbooks.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                <option value="Other">Other</option>
              </select>
              {strategy === 'Other' && (
                <input 
                  style={{ marginTop: 8 }}
                  value={customStrategy} 
                  onChange={e => setCustomStrategy(e.target.value)} 
                  placeholder="Enter custom strategy..." 
                  required 
                />
              )}
            </div>
            <div>
              <label>Emotion</label>
              <select value={emotion} onChange={e => setEmotion(e.target.value as Emotion)}>
                {EMOTIONS.map(e => <option key={e} value={e}>{e.charAt(0) + e.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
          </div>

          {/* Mistakes */}
          <div>
            <label>Mistakes (select all that apply)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {MISTAKES.map(m => (
                <button key={m} type="button" onClick={() => toggleMistake(m)}
                  style={{
                    padding: '0.3rem 0.65rem', borderRadius: 20, fontSize: '0.7rem',
                    background: mistakes.includes(m) ? 'var(--red-bg)' : 'var(--bg-input)',
                    border: `1px solid ${mistakes.includes(m) ? 'var(--red)' : 'transparent'}`,
                    color: mistakes.includes(m) ? 'var(--red)' : 'var(--text-secondary)',
                  }}>
                  {m.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <input 
              style={{ marginTop: 8 }}
              value={customMistakesInput} 
              onChange={e => setCustomMistakesInput(e.target.value)} 
              placeholder="Other mistakes (comma separated)..." 
            />
          </div>

          {/* Tags + Notes */}
          <div>
            <label>Tags (comma separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="momentum, breakout, earnings" />
          </div>
          <div>
            <label>Notes / Journal</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="What did you do well? What could you improve?"
              style={{ resize: 'vertical', fontSize: '0.85rem' }} />
          </div>

          {/* Save Button - VERY PROMINENT */}
          <button type="submit"
            style={{
              width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)',
              background: 'var(--accent)', color: '#fff', fontSize: '1.05rem',
              fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, marginTop: 8, marginBottom: 8,
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)',
              letterSpacing: '0.3px',
            }}>
            <Save size={20} />
            SAVE JOURNAL
          </button>
        </form>
      </div>
    </div>
  );
}
