export type ThemeColorId =
  | 'amber'
  | 'emerald'
  | 'blue'
  | 'rose'
  | 'purple'
  | 'orange'
  | 'teal'
  | 'zinc';

export interface ThemeConfig {
  id: ThemeColorId;
  name: string;
  tagline: string;
  category: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryBorder: string;
  primaryText: string; // text on top of primary button
  ringColor: string;
  previewGradient: string;
}

export const THEMES: Record<ThemeColorId, ThemeConfig> = {
  amber: {
    id: 'amber',
    name: 'Ámbar Gourmet',
    tagline: 'Cervecería, Grill & Hamburguesas',
    category: 'Clásico & Cálido',
    primary: '#f59e0b',
    primaryHover: '#d97706',
    primaryLight: '#fef3c7',
    primaryBorder: '#fcd34d',
    primaryText: '#171717',
    ringColor: '#fbbf24',
    previewGradient: 'from-amber-400 to-amber-600',
  },
  emerald: {
    id: 'emerald',
    name: 'Esmeralda Bistro',
    tagline: 'Saludable, Cafetería & Cocina Fresca',
    category: 'Fresco & Orgánico',
    primary: '#10b981',
    primaryHover: '#059669',
    primaryLight: '#d1fae5',
    primaryBorder: '#6ee7b7',
    primaryText: '#ffffff',
    ringColor: '#34d399',
    previewGradient: 'from-emerald-400 to-emerald-600',
  },
  blue: {
    id: 'blue',
    name: 'Azul Océano',
    tagline: 'Marisquerías, Pizzerías & Lounge',
    category: 'Moderno & Confiable',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryLight: '#dbeafe',
    primaryBorder: '#93c5fd',
    primaryText: '#ffffff',
    ringColor: '#60a5fa',
    previewGradient: 'from-blue-500 to-blue-700',
  },
  rose: {
    id: 'rose',
    name: 'Borgoña & Carnes',
    tagline: 'Steakhouse, Vinos & Asador Premium',
    category: 'Elegante & Pasional',
    primary: '#e11d48',
    primaryHover: '#be123c',
    primaryLight: '#ffe4e6',
    primaryBorder: '#fda4af',
    primaryText: '#ffffff',
    ringColor: '#fb7185',
    previewGradient: 'from-rose-500 to-rose-700',
  },
  purple: {
    id: 'purple',
    name: 'Púrpura Gastrobar',
    tagline: 'Coctelería de Autor, Tapas & Sushi',
    category: 'Nocturno & Exclusivo',
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    primaryLight: '#ede9fe',
    primaryBorder: '#c4b5fd',
    primaryText: '#ffffff',
    ringColor: '#a78bfa',
    previewGradient: 'from-purple-500 to-purple-700',
  },
  orange: {
    id: 'orange',
    name: 'Naranja Brasa',
    tagline: 'Taquerías, Tex-Mex & Pollos en Brasas',
    category: 'Apetitoso & Dinámico',
    primary: '#ea580c',
    primaryHover: '#c2410c',
    primaryLight: '#ffedd5',
    primaryBorder: '#fdba74',
    primaryText: '#ffffff',
    ringColor: '#fb923c',
    previewGradient: 'from-orange-500 to-amber-600',
  },
  teal: {
    id: 'teal',
    name: 'Turquesa Caribe',
    tagline: 'Brunch, Pastelería, Helados & Tragos',
    category: 'Costero & Luminoso',
    primary: '#0d9488',
    primaryHover: '#0f766e',
    primaryLight: '#ccfbf1',
    primaryBorder: '#5eead4',
    primaryText: '#ffffff',
    ringColor: '#2dd4bf',
    previewGradient: 'from-teal-400 to-teal-600',
  },
  zinc: {
    id: 'zinc',
    name: 'Grafito Minimalista',
    tagline: 'Alta Cocina, Fusión & Autor',
    category: 'Sobrio & Vanguardista',
    primary: '#27272a',
    primaryHover: '#18181b',
    primaryLight: '#f4f4f5',
    primaryBorder: '#d4d4d8',
    primaryText: '#ffffff',
    ringColor: '#71717a',
    previewGradient: 'from-neutral-700 to-neutral-900',
  },
};

export const THEME_LIST = Object.values(THEMES);

/**
 * Applies CSS custom properties to the document root to update theme globally
 */
export function applyTheme(themeId: ThemeColorId | string) {
  const theme = THEMES[themeId as ThemeColorId] || THEMES.amber;
  const root = document.documentElement;

  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-primary-hover', theme.primaryHover);
  root.style.setProperty('--theme-primary-light', theme.primaryLight);
  root.style.setProperty('--theme-primary-border', theme.primaryBorder);
  root.style.setProperty('--theme-primary-text', theme.primaryText);
  root.style.setProperty('--theme-ring', theme.ringColor);

  // Set attribute for arbitrary css targeting
  root.setAttribute('data-theme', theme.id);
  localStorage.setItem('resto_theme_color', theme.id);
}

/**
 * Retrieves the currently saved theme ID
 */
export function getSavedThemeId(): ThemeColorId {
  const saved = localStorage.getItem('resto_theme_color');
  if (saved && saved in THEMES) {
    return saved as ThemeColorId;
  }
  return 'amber';
}
