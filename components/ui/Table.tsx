import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={clsx('w-full bg-white rounded-lg', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={clsx('bg-border-light border-b-2 border-border', className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: TableBodyProps) {
  return (
    <tbody className={clsx('divide-y divide-border', className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr
      className={clsx(
        'transition-colors',
        onClick && 'cursor-pointer hover:bg-background-gray',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className, align = 'left' }: TableHeadProps) {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  
  return (
    <th className={clsx('px-6 py-3 text-xs font-exo font-semibold text-text-secondary uppercase tracking-wider', alignments[align], className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, align = 'left' }: TableCellProps) {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  
  return (
    <td className={clsx('px-6 py-4 text-sm font-exo text-text-primary', alignments[align], className)}>
      {children}
    </td>
  );
}