/**
 * ThemeManager - 主题管理器
 * 支持三大 UI 框架主题：Ant Design Vue、Element Plus、NaiveUI
 */
import type { ThemeConfig, ThemePreset } from '../types'
import { antDesignTheme, antDesignDarkTheme } from '../theme/presets/ant-design'
import {
  elementPlusTheme,
  elementPlusDarkTheme
} from '../theme/presets/element-plus'
import { naiveTheme, naiveDarkTheme } from '../theme/presets/naive'

// ============================================================================
// 主题预设映射
// ============================================================================

const THEME_PRESETS: Record<ThemePreset, ThemeConfig> = {
  'ant-design': antDesignTheme,
  'ant-design-dark': antDesignDarkTheme,
  'element-plus': elementPlusTheme,
  'element-plus-dark': elementPlusDarkTheme,
  naive: naiveTheme,
  'naive-dark': naiveDarkTheme
}

// ============================================================================
// 默认主题（兼容旧代码）
// ============================================================================

export const DEFAULT_THEME: ThemeConfig = antDesignTheme
export const DARK_THEME: ThemeConfig = antDesignDarkTheme

// ============================================================================
// ThemeManager 类
// ============================================================================

export class ThemeManager {
  private currentTheme: ThemeConfig = DEFAULT_THEME
  private currentPreset: ThemePreset | null = null
  private listeners: Set<(theme: ThemeConfig) => void> = new Set()

  constructor(initialTheme?: ThemeConfig | ThemePreset) {
    if (typeof initialTheme === 'string') {
      this.setThemeByName(initialTheme)
    } else {
      this.currentTheme = initialTheme || DEFAULT_THEME
      this.applyTheme(this.currentTheme)
    }
  }

  /**
   * 获取当前主题
   */
  getTheme(): ThemeConfig {
    return this.currentTheme
  }

  /**
   * 设置主题（支持主题预设或自定义主题）
   */
  setTheme(theme: ThemeConfig | ThemePreset) {
    if (typeof theme === 'string') {
      this.setThemeByName(theme)
    } else {
      this.currentTheme = theme
      this.currentPreset = null
      this.applyTheme(theme)
      this.notifyListeners(theme)
    }
  }

  /**
   * 通过预设名称设置主题
   */
  setThemeByName(name: ThemePreset) {
    const theme = THEME_PRESETS[name]
    if (theme) {
      this.currentTheme = theme
      this.currentPreset = name
      this.applyTheme(theme)
      this.notifyListeners(theme)
    } else {
      console.warn(`[ThemeManager] Unknown theme preset: ${name}`)
    }
  }

  /**
   * 获取当前预设名称
   */
  getCurrentPreset(): ThemePreset | null {
    return this.currentPreset
  }

  /**
   * 应用主题到 DOM（设置 CSS 变量）
   */
  private applyTheme(theme: ThemeConfig) {
    const root = document.documentElement

    // 设置颜色变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--ctable-color-${key}`, value)
    })

    // 设置字体变量
    Object.entries(theme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--ctable-font-${key}-size`, value.size)
      root.style.setProperty(`--ctable-font-${key}-weight`, value.weight)
    })

    // 设置间距变量
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--ctable-spacing-${key}`, String(value))
    })
  }

  /**
   * 监听主题变化
   */
  onChange(callback: (theme: ThemeConfig) => void): () => void {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(theme: ThemeConfig) {
    this.listeners.forEach(callback => callback(theme))
  }

  /**
   * 获取所有可用的主题预设名称
   */
  static getAvailablePresets(): ThemePreset[] {
    return Object.keys(THEME_PRESETS) as ThemePreset[]
  }

  /**
   * 检查主题预设是否存在
   */
  static hasPreset(name: string): name is ThemePreset {
    return name in THEME_PRESETS
  }
}

// ============================================================================
// Vue 3 Composable
// ============================================================================

export function useThemeManager(initialTheme?: ThemeConfig | ThemePreset) {
  const themeManager = new ThemeManager(initialTheme)

  return {
    themeManager,
    setTheme: (theme: ThemeConfig | ThemePreset) =>
      themeManager.setTheme(theme),
    setThemeByName: (name: ThemePreset) => themeManager.setThemeByName(name),
    getTheme: () => themeManager.getTheme(),
    getCurrentPreset: () => themeManager.getCurrentPreset(),
    onChange: (callback: (theme: ThemeConfig) => void) =>
      themeManager.onChange(callback)
  }
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 获取主题预设
 */
export function getThemePreset(name: ThemePreset): ThemeConfig | undefined {
  return THEME_PRESETS[name]
}

/**
 * 检查是否为暗黑主题
 */
export function isDarkTheme(name: ThemePreset): boolean {
  return name.endsWith('-dark')
}

/**
 * 切换明暗主题
 */
export function toggleTheme(currentPreset: ThemePreset): ThemePreset {
  if (isDarkTheme(currentPreset)) {
    return currentPreset.replace('-dark', '') as ThemePreset
  } else {
    return `${currentPreset}-dark` as ThemePreset
  }
}
