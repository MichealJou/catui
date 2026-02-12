/**
 * Element Plus 2.x 主题配置 - VTable 版本
 * 完全匹配 Element Plus Table 视觉规范
 * https://element-plus.org/zh-CN/component/table.html
 */

export const elementPlusVTableTheme = {
  colors: {
    bgColor: '#ffffff',
    headerBgColor: '#f5f7fa',
    footerBgColor: '#f5f7fa',
    headerTextColor: '#606266',
    textColor: '#606266',
    headerSortActiveTextColor: '#409eff',
    headerSortHoverTextColor: '#409eff',
    borderColor: '#ebeef5',
    headerBorderColor: '#ebeef5',
    cellBorderColor: '#ebeef5',
    headerCellBorderColor: '#ebeef5',
    hoverColor: '#f5f7fa',
    hoverBorderColor: '#ebeef5',
    selectColor: '#ecf5ff',
    selectBorderColor: '#c6e2ff',
    expandedRowBg: '#f5f7fa',
    primaryColor: '#409eff',
    primaryHover: '#66b1ff',
    primaryActive: '#3a8ee6',
    primaryColorBg: '#ecf5ff',
    errorColor: '#f56c6c',
    warningColor: '#e6a23c',
    successColor: '#67c23a',
    infoColor: '#909399'
  },
  fonts: {
    fontSize: 14,
    headerFontSize: 14,
    fontFamily:
      '"Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
    headerFontWeight: 700,
    cellFontWeight: 400,
    lineHeight: 1.5,
    headerLineHeight: 1.5
  },
  sizes: {
    headerHeight: 48,
    cellHeight: 48,
    headerPaddingVertical: 12,
    headerPaddingHorizontal: 10,
    cellPaddingVertical: 12,
    cellPaddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 4
  },
  frozenColumn: {
    bgColor: '#ffffff',
    borderColor: '#ebeef5',
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowSize: 6
  },
  stripeColor: '#fafafa'
}

export const elementPlusLight = {
  ...elementPlusVTableTheme
}

export const elementPlusDark = {
  colors: {
    ...elementPlusVTableTheme.colors,
    bgColor: '#141414',
    headerBgColor: '#1d1d1d',
    footerBgColor: '#1d1d1d',
    headerTextColor: '#cfd3dc',
    textColor: '#cfd3dc',
    headerSortActiveTextColor: '#409eff',
    headerSortHoverTextColor: '#409eff',
    borderColor: '#4c4d4f',
    headerBorderColor: '#4c4d4f',
    cellBorderColor: '#4c4d4f',
    headerCellBorderColor: '#4c4d4f',
    hoverColor: '#262727',
    hoverBorderColor: '#4c4d4f',
    selectColor: '#1a3a4d',
    selectBorderColor: '#409eff',
    expandedRowBg: '#1d1d1d',
    primaryColorBg: '#1a3a4d'
  },
  frozenColumn: {
    bgColor: '#141414',
    borderColor: '#4c4d4f',
    shadowColor: 'rgba(255, 255, 255, 0.12)',
    shadowSize: 6
  },
  stripeColor: '#1d1d1d'
}
