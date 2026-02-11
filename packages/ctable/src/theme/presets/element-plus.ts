/**
 * Element Plus 主题预设
 * 参考: https://element-plus.org/zh-CN/component/table.html
 */
import type { ThemeConfig } from '../../types'

export const elementPlusTheme: ThemeConfig = {
  colors: {
    primary: '#409eff', // Element Plus 主色
    secondary: '#79bbff', // 辅助色
    background: '#ffffff', // 背景色
    header: '#f5f7fa', // 表头背景
    border: '#ebeef5', // 边框色
    text: '#606266', // 文字颜色
    hover: '#f5f7fa', // 悬停色
    selected: '#ecf5ff', // 选中色
    footer: '#f5f7fa', // 表尾背景
    stripe: '#fafafa', // 斑马纹颜色
    fixedShadow: 'rgba(0, 0, 0, 0.1)' // 固定列阴影
  },
  fonts: {
    header: { size: '14px', weight: 'bold' }, // 表头字体
    cell: { size: '14px', weight: 'normal' }, // 单元格字体
    footer: { size: '14px', weight: 'normal' } // 表尾字体
  },
  spacing: {
    header: 48, // 表头高度（Element Plus 默认较小）
    cell: 48, // 单元格高度
    border: 1, // 边框宽度
    padding: 12 // 内边距
  }
}

// Element Plus 暗黑主题
export const elementPlusDarkTheme: ThemeConfig = {
  colors: {
    primary: '#409eff',
    secondary: '#66b1ff',
    background: '#1d1e1f',
    header: '#252526',
    border: '#4c4d4f',
    text: '#e5eaf3',
    hover: '#2a2a2a',
    selected: '#1a2a3a',
    footer: '#252526',
    stripe: '#262727',
    fixedShadow: 'rgba(0, 0, 0, 0.3)'
  },
  fonts: {
    header: { size: '14px', weight: 'bold' },
    cell: { size: '14px', weight: 'normal' },
    footer: { size: '14px', weight: 'normal' }
  },
  spacing: {
    header: 48,
    cell: 48,
    border: 1,
    padding: 12
  }
}
