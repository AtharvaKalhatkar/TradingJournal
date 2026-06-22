import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Plus, Bell, Settings } from 'lucide-react';
import { useTradeContext } from '../../context/TradeContext';
import { AddTradeModal } from '../trades/AddTradeModal';

export function Topbar() {
  const { accountBalance, baseCurrency, setBaseCurrency, formatMoney } = useTradeContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header style={{
        height: '70px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        backgroundColor: 'var(--bg-primary)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div>
          <h2 className="hide-on-mobile" style={{ fontSize: '1.25rem', fontWeight: '600' }}>Welcome back, Trader! 👋</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select 
            value={baseCurrency} 
            onChange={(e) => setBaseCurrency(e.target.value)}
            style={{ 
              padding: '0.5rem', 
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="USD">USD $</option>
            <option value="INR">INR ₹</option>
            <option value="EUR">EUR €</option>
            <option value="GBP">GBP £</option>
          </select>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            backgroundColor: 'var(--bg-secondary)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--border-radius-sm)',
            border: '1px solid var(--border-color)'
          }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Balance:</span>
            <span style={{ fontWeight: '600', color: 'var(--accent-win)' }}>{formatMoney(accountBalance)}</span>
          </div>

          <Button icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>Add Trade</Button>

          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
            <Button variant="ghost" size="sm" icon={<Bell size={20} />} style={{ padding: '0.5rem' }} />
            <Button variant="ghost" size="sm" icon={<Settings size={20} />} style={{ padding: '0.5rem' }} />
          </div>
        </div>
      </header>

      <AddTradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
