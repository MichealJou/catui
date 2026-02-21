/**
 * @catui/ctable - 高性能 Canvas 表格组件
 * 基于 VTable 渲染引擎
 */

// 导出类型定义（排除冲突的 ThemePreset）
export type {
  Column,
  CTableProps,
  CTableEvents,
  PaginationConfig,
  PaginationMode,
  RowSelectionConfig,
  SortOrder,
  SortDirection,
  FilterCondition,
  FilterOption,
  ContextMenuItem,
  CTableLocale,
  CTableLocalePack,
  QueryRequestPayload,
  ThemeConfig,
  ResizeConfig,
  ColumnDragConfig,
  ColumnResizeInfo,
  ColumnResizeEndInfo
} from './types'

// 单独导出 CTable 的 ThemePreset（6 种主题）
export { type ThemePreset } from './types'

// 导出 VTable 相关类型
export type {
  ThemePreset as VTableThemePreset,
  ThemeMode
} from './theme/vtable'

// 导出主题预设
export { antDesignTheme, antDesignDarkTheme } from './theme/presets/ant-design'
export {
  elementPlusTheme,
  elementPlusDarkTheme
} from './theme/presets/element-plus'
export { naiveTheme, naiveDarkTheme } from './theme/presets/naive'

// 导出 VTable 主题
export {
  antDesignLight,
  antDesignDark,
  elementPlusLight,
  elementPlusDark,
  naiveLight,
  naiveDark,
  getVTableTheme,
  toVTableTheme
} from './theme/vtable'

// 导出核心类
export {
  ThemeManager,
  useThemeManager,
  DEFAULT_THEME,
  DARK_THEME
} from './core/ThemeManager'
export { SortManager } from './core/SortManager'
export { FilterManager } from './core/FilterManager'
export { EventManager } from './core/EventManager'

// 导出 Vue 组件
export { default as CTable } from './components/CTable.vue'

// 导出 VTable 适配器
export { createVTableAdapter, VTableAdapter } from './adapters/VTableAdapter'

// 默认导出
export { default } from './components/CTable.vue'
