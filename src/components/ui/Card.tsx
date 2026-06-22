import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function Card({ children, noPadding = false, style, ...props }: CardProps) {
  return (
    <div className="card" style={{ padding: noPadding ? '0' : '1rem', ...style } as React.CSSProperties} {...props}>
      {children}
    </div>
  );
}
