import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from './Card';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
  subtitle?: string;
}

export default function MetricCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  subtitle = 'from yesterday',
}: MetricCardProps) {
  const changeColors = {
    positive: 'text-status-success',
    negative: 'text-status-critical',
    neutral: 'text-text-secondary',
  };
  
  const TrendIcon = changeType === 'positive' ? TrendingUp : changeType === 'negative' ? TrendingDown : null;
  
  return (
    <Card padding="md" shadow="sm">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-exo text-text-secondary uppercase tracking-wide">
            {label}
          </span>
          {icon && <div className="text-text-secondary">{icon}</div>}
        </div>
        
        <div className="flex items-end justify-between">
          <div className="text-kpi font-exo font-bold text-text-primary">
            {value}
          </div>
          
          {change && (
            <div className={`flex items-center gap-1 text-xs font-exo font-semibold ${changeColors[changeType]}`}>
              {TrendIcon && <TrendIcon className="w-3 h-3" />}
              {change}
            </div>
          )}
        </div>
        
        {subtitle && (
          <div className="text-xs font-exo text-text-tertiary">
            {subtitle}
          </div>
        )}
      </div>
    </Card>
  );
}