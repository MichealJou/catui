/**
 * Naive UI 主题配置 - VTable 版本
 * 完美匹配 Naive UI DataTable 视觉风格
 */

export const naiveVTableTheme = {
  // 基础颜色
  colors: {
    // 背景色
    bgColor: '#ffffff',
    headerBgColor: '#ffffff',
    headerTextColor: 'rgb(51, 54, 57)',
    textColor: 'rgb(51, 54, 57)',

    // 边框色
    borderColor: 'rgb(239, 239, 245)',

    // 交互状态
    hoverColor: 'rgb(247, 248, 248)',
    selectColor: 'rgb(243, 244, 246)',

    // 品牌色
    primaryColor: '#18a058',
    primaryHover: '#36ad6a',
    primaryActive: '#0c7a43',

    // 功能色
    errorColor: '#d03050',
    warningColor: '#f0a020',
    successColor: '#18a058',
    infoColor: '#2080f0'
  },

  // 字体配置
  fonts: {
    fontSize: 14,
    fontFamily: 'v-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    headerFontWeight: '600',
    cellFontWeight: '400'
  },

  // 尺寸配置
  sizes: {
    headerHeight: 44,
    cellHeight: 44,
    cellPadding: 12,
    borderWidth: 1
  },

  // 固定列样式
  frozenColumn: {
    bgColor: '#ffffff',
    borderColor: 'rgb(239, 239, 245)',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowSize: 2
  },

  // 斑马纹
  stripeColor: 'rgb(250, 250, 252)'
}

// 亮色主题（默认）
export const naiveLight = {
  ...naiveVTableTheme
}

// 暗色主题（Naive OS 暗色主题风格）
export const naiveDark = {
  colors: {
    ...naiveVTableTheme.colors,
    bgColor: 'rgb(24, 24, 28)',
    headerBgColor: 'rgb(24, 24, 28)',
    headerTextColor: 'rgb(255, 255, 255)',
    textColor: 'rgb(206, 206, 210)',
    borderColor: 'rgb(46, 46, 48)',
    hoverColor: 'rgb(46, 46, 48)',
    selectColor: 'rgb(38, 38, 41)',
    primaryColor: '#18a058',
    primaryHover: '#36ad6a',
    primaryActive: '#0c7a43'
  },

  frozenColumn: {
    bgColor: 'rgb(24, 24, 28)',
    borderColor: 'rgb(46, 46, 48)',
    shadowColor: 'rgba(255, 255, 255, 0.08)',
    shadowSize: 2
  },

  stripeColor: 'rgb(32, 32, 34)'
}
