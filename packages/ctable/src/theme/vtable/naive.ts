/**
 * Naive UI 主题配置 - VTable 版本
 * 完全匹配 Naive UI DataTable 视觉规范
 * https://www.naiveui.com/zh-CN/light/components/data-table
 */

export const naiveVTableTheme = {
  colors: {
    bgColor: '#ffffff',
    headerBgColor: '#f1f3f5',
    footerBgColor: '#fafafa',
    headerTextColor: '#1f2329',
    textColor: '#1f2329',
    headerSortActiveTextColor: '#18a058',
    headerSortHoverTextColor: '#18a058',
    borderColor: '#e4e7ed',
    headerBorderColor: '#e4e7ed',
    cellBorderColor: '#e4e7ed',
    headerCellBorderColor: '#e4e7ed',
    hoverColor: '#f8f9fa',
    hoverBorderColor: '#e4e7ed',
    selectColor: '#e2f8e8',
    selectBorderColor: '#c2eecd',
    expandedRowBg: '#fafafa',
    primaryColor: '#18a058',
    primaryHover: '#36ad6a',
    primaryActive: '#0c7a43',
    primaryColorBg: '#e8f3e8',
    errorColor: '#d03050',
    warningColor: '#f0a020',
    successColor: '#18a058',
    infoColor: '#2080f0'
  },
  fonts: {
    fontSize: 14,
    headerFontSize: 14,
    fontFamily:
      'v-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    headerFontWeight: 500,
    cellFontWeight: 400,
    lineHeight: 22 / 14,
    headerLineHeight: 22 / 14
  },
  sizes: {
    headerHeight: 44,
    cellHeight: 47,
    headerPaddingVertical: 12,
    headerPaddingHorizontal: 12,
    cellPaddingVertical: 12,
    cellPaddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 3
  },
  frozenColumn: {
    bgColor: '#ffffff',
    borderColor: '#e4e7ed',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowSize: 2
  },
  stripeColor: '#fafafa'
}

export const naiveLight = {
  ...naiveVTableTheme
}

export const naiveDark = {
  colors: {
    ...naiveVTableTheme.colors,
    bgColor: 'rgb(16, 16, 20)',
    headerBgColor: 'rgb(24, 24, 28)',
    footerBgColor: 'rgb(24, 24, 28)',
    headerTextColor: 'rgba(255, 255, 255, 0.82)',
    textColor: 'rgba(255, 255, 255, 0.82)',
    headerSortActiveTextColor: '#63e2b7',
    headerSortHoverTextColor: '#63e2b7',
    borderColor: 'rgb(55, 55, 60)',
    headerBorderColor: 'rgb(55, 55, 60)',
    cellBorderColor: 'rgb(55, 55, 60)',
    headerCellBorderColor: 'rgb(55, 55, 60)',
    hoverColor: 'rgb(32, 32, 36)',
    hoverBorderColor: 'rgb(55, 55, 60)',
    selectColor: 'rgb(38, 50, 44)',
    selectBorderColor: 'rgb(55, 55, 60)',
    expandedRowBg: 'rgb(24, 24, 28)',
    primaryColor: '#63e2b7',
    primaryHover: '#7be2b8',
    primaryActive: '#5cc9a9',
    primaryColorBg: 'rgb(38, 50, 44)'
  },
  frozenColumn: {
    bgColor: 'rgb(16, 16, 20)',
    borderColor: 'rgb(55, 55, 60)',
    shadowColor: 'rgba(255, 255, 255, 0.08)',
    shadowSize: 2
  },
  stripeColor: 'rgb(22, 22, 26)'
}
