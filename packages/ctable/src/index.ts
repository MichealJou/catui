/**
 * @catui/ctable - 高性能 Canvas 表格组件
 * 基于 AntV G2 渲染引擎
 */

// 导出类型定义
export * from './types'

// 导出主题
export { antDesignTheme, antDesignDarkTheme } from './theme/presets/ant-design'
export {
  elementPlusTheme,
  elementPlusDarkTheme
} from './theme/presets/element-plus'
export { naiveTheme, naiveDarkTheme } from './theme/presets/naive'

// 导出 VTable 主题
export * from './theme/vtable'

// 导出核心类（从 core 目录）
// 注意：以下类已不再使用，保留导出以向后兼容
// export { G2TableRenderer } from './core/G2TableRenderer' // 已删除
// export { CanvasRenderer } from './core/CanvasRenderer' // 已删除
export {
  ThemeManager,
  useThemeManager,
  DEFAULT_THEME,
  DARK_THEME
} from './core/ThemeManager'
export { SortManager } from './core/SortManager'
export { FilterManager } from './core/FilterManager'
export { EventManager } from './core/EventManager'
// export { FixedColumnManager } from './core/FixedColumnManager' // 已删除

// 导出 Vue 组件
export { default as CTable } from './components/CTable.vue'

// 导出 VTable 适配器
export { createVTableAdapter, VTableAdapter } from './adapters/VTableAdapter'

// 默认导出（兼容 Vue 插件）
export { default } from './components/CTable.vue'
