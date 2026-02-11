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
    'naive': {
      light: naiveLight,
      dark: naiveDark
    }
  }

  return themes[preset][mode]
}

/**
 * 转换为 VTable 主题格式
 */
export function toVTableTheme(theme: any) {
  return {
    // 基础样式
    background: theme.colors.bgColor,
    foregroundColor: theme.colors.textColor,

    // 表头样式
    headerBackgroundColor: theme.colors.headerBgColor,
    headerLineColor: theme.colors.borderColor,
    headerTextColor: theme.colors.headerTextColor,

    // 单元格样式
    cellBackgroundColor: theme.colors.bgColor,
    borderColor: theme.colors.borderColor,

    // 交互状态
    hoverBackgroundColor: theme.colors.hoverColor,
    selectionBackgroundColor: theme.colors.selectColor,

    // 字体
    fontSize: theme.fonts.fontSize,
    fontFamily: theme.fonts.fontFamily,
    fontWeight: theme.fonts.cellFontWeight,
    headerFontWeight: theme.fonts.headerFontWeight,

    // 尺寸
    headerHeight: theme.sizes.headerHeight,
    cellPadding: theme.sizes.cellPadding,

    // 固定列
    frozenColumnBackgroundColor: theme.frozenColumn.bgColor,
    frozenColumnLineColor: theme.frozenColumn.borderColor,

    // 滚动条
    scrollBarColor: 'rgba(0, 0, 0, 0.2)',
    scrollBarHoverColor: 'rgba(0, 0, 0, 0.3)'
  }
}
