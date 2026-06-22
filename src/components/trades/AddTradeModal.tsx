import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { X, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { useTradeContext } from '../../context/TradeContext';
import type { AssetClass, TradeType, Emotion, Playbook } from '../../types';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTradeModal({ isOpen, onClose }: AddTradeModalProps) {
  const { addTrade, playbooks } = useTradeContext();
  
  const [formData, setFormData] = useState({
    symbol: '',
    assetClass: 'STOCKS' as AssetClass,
    type: 'LONG' as TradeType,
    entryDate: new Date().toISOString().slice(0, 16),
    exitDate: new Date().toISOString().slice(0, 16),
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    multiplier: '1',
    fees: '0',
    setup: '',
    emotion: 'NEUTRAL' as Emotion,
    notes: '',
    chartUrl: '',
  });

  const [checklistMap, setChecklistMap] = useState<Record<string, boolean>>({});

  const selectedPlaybook = playbooks.find(p => p.name === formData.setup);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        symbol: '',
        assetClass: 'STOCKS',
        type: 'LONG',
        entryDate: new Date().toISOString().slice(0, 16),
        exitDate: new Date().toISOString().slice(0, 16),
        entryPrice: '',
        exitPrice: '',
        quantity: '',
        multiplier: '1',
        fees: '0',
        setup: playbooks.length > 0 ? playbooks[0].name : '',
        emotion: 'NEUTRAL',
        notes: '',
        chartUrl: '',
      });
      setChecklistMap({});
    }
  }, [isOpen, playbooks]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTrade({
      symbol: formData.symbol.toUpperCase(),
      assetClass: formData.assetClass,
      type: formData.type,
      entryDate: new Date(formData.entryDate).toISOString(),
      exitDate: new Date(formData.exitDate).toISOString(),
      entryPrice: Number(formData.entryPrice),
      exitPrice: Number(formData.exitPrice),
      quantity: Number(formData.quantity),
      multiplier: Number(formData.multiplier) || 1,
      fees: Number(formData.fees),
      setup: formData.setup || 'None',
      emotion: formData.emotion,
      notes: formData.notes,
      chartUrl: formData.chartUrl,
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'setup') {
      setChecklistMap({});
    }

    if (name === 'assetClass') {
      if (value === 'OPTIONS') {
        setFormData(prev => ({ ...prev, multiplier: '100' }));
      } else {
        setFormData(prev => ({ ...prev, multiplier: '1' }));
      }
    }
  };

  const toggleChecklist = (ruleId: string) => {
    setChecklistMap(prev => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      <div 
        className="fade-in"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 101 }}
        onClick={onClose}
      />

      <div 
        className="glass-panel slide-in-right"
        style={{ width: '500px', maxWidth: '100%', height: '100%', zIndex: 102, display: 'flex', flexDirection: 'column', position: 'relative' }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-primary)' }}>
          <h2 style={{ fontSize: '1.4rem' }}>Log New Trade</h2>
          <Button variant="ghost" icon={<X size={20} />} onClick={onClose} style={{ padding: '0.5rem' }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <form id="add-trade-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Symbol</label>
                <input required name="symbol" value={formData.symbol} onChange={handleChange} placeholder="e.g. AAPL" />
              </div>
              <div className="form-group">
                <label className="form-label">Asset Class</label>
                <select name="assetClass" value={formData.assetClass} onChange={handleChange}>
                  <option value="STOCKS">Stocks</option>
                  <option value="CRYPTO">Crypto</option>
                  <option value="FOREX">Forex</option>
                  <option value="OPTIONS">Options</option>
                  <option value="FUTURES">Futures</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Trade Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="LONG">Long</option>
                  <option value="SHORT">Short</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Playbook / Setup</label>
                <select name="setup" value={formData.setup} onChange={handleChange}>
                  {playbooks.length === 0 && <option value="">None</option>}
                  {playbooks.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  <option value="Other">Other / Custom</option>
                </select>
              </div>
            </div>

            {selectedPlaybook && selectedPlaybook.rules.length > 0 && (
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block', color: 'var(--accent-primary)' }}>Pre-Trade Checklist</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedPlaybook.rules.map(rule => (
                    <label key={rule.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={!!checklistMap[rule.id]} 
                        onChange={() => toggleChecklist(rule.id)}
                        style={{ width: 'auto', marginTop: '0.2rem' }}
                      />
                      <span style={{ color: checklistMap[rule.id] ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: checklistMap[rule.id] ? 'line-through' : 'none' }}>
                        {rule.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Entry Date</label>
                <input type="datetime-local" required name="entryDate" value={formData.entryDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Exit Date</label>
                <input type="datetime-local" required name="exitDate" value={formData.exitDate} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Entry Price</label>
                <input type="number" step="0.00001" required name="entryPrice" value={formData.entryPrice} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Exit Price</label>
                <input type="number" step="0.00001" required name="exitPrice" value={formData.exitPrice} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input type="number" step="0.00001" required name="quantity" value={formData.quantity} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Multiplier</label>
                <input type="number" step="0.01" required name="multiplier" value={formData.multiplier} onChange={handleChange} title="Use 100 for Options, Lot size for Forex" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Fees & Comms</label>
                <input type="number" step="0.01" required name="fees" value={formData.fees} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Emotional State</label>
                <select name="emotion" value={formData.emotion} onChange={handleChange}>
                  <option value="NEUTRAL">Neutral</option>
                  <option value="CONFIDENT">Confident</option>
                  <option value="DISCIPLINED">Disciplined</option>
                  <option value="ANXIOUS">Anxious</option>
                  <option value="FOMO">FOMO</option>
                  <option value="TILTED">Tilted / Revenge</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon size={14} /> Chart Link (Optional)
              </label>
              <input type="url" name="chartUrl" value={formData.chartUrl} onChange={handleChange} placeholder="https://www.tradingview.com/x/..." />
            </div>

            <div className="form-group">
              <label className="form-label">Journal Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} placeholder="What did you do well? What could you improve?" style={{ resize: 'vertical' }} />
            </div>
          </form>
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: 'var(--bg-primary)' }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" form="add-trade-form">Save Trade</Button>
        </div>

      </div>
    </div>
  );
}
