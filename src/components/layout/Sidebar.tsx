import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LineChart, BrainCircuit, Calendar, ListChecks } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Trade Log', path: '/log', icon: BookOpen },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Analytics', path: '/analytics', icon: LineChart },
  { name: 'Playbooks', path: '/playbooks', icon: ListChecks },
  { name: 'Psychology', path: '/psychology', icon: BrainCircuit },
];

export function Sidebar() {
  return (
    <aside className="desktop-sidebar" style={{
      width: '260px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '3rem',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--accent-primary), #60a5fa)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '1.2rem',
        }}>
          T
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.5px' }}>TradeLog Pro</h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--border-radius-sm)',
              textDecoration: 'none',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
              transition: 'all 0.2s',
              fontWeight: isActive ? '500' : '400',
            })}
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
         <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--border-radius-sm)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Pro Plan Active</p>
            <div style={{ height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
               <div style={{ width: '100%', height: '100%', background: 'var(--accent-primary)' }}></div>
            </div>
         </div>
      </div>
    </aside>
  );
}
