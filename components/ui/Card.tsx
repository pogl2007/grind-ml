import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export function Card({ children, hoverable, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`rounded border border-border bg-surface ${hoverable ? 'transition-colors duration-150 ease-out hover:bg-surface-hover hover:border-border-strong' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
