import React, { useState } from 'react';
import { X, Save, Star } from 'lucide-react';
import { useTrade } from '../../context/TradeContext';
import type { MarketType, InstrumentType, Direction, Emotion, Mistake, Trade, TradeStatus } from '../../types';

interface Props { onClose: () => void; editTrade?: Trade; }

const MARKETS: MarketType[] = ['STOCK', 'CRYPTO', 'FOREX', 'COMMODITY'];
const EMOTIONS: Emotion[] = ['NEUTRAL', 'CONFIDENT', 'DISCIPLINED', 'ANXIOUS', 'FOMO', 'TILTED', 'GREEDY', 'REVENGE', 'SATISFIED'];
const MISTAKES: Mistake[] = ['EARLY_ENTRY', 'LATE_ENTRY', 'EARLY_EXIT', 'LATE_EXIT', 'OVERSIZED', 'NO_SL', 'NO_PLAN', 'FOMO', 'REVENGE', 'OVERTRADE', 'OTHER'];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

export function AddTradeModal({ onClose, editTrade }: Props) {
  const { addTrade, updateTrade, playbooks } = useTrade();
  const isEdit = !!editTrade;

  const [market, setMarket] = useState<MarketType>(editTrade?.marketType || 'STOCK');
  const [instrument, setInstrument] = useState<InstrumentType>(editTrade?.instrumentType || 'EQUITY');
  const [direction, setDirection] = useState<Direction>(editTrade?.direction || 'LONG');
  const [status, setStatus] = useState<TradeStatus>(editTrade?.status || 'CLOSED');
  const [symbol, setSymbol] = useState(editTrade?.symbol || '');
  const [entryDate, setEntryDate] = useState(editTrade ? editTrade.entryDate.slice(0, 16) : new Date().toISOString().slice(0, 16));
  const [exitDate, setExitDate] = useState(editTrade?.exitDate ? editTrade.exitDate.slice(0, 16) : new Date().toISOString().slice(0, 16));
  const [entryPrice, setEntryPrice] = useState(editTrade ? String(editTrade.entryPrice) : '');
  const [exitPrice, setExitPrice] = useState(editTrade?.exitPrice ? String(editTrade.exitPrice) : '');
  const [stopLoss, setStopLoss] = useState(editTrade?.stopLoss ? String(editTrade.stopLoss) : '');
  const [takeProfit, setTakeProfit] = useState(editTrade?.takeProfit ? String(editTrade.takeProfit) : '');
  const [quantity, setQuantity] = useState(editTrade ? String(editTrade.quantity) : '');
  const [fees, setFees] = useState(editTrade ? String(editTrade.fees) : '0');
  const [strategy, setStrategy] = useState(editTrade?.strategy || playbooks[0]?.name || '');
  const [emotion, setEmotion] = useState<Emotion>(editTrade?.emotion || 'NEUTRAL');
  const [mistakes, setMistakes] = useState<Mistake[]>(editTrade?.mistakes || []);
  const [customMistakesInput, setCustomMistakesInput] = useState('');
  const [customStrategy, setCustomStrategy] = useState('');
  const [tags, setTags] = useState(editTrade?.tags.join(', ') || '');
  const [notes, setNotes] = useState(editTrade?.notes || '');
  const [screenshot, setScreenshot] = useState(editTrade?.screenshot || '');
  const [rating, setRating] = useState(editTrade?.rating || 0);

  const toggleMistake = (m: Mistake) => setMistakes(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = Number(entryPrice);
    const exit = Number(exitPrice);
    const qty = Number(quantity);
    const fee = Number(fees);
    const isLong = direction === 'LONG';

    let pnl = 0, pnlPct = 0, dur = '';
    if (status === 'CLOSED' && exit && qty) {
      const diff = isLong ? (exit - entry) : (entry - exit);
      const rawPnl = diff * qty;
      pnl = rawPnl - fee;
      const investment = entry * qty;
      pnlPct = investment > 0 ? (pnl / investment) * 100 : 0;
      const ms = new Date(exitDate).getTime() - new Date(entryDate).getTime();
      const hrs = Math.round(ms / 3600000);
      dur = hrs < 1 ? `${Math.round(ms / 60000)}m` : hrs < 24 ? `${hrs}h` : `${Math.round(hrs / 24)}d`;
    }

    const finalMistakes = [...mistakes];
    if (customMistakesInput.trim()) {
      customMistakesInput.split(',').forEach(m => {
        if (m.trim()) finalMistakes.push(m.trim().toUpperCase().replace(/\s+/g, '_') as Mistake);
      });
    }

    const trade: Trade = {
      id: editTrade?.id || uid(),
      symbol: symbol.toUpperCase(), marketType: market, instrumentType: instrument, direction,
      entryDate: new Date(entryDate).toISOString(),
      exitDate: status === 'CLOSED' ? new Date(exitDate).toISOString() : undefined,
      entryPrice: entry,
      exitPrice: status === 'CLOSED' ? exit : undefined,
      stopLoss: stopLoss ? Number(stopLoss) : undefined,
      takeProfit: takeProfit ? Number(takeProfit) : undefined,
      quantity: qty, fees: fee,
      strategy: strategy === 'Other' && customStrategy.trim() ? customStrategy.trim() : (strategy || 'None'),
      emotion, mistakes: finalMistakes, tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      notes, pnl, pnlPercent: pnlPct, investment: entry * qty, duration: dur, status,
      screenshot: screenshot || undefined,
      rating: rating || undefined,
    };

    if (isEdit) updateTrade(trade);
    else addTrade(trade);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div className="fade-in" style={{ position: 'absolute', inset: 0, background: 'var(--overlay)' }} onClick={onClose} />
      <div className="slide-up" style={{
        width: '100%', maxWidth: 480, maxHeight: '92vh',
        background: 'var(--modal-bg)', borderRadius: '20px 20px 0 0',
        zIndex: 201, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '1.25rem 1.25rem 0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{isEdit ? 'Edit Trade' : 'New Journal Entry'}</h2>
          <button onClick={onClose} style={{ padding: 4, color: 'var(--text-muted)', borderRadius: '50%', background: 'var(--bg-input)', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>Market</label>
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
              {MARKETS.map(m => (
                <button key={m} type="button" onClick={() => setMarket(m)}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 500,
                    background: market === m ? 'var(--bg-card)' : 'transparent', color: market === m ? 'var(--text)' : 'var(--text-secondary)',
                    boxShadow: market === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
                  {m.charAt(0) + m.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div>
              <label>Direction</label>
              <div style={{ display: 'flex', gap: 3, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
                {(['LONG', 'SHORT'] as Direction[]).map(d => (
                  <button key={d} type="button" onClick={() => setDirection(d)}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: 5, fontSize: '0.75rem', fontWeight: 600,
                      background: direction === d ? (d === 'LONG' ? 'var(--green)' : 'var(--red)') : 'transparent',
                      color: direction === d ? '#fff' : 'var(--text-secondary)' }}>
                    {d === 'LONG' ? 'Long' : 'Short'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label>Type</label>
              <div style={{ display: 'flex', gap: 3, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
                {(['EQUITY', 'FNO'] as InstrumentType[]).map(inst => (
                  <button key={inst} type="button" onClick={() => setInstrument(inst)}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: 5, fontSize: '0.75rem', fontWeight: 500,
                      background: instrument === inst ? 'var(--accent)' : 'transparent', color: instrument === inst ? '#fff' : 'var(--text-secondary)' }}>
                    {inst === 'EQUITY' ? 'Eq' : 'F&O'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label>Status</label>
              <div style={{ display: 'flex', gap: 3, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
                {(['OPEN', 'CLOSED'] as TradeStatus[]).map(s => (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: 5, fontSize: '0.75rem', fontWeight: 500,
                      background: status === s ? (s === 'CLOSED' ? 'var(--accent)' : '#f59e0b') : 'transparent',
                      color: status === s ? '#fff' : 'var(--text-secondary)' }}>
                    {s === 'OPEN' ? 'Open' : 'Closed'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label>Symbol / Underlying</label>
            <input required value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="e.g. AAPL, BTC, NIFTY" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Entry Date & Time</label>
              <input type="datetime-local" required value={entryDate} onChange={e => setEntryDate(e.target.value)} />
            </div>
            {status === 'CLOSED' && (
              <div>
                <label>Exit Date & Time</label>
                <input type="datetime-local" required value={exitDate} onChange={e => setExitDate(e.target.value)} />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Entry Price</label>
              <input type="number" step="0.01" required value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="0.00" />
            </div>
            {status === 'CLOSED' && (
              <div>
                <label>Exit Price</label>
                <input type="number" step="0.01" required value={exitPrice} onChange={e => setExitPrice(e.target.value)} placeholder="0.00" />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Stop Loss</label>
              <input type="number" step="0.01" value={stopLoss} onChange={e => setStopLoss(e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label>Take Profit</label>
              <input type="number" step="0.01" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} placeholder="Optional" />
            </div>
          </div>

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Strategy</label>
              <select value={strategy} onChange={e => setStrategy(e.target.value)}>
                {playbooks.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                <option value="Other">Other</option>
              </select>
              {strategy === 'Other' && (
                <input style={{ marginTop: 8 }} value={customStrategy} onChange={e => setCustomStrategy(e.target.value)} placeholder="Custom strategy..." required />
              )}
            </div>
            <div>
              <label>Emotion</label>
              <select value={emotion} onChange={e => setEmotion(e.target.value as Emotion)}>
                {EMOTIONS.map(e => <option key={e} value={e}>{e.charAt(0) + e.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label>Rating</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setRating(rating === n ? 0 : n)}
                  style={{ padding: 4, color: n <= rating ? '#f59e0b' : 'var(--text-muted)' }}>
                  <Star size={22} fill={n <= rating ? '#f59e0b' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label>Mistakes</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {MISTAKES.map(m => (
                <button key={m} type="button" onClick={() => toggleMistake(m)}
                  style={{ padding: '0.3rem 0.65rem', borderRadius: 20, fontSize: '0.7rem',
                    background: mistakes.includes(m) ? 'var(--red-bg)' : 'var(--bg-input)',
                    border: `1px solid ${mistakes.includes(m) ? 'var(--red)' : 'transparent'}`,
                    color: mistakes.includes(m) ? 'var(--red)' : 'var(--text-secondary)' }}>
                  {m.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <input style={{ marginTop: 8 }} value={customMistakesInput} onChange={e => setCustomMistakesInput(e.target.value)} placeholder="Other mistakes (comma separated)..." />
          </div>

          <div>
            <label>Tags (comma separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="momentum, breakout, earnings" />
          </div>

          <div>
            <label>Chart Screenshot</label>
            <input type="file" accept="image/*" onChange={handleScreenshot} style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }} />
            {screenshot && (
              <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
                <img src={screenshot} alt="chart" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                <button type="button" onClick={() => setScreenshot('')} style={{ position: 'absolute', top: -4, right: -4, background: 'var(--red)', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            )}
          </div>

          <div>
            <label>Notes / Journal</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="What did you do well? What could you improve?"
              style={{ resize: 'vertical', fontSize: '0.85rem' }} />
          </div>

          {isEdit && editTrade?.status === 'OPEN' && status === 'CLOSED' && (
            <div style={{ padding: '0.75rem', background: 'var(--accent-bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--accent)' }}>
              Closing this open trade. Fill exit details above.
            </div>
          )}

          <button type="submit"
            style={{
              width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)',
              background: 'var(--accent)', color: '#fff', fontSize: '1.05rem',
              fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, marginTop: 8, marginBottom: 8, boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)',
              letterSpacing: '0.3px',
            }}>
            <Save size={20} />
            {isEdit ? 'UPDATE JOURNAL' : 'SAVE JOURNAL'}
          </button>
        </form>
      </div>
    </div>
  );
}
