import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';
import { useTradeContext } from '../../context/TradeContext';
import type { MarketType, InstrumentType, Direction, Emotion, MistakeType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MARKETS: MarketType[] = ['STOCK', 'CRYPTO', 'FOREX', 'COMMODITY'];
const INSTRUMENTS: { label: string; value: InstrumentType }[] = [
  { label: 'Equity', value: 'EQUITY' },
  { label: 'F&O', value: 'FNO' },
];
const EMOTIONS: Emotion[] = ['NEUTRAL', 'CONFIDENT', 'DISCIPLINED', 'ANXIOUS', 'FOMO', 'TILTED', 'GREEDY', 'REVENGE', 'SATISFIED'];
const MISTAKES: MistakeType[] = ['EARLY_ENTRY', 'LATE_ENTRY', 'EARLY_EXIT', 'LATE_EXIT', 'OVERSIZED', 'NO_STOPLOSS', 'NO_PLAN', 'FOMO', 'REVENGE', 'OVERTRADED', 'OTHER'];

export function AddTradeModal({ isOpen, onClose }: Props) {
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
  const [strategy, setStrategy] = useState(playbooks.length > 0 ? playbooks[0].name : '');
  const [emotion, setEmotion] = useState<Emotion>('NEUTRAL');
  const [selectedMistakes, setSelectedMistakes] = useState<MistakeType[]>([]);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMarket('STOCK'); setInstrument('EQUITY'); setDirection('LONG');
      setSymbol(''); setEntryDate(new Date().toISOString().slice(0, 16));
      setExitDate(new Date().toISOString().slice(0, 16));
      setEntryPrice(''); setExitPrice(''); setQuantity(''); setFees('0');
      setStrategy(playbooks.length > 0 ? playbooks[0].name : '');
      setEmotion('NEUTRAL'); setSelectedMistakes([]); setNotes(''); setTags('');
    }
  }, [isOpen, playbooks]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTrade({
      symbol: symbol.toUpperCase(), marketType: market, instrumentType: instrument,
      direction, entryDate: new Date(entryDate).toISOString(),
      exitDate: new Date(exitDate).toISOString(),
      entryPrice: Number(entryPrice), exitPrice: Number(exitPrice),
      quantity: Number(quantity), fees: Number(fees),
      strategy: strategy || 'None', emotion,
      mistakes: selectedMistakes, tags: tags.split(',').map(t => t.trim()).filter(Boolean), notes,
      status: 'CLOSED',
    });
    onClose();
  };

  const toggleMistake = (m: MistakeType) => {
    setSelectedMistakes(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div className="fade-in" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />

      <div className="slide-up" style={{
        width: '100%', maxWidth: '480px', maxHeight: '93vh',
        background: '#fff', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        zIndex: 201, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          padding: '1.25rem 1.25rem 0.75rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700' }}>New Journal</h2>
          <button onClick={onClose} style={{ padding: '0.3rem', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
          <form id="journal-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div className="form-group">
              <label className="form-label">Market</label>
              <div className="segmented">
                {MARKETS.map(m => (
                  <button key={m} type="button"
                    className={market === m ? 'active' : ''}
                    onClick={() => setMarket(m)}
                  >{m.charAt(0) + m.slice(1).toLowerCase()}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Instrument Type</label>
                <div className="segmented">
                  {INSTRUMENTS.map(inst => (
                    <button key={inst.value} type="button"
                      className={instrument === inst.value ? 'active' : ''}
                      onClick={() => setInstrument(inst.value)}
                    >{inst.label}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Direction</label>
                <div className="segmented">
                  <button type="button"
                    className={`green ${direction === 'LONG' ? 'active' : ''}`}
                    onClick={() => setDirection('LONG')}
                  >Long</button>
                  <button type="button"
                    className={`red ${direction === 'SHORT' ? 'active' : ''}`}
                    onClick={() => setDirection('SHORT')}
                  >Short</button>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Entry Date & Time</label>
                <input type="datetime-local" required value={entryDate}
                  onChange={e => setEntryDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Exit Date & Time</label>
                <input type="datetime-local" required value={exitDate}
                  onChange={e => setExitDate(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Underlying / Symbol</label>
              <input required value={symbol} onChange={e => setSymbol(e.target.value)}
                placeholder="Search asset..." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Buy Price</label>
                <input type="number" step="0.00001" required value={entryPrice}
                  onChange={e => setEntryPrice(e.target.value)} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Qty.</label>
                <input type="number" step="any" required value={quantity}
                  onChange={e => setQuantity(e.target.value)} placeholder="0" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Sell Price</label>
                <input type="number" step="0.00001" required value={exitPrice}
                  onChange={e => setExitPrice(e.target.value)} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Fees</label>
                <input type="number" step="0.01" value={fees}
                  onChange={e => setFees(e.target.value)} placeholder="0" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Strategy</label>
                <select value={strategy} onChange={e => setStrategy(e.target.value)}>
                  {playbooks.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Emotion</label>
                <select value={emotion} onChange={e => setEmotion(e.target.value as Emotion)}>
                  {EMOTIONS.map(e => <option key={e} value={e}>{e.charAt(0) + e.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mistakes (tap)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {MISTAKES.map(m => (
                  <button key={m} type="button" onClick={() => toggleMistake(m)}
                    style={{
                      padding: '0.3rem 0.65rem', borderRadius: '20px', fontSize: '0.7rem',
                      background: selectedMistakes.includes(m) ? 'var(--accent-red-bg)' : 'var(--bg-input)',
                      border: `1px solid ${selectedMistakes.includes(m) ? 'var(--accent-red)' : 'var(--border)'}`,
                      color: selectedMistakes.includes(m) ? 'var(--accent-red)' : 'var(--text-secondary)',
                    }}>
                    {m.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="momentum, breakout" />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                rows={3} placeholder="Entry reason, exit thoughts, lessons..."
                style={{ resize: 'vertical', fontSize: '0.85rem' }} />
            </div>
          </form>
        </div>

        <div style={{
          padding: '0.75rem 1.25rem 1.25rem',
          borderTop: '1px solid var(--border)',
        }}>
          <button type="submit" form="journal-form"
            style={{
              width: '100%', padding: '0.9rem', borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-blue)', color: '#fff',
              fontSize: '1rem', fontWeight: '600',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}>
            Save Journal
          </button>
        </div>
      </div>
    </div>
  );
}
