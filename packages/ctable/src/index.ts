/**
 * @catui/ctable - 高性能 Canvas 表格组件
 * 基于 AntV G2 渲染引擎
 */

// 导出类型定义
export * from './types'

// 导出主题
export { antDesignTheme, antDesignDarkTheme } from './theme/presets/ant-design'
export { elementPlusTheme, elementPlusDarkTheme } from './theme/presets/element-plus'
export { naiveTheme, naiveDarkTheme } from './theme/presets/naive'

// 导出核心类（从 core 目录）
export { G2TableRenderer } from './core/G2TableRenderer'
export { CanvasRenderer } from './core/CanvasRenderer'
export { ThemeManager, useThemeManager, DEFAULT_THEME, DARK_THEME } from './core/ThemeManager'
export { SortManager } from './core/SortManager'
export { FilterManager } from './core/FilterManager'
export { EventManager } from './core/EventManager'

// 导出 Vue 组件
export { default as CTable } from './components/CTable.vue'

// 默认导出（兼容 Vue 插件）
export { default } from './components/CTable.vue'
