import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTradeContext } from '../context/TradeContext';
import { formatPercent } from '../utils/calculations';
import { format } from 'date-fns';
import { Trash2, ExternalLink, FilterX } from 'lucide-react';

export function TradeLog() {
  const { trades, deleteTrade, playbooks, formatMoney } = useTradeContext();
  
  const [filterAsset, setFilterAsset] = useState('ALL');
  const [filterSetup, setFilterSetup] = useState('ALL');
  
  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      const matchAsset = filterAsset === 'ALL' || t.assetClass === filterAsset;
      const matchSetup = filterSetup === 'ALL' || t.setup === filterSetup;
      return matchAsset && matchSetup;
    });
  }, [trades, filterAsset, filterSetup]);

  const clearFilters = () => {
    setFilterAsset('ALL');
    setFilterSetup('ALL');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Trade Log</h1>
        <Button>Export CSV</Button>
      </div>

      <Card style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '150px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Asset Class</label>
          <select value={filterAsset} onChange={e => setFilterAsset(e.target.value)} style={{ padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)' }}>
            <option value="ALL">All Assets</option>
            <option value="STOCKS">Stocks</option>
            <option value="CRYPTO">Crypto</option>
            <option value="FOREX">Forex</option>
            <option value="OPTIONS">Options</option>
            <option value="FUTURES">Futures</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '150px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Setup / Playbook</label>
          <select value={filterSetup} onChange={e => setFilterSetup(e.target.value)} style={{ padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)' }}>
            <option value="ALL">All Setups</option>
            {playbooks.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            <option value="Other">Other</option>
            <option value="None">None</option>
          </select>
        </div>

        {(filterAsset !== 'ALL' || filterSetup !== 'ALL') && (
          <div style={{ marginTop: '1.2rem' }}>
            <Button variant="ghost" icon={<FilterX size={16}/>} onClick={clearFilters} style={{ color: 'var(--accent-loss)' }}>
              Clear
            </Button>
          </div>
        )}
      </Card>

      <Card noPadding>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Symbol</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Type</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Entry/Exit</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Setup</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>PnL</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>%</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No trades match the current filters.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => (
                  <tr key={trade.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{format(new Date(trade.entryDate), 'MMM dd, HH:mm')}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          to {format(new Date(trade.exitDate), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>
                      {trade.symbol}
                      {trade.chartUrl && (
                        <a href={trade.chartUrl} target="_blank" rel="noreferrer" style={{ marginLeft: '0.5rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                          <ExternalLink size={12} style={{ display: 'inline' }} />
                        </a>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        backgroundColor: trade.type === 'LONG' ? 'var(--accent-win-bg)' : 'var(--accent-loss-bg)',
                        color: trade.type === 'LONG' ? 'var(--accent-win)' : 'var(--accent-loss)'
                      }}>
                        {trade.type}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{formatMoney(trade.entryPrice)}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{formatMoney(trade.exitPrice)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {trade.setup}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '600', color: trade.pnl >= 0 ? 'var(--accent-win)' : 'var(--accent-loss)' }}>
                      {trade.pnl > 0 ? '+' : ''}{formatMoney(trade.pnl)}
                    </td>
                    <td style={{ padding: '1rem', color: trade.pnlPercent >= 0 ? 'var(--accent-win)' : 'var(--accent-loss)' }}>
                      {trade.pnlPercent > 0 ? '+' : ''}{formatPercent(trade.pnlPercent)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={<Trash2 size={16} />} 
                          style={{ padding: '0.25rem', color: 'var(--accent-loss)' }} 
                          onClick={() => deleteTrade(trade.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
