// 테마 정의
export const THEMES = {
  DEFAULT: 'default',
  OCEAN: 'ocean',
  SUNSET: 'sunset'
};

export const themeConfig = {
  [THEMES.DEFAULT]: {
    name: 'Purple Dream',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#4caf50',
    cardBg: 'white',
    textPrimary: '#333',
    textSecondary: '#666'
  },
  [THEMES.OCEAN]: {
    name: 'Ocean Breeze',
    gradient: 'linear-gradient(135deg, #0083B0 0%, #00B4DB 100%)',
    primary: '#0083B0',
    secondary: '#00B4DB',
    accent: '#00D9FF',
    cardBg: 'white',
    textPrimary: '#1a1a2e',
    textSecondary: '#16213e'
  },
  [THEMES.SUNSET]: {
    name: 'Warm Sunset',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    primary: '#f093fb',
    secondary: '#f5576c',
    accent: '#ff6b6b',
    cardBg: 'white',
    textPrimary: '#2d3436',
    textSecondary: '#636e72'
  }
};

// 테마를 CSS 변수로 적용
export const applyTheme = (themeName) => {
  const theme = themeConfig[themeName];
  if (!theme) return;

  const root = document.documentElement;
  root.style.setProperty('--gradient-bg', theme.gradient);
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--card-bg', theme.cardBg);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
};
