import type { ThemeConfig } from '../../types'

/**
 * 默认主题（亮色）
 */
export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    primary: '#1677ff',
    secondary: '#52c41a',
    background: '#ffffff',
    header: '#fafafa',
    border: '#f0f0f0',
    text: 'rgba(0, 0, 0, 0.88)',
    hover: '#fafafa',
    selected: '#e6f7ff',
    footer: '#fafafa'
  },
  fonts: {
    header: { size: '14px', weight: '600' },
    cell: { size: '14px', weight: '400' },
    footer: { size: '12px', weight: '400' }
  },
  spacing: {
    header: 55,
    cell: 55,
    border: 1,
    padding: 16
  }
}
