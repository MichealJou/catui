// 基础类型定义
export interface ITablePlugin {
  // 插件信息
  name: string
  version: string
  dependencies?: string[]
  
  // 生命周期
  install(table: any): void
  uninstall(table: any): void
  
  // 事件监听
  on?(event: string, handler: Function): void
  off?(event: string, handler: Function): void
}

export interface IRenderer {
  render(params: RenderParams): void
  clear(): void
  update(params: UpdateParams): void
  resize(width: number, height: number): void
}

export interface IEventSystem {
  on(event: string, handler: Function): void
  off(event: string, handler: Function): void
  emit(event: string, data?: any): void
  once(event: string, handler: Function): void
}

export interface IPluginManager {
  register(plugin: ITablePlugin): void
  unregister(name: string): void
  get(name: string): ITablePlugin | undefined
  list(): string[]
  load(name: string): boolean
  unload(name: string): boolean
}

// 表格配置类型
export interface Column {
  key: string
  title: string
  width?: number
  minWidth?: number
  maxWidth?: number
  fixed?: 'left' | 'right'
  sortable?: boolean
  filterable?: boolean
  editable?: boolean
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  className?: string
  render?: (value: any, row: any, column: Column, index: number) => any
  headerRender?: (column: Column, index: number) => any
  sortableChildren?: Column[]
}

export interface TableProps {
  // 数据相关
  data: any[]
  columns: Column[]
  
  // 尺寸相关
  width: number
  height: number
  rowHeight?: number
  columnWidth?: number
  
  // 功能开关
  virtual?: boolean
  showHeader?: boolean
  showScrollbar?: boolean
  showBorder?: boolean
  highlightRow?: boolean
  
  // 性能相关
  threshold?: number      // 触发虚拟滚动的阈值
  bufferSize?: number     // 缓冲区大小
  
  // 渲染相关
  renderer?: 'canvas' | 'dom' | 'hybrid'
  
  // 主题相关
  theme?: ThemeConfig
  
  // 事件回调
  onRowClick?: (row: any, index: number) => void
  onCellClick?: (cell: any, row: any, col: Column) => void
  onSort?: (column: Column, direction: string) => void
  onFilter?: (column: Column, values: any[]) => void
  onSelectionChange?: (selected: any[]) => void
  onScroll?: (scrollTop: number, scrollLeft: number) => void
}

export interface TableEvents {
  'row-click': [row: any, index: number]
  'cell-click': [cell: any, row: any, col: Column]
  'sort': [column: Column, direction: string]
  'filter': [column: Column, values: any[]]
  'selection-change': [selected: any[]]
  'scroll': [scrollTop: number, scrollLeft: number]
}

// 渲染相关类型
export interface Viewport {
  width: number
  height: number
  scrollTop: number
  scrollLeft: number
  clientWidth: number
  clientHeight: number
}

export interface RenderParams {
  data: any[]
  columns: Column[]
  viewport: Viewport
  selected: any[]
  theme: ThemeConfig
}

export interface UpdateParams {
  data?: any[]
  columns?: Column[]
  viewport?: Viewport
  selected?: any[]
  theme?: ThemeConfig
}

// 主题类型
export interface ThemeConfig {
  background?: string
  border?: string
  header?: string
  headerBorder?: string
  rowHover?: string
  rowSelected?: string
  textPrimary?: string
  textSecondary?: string
  scrollbarBg?: string
  scrollbarThumb?: string
}

// 插件配置类型
export interface PluginConfig {
  [key: string]: any
}

// 插件管理器状态
export interface PluginManagerState {
  plugins: Map<string, ITablePlugin>
  loaded: Set<string>
  table: any
}

// 事件系统状态
export interface EventSystemState {
  events: Map<string, Function[]>
}

// 渲染器类型
export type RendererType = 'canvas' | 'dom' | 'hybrid'

// 排序方向
export type SortDirection = 'asc' | 'desc' | null

// 筛选器类型
export interface Filter {
  column: string
  values: any[]
  type?: 'equals' | 'contains' | 'range' | 'list'
}

// 选择类型
export interface Selection {
  type: 'single' | 'multiple'
  selected: Set<any>
  rowKey?: string | ((row: any) => string | number)
}

// 编辑类型
export interface EditConfig {
  mode: 'cell' | 'row' | 'inline'
  trigger: 'click' | 'dblclick' | 'manual'
  editableColumns?: string[]
  validator?: (value: any, row: any, column: Column) => boolean
}

// 虚拟滚动配置
export interface VirtualScrollConfig {
  enabled: boolean
  threshold: number
  bufferSize: number
  overscan: number
  itemHeight?: number
  itemWidth?: number
}

// 列配置
export interface ColumnConfig {
  resizable?: boolean
  draggable?: boolean
  hideable?: boolean
  fixedColumns?: 'left' | 'right'
  fixedHeader?: boolean
  groupable?: boolean
  summary?: boolean
}

// 导出配置
export interface ExportConfig {
  format: 'csv' | 'excel' | 'json'
  filename?: string
  includeHeader?: boolean
  selectedOnly?: boolean
}