/**
 * Ant Design Vue 主题预设
 * 参考: https://antdv.com/docs/spec/theme
 */
import type { ThemeConfig } from '../../types'

export const antDesignTheme: ThemeConfig = {
  colors: {
    primary: '#1677ff', // Ant Design 2024 主色
    secondary: '#8c8ce6', // 辅助色
    background: '#ffffff', // 背景色
    header: '#fafafa', // 表头背景
    border: '#f0f0f0', // 边框色
    text: 'rgba(0, 0, 0, 0.88)', // 文字颜色 (85% 不透明度)
    hover: 'rgba(0, 0, 0, 0.04)', // 悬停色
    selected: '#e6f4ff', // 选中色（浅蓝背景）
    footer: '#fafafa', // 表尾背景
    stripe: '#fafafa', // 斑马纹颜色
    fixedShadow: 'rgba(0, 0, 0, 0.1)' // 固定列阴影
  },
  fonts: {
    header: { size: '14px', weight: '600' }, // 表头字体：14px, 字重 600
    cell: { size: '14px', weight: '400' }, // 单元格字体：14px, 字重 400
    footer: { size: '14px', weight: '400' } // 表尾字体
  },
  spacing: {
    header: 55, // 表头高度
    cell: 55, // 单元格高度
    border: 1, // 边框宽度
    padding: 16 // 内边距
  }
}

// Ant Design 暗黑主题
export const antDesignDarkTheme: ThemeConfig = {
  colors: {
    primary: '#1677ff',
    secondary: '#6d6ee3',
    background: '#141414',
    header: '#1d1d1d',
    border: '#303030',
    text: 'rgba(255, 255, 255, 0.85)',
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: '#111d2c',
    footer: '#1d1d1d',
    stripe: '#1f1f1f',
    fixedShadow: 'rgba(0, 0, 0, 0.3)'
  },
  fonts: {
    header: { size: '14px', weight: '600' },
    cell: { size: '14px', weight: '400' },
    footer: { size: '14px', weight: '400' }
  },
  spacing: {
    header: 55,
    cell: 55,
    border: 1,
    padding: 16
  }
}
