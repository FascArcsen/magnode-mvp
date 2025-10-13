import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export default function Card({
  children,
  className,
  padding = 'md',
  shadow = 'md',
  hover = false,
}: CardProps) {
  const baseStyles = 'bg-white rounded-lg border border-border';
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-card',
    lg: 'p-6',
  };
  
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
  };
  
  const hoverStyles = hover ? 'hover:shadow-lg hover:border-border-light transition-all cursor-pointer' : '';
  
  return (
    <div className={clsx(baseStyles, paddings[padding], shadows[shadow], hoverStyles, className)}>
      {children}
    </div>
  );
}