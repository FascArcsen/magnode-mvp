import { clsx } from 'clsx';

interface StatusIndicatorProps {
  status: 'healthy' | 'warning' | 'critical';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showDot?: boolean;
}

export default function StatusIndicator({
  status,
  size = 'md',
  showLabel = true,
  showDot = true,
}: StatusIndicatorProps) {
  const statusConfig = {
    healthy: {
      label: 'Saludable',
      emoji: '🟢',
      color: 'text-status-success',
      bg: 'bg-green-50',
      border: 'border-green-200',
      dotColor: 'bg-status-success',
    },
    warning: {
      label: 'Advertencia',
      emoji: '🟡',
      color: 'text-status-warning',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      dotColor: 'bg-status-warning',
    },
    critical: {
      label: 'Crítico',
      emoji: '🔴',
      color: 'text-status-critical',
      bg: 'bg-red-50',
      border: 'border-red-200',
      dotColor: 'bg-status-critical',
    },
  };
  
  const config = statusConfig[status];
  
  const sizes = {
    sm: {
      container: 'px-2 py-0.5 text-xs',
      dot: 'w-1.5 h-1.5',
    },
    md: {
      container: 'px-2.5 py-1 text-sm',
      dot: 'w-2 h-2',
    },
    lg: {
      container: 'px-3 py-1.5 text-base',
      dot: 'w-2.5 h-2.5',
    },
  };
  
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-exo font-semibold rounded-lg border',
        config.color,
        config.bg,
        config.border,
        sizes[size].container
      )}
    >
      {showDot && (
        <span className={clsx('rounded-full', config.dotColor, sizes[size].dot)} />
      )}
      {showLabel && <span className="capitalize">{config.label}</span>}
    </span>
  );
}