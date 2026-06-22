import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({ variant = 'primary', size = 'md', children, icon, fullWidth, style, ...props }: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.4rem', fontWeight: '600', borderRadius: 'var(--radius-sm)',
    transition: 'all 0.15s', fontFamily: 'inherit',
    width: fullWidth ? '100%' : undefined,
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--accent-blue)', color: '#fff', padding: '0.85rem 1.5rem', fontSize: '0.95rem' },
    secondary: { background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '0.6rem 1rem', fontSize: '0.85rem' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)', padding: '0.4rem 0.6rem', fontSize: '0.85rem' },
  };

  return (
    <button style={{ ...base, ...variants[variant], ...style } as React.CSSProperties} {...props}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
