/**
 * Element Plus 主题配置 - VTable 版本
 * 完美匹配 Element Plus Table 视觉风格
 */

export const elementPlusVTableTheme = {
  // 基础颜色
  colors: {
    // 背景色
    bgColor: '#ffffff',
    headerBgColor: '#f5f7fa',
    headerTextColor: '#606266',
    textColor: '#606266',

    // 边框色
    borderColor: '#ebeef5',

    // 交互状态
    hoverColor: '#f5f7fa',
    selectColor: '#ecf5ff',

    // 品牌色
    primaryColor: '#409eff',
    primaryHover: '#66b1ff',
    primaryActive: '#0d84ff',

    // 功能色
    errorColor: '#f56c6c',
    warningColor: '#e6a23c',
    successColor: '#67c23a',
    infoColor: '#909399'
  },

  // 字体配置
  fonts: {
    fontSize: 14,
    fontFamily: '"Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif',
    headerFontWeight: 'bold',
    cellFontWeight: 'normal'
  },

  // 尺寸配置
  sizes: {
    headerHeight: 48,
    cellHeight: 48,
    cellPadding: 12,
    borderWidth: 1
  },

  // 固定列样式
  frozenColumn: {
    bgColor: '#ffffff',
    borderColor: '#ebeef5',
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowSize: 6
  },

  // 斑马纹
  stripeColor: '#fafafa'
}

// 亮色主题（默认）
export const elementPlusLight = {
  ...elementPlusVTableTheme
}

// 暗色主题
export const elementPlusDark = {
  colors: {
    ...elementPlusVTableTheme.colors,
    bgColor: '#1d1e1f',
    headerBgColor: '#25262a',
    headerTextColor: '#e5eaf3',
    textColor: '#cfd3dc',
    borderColor: '#4c4d4f',
    hoverColor: '#2b2b2e',
    selectColor: '#1a2b45',
    primaryColor: '#409eff',
    primaryHover: '#66b1ff',
    primaryActive: '#0d84ff'
  },

  frozenColumn: {
    bgColor: '#1d1e1f',
    borderColor: '#4c4d4f',
    shadowColor: 'rgba(255, 255, 255, 0.12)',
    shadowSize: 6
  },

  stripeColor: '#25262a'
}
