export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface ThemeConfig {
  name: string;
  colors: ThemeColors;
  radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  fontFamily: 'sans' | 'serif' | 'mono';
  isDark: boolean;
}

const DEFAULT_LIGHT_COLORS: ThemeColors = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  background: '#ffffff',
  foreground: '#000000',
  border: '#e5e7eb',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#06b6d4',
};

const DEFAULT_DARK_COLORS: ThemeColors = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  background: '#000000',
  foreground: '#ffffff',
  border: '#27272a',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#06b6d4',
};

const PRESET_THEMES: Record<string, ThemeConfig> = {
  light: {
    name: 'Light',
    colors: DEFAULT_LIGHT_COLORS,
    radius: 'md',
    fontFamily: 'sans',
    isDark: false,
  },
  dark: {
    name: 'Dark',
    colors: DEFAULT_DARK_COLORS,
    radius: 'md',
    fontFamily: 'sans',
    isDark: true,
  },
  nord: {
    name: 'Nord',
    colors: {
      primary: '#88c0d0',
      secondary: '#81a1c1',
      accent: '#bf616a',
      background: '#2e3440',
      foreground: '#eceff4',
      border: '#3b4252',
      error: '#bf616a',
      warning: '#ebcb8b',
      success: '#a3be8c',
      info: '#81a1c1',
    },
    radius: 'md',
    fontFamily: 'sans',
    isDark: true,
  },
  dracula: {
    name: 'Dracula',
    colors: {
      primary: '#bd93f9',
      secondary: '#8be9fd',
      accent: '#ff79c6',
      background: '#282a36',
      foreground: '#f8f8f2',
      border: '#44475a',
      error: '#ff5555',
      warning: '#ffb86c',
      success: '#50fa7b',
      info: '#8be9fd',
    },
    radius: 'md',
    fontFamily: 'sans',
    isDark: true,
  },
  solarized: {
    name: 'Solarized',
    colors: {
      primary: '#268bd2',
      secondary: '#2aa198',
      accent: '#dc322f',
      background: '#fdf6e3',
      foreground: '#657b83',
      border: '#eee8d5',
      error: '#dc322f',
      warning: '#b58900',
      success: '#859900',
      info: '#268bd2',
    },
    radius: 'md',
    fontFamily: 'sans',
    isDark: false,
  },
};

export class ThemeService {
  private currentTheme: ThemeConfig;
  private listeners: Set<(theme: ThemeConfig) => void> = new Set();

  constructor(initialTheme: string = 'dark') {
    this.currentTheme = PRESET_THEMES[initialTheme] || PRESET_THEMES.dark;
  }

  getCurrentTheme(): ThemeConfig {
    return this.currentTheme;
  }

  setTheme(name: string): void {
    const theme = PRESET_THEMES[name];
    if (theme) {
      this.currentTheme = theme;
      this.notifyListeners();
    }
  }

  updateThemeColors(colors: Partial<ThemeColors>): void {
    this.currentTheme = {
      ...this.currentTheme,
      colors: { ...this.currentTheme.colors, ...colors },
    };
    this.notifyListeners();
  }

  updateThemeConfig(config: Partial<Omit<ThemeConfig, 'colors'>>): void {
    this.currentTheme = {
      ...this.currentTheme,
      ...config,
    };
    this.notifyListeners();
  }

  getAvailableThemes(): string[] {
    return Object.keys(PRESET_THEMES);
  }

  getThemePresets(): ThemeConfig[] {
    return Object.values(PRESET_THEMES);
  }

  getThemeCSS(): string {
    const { colors, radius, fontFamily } = this.currentTheme;
    const radiusValues: Record<string, string> = {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px',
    };

    const fontFamilies: Record<string, string> = {
      sans: 'system-ui, -apple-system, sans-serif',
      serif: 'ui-serif, Georgia, serif',
      mono: 'ui-monospace, "Courier New", monospace',
    };

    return `
      :root {
        --primary: ${colors.primary};
        --secondary: ${colors.secondary};
        --accent: ${colors.accent};
        --background: ${colors.background};
        --foreground: ${colors.foreground};
        --border: ${colors.border};
        --error: ${colors.error};
        --warning: ${colors.warning};
        --success: ${colors.success};
        --info: ${colors.info};
        --radius: ${radiusValues[radius]};
        --font-family: ${fontFamilies[fontFamily]};
      }

      * {
        border-color: var(--border);
      }

      body {
        background-color: var(--background);
        color: var(--foreground);
        font-family: var(--font-family);
      }

      a {
        color: var(--primary);
      }

      button {
        background-color: var(--primary);
        color: var(--background);
        border-radius: var(--radius);
      }

      input, textarea, select {
        border-color: var(--border);
        border-radius: var(--radius);
        background-color: var(--background);
        color: var(--foreground);
      }
    `;
  }

  subscribe(callback: (theme: ThemeConfig) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.currentTheme));
  }

  exportTheme(): ThemeConfig {
    return JSON.parse(JSON.stringify(this.currentTheme));
  }

  importTheme(config: ThemeConfig): void {
    this.currentTheme = config;
    this.notifyListeners();
  }
}

export const createThemeService = (initialTheme?: string): ThemeService => {
  return new ThemeService(initialTheme);
};
