/**
 * 主题系统扩展类型定义
 * 用于支持完整的 UI/UX 设计规范
 */

import type { ThemeConfig } from '../types'

// ============================================================================
// 颜色系统扩展
// ============================================================================

/**
 * 完整的颜色系统
 */
export interface ExtendedThemeColors {
  // === 主色系 ===
  primary: string           // 主色
  primaryHover: string      // 主色悬停
  primaryActive: string     // 主色激活
  primaryBg: string         // 主色背景（浅色）

  // === 辅助色 ===
  secondary: string         // 辅助色
  secondaryHover: string    // 辅助色悬停
  secondaryActive: string   // 辅助色激活

  // === 功能色 ===
  success: string           // 成功色
  warning: string           // 警告色
  error: string             // 错误色
  info: string              // 信息色

  // === 中性色 ===
  background: string        // 背景色
  header: string            // 表头背景
  border: string            // 边框色
  borderLight: string       // 浅边框
  borderDark: string        // 深边框（hover 状态）

  // === 文字色 ===
  text: string              // 主要文字
  textSecondary: string     // 次要文字
  textTertiary: string      // 辅助文字
  textDisabled: string      // 禁用文字

  // === 交互状态 ===
  hover: string             // 悬停背景色
  selected: string          // 选中背景色
  selectedHover: string     // 选中悬停背景色
  selectedBorder: string    // 选中边框色

  // === 其他 ===
  footer: string            // 表尾背景
  stripe: string            // 斑马纹颜色
  stripeOdd: string         // 奇数行背景
  stripeEven: string        // 偶数行背景

  // === 固定列 ===
  fixedShadow: string       // 固定列阴影
  fixedDivider: string      // 固定列分隔线
}

// ============================================================================
// 字体系统扩展
// ============================================================================

/**
 * 字体配置
 */
export interface FontConfig {
  size: string              // 字号（如 '14px'）
  weight: string            // 字重（如 '400', '600'）
  lineHeight: string        // 行高（如 '22px'）
}

/**
 * 完整的字体系统
 */
export interface ExtendedThemeFonts {
  header: FontConfig        // 表头字体
  cell: FontConfig          // 单元格字体
  footer: FontConfig        // 表尾字体
  small: FontConfig         // 小号文字
  large: FontConfig         // 大号文字
}

/**
 * 字体栈
 */
export interface FontStack {
  system: string            // 系统字体栈
  mono: string              // 等宽字体
  number: string            // 数字字体
}

// ============================================================================
// 间距系统扩展
// ============================================================================

/**
 * Size 变体
 */
export interface SizeVariant {
  header: number            // 表头高度
  cell: number              // 单元格高度
  padding: number           // 内边距
}

/**
 * 边框样式
 */
export interface BorderStyle {
  width: number             // 边框宽度
  style: 'solid' | 'dashed' | 'none' // 边框样式
}

/**
 * 完整的间距系统
 */
export interface ExtendedThemeSpacing {
  header: number            // 表头高度
  cell: number              // 单元格高度
  border: number            // 边框宽度
  padding: number           // 内边距
  minWidth: number          // 列最小宽度

  // Size 变体
  large: SizeVariant        // 大号尺寸
  default: SizeVariant      // 默认尺寸
  small: SizeVariant        // 小号尺寸
}

// ============================================================================
// 交互状态
// ============================================================================

/**
 * 交互状态类型
 */
export type InteractionState =
  | 'default'
  | 'hover'
  | 'selected'
  | 'disabled'
  | 'focus'

/**
 * 交互状态样式
 */
export interface InteractionStateStyles {
  background: string
  border: {
    color: string
    width: number
  }
  text: string
  cursor: string
  opacity?: number
  outline?: {
    color: string
    width: number
    offset: number
    style: string
  }
}

/**
 * 所有交互状态的样式映射
 */
export interface InteractionStates {
  default: InteractionStateStyles
  hover: InteractionStateStyles
  selected: InteractionStateStyles
  disabled: InteractionStateStyles
  focus: InteractionStateStyles
}

// ============================================================================
// 固定列视觉规范
// ============================================================================

/**
 * 阴影方向
 */
export type ShadowDirection = 'left' | 'right'

/**
 * 固定列阴影配置
 */
export interface FixedShadowConfig {
  direction: ShadowDirection
  width: number
  color: string
  scrollColor: string       // 滚动时的阴影颜色
}

/**
 * 固定列分隔线配置
 */
export interface FixedDividerConfig {
  color: string
  width: number
  style: 'solid' | 'dashed'
  position: 'left' | 'right'
}

/**
 * 固定列视觉规范
 */
export interface FixedColumnVisual {
  shadow: FixedShadowConfig
  divider: FixedDividerConfig
  zIndex: number
}

// ============================================================================
// 动画与过渡
// ============================================================================

/**
 * 过渡配置
 */
export interface TransitionConfig {
  property: string | string[]
  duration: number          // 毫秒
  timing: string            // 缓动函数
  delay?: number            // 延迟（毫秒）
}

/**
 * 所有动画配置
 */
export interface AnimationConfig {
  hover: TransitionConfig
  selected: TransitionConfig
  theme: TransitionConfig
  expand: TransitionConfig
  sort: TransitionConfig
}

/**
 * 缓动函数类型
 */
export type EasingFunction =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier'

// ============================================================================
// 扩展的主题配置
// ============================================================================

/**
 * 完整的主题配置（扩展版）
 */
export interface ExtendedThemeConfig {
  colors: ExtendedThemeColors
  fonts: ExtendedThemeFonts
  fontStack: FontStack
  spacing: ExtendedThemeSpacing
  states: InteractionStates
  fixedColumn: FixedColumnVisual
  animations: AnimationConfig
  borderStyles: {
    solid: BorderStyle
    dashed: BorderStyle
    none: BorderStyle
  }
}

/**
 * 从扩展主题转换为标准主题
 */
export function toStandardTheme(extended: ExtendedThemeConfig): ThemeConfig {
  return {
    colors: {
      primary: extended.colors.primary,
      secondary: extended.colors.secondary,
      background: extended.colors.background,
      header: extended.colors.header,
      border: extended.colors.border,
      text: extended.colors.text,
      hover: extended.colors.hover,
      selected: extended.colors.selected,
      footer: extended.colors.footer,
      stripe: extended.colors.stripe,
      fixedShadow: extended.colors.fixedShadow,
    },
    fonts: {
      header: {
        size: extended.fonts.header.size,
        weight: extended.fonts.header.weight,
      },
      cell: {
        size: extended.fonts.cell.size,
        weight: extended.fonts.cell.weight,
      },
      footer: {
        size: extended.fonts.footer.size,
        weight: extended.fonts.footer.weight,
      },
    },
    spacing: {
      header: extended.spacing.header,
      cell: extended.spacing.cell,
      border: extended.spacing.border,
      padding: extended.spacing.padding,
    },
  }
}

// ============================================================================
// Canvas 渲染相关类型
// ============================================================================

/**
 * Canvas 渐变配置
 */
export interface CanvasGradient {
  type: 'linear' | 'radial'
  direction: ShadowDirection
  stops: Array<{ offset: number; color: string }>
}

/**
 * 阴影渲染参数
 */
export interface ShadowRenderParams {
  x: number
  y: number
  width: number
  height: number
  isDark: boolean
  isScrolling: boolean
}

/**
 * hover 动画状态
 */
export interface HoverAnimation {
  targetCell: {
    x: number
    y: number
    width: number
    height: number
  }
  currentOpacity: number
  targetOpacity: number
  startTime: number
  duration: number
}

/**
 * 主题过渡动画状态
 */
export interface ThemeTransition {
  oldTheme: ExtendedThemeConfig
  newTheme: ExtendedThemeConfig
  startTime: number
  duration: number
  onProgress?: (progress: number, interpolated: ExtendedThemeConfig) => void
  onComplete?: () => void
}

// ============================================================================
// 工具函数类型
// ============================================================================

/**
 * RGB 颜色
 */
export interface RgbColor {
  r: number
  g: number
  b: number
}

/**
 * 缓动函数签名
 */
export type EasingFn = (t: number) => number

/**
 * 颜色插值函数签名
 */
export type ColorLerpFn = (color1: string, color2: string, t: number) => string

/**
 * 主题插值函数签名
 */
export type ThemeLerpFn = (
  theme1: ExtendedThemeConfig,
  theme2: ExtendedThemeConfig,
  t: number
) => ExtendedThemeConfig

// ============================================================================
// 配置常量
// ============================================================================

/**
 * Z-index 层级
 */
export const Z_INDEX_LAYERS = {
  container: 0,
  normalColumn: 1,
  fixedColumn: 10,
  fixedShadow: 11,
  fixedDivider: 12,
  dropdown: 1000,
  modal: 1050,
  drawer: 1060,
} as const

export type ZIndexLayer = keyof typeof Z_INDEX_LAYERS

/**
 * 动画时长常量
 */
export const ANIMATION_DURATION = {
  hover: 150,
  selected: 200,
  theme: 250,
  expand: 300,
  sort: 300,
} as const

/**
 * 默认动画配置
 */
export const DEFAULT_ANIMATIONS: AnimationConfig = {
  hover: {
    property: 'background-color',
    duration: ANIMATION_DURATION.hover,
    timing: 'ease-out',
  },
  selected: {
    property: ['background-color', 'border-color'],
    duration: ANIMATION_DURATION.selected,
    timing: 'ease-in-out',
  },
  theme: {
    property: 'all',
    duration: ANIMATION_DURATION.theme,
    timing: 'ease-in-out',
  },
  expand: {
    property: 'height',
    duration: ANIMATION_DURATION.expand,
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  sort: {
    property: 'transform',
    duration: ANIMATION_DURATION.sort,
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

/**
 * 默认字体栈
 */
export const DEFAULT_FONT_STACK: FontStack = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
  number: '"SF Mono", "Roboto Mono", Consolas, monospace',
} as const
