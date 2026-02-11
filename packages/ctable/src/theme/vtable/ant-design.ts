/**
 * Ant Design 主题配置 - VTable 版本
 * 完美匹配 Ant Design Vue Table 视觉风格
 */

export const antDesignVTableTheme = {
  // 基础颜色
  colors: {
    // 背景色
    bgColor: '#ffffff',
    headerBgColor: '#fafafa',
    headerTextColor: 'rgba(0, 0, 0, 0.88)',
    textColor: 'rgba(0, 0, 0, 0.65)',

    // 边框色
    borderColor: '#f0f0f0',

    // 交互状态
    hoverColor: 'rgba(24, 144, 255, 0.06)',
    selectColor: '#e6f7ff',

    // 品牌色
    primaryColor: '#1677ff',
    primaryHover: '#4096ff',
    primaryActive: '#0958d9',

    // 功能色
    errorColor: '#ff4d4f',
    warningColor: '#faad14',
    successColor: '#52c41a',
    infoColor: '#1677ff'
  },

  // 字体配置
  fonts: {
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    headerFontWeight: 500,
    cellFontWeight: 400
  },

  // 尺寸配置
  sizes: {
    headerHeight: 55,
    cellHeight: 54,
    cellPadding: 16,
    borderWidth: 1
  },

  // 固定列样式
  frozenColumn: {
    bgColor: '#ffffff',
    borderColor: '#e8e8e8',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowSize: 4
  },

  // 斑马纹
  stripeColor: '#fafafa'
}

// 亮色主题（默认）
export const antDesignLight = {
  ...antDesignVTableTheme
}

// 暗色主题
export const antDesignDark = {
  colors: {
    ...antDesignVTableTheme.colors,
    bgColor: '#141414',
    headerBgColor: '#1f1f1f',
    headerTextColor: 'rgba(255, 255, 255, 0.85)',
    textColor: 'rgba(255, 255, 255, 0.65)',
    borderColor: '#303030',
    hoverColor: 'rgba(255, 255, 255, 0.08)',
    selectColor: '#112545',
    primaryColor: '#1677ff',
    primaryHover: '#4096ff',
    primaryActive: '#0958d9'
  },

  frozenColumn: {
    bgColor: '#141414',
    borderColor: '#303030',
    shadowColor: 'rgba(255, 255, 255, 0.15)',
    shadowSize: 4
  },

  stripeColor: '#1f1f1f'
}
