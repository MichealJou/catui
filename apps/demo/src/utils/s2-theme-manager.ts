import type { ThemeCfg } from '@antv/s2'
import type { ThemeConfig } from './types'

export const DEFAULT_THEMES: Record<string, ThemeConfig> = {
  default: {
    colors: {
      primary: '#1890ff',
      secondary: '#52c41a',
      background: '#ffffff',
      header: '#f5f5f5',
      border: '#e0e0e0',
      text: '#333333',
      hover: '#f0f0f0',
      selected: '#e6f7ff',
      footer: '#fafafa'
    },
    fonts: {
      header: { size: '14px', weight: 'bold' },
      cell: { size: '14px', weight: 'normal' },
      footer: { size: '12px', weight: 'normal' }
    },
    spacing: {
      header: 40,
      cell: 32,
      border: 1,
      padding: 8
    }
  },
  dark: {
    colors: {
      primary: '#1890ff',
      secondary: '#52c41a',
      background: '#1f1f1f',
      header: '#2d2d2d',
      border: '#404040',
      text: '#ffffff',
      hover: '#404040',
      selected: '#003a8c',
      footer: '#2d2d2d'
    },
    fonts: {
      header: { size: '14px', weight: 'bold' },
      cell: { size: '14px', weight: 'normal' },
      footer: { size: '12px', weight: 'normal' }
    },
    spacing: {
      header: 40,
      cell: 32,
      border: 1,
      padding: 8
    }
  },
  gray: {
    colors: {
      primary: '#595959',
      secondary: '#8c8c8c',
      background: '#f8f9fa',
      header: '#e9ecef',
      border: '#dee2e6',
      text: '#495057',
      hover: '#e9ecef',
      selected: '#cce5ff',
      footer: '#f8f9fa'
    },
    fonts: {
      header: { size: '14px', weight: 'bold' },
      cell: { size: '14px', weight: 'normal' },
      footer: { size: '12px', weight: 'normal' }
    },
    spacing: {
      header: 40,
      cell: 32,
      border: 1,
      padding: 8
    }
  }
}

export class S2ThemeManager {
  private themes: Record<string, ThemeConfig>
  private currentTheme: string
  private s2ThemeCache: Map<string, ThemeCfg>
  
  constructor() {
    this.themes = { ...DEFAULT_THEMES }
    this.currentTheme = 'default'
    this.s2ThemeCache = new Map()
  }
  
  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeConfig {
    return this.themes[this.currentTheme]
  }
  
  /**
   * 设置主题
   */
  setTheme(themeName: string): void {
    if (this.themes[themeName]) {
      this.currentTheme = themeName
      this.s2ThemeCache.clear()
    }
  }
  
  /**
   * 添加自定义主题
   */
  addTheme(themeName: string, themeConfig: ThemeConfig): void {
    this.themes[themeName] = themeConfig
    this.s2ThemeCache.delete(themeName)
  }
  
  /**
   * 获取所有主题
   */
  getThemes(): Record<string, ThemeConfig> {
    return { ...this.themes }
  }
  
  /**
   * 转换为 S2 主题配置
   */
  toS2Theme(): ThemeCfg {
    const theme = this.getCurrentTheme()
    const colors = theme.colors
    
    return {
      // 基础样式
      background: colors.background,
      borderColor: colors.border,
      textColor: colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      
      // 表头样式
      headerBackground: colors.header,
      headerBorderColor: colors.border,
      headerTextColor: colors.text,
      headerFontWeight: 'bold',
      
      // 单元格样式
      cellBackground: colors.background,
      cellBorderColor: colors.border,
      cellTextColor: colors.text,
      cellHoverBackground: colors.hover,
      cellSelectedBackground: colors.selected,
      
      // 行样式
      rowBackground: colors.background,
      rowHoverBackground: colors.hover,
      rowSelectedBackground: colors.selected,
      
      // 列样式
      colBackground: colors.header,
      colBorderColor: colors.border,
      colHoverBackground: colors.hover,
      colSelectedBackground: colors.selected,
      
      // 交互样式
      interaction: {
        hoverHighlight: true,
        selectedCellHighlight: true,
        hoverFocus: true,
        rangeSelection: true
      },
      
      // 工具提示
      tooltip: {
        background: colors.header,
        borderColor: colors.border,
        textColor: colors.text,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      },
      
      // 滚动条
      scrollbar: {
        background: colors.hover,
        thumbBackground: colors.border,
        thumbHoverBackground: colors.text,
        thumbBorderRadius: '4px',
        thumbMinSize: 20
      },
      
      // 分页
      pagination: {
        background: colors.header,
        borderColor: colors.border,
        textColor: colors.text,
        selectedTextColor: colors.background,
        selectedBackground: colors.primary
      }
    }
  }
  
  /**
   * 获取字体样式
   */
  getFontStyles(type: 'header' | 'cell' | 'footer'): { fontSize: string, fontWeight: string } {
    const theme = this.getCurrentTheme()
    const font = theme.fonts[type]
    
    return {
      fontSize: font.size,
      fontWeight: font.weight
    }
  }
  
  /**
   * 获取间距配置
   */
  getSpacing(type: 'header' | 'cell' | 'border' | 'padding'): number {
    const theme = this.getCurrentTheme()
    return theme.spacing[type]
  }
  
  /**
   * 自定义主题配置
   */
  customizeTheme(customizations: Partial<ThemeConfig>): void {
    const theme = this.getCurrentTheme()
    this.themes[this.currentTheme] = {
      ...theme,
      ...customizations
    }
    this.s2ThemeCache.delete(this.currentTheme)
  }
  
  /**
   * 重置主题
   */
  resetTheme(themeName?: string): void {
    if (themeName && DEFAULT_THEMES[themeName]) {
      this.themes[themeName] = { ...DEFAULT_THEMES[themeName] }
      this.s2ThemeCache.delete(themeName)
    } else {
      // 重置所有主题
      Object.keys(DEFAULT_THEMES).forEach(key => {
        this.themes[key] = { ...DEFAULT_THEMES[key] }
      })
      this.s2ThemeCache.clear()
    }
  }
  
  /**
   * 导出主题配置
   */
  exportTheme(themeName?: string): string {
    const theme = themeName ? this.themes[themeName] : this.getCurrentTheme()
    return JSON.stringify(theme, null, 2)
  }
  
  /**
   * 导入主题配置
   */
  importTheme(themeConfig: string, themeName?: string): void {
    try {
      const theme = JSON.parse(themeConfig)
      const name = themeName || `custom-${Date.now()}`
      this.addTheme(name, theme)
    } catch (error) {
      console.error('Failed to import theme:', error)
      throw new Error('Invalid theme configuration')
    }
  }
  
  /**
   * 删除主题
   */
  deleteTheme(themeName: string): void {
    if (this.themes[themeName] && !DEFAULT_THEMES[themeName]) {
      delete this.themes[themeName]
      this.s2ThemeCache.delete(themeName)
      
      // 如果删除的是当前主题，切换到默认主题
      if (this.currentTheme === themeName) {
        this.currentTheme = 'default'
      }
    }
  }
}