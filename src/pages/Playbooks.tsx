import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTradeContext } from '../context/TradeContext';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

export function Playbooks() {
  const { playbooks, addPlaybook, deletePlaybook } = useTradeContext();
  const [isAdding, setIsAdding] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState([{ id: '1', text: '' }]);

  const handleAddRule = () => setRules([...rules, { id: crypto.randomUUID(), text: '' }]);
  const handleRuleChange = (id: string, text: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, text } : r));
  };
  const handleRemoveRule = (id: string) => setRules(rules.filter(r => r.id !== id));

  const handleSavePlaybook = (e: React.FormEvent) => {
    e.preventDefault();
    const validRules = rules.filter(r => r.text.trim() !== '');
    if (!name.trim() || validRules.length === 0) return;

    addPlaybook({
      name,
      description,
      rules: validRules
    });

    setIsAdding(false);
    setName('');
    setDescription('');
    setRules([{ id: '1', text: '' }]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Playbooks & Setups</h1>
        {!isAdding && <Button icon={<Plus size={18} />} onClick={() => setIsAdding(true)}>New Playbook</Button>}
      </div>

      {isAdding && (
        <Card className="slide-in-right">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Create New Playbook</h3>
          <form onSubmit={handleSavePlaybook} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Setup Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mean Reversion" />
            </div>
            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="What is the logic behind this setup?" />
            </div>
            
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Pre-Trade Checklist Rules</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {rules.map((rule, idx) => (
                  <div key={rule.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ width: '24px', color: 'var(--text-muted)' }}>{idx + 1}.</div>
                    <input 
                      required 
                      value={rule.text} 
                      onChange={e => handleRuleChange(rule.id, e.target.value)} 
                      placeholder="e.g. Price is above 200 EMA" 
                    />
                    <Button type="button" variant="ghost" size="sm" icon={<Trash2 size={16} />} onClick={() => handleRemoveRule(rule.id)} style={{ color: 'var(--accent-loss)', padding: '0.5rem' }} />
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" icon={<Plus size={16} />} onClick={handleAddRule} style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                  Add Rule
                </Button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Playbook</Button>
            </div>
          </form>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {playbooks.map(playbook => (
          <Card key={playbook.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>{playbook.name}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{playbook.description || 'No description provided.'}</p>
              </div>
              <Button variant="ghost" size="sm" icon={<Trash2 size={18}/>} onClick={() => deletePlaybook(playbook.id)} style={{ color: 'var(--accent-loss)', padding: '0.5rem' }} />
            </div>
            
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Checklist Requirements</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {playbook.rules.map(rule => (
                  <li key={rule.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.95rem' }}>
                    <CheckCircle2 size={16} color="var(--accent-win)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-primary)' }}>{rule.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
