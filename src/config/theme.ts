/**
 * Theme colors based on R Pralas logo
 * Primary: Teal/Turquoise (#1DB5B1, #17A2A2)
 * Secondary: Soft White (#F5F5F5)
 * Accent: Gold/Amber for highlights
 */

export const pralosTheme = {
  colors: {
    primary: '#1DB5B1', // Teal principal
    primaryLight: '#2ECCC9', // Teal claro
    primaryDark: '#17A2A2', // Teal escuro
    
    secondary: '#F5F5F5', // Branco suave
    secondaryDark: '#E8E8E8', // Cinza claro
    
    accent: '#FFD700', // Ouro
    accentLight: '#FFF44F', // Ouro claro
    accentDark: '#FFC700', // Ouro escuro
    
    white: '#FFFFFF',
    black: '#1A1A1A',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  gradients: {
    primary: 'from-teal-500 to-teal-600',
    primaryHover: 'from-teal-600 to-teal-700',
    primaryLight: 'from-teal-400 to-teal-500',
    
    accent: 'from-yellow-500 to-yellow-600',
    accentHover: 'from-yellow-600 to-yellow-700',
    
    dark: 'from-slate-800 to-slate-900',
    darkHover: 'from-slate-900 to-slate-950',
  },
  
  tailwind: {
    primary: 'teal',
    primaryValue: 'teal-500',
    primaryHover: 'hover:from-teal-600',
  },
};

export default pralosTheme;
