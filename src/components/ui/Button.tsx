import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  icon,
  className = '',
  ...props 
}: ButtonProps) {
  
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: '500',
    borderRadius: 'var(--border-radius-sm)',
    transition: 'all 0.2s',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--accent-primary)',
      color: '#fff',
      border: '1px solid transparent',
    },
    secondary: {
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
    },
    danger: {
      backgroundColor: 'var(--accent-loss)',
      color: '#fff',
      border: '1px solid transparent',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
    }
  };

  const sizes = {
    sm: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.25rem', fontSize: '0.95rem' },
    lg: { padding: '1rem 1.5rem', fontSize: '1.05rem' },
  };

  // Hover states via style tag (simple approach for vanilla css)
  const hoverClass = `btn-hover-${variant}`;
  
  return (
    <>
      <style>
        {`
          .${hoverClass}:hover:not(:disabled) {
            transform: translateY(-1px);
            opacity: 0.9;
            ${variant === 'ghost' ? 'color: var(--text-primary); background: var(--bg-hover);' : ''}
          }
          .${hoverClass}:active:not(:disabled) {
            transform: translateY(0);
          }
          .${hoverClass}:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}
      </style>
      <button 
        className={`${hoverClass} ${className}`}
        style={{ ...baseStyles, ...variants[variant], ...sizes[size] }}
        {...props}
      >
        {icon && <span style={{ display: 'flex' }}>{icon}</span>}
        {children}
      </button>
    </>
  );
}
