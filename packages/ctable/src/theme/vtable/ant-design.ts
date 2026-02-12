/**
 * Ant Design Vue 4.x 主题配置 - VTable 版本
 * 完全匹配 Ant Design Vue Table 视觉规范
 * https://antdv.com/components/table-cn
 */

export const antDesignVTableTheme = {
  colors: {
    // 背景色
    bgColor: '#ffffff',
    headerBgColor: '#fafafa',
    footerBgColor: '#fafafa',

    // 文字色
    headerTextColor: 'rgba(0, 0, 0, 0.88)',
    textColor: 'rgba(0, 0, 0, 0.88)',
    headerSortActiveTextColor: '#1677ff',
    headerSortHoverTextColor: '#1677ff',

    // 边框色
    borderColor: '#f0f0f0',
    headerBorderColor: '#f0f0f0',
    cellBorderColor: '#f0f0f0',
    headerCellBorderColor: '#f0f0f0',

    // 交互状态
    hoverColor: 'rgba(0, 0, 0, 0.04)',
    hoverBorderColor: '#f0f0f0',
    selectColor: '#e6f4ff',
    selectBorderColor: '#bae0ff',
    expandedRowBg: '#fafafa',

    // 品牌色
    primaryColor: '#1677ff',
    primaryHover: '#4096ff',
    primaryActive: '#0958d9',
    primaryColorBg: '#e6f4ff',

    // 功能色
    errorColor: '#ff4d4f',
    warningColor: '#faad14',
    successColor: '#52c41a',
    infoColor: '#1677ff'
  },

  fonts: {
    fontSize: 14,
    headerFontSize: 14,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    headerFontWeight: 600,
    cellFontWeight: 400,
    lineHeight: 22 / 14,
    headerLineHeight: 22 / 14
  },

  sizes: {
    headerHeight: 55,
    cellHeight: 55,
    headerPaddingVertical: 16,
    headerPaddingHorizontal: 8,
    cellPaddingVertical: 16,
    cellPaddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 8
  },

  frozenColumn: {
    bgColor: '#ffffff',
    borderColor: '#f0f0f0',
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowSize: 4
  },

  stripeColor: '#fafafa'
}

export const antDesignLight = {
  ...antDesignVTableTheme
}

export const antDesignDark = {
  colors: {
    ...antDesignVTableTheme.colors,
    bgColor: '#141414',
    headerBgColor: '#1f1f1f',
    footerBgColor: '#1f1f1f',
    headerTextColor: 'rgba(255, 255, 255, 0.85)',
    textColor: 'rgba(255, 255, 255, 0.85)',
    headerSortActiveTextColor: '#1677ff',
    headerSortHoverTextColor: '#1677ff',
    borderColor: '#424242',
    headerBorderColor: '#424242',
    cellBorderColor: '#424242',
    headerCellBorderColor: '#424242',
    hoverColor: 'rgba(255, 255, 255, 0.04)',
    hoverBorderColor: '#424242',
    selectColor: 'rgba(22, 119, 255, 0.2)',
    selectBorderColor: '#1677ff',
    expandedRowBg: '#1f1f1f',
    primaryColorBg: 'rgba(22, 119, 255, 0.2)'
  },

  frozenColumn: {
    bgColor: '#141414',
    borderColor: '#424242',
    shadowColor: 'rgba(255, 255, 255, 0.06)',
    shadowSize: 4
  },

  stripeColor: '#1f1f1f'
}
