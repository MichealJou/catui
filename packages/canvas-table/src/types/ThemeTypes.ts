/**
 * 主题相关类型定义
 */

/**
 * 主题颜色配置
 */
export interface ThemeColors {
  /** 主色 */
  primary: string
  /** 辅助色 */
  secondary: string
  /** 背景色 */
  background: string
  /** 表头背景色 */
  header: string
  /** 边框色 */
  border: string
  /** 文字颜色 */
  text: string
  /** 悬停颜色 */
  hover: string
  /** 选中颜色 */
  selected: string
  /** 表尾背景色 */
  footer: string
}

/**
 * 主题字体配置
 */
export interface ThemeFonts {
  /** 表头字体 */
  header: { size: string; weight: string }
  /** 单元格字体 */
  cell: { size: string; weight: string }
  /** 表尾字体 */
  footer: { size: string; weight: string }
}

/**
 * 主题间距配置
 */
export interface ThemeSpacing {
  /** 表头高度 */
  header: number
  /** 单元格高度 */
  cell: number
  /** 边框宽度 */
  border: number
  /** 内边距 */
  padding: number
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 颜色配置 */
  colors: ThemeColors
  /** 字体配置 */
  fonts: ThemeFonts
  /** 间距配置 */
  spacing: ThemeSpacing
}

/**
 * 主题名称
 */
export type ThemeName = 'default' | 'dark' | 'gray'
