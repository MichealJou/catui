export type SortOrder = 'asc' | 'desc' | null
export type FilterType = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'range' | 'list'

export interface FilterCondition {
  field: string
  type: FilterType
  value: any
  value2?: any
  options?: any[]
}

export interface Column {
  key: string
  title: string
  dataIndex?: string
  width?: number
  minWidth?: number
  maxWidth?: number
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  filterable?: boolean
  resizable?: boolean
  render?: (data: any, row: number, column: Column) => any
  children?: Column[]
  sorter?: (a: any, b: any) => number
}

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
  stripe?: string  // 斑马纹颜色（隔行变色）
  fixedShadow?: string  // 固定列阴影颜色
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

export interface SortConfig {
  field: string
  order: SortOrder
  sorter?: (a: any, b: any) => number
}

export interface TableProps {
  columns: Column[]
  data: any[]
  width?: number
  height?: number
  rowKey?: string
  theme?: ThemeConfig
  virtualScroll?: boolean
  selectable?: boolean
  selectableType?: 'single' | 'multiple'
  fixedColumns?: {
    left?: number
    right?: number
  }
  sortConfig?: SortConfig[]
}
