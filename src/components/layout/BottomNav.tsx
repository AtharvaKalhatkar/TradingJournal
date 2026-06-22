import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, BarChart3, User } from 'lucide-react';

const items = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff',
      borderTop: '1px solid var(--border)',
      display: 'flex', justifyContent: 'space-around',
      padding: '0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))',
      zIndex: 100,
      maxWidth: '480px', margin: '0 auto',
    }}>
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '2px', textDecoration: 'none', flex: 1,
            color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
            fontSize: '0.6rem', fontWeight: isActive ? '600' : '400',
            transition: 'color 0.15s',
          })}
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
