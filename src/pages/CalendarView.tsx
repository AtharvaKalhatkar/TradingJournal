import React, { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { useTradeContext } from '../context/TradeContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import type { Trade } from '../types';

export function CalendarView() {
  const { trades, formatMoney } = useTradeContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayTrades, setSelectedDayTrades] = useState<{date: Date, trades: Trade[]} | null>(null);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Generate calendar grid including empty leading/trailing days
  const calendarGrid = useMemo(() => {
    const startOffset = getDay(daysInMonth[0]);
    const emptyStart = Array.from({ length: startOffset }, () => null);
    
    let maxProfit = 0;
    let maxLoss = 0;

    const daysWithData = daysInMonth.map(day => {
      const dayTrades = trades.filter(t => isSameDay(new Date(t.exitDate), day));
      const netPnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
      
      if (netPnl > maxProfit) maxProfit = netPnl;
      if (netPnl < maxLoss) maxLoss = netPnl;

      return { date: day, pnl: netPnl, trades: dayTrades, count: dayTrades.length };
    });

    return { grid: [...emptyStart, ...daysWithData], maxProfit, maxLoss };
  }, [daysInMonth, trades]);

  const { grid, maxProfit, maxLoss } = calendarGrid;

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const totalMonthPnl = grid.filter(d => d).reduce((sum, d) => sum + (d?.pnl || 0), 0);

  // Calculate dynamic background color based on PnL
  const getBackgroundColor = (pnl: number) => {
    if (pnl === 0) return 'var(--bg-secondary)';
    
    if (pnl > 0) {
      // Scale from 0.1 to 0.8 opacity based on maxProfit
      const intensity = Math.max(0.1, Math.min(0.8, pnl / (maxProfit || 1)));
      return `rgba(0, 255, 136, ${intensity})`; // Green
    } else {
      // Scale from 0.1 to 0.8 opacity based on maxLoss
      const intensity = Math.max(0.1, Math.min(0.8, pnl / (maxLoss || -1)));
      return `rgba(255, 51, 102, ${intensity})`; // Red
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Calendar</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={prevMonth} style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'white' }}><ChevronLeft size={20}/></button>
            <button onClick={nextMonth} style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'white' }}><ChevronRight size={20}/></button>
          </div>
          <h2 style={{ fontSize: '1.2rem', minWidth: '150px', textAlign: 'right' }}>{format(currentDate, 'MMMM yyyy')}</h2>
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Net PnL (Month)</p>
            <h2 style={{ fontSize: '1.5rem', color: totalMonthPnl >= 0 ? 'var(--accent-win)' : 'var(--accent-loss)' }}>
              {totalMonthPnl > 0 ? '+' : ''}{formatMoney(totalMonthPnl)}
            </h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.85rem' }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', minHeight: '500px' }}>
          {grid.map((day, i) => {
            const hasTrades = day && day.count > 0;
            return (
              <div 
                key={i} 
                onClick={() => { if(hasTrades) setSelectedDayTrades({ date: day.date, trades: day.trades }) }}
                style={{ 
                  backgroundColor: day ? (hasTrades ? getBackgroundColor(day.pnl) : 'var(--bg-secondary)') : 'transparent',
                  border: day ? '1px solid var(--border-color)' : 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '80px',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: hasTrades ? 'pointer' : 'default',
                  transition: 'transform 0.1s, filter 0.1s',
                  ...(hasTrades ? { ':hover': { filter: 'brightness(1.2)', transform: 'scale(1.02)' } } : {})
                }}
                onMouseEnter={(e) => { if(hasTrades) { e.currentTarget.style.filter = 'brightness(1.2)'; e.currentTarget.style.transform = 'scale(1.02)'; } }}
                onMouseLeave={(e) => { if(hasTrades) { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none'; } }}
              >
                {day && (
                  <>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      color: hasTrades ? '#fff' : 'var(--text-secondary)',
                      fontWeight: hasTrades ? '600' : '400',
                      textShadow: hasTrades ? '0px 1px 3px rgba(0,0,0,0.8)' : 'none'
                    }}>{format(day.date, 'd')}</span>
                    
                    {hasTrades && (
                      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }}>
                        <span style={{ 
                          fontSize: '1rem', 
                          fontWeight: '700', 
                          color: '#fff' 
                        }}>
                          {day.pnl > 0 ? '+' : ''}{formatMoney(day.pnl)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>{day.count} Trades</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Day Trades Modal */}
      {selectedDayTrades && (
        <div 
          onClick={() => setSelectedDayTrades(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div 
            className="glass fade-in" 
            onClick={(e) => e.stopPropagation()}
            style={{ width: '800px', maxWidth: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', borderRadius: 'var(--border-radius-md)' }}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.4rem' }}>Trades for {format(selectedDayTrades.date, 'MMMM d, yyyy')}</h2>
              <Button variant="ghost" icon={<X size={20} />} onClick={() => setSelectedDayTrades(null)} style={{ padding: '0.5rem' }} />
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Symbol</th>
                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Type</th>
                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Setup</th>
                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDayTrades.trades.map(trade => (
                    <tr key={trade.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>
                        {trade.symbol}
                        {trade.chartUrl && (
                          <a href={trade.chartUrl} target="_blank" rel="noreferrer" style={{ marginLeft: '0.5rem', color: 'var(--accent-primary)' }}>
                            <ExternalLink size={12} style={{ display: 'inline' }} />
                          </a>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600', backgroundColor: trade.type === 'LONG' ? 'var(--accent-win-bg)' : 'var(--accent-loss-bg)', color: trade.type === 'LONG' ? 'var(--accent-win)' : 'var(--accent-loss)' }}>
                          {trade.type}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>{trade.setup}</td>
                      <td style={{ padding: '1rem', fontWeight: '600', color: trade.pnl >= 0 ? 'var(--accent-win)' : 'var(--accent-loss)' }}>
                        {trade.pnl > 0 ? '+' : ''}{formatMoney(trade.pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--bg-primary)', borderBottomLeftRadius: 'var(--border-radius-md)', borderBottomRightRadius: 'var(--border-radius-md)' }}>
              <Button variant="secondary" onClick={() => setSelectedDayTrades(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
