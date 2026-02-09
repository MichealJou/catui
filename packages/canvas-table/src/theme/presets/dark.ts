import type { ThemeConfig } from '../../types'

/**
 * 暗色主题
 */
export const DARK_THEME: ThemeConfig = {
  colors: {
    primary: '#1677ff',
    secondary: '#49aa19',
    background: '#141414',
    header: '#1f1f1f',
    border: '#303030',
    text: 'rgba(255, 255, 255, 0.85)',
    hover: '#262626',
    selected: '#11263c',
    footer: '#1f1f1f'
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
