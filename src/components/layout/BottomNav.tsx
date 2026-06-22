import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, BarChart2, User } from 'lucide-react';

export function BottomNav() {
  const navItems = [
    { to: '/', icon: <Home size={20} />, label: 'Home' },
    { to: '/log', icon: <BookOpen size={20} />, label: 'Journal' },
    { to: '/calendar', icon: <BarChart2 size={20} />, label: 'Analytics' },
    { to: '/playbooks', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <nav className="mobile-bottom-nav" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0.75rem 0',
      zIndex: 100,
      paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))'
    }}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none',
            color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
            transition: 'color 0.2s',
            flex: 1
          })}
        >
          {item.icon}
          <span style={{ fontSize: '0.7rem', fontWeight: '500' }}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
