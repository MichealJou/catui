import type { ThemeConfig } from '../types'

export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    primary: '#1677ff',
    secondary: '#52c41a',
    background: '#ffffff',
    header: '#fafafa',
    border: '#f0f0f0',
    text: 'rgba(0, 0, 0, 0.88)',
    hover: '#fafafa',
    selected: '#e6f7ff',
    footer: '#fafafa',
    // 斑马纹颜色（隔行变色）
    stripe: '#fafafa',
    // 固定列阴影
    fixedShadow: 'rgba(0, 0, 0, 0.06)'
  },
  fonts: {
    header: { size: '14px', weight: '500' },
    cell: { size: '14px', weight: '400' },
    footer: { size: '12px', weight: '400' }
  },
  spacing: {
    header: 39,
    cell: 39,
    border: 1,
    padding: 16
  }
}

export const DARK_THEME: ThemeConfig = {
  colors: {
    primary: '#1677ff',
    secondary: '#49aa19',
    background: '#141414',
    header: '#1f1f1f',
    border: '#303030',
    text: 'rgba(255, 255, 255, 0.85)',
    hover: '#262626',
    selected: '#11263c',
    footer: '#1f1f1f',
    stripe: '#1f1f1f',
    fixedShadow: 'rgba(255, 255, 255, 0.1)'
  },
  fonts: {
    header: { size: '14px', weight: '500' },
    cell: { size: '14px', weight: '400' },
    footer: { size: '12px', weight: '400' }
  },
  spacing: {
    header: 39,
    cell: 39,
    border: 1,
    padding: 16
  }
}

export class ThemeManager {
  private currentTheme: ThemeConfig
  private listeners: Set<(theme: ThemeConfig) => void> = new Set()

  constructor(initialTheme: ThemeConfig = DEFAULT_THEME) {
    this.currentTheme = initialTheme
    this.applyTheme(initialTheme)
  }

  getTheme(): ThemeConfig {
    return this.currentTheme
  }

  setTheme(theme: ThemeConfig) {
    this.currentTheme = theme
    this.applyTheme(theme)
    this.listeners.forEach(callback => callback(theme))
  }

  setThemeByName(name: 'default' | 'dark') {
    const theme = name === 'dark' ? DARK_THEME : DEFAULT_THEME
    this.setTheme(theme)
  }

  private applyTheme(theme: ThemeConfig) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--canvas-color-${key}`, value)
    })
  }

  onChange(callback: (theme: ThemeConfig) => void) {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }
}

export function useThemeManager(initialTheme?: 'default' | 'dark') {
  const themeManager = new ThemeManager(
    initialTheme === 'dark' ? DARK_THEME : DEFAULT_THEME
  )

  return {
    themeManager,
    setTheme: (name: 'default' | 'dark') => themeManager.setThemeByName(name),
    getTheme: () => themeManager.getTheme()
  }
}
