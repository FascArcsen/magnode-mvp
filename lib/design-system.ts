/**
 * MagNode Design System
 * Paleta de colores, tipografías y tokens de diseño
 */

export const colors = {
  // Primarios
  primary: {
    DEFAULT: '#FF6A00',
    dark: '#D45500',
  },
  
  // Secundarios
  secondary: {
    DEFAULT: '#1A1A1A',
    light: '#6B6B6B',
  },
  
  // Fondos
  background: {
    white: '#FFFFFF',
    gray: '#F9FAFB',
    dark: '#0A0A0A',
    sidebar: '#111827',
  },
  
  // Estados
  status: {
    success: '#22C55E',
    warning: '#FACC15',
    critical: '#EF4444',
    info: '#3B82F6',
  },
  
  // Borders y separadores
  border: {
    DEFAULT: '#E5E7EB',
    light: '#F3F4F6',
  },
  
  // Texto
  text: {
    primary: '#1A1A1A',
    secondary: '#6B6B6B',
    tertiary: '#9CA3AF',
    white: '#FFFFFF',
  },
} as const;

export const typography = {
  fontFamily: {
    heading: ['Syne', 'sans-serif'],
    body: ['Exo 2', 'sans-serif'],
  },
  
  fontSize: {
    h1: ['32px', { lineHeight: '1.2', fontWeight: '700' }],
    h2: ['24px', { lineHeight: '1.3', fontWeight: '600' }],
    h3: ['16px', { lineHeight: '1.5', fontWeight: '500' }],
    body: ['16px', { lineHeight: '1.6', fontWeight: '400' }],
    bodySmall: ['14px', { lineHeight: '1.6', fontWeight: '400' }],
    small: ['12px', { lineHeight: '1.5', fontWeight: '400' }],
    kpi: ['32px', { lineHeight: '1.2', fontWeight: '700' }],
  },
} as const;

export const layout = {
  spacing: {
    section: '32px',
    card: '20px',
    element: '12px',
  },
  
  borderRadius: {
    DEFAULT: '12px',
    sm: '8px',
    lg: '16px',
    full: '9999px',
  },
  
  shadow: {
    sm: '0px 1px 4px rgba(0, 0, 0, 0.05)',
    DEFAULT: '0px 4px 12px rgba(0, 0, 0, 0.05)',
    md: '0px 6px 16px rgba(0, 0, 0, 0.08)',
    lg: '0px 10px 24px rgba(0, 0, 0, 0.1)',
  },
  
  grid: {
    columns: 12,
    gap: '24px',
    margin: '24px',
  },
} as const;

// Helper functions
export const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
  const statusMap = {
    healthy: colors.status.success,
    warning: colors.status.warning,
    critical: colors.status.critical,
  };
  return statusMap[status];
};

export const getStatusBgColor = (status: 'healthy' | 'warning' | 'critical') => {
  const statusMap = {
    healthy: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
  };
  return statusMap[status];
};

// Export all as single object
export const designSystem = {
  colors,
  typography,
  layout,
  getStatusColor,
  getStatusBgColor,
} as const;