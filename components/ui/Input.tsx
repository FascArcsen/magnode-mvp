import { InputHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  const baseStyles = 'w-full px-4 py-2.5 font-exo text-base bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2';
  
  const stateStyles = error
    ? 'border-status-critical focus:ring-status-critical focus:border-status-critical'
    : 'border-border focus:ring-primary focus:border-primary';
  
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-primary font-exo">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          className={clsx(
            baseStyles,
            stateStyles,
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-status-critical font-exo">{error}</p>
      )}
      
      {hint && !error && (
        <p className="text-xs text-text-tertiary font-exo">{hint}</p>
      )}
    </div>
  );
}