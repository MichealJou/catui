/**
 * VTable 主题配置入口
 * 导出三大 UI 框架的主题配置
 */

export * from './ant-design'
export * from './element-plus'
export * from './naive'

import { antDesignLight, antDesignDark } from './ant-design'
import { elementPlusLight, elementPlusDark } from './element-plus'
import { naiveLight, naiveDark } from './naive'

export type ThemePreset = 'ant-design' | 'element-plus' | 'naive'
export type ThemeMode = 'light' | 'dark'

/**
 * 获取 VTable 主题配置
 */
export function getVTableTheme(preset: ThemePreset, mode: ThemeMode = 'light') {
  const themes: Record<ThemePreset, Record<ThemeMode, any>> = {
    'ant-design': {
      light: antDesignLight,
      dark: antDesignDark
    },
    'element-plus': {
      light: elementPlusLight,
      dark: elementPlusDark
    },
    naive: {
      light: naiveLight,
      dark: naiveDark
    }
  }

  return themes[preset][mode]
}

/**
 * 转换为 VTable 主题格式
 * 参考 VTable 官方文档: https://visactor.io/vtable/option/ListTable#theme
 */
export function toVTableTheme(theme: any) {
  const borderColor = theme.colors?.borderColor ?? '#f0f0f0'
  const headerBorderColor = theme.colors?.headerBorderColor ?? borderColor
  const cellBorderColor = theme.colors?.cellBorderColor ?? borderColor

  const paddingVertical =
    theme.sizes?.cellPaddingVertical ?? theme.sizes?.cellPadding ?? 16
  const paddingHorizontal =
    theme.sizes?.cellPaddingHorizontal ?? theme.sizes?.cellPaddingInline ?? 8
  const headerPaddingVertical =
    theme.sizes?.headerPaddingVertical ?? paddingVertical
  const headerPaddingHorizontal =
    theme.sizes?.headerPaddingHorizontal ?? paddingHorizontal

  return {
    // 默认样式（单元格）
    defaultStyle: {
      bgColor: theme.colors?.bgColor ?? '#ffffff',
      color: theme.colors?.textColor ?? 'rgba(0, 0, 0, 0.88)',
      fontFamily: theme.fonts?.fontFamily ?? 'sans-serif',
      fontSize: theme.fonts?.fontSize ?? 14,
      fontWeight: theme.fonts?.cellFontWeight ?? 400,
      lineHeight: theme.fonts?.lineHeight ?? 1.57,
      padding: [paddingVertical, paddingHorizontal],
      borderColor: cellBorderColor,
      borderLineWidth: theme.sizes?.borderWidth ?? 1,
      // 边框配置
      borderLine: [
        { width: theme.sizes?.borderWidth ?? 1, color: cellBorderColor }
      ]
    },

    // 表头样式
    headerStyle: {
      bgColor: theme.colors?.headerBgColor ?? '#fafafa',
      color: theme.colors?.headerTextColor ?? 'rgba(0, 0, 0, 0.88)',
      fontFamily: theme.fonts?.fontFamily ?? 'sans-serif',
      fontSize: theme.fonts?.headerFontSize ?? theme.fonts?.fontSize ?? 14,
      fontWeight: theme.fonts?.headerFontWeight ?? 600,
      lineHeight:
        theme.fonts?.headerLineHeight ?? theme.fonts?.lineHeight ?? 1.57,
      padding: [headerPaddingVertical, headerPaddingHorizontal],
      borderColor: headerBorderColor,
      borderLineWidth: theme.sizes?.borderWidth ?? 1,
      borderLine: [
        { width: theme.sizes?.borderWidth ?? 1, color: headerBorderColor }
      ]
    },

    // 行样式
    rowStyle: {
      bgColor: theme.colors?.bgColor ?? '#ffffff',
      hover: {
        cellBgColor: theme.colors?.hoverColor ?? 'rgba(0, 0, 0, 0.02)'
      },
      selected: {
        cellBgColor: theme.colors?.selectColor ?? '#e6f4ff'
      }
    },

    // 列样式
    columnStyle: {
      borderColor: borderColor,
      borderLineWidth: theme.sizes?.borderWidth ?? 1,
      verticalBorderColor: borderColor,
      verticalBorderLineWidth: theme.sizes?.borderWidth ?? 1,
      horizontalBorderColor: borderColor,
      horizontalBorderLineWidth: theme.sizes?.borderWidth ?? 1
    },

    // 边框样式
    frameStyle: {
      borderLineColor: borderColor,
      borderLineWidth: theme.sizes?.borderWidth ?? 1,
      cornerRadius: theme.sizes?.borderRadius ?? 8
    },

    // 固定列样式
    frozenColStyle: {
      bgColor: theme.frozenColumn?.bgColor ?? '#ffffff',
      borderColor: theme.frozenColumn?.borderColor ?? borderColor,
      shadow: {
        color: theme.frozenColumn?.shadowColor ?? 'rgba(0, 0, 0, 0.06)',
        blur: theme.frozenColumn?.shadowSize ?? 4
      }
    },

    // 斑马纹
    stripe: {
      bgColor: theme.stripeColor ?? '#fafafa'
    },

    // 滚动条样式
    scrollStyle: {
      scrollRailColor: 'rgba(0, 0, 0, 0.1)',
      scrollSliderColor: 'rgba(0, 0, 0, 0.2)',
      scrollSliderCornerRadius: 4,
      width: 8
    },

    // 兼容旧属性
    background: theme.colors?.bgColor ?? '#ffffff',
    foregroundColor: theme.colors?.textColor ?? 'rgba(0, 0, 0, 0.88)',
    headerBackgroundColor: theme.colors?.headerBgColor ?? '#fafafa',
    headerTextColor: theme.colors?.headerTextColor ?? 'rgba(0, 0, 0, 0.88)',
    cellBackgroundColor: theme.colors?.bgColor ?? '#ffffff',
    hoverBackgroundColor: theme.colors?.hoverColor ?? 'rgba(0, 0, 0, 0.02)',
    selectionBackgroundColor: theme.colors?.selectColor ?? '#e6f4ff',
    headerHeight: theme.sizes?.headerHeight ?? 55
  }
}
