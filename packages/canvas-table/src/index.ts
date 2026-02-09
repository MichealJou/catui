// 导出类型定义
export * from './types'

// 导出核心模块
export { EventSystem } from './core/EventSystem'
export { LifecycleManager } from './core/LifecycleManager'
export { PluginManager } from './plugins/PluginManager'
export { TableEventManager, useTableEvents } from './core/TableEventManager'
export { CTable, createTable } from './core/Table'

// 导出渲染器
export { CanvasRenderer } from './renderers/CanvasRenderer'
export { BaseRenderer } from './renderers/BaseRenderer'
export { G2Renderer } from './renderers/G2Renderer'

// 导出主题系统
export { ThemeManager, useThemeManager } from './theme/ThemeManager'
export { DEFAULT_THEME } from './theme/presets/default'
export { DARK_THEME } from './theme/presets/dark'

// 导出虚拟滚动
export * from './features/virtual-scroll'

// 导出工具函数
export * from './utils/geometry'

// 导出 Vue 组件
export { default as CTableComponent } from './components/CTable.vue'

// 默认导出 Vue 组件
export { default } from './components/CTable.vue'
