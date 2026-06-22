import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className = '', noPadding = false, ...props }: CardProps) {
  return (
    <div 
      className={`glass ${noPadding ? '' : 'p-6'} rounded-2xl ${className}`}
      style={{
        padding: noPadding ? '0' : '1.5rem',
        borderRadius: 'var(--border-radius-md)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
