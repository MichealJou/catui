/**
 * CTable 类型定义
 * 兼容 Ant Design Vue Table API
 */

// ============================================================================
// 基础类型
// ============================================================================

export type SortOrder = 'asc' | 'desc' | null
export type SortDirection = 'ascend' | 'descend' | null
export type FilterType = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'range' | 'list'

// ============================================================================
// 筛选相关类型
// ============================================================================

export interface FilterCondition {
  field: string
  type: FilterType
  value: any
  value2?: any
  options?: any[]
}

export interface FilterOption {
  text: string
  value: any
  children?: FilterOption[]
}

export interface FilterDropdownProps {
  filters?: FilterOption[]
  filterDropdown?: any
  filterIcon?: any
  onFilter?: (value: any, record: any) => boolean
  filteredValue?: any[]
}

// ============================================================================
// 排序相关类型
// ============================================================================

export interface SorterConfig {
  compare?: (a: any, b: any) => number
  multiple?: number
}

// ============================================================================
// 分页相关类型
// ============================================================================

export interface PaginationConfig {
  current?: number
  pageSize?: number
  total?: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: (total: number) => string
  pageSizeOptions?: number[]
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
}

// ============================================================================
// 选择相关类型
// ============================================================================

export interface RowSelectionConfig {
  type?: 'checkbox' | 'radio'
  selectedRowKeys?: any[]
  onChange?: (selectedRowKeys: any[], selectedRows: any[]) => void
  getCheckboxProps?: (record: any) => { disabled?: boolean }
  fixed?: boolean
  columnWidth?: string | number
  selections?: boolean
  hideDefaultSelections?: boolean
}

// ============================================================================
// 列定义类型（兼容 Ant Design Vue）
// ============================================================================

export interface Column {
  // === 基础属性 ===
  key: string
  title: string
  dataIndex?: string | string[]

  // === 列宽控制 ===
  width?: number | string
  minWidth?: number
  maxWidth?: number

  // === 对齐方式 ===
  align?: 'left' | 'center' | 'right'

  // === 固定列 ===
  fixed?: 'left' | 'right'

  // === 排序 ===
  sorter?: boolean | ((a: any, b: any) => number) | SorterConfig
  sortOrder?: SortOrder | SortDirection

  // === 筛选 ===
  filters?: FilterOption[]
  filterDropdown?: any
  filterIcon?: any
  onFilter?: (value: any, record: any) => boolean
  filteredValue?: any[]
  filterMultiple?: boolean
  filterable?: boolean  // CTable 扩展属性

  // === 自定义渲染 ===
  customRender?: ({ value, record, index, column }: any) => any
  customCell?: (record: any) => object
  customHeaderCell?: (column: Column) => object

  // === 编辑 ===
  editable?: boolean
  editor?: 'input' | 'select' | 'date' | any

  // === 响应式 ===
  responsive?: ['xs' | 'sm' | 'md' | 'lg' | 'xl']

  // === 拖拽 ===
  resizable?: boolean
  draggable?: boolean

  // === CTable 特有属性 ===
  render?: (data: any, row: number, column: Column) => any
  children?: Column[]  // 嵌套列
}

// ============================================================================
// 单元格类型
// ============================================================================

export interface Cell {
  row?: number
  col?: number
  x: number
  y: number
  width?: number
  height?: number
  data?: any
  column?: Column
  type?: string
}

// ============================================================================
// 主题配置类型
// ============================================================================

export interface ThemeColors {
  primary: string
  secondary: string
  background: string
  header: string
  border: string
  text: string
  hover: string
  selected: string
  footer: string
  stripe?: string
  fixedShadow?: string
}

export interface ThemeFonts {
  header: { size: string; weight: string }
  cell: { size: string; weight: string }
  footer: { size: string; weight: string }
}

export interface ThemeSpacing {
  header: number
  cell: number
  border: number
  padding: number
}

export interface ThemeConfig {
  colors: ThemeColors
  fonts: ThemeFonts
  spacing: ThemeSpacing
}

export type ThemePreset = 'ant-design' | 'ant-design-dark' | 'element-plus' | 'element-plus-dark' | 'naive' | 'naive-dark'

// ============================================================================
// 表格 Props 类型（兼容 Ant Design Vue）
// ============================================================================

export interface CTableProps {
  // === 基础属性 ===
  dataSource?: any[]  // 兼容 Ant Design Vue (dataSource)
  data?: any[]        // 简化别名 (data)
  columns?: Column[]
  rowKey?: string | ((row: any) => string)

  // === 布局属性 ===
  bordered?: boolean
  showHeader?: boolean
  size?: 'large' | 'middle' | 'small'
  tableLayout?: 'auto' | 'fixed'

  // === 尺寸属性 ===
  width?: number
  height?: number

  // === 滚动属性 ===
  scroll?: {
    x?: number | string
    y?: number | string
  }

  // === 分页属性 ===
  pagination?: PaginationConfig | false

  // === 选择属性 ===
  rowSelection?: RowSelectionConfig

  // === 展开行属性 ===
  expandedRowKeys?: any[]
  expandRowByClick?: boolean
  defaultExpandAllRows?: boolean
  expandedRowRender?: (record: any) => any
  expandIcon?: (props: any) => any

  // === 树形数据属性 ===
  childrenColumnName?: string
  defaultExpandAllRows?: boolean
  indentSize?: number

  // === 排序/筛选变化 ===
  onChange?: (pagination: any, filters: any, sorter: any) => void

  // === CTable 特有属性 ===
  theme?: ThemePreset | ThemeConfig
  virtualScroll?: boolean
  renderer?: 'g2' | 'canvas'
  fixedColumns?: {
    left?: number
    right?: number
  }
  sortConfig?: Array<{
    field: string
    order: SortOrder
    sorter?: (a: any, b: any) => number
  }>
}

// ============================================================================
// 事件类型
// ============================================================================

export interface CTableEvents {
  // === 行事件 ===
  'row-click': [row: any, index: number, event: MouseEvent]
  'row-dblclick': [row: any, index: number, event: MouseEvent]
  'row-contextmenu': [row: any, index: number, event: MouseEvent]

  // === 单元格事件 ===
  'cell-click': [cell: any, row: any, column: Column]
  'header-click': [column: Column, event: MouseEvent]

  // === 选择事件 ===
  'select': [row: any, selected: boolean, rows: any[]]
  'select-all': [selected: boolean, rows: any[], changeRows: any[]]
  'selection-change': [selectedRows: any[], selectedKeys: any[]]

  // === 排序/筛选事件 ===
  'sort-change': [sorter: any]
  'filter-change': [filters: any]

  // === 滚动事件 ===
  'scroll': [event: { scrollTop: number; scrollLeft: number }]

  // === Table 变化事件（兼容 a-table） ===
  'change': [pagination: any, filters: any, sorter: any]

  // === 展开事件 ===
  'expand': [expanded: boolean, record: any]
}

// ============================================================================
// 渲染相关类型
// ============================================================================

export interface RenderTask {
  type: 'header' | 'cell' | 'grid'
  x?: number
  y?: number
  width?: number
  height?: number
  content?: string
  style?: any
}

export interface ScrollConfig {
  enabled: boolean
  itemSize: number
  buffer?: number
}

// ============================================================================
// 插件类型
// ============================================================================

export interface CTablePlugin {
  name: string
  version?: string
  install: (instance: any) => void
  uninstall?: (instance: any) => void
}
