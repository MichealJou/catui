export interface Column {
  key: string
  title: string
  dataIndex?: string
  width?: number
  minWidth?: number
  maxWidth?: number
  type?: 'data' | 'row' | 'column' | 'action'
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  sortable?: boolean
  filterable?: boolean
  editable?: boolean
  formatter?: (value: any) => string
  formatterParams?: any
  render?: (value: any, row: any, column: Column) => string | React.ReactNode
  children?: Column[]
  description?: string
}

export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    background: string
    header: string
    border: string
    text: string
    hover: string
    selected: string
    footer: string
  }
  fonts: {
    header: { size: string, weight: string }
    cell: { size: string, weight: string }
    footer: { size: string, weight: string }
  }
  spacing: {
    header: number
    cell: number
    border: number
    padding: number
  }
}

export interface TableProps {
  // 数据相关
  data: any[]
  columns: Column[]
  rowKey?: string
  
  // 尺寸相关
  width: number
  height: number
  maxHeight?: number
  minHeight?: number
  
  // 功能配置
  mode: 'grid' | 'tree' | 'compact'
  theme: 'default' | 'dark' | 'gray'
  showHeader?: boolean
  showFooter?: boolean
  bordered?: boolean
  loading?: boolean
  
  // 虚拟滚动
  virtual?: boolean
  
  // 分页
  pagination?: {
    current: number
    pageSize: number
    total: number
    showSizeChanger?: boolean
    showQuickJumper?: boolean
    showTotal?: boolean
    pageSizeOptions?: number[]
  }
  
  // 交互配置
  interactive: {
    hoverHighlight: boolean
    selectedCellHighlight: boolean
    rowSelection?: boolean
    columnSelection?: boolean
    cellEdit?: boolean
    dragDrop?: boolean
    multiSort?: boolean
  }
  
  // 工具栏配置
  toolbar?: {
    show: boolean
    tools: ('filter' | 'sort' | 'export' | 'setting' | 'fullScreen' | 'refresh')[]
    position?: 'top' | 'bottom' | 'right'
  }
  
  // 选择配置
  selection?: {
    type: 'single' | 'multiple'
    showSelectAll?: boolean
    selectedRowKeys?: string[]
    onChange?: (selectedKeys: string[]) => void
  }
  
  // 排序配置
  sort?: {
    field?: string
    direction?: 'asc' | 'desc'
    onChange?: (sortInfo: any) => void
  }
  
  // 筛选配置
  filter?: {
    showFilter?: boolean
    filters?: Record<string, any[]>
    onChange?: (filterInfo: any) => void
  }
  
  // 国际化
  locale?: string
  translations?: Record<string, string>
  
  // 事件回调
  onRowClick?: (row: any, index: number) => void
  onCellClick?: (cell: any, row: any, column: Column) => void
  onSelectionChange?: (selectedRows: any[], selectedKeys: string[]) => void
  onSortChange?: (sortInfo: any) => void
  onFilterChange?: (filterInfo: any) => void
  onPaginationChange?: (pagination: any) => void
  onScroll?: (scrollTop: number, scrollLeft: number) => void
  onToolbarClick?: (tool: string, event: MouseEvent) => void
}

export interface TableEmits {
  'row-click': [row: any, index: number]
  'cell-click': [cell: any, row: any, column: Column]
  'selection-change': [selectedRows: any[], selectedKeys: string[]]
  'sort-change': [sortInfo: any]
  'filter-change': [filterInfo: any]
  'pagination-change': [pagination: any]
  'scroll': [scrollTop: number, scrollLeft: number]
  'tool-click': [tool: string, event: MouseEvent]
  'data-change': [data: any[]]
  'columns-change': [columns: Column[]]
}

export interface S2TableState {
  data: any[]
  columns: Column[]
  selectedKeys: string[]
  sortInfo: any
  filterInfo: any
  pagination: any
  loading: boolean
  theme: string
}

export interface S2TableInstance {
  s2: any
  container: HTMLDivElement
  dataTransformer: any
  themeManager: any
  interactionManager: any
  performanceOptimizer: any
  
  // API 方法
  getData: () => any[]
  setData: (data: any[]) => void
  getSelectedRows: () => any[]
  getSelectedKeys: () => string[]
  selectRows: (keys: string[]) => void
  clearSelection: () => void
  sort: (field: string, direction: 'asc' | 'desc') => void
  filter: (filters: Record<string, any[]>) => void
  paginate: (pagination: any) => void
  setTheme: (theme: string) => void
  exportData: (format: 'csv' | 'xlsx' | 'json') => void
  refresh: () => void
  destroy: () => void
}

export interface S2Plugin {
  name: string
  version: string
  install: (instance: S2TableInstance) => void
  uninstall?: (instance: S2TableInstance) => void
}

export interface S2Options {
  width: number
  height: number
  mode: 'grid' | 'tree' | 'compact'
  theme: ThemeConfig
  debug?: boolean
  showHeader?: boolean
  showFooter?: boolean
  bordered?: boolean
  pagination?: any
  interaction?: any
  tooltip?: any
  scrollbar?: any
}