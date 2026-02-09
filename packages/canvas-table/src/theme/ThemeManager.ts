import type { ThemeConfig } from '../types'
import { DEFAULT_THEME } from './presets/default'
import { DARK_THEME } from './presets/dark'

/**
 * 主题管理器
 * 负责管理表格主题，支持主题切换和主题变更监听
 */
export class ThemeManager {
  private currentTheme: ThemeConfig
  private listeners: Set<(theme: ThemeConfig) => void> = new Set()

  constructor(initialTheme: ThemeConfig = DEFAULT_THEME) {
    this.currentTheme = initialTheme
    this.applyTheme(initialTheme)
  }

  /**
   * 获取当前主题
   */
  getTheme(): ThemeConfig {
    return this.currentTheme
  }

  /**
   * 设置主题
   */
  setTheme(theme: ThemeConfig) {
    this.currentTheme = theme
    this.applyTheme(theme)
    this.listeners.forEach(callback => callback(theme))
  }

  /**
   * 按名称设置主题
   */
  setThemeByName(name: 'default' | 'dark' | 'gray') {
    const theme = name === 'dark' ? DARK_THEME : DEFAULT_THEME
    this.setTheme(theme)
  }

  /**
   * 应用主题到 DOM
   */
  private applyTheme(theme: ThemeConfig) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--canvas-color-${key}`, value)
    })

    // 应用字体
    Object.entries(theme.fonts).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--canvas-font-${key}-size`, value.size)
      document.documentElement.style.setProperty(`--canvas-font-${key}-weight`, value.weight)
    })

    // 应用间距
    Object.entries(theme.spacing).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--canvas-spacing-${key}`, `${value}px`)
    })
  }

  /**
   * 监听主题变更
   * @returns 取消监听的函数
   */
  onChange(callback: (theme: ThemeConfig) => void): () => void {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * 销毁主题管理器
   */
  destroy() {
    this.listeners.clear()
  }
}

/**
 * Vue 3 Composition API 风格的主题 Hook
 */
export function useThemeManager(initialTheme?: 'default' | 'dark' | 'gray') {
  const themeManager = new ThemeManager(
    initialTheme === 'dark' ? DARK_THEME : DEFAULT_THEME
  )

  return {
    themeManager,
    setTheme: (name: 'default' | 'dark' | 'gray') => themeManager.setThemeByName(name),
    getTheme: () => themeManager.getTheme(),
    onChange: (callback: (theme: ThemeConfig) => void) => themeManager.onChange(callback)
  }
}
