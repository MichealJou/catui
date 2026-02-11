/**
 * NaiveUI 主题预设
 * 参考: https://www.naiveui.com/zh-CN/light/docs/data-table
 */
import type { ThemeConfig } from '../../types'

export const naiveTheme: ThemeConfig = {
  colors: {
    primary: '#18a058', // NaiveUI 主色（绿色）
    secondary: '#36ad6a', // 辅助色
    background: '#ffffff', // 背景色
    header: '#f1f3f5', // 表头背景
    border: '#e4e7ed', // 边框色
    text: '#1f2329', // 文字颜色
    hover: '#f8f9fa', // 悬停色
    selected: '#e2f8e8', // 选中色（浅绿背景）
    footer: '#f1f3f5', // 表尾背景
    stripe: '#fafafa', // 斑马纹颜色
    fixedShadow: 'rgba(0, 0, 0, 0.1)' // 固定列阴影
  },
  fonts: {
    header: { size: '14px', weight: '600' }, // 表头字体
    cell: { size: '14px', weight: '400' }, // 单元格字体
    footer: { size: '14px', weight: '400' } // 表尾字体
  },
  spacing: {
    header: 44, // 表头高度（NaiveUI 默认较小）
    cell: 47, // 单元格高度
    border: 1, // 边框宽度
    padding: 12 // 内边距
  }
}

// NaiveUI 暗黑主题
export const naiveDarkTheme: ThemeConfig = {
  colors: {
    primary: '#18a058',
    secondary: '#4cb272',
    background: '#18181c',
    header: '#1f1f23',
    border: '#3e3e42',
    text: '#e2e7ee',
    hover: '#252529',
    selected: '#0f2818',
    footer: '#1f1f23',
    stripe: '#212124',
    fixedShadow: 'rgba(0, 0, 0, 0.3)'
  },
  fonts: {
    header: { size: '14px', weight: '600' },
    cell: { size: '14px', weight: '400' },
    footer: { size: '14px', weight: '400' }
  },
  spacing: {
    header: 44,
    cell: 47,
    border: 1,
    padding: 12
  }
}
