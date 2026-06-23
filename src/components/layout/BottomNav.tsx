import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, BarChart3, Settings } from 'lucide-react';

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/profile', icon: Settings, label: 'Profile' },
];

export function BottomNav() {
  return (
    <div className="bottom-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--nav-bg)', borderTop: '1px solid var(--border)',
      display: 'flex', padding: '0.4rem 0 calc(0.4rem + env(safe-area-inset-bottom))',
      margin: '0 auto', zIndex: 100,
    }}>
      {tabs.map(t => (
        <NavLink key={t.to} to={t.to} style={({ isActive }) => ({
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 2, textDecoration: 'none', fontSize: '0.6rem', fontWeight: 500,
          color: isActive ? 'var(--accent)' : 'var(--text-muted)',
        })}>
          <t.icon size={20} />
          <span>{t.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
