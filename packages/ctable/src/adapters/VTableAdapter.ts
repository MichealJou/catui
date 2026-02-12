/**
 * VTableAdapter - VTable API 适配器
 * 将 CTable API 转换为 VTable API，保持用户 API 不变
 */

import * as VTable from '@visactor/vtable'
import {
  getVTableTheme,
  toVTableTheme,
  type ThemeMode,
  type ThemePreset
} from '../theme/vtable/index'
import type {
  Column,
  ColumnResizeInfo,
  ThemePreset as CTableThemePreset,
  FilterOption,
  PaginationConfig,
  ResizeConfig,
  SorterConfig,
  SortOrder,
  ThemeConfig
} from '../types'

export interface VTableAdapterOptions {
  container: HTMLElement
  columns: Column[]
  data: any[]
  width: number
  height: number
  theme?: CTableThemePreset | ThemeConfig
  themeMode?: ThemeMode
  rowKey?: string | ((row: any) => string)
  rowSelection?: {
    type?: 'checkbox' | 'radio'
    selectedRowKeys?: any[]
    onChange?: (selectedRows: any[], selectedRowKeys: any[]) => void
  }
  sortable?: boolean | SorterConfig[]
  resizable?: boolean | ResizeConfig
  sortConfig?: Array<{
    field: string
    order: SortOrder
    sorter?: (a: any, b: any) => number
  }>
  filterConfig?: Array<{
    field: string
    filters: FilterOption[]
    onFilter?: (filters: any[]) => void
    filteredValue?: any[]
  }>
  pagination?: PaginationConfig
  onRowClick?: (row: any, index: number, event: Event) => void
  onCellClick?: (cell: any, row: any, column: Column, event: Event) => void
  onSortChange?: (sorter: any) => void
  onFilterChange?: (filters: any) => void
  onScroll?: (event: { scrollTop: number; scrollLeft: number }) => void
  onColumnResize?: (info: ColumnResizeInfo) => void
  onColumnResizeEnd?: (info: ColumnResizeInfo) => void
}

export class VTableAdapter {
  private table: any | null = null
  private container: HTMLElement
  private options: VTableAdapterOptions
  private currentTheme: ThemePreset = 'ant-design'
  private currentMode: ThemeMode = 'light'
  private columnWidths: Map<string, number> = new Map()

  constructor(options: VTableAdapterOptions) {
    this.options = options
    this.container = options.container
    const { preset, mode } = this.parseTheme(options.theme)
    this.currentTheme = preset
    this.currentMode = options.themeMode ?? mode
  }

  /**
   * 解析主题配置（支持 6 种主题格式）
   */
  private parseTheme(theme?: CTableThemePreset | ThemeConfig): {
    preset: ThemePreset
    mode: ThemeMode
  } {
    if (typeof theme === 'string') {
      if (theme.endsWith('-dark')) {
        const preset = theme.replace('-dark', '') as ThemePreset
        return { preset, mode: 'dark' }
      }
      return { preset: theme as ThemePreset, mode: 'light' }
    }
    return { preset: 'ant-design', mode: 'light' }
  }

  /**
   * 转换列配置为 VTable 格式
   */
  private convertColumns(columns: Column[]): any[] {
    return columns.map((col, index) => {
      // 处理复选框列
      if (col.key === '__checkbox__') {
        return {
          field: 'checkbox',
          title: '',
          width: col.width || 50,
          cellType: 'checkbox',
          headerType: 'checkbox',
          frozen:
            col.fixed === 'left'
              ? 'start'
              : col.fixed === 'right'
                ? 'end'
                : undefined
        }
      }

      const vtableCol: any = {
        field: col.key,
        title: col.title,
        width: this.columnWidths.get(col.key) ?? col.width ?? 120,
        // 字段对齐
        textAlign: col.align || 'left'
      }

      // 固定列
      if (col.fixed === 'left') {
        vtableCol.frozen = 'start'
      } else if (col.fixed === 'right') {
        vtableCol.frozen = 'end'
      }

      // 排序
      if (col.sortable || col.sorter) {
        vtableCol.sort = true
        // 设置排序方向
        if (col.sortOrder === 'ascend' || col.sortOrder === 'descend') {
          vtableCol.sortOrder = col.sortOrder === 'ascend' ? 'asc' : 'desc'
        }
        // 支持自定义排序函数
        if (col.sorter && typeof col.sorter === 'function') {
          vtableCol.sorter = col.sorter
        }
      }

      // 筛选
      if (col.filterable) {
        vtableCol.filter = true
        // 支持自定义筛选函数
        if (col.onFilter) {
          vtableCol.filter = col.onFilter
        }
        // 支持筛选选项
        if (col.filters && col.filters.length > 0) {
          vtableCol.filterOptions = col.filters.map(filter => ({
            value: filter.value,
            text: filter.text
          }))
        }
        if (col.filteredValue) {
          vtableCol.filterValue = col.filteredValue
        }
      }

      // 最小/最大宽度
      if (col.minWidth) {
        vtableCol.minWidth = col.minWidth
      }
      if (col.maxWidth) {
        vtableCol.maxWidth = col.maxWidth
      }

      // 自定义渲染
      if (col.customRender || col.render) {
        vtableCol.cellRenderer = (args: any) => {
          const { table, col: column, row, value } = args
          const renderFn = col.customRender || col.render
          if (typeof renderFn === 'function') {
            // render 函数签名: (data: any, row: number, column: Column) => any
            // customRender 函数签名: ({ value, record, index, column }: any) => any
            if (col.render) {
              return col.render(value, row, column)
            } else if (col.customRender) {
              return col.customRender({ value, row, column, index: 0 })
            }
          }
          return value
        }
      }

      return vtableCol
    })
  }

  /**
   * 解析 resizable 配置为 VTable 格式
   */
  private parseResizable(config?: boolean | ResizeConfig): any {
    if (!config) {
      return { enable: false }
    }

    if (config === true) {
      return { enable: true }
    }

    return {
      enable: config.enabled ?? true,
      minWidth: config.minWidth ?? 50,
      maxWidth: config.maxWidth ?? 1000
    }
  }

  /**
   * 转换数据为 VTable 格式
   */
  private convertData(data: any[]): any[] {
    if (!data) return []

    const selectedRowKeys = this.options.rowSelection?.selectedRowKeys
    // 使用 Set 优化 includes 查找性能（从 O(n) 到 O(1)）
    const selectedKeySet = selectedRowKeys ? new Set(selectedRowKeys) : null

    // VTable 使用数组格式，CTable 也是数组格式
    return data.map(row => {
      // 使用对象展开优化性能（避免 forEach）
      const result: any = { ...row }

      // 处理复选框状态 - 使用简单布尔值（性能更好）
      if (selectedKeySet) {
        const rowKey = this.getRowKey(row)
        const isChecked = selectedKeySet.has(rowKey)
        result.checkbox = isChecked  // ✅ 只用 checked 布尔值
      } else {
        // 如果没有行选择配置，设置为 false
        result.checkbox = false  // ✅ 默认 false
      }

      return result
    })
  }

  /**
   * 获取行唯一标识
   */
  private getRowKey(row: any): string {
    if (typeof this.options.rowKey === 'function') {
      return this.options.rowKey(row)
    }
    const key = this.options.rowKey || 'id'
    return String(row[key])
  }

  /**
   * 创建表格
   */
  create() {
    // 转换配置
    const vtableColumns = this.convertColumns(this.options.columns)
    const vtableData = this.convertData(this.options.data)
    const themeConfig = getVTableTheme(this.currentTheme, this.currentMode)
    const vtableTheme = toVTableTheme(themeConfig)

    // 计算固定列数量
    const frozenColCount = this.options.columns.filter(
      c => c.fixed === 'left'
    ).length
    const frozenColEndCount = this.options.columns.filter(
      c => c.fixed === 'right'
    ).length

    // 创建 VTable - 使用正确的 API 格式
    this.table = new VTable.ListTable({
      container: this.container,
      // VTable 使用 records 而不是 data
      records: vtableData,
      columns: vtableColumns,

      // 尺寸
      width: this.options.width,
      height: this.options.height,

      // 固定列
      frozenColCount,
      frozenColEndCount,

      // 主题
      theme: vtableTheme,

      // 虚拟滚动
      virtual: true,

      // 列宽拖拽调整
      columnResize: this.parseResizable(this.options.resizable),

      // 复选框配置
      select: {
        checkbox: this.options.rowSelection?.type === 'checkbox',
        headerCheckbox: this.options.rowSelection?.type === 'checkbox',
        clickArea: 'cell'
      },

      // 排序配置
      sort: this.options.sortConfig
        ? {
            mode: 'multiple',
            multiple: this.options.sortConfig.length > 1
          }
        : false,

      // 筛选配置
      filter: {
        multiple: this.options.columns.some(
          col => col.filterable && col.filters && col.filters.length > 0
        ),
        filterChange: this.options.onFilterChange
          ? (filter: any) => {
              this.options.onFilterChange?.(filter)
            }
          : undefined
      },

      // 分页配置
      pagination: this.options.pagination
        ? {
            pageSize: this.options.pagination.pageSize || 10,
            current: this.options.pagination.current || 1,
            total: this.options.data.length
          }
        : false,

      // 事件监听
      listeners: {
        // 点击单元格
        cellClick: (args: any) => {
          const { rowData, col: columnData } = args
          if (this.options.onCellClick) {
            const column = this.options.columns.find(
              c => c.key === columnData.field
            )
            if (column) {
              this.options.onCellClick(
                args,
                rowData,
                column,
                args.originalEvent
              )
            }
          }
        },

        // 点击行
        rowClick: (args: any) => {
          const { rowData } = args
          if (this.options.onRowClick) {
            this.options.onRowClick(rowData, 0, args.originalEvent)
          }
        },

        // 滚动事件
        scroll: (args: any) => {
          if (this.options.onScroll) {
            this.options.onScroll({
              scrollTop: args.scrollTop,
              scrollLeft: args.scrollLeft
            })
          }
        },

        // 列宽调整事件
        resize_column: (args: any) => {
          const { col, width } = args
          const column = this.options.columns[col]
          if (column) {
            const defaultWidth =
              typeof column.width === 'number' ? column.width : 120
            const oldWidth = this.columnWidths.get(column.key) ?? defaultWidth
            this.columnWidths.set(column.key, width)

            if (this.options.onColumnResize) {
              this.options.onColumnResize({
                column: column.key,
                columnIndex: col,
                oldWidth,
                newWidth: width
              })
            }
          }
        },

        // 复选框选择事件
        checkbox_change: (_args: any) => {
          if (this.options.rowSelection?.onChange) {
            const currentRecords = this.table.getRecords()
            const selectedKeys: any[] = []
            const selectedRows: any[] = []

            currentRecords.forEach((record: any) => {
              if (record.checkbox) {
                const rowKey = this.getRowKey(record)
                selectedKeys.push(rowKey)
                selectedRows.push(record)
              }
            })

            this.options.rowSelection.onChange(selectedRows, selectedKeys)
          }
        },

        // 选中行变化事件
        checkbox_state_change: (args: any) => {
          if (this.options.rowSelection?.onChange) {
            const { records } = args
            const selectedKeys: any[] = []
            const selectedRows: any[] = []

            if (records && Array.isArray(records)) {
              records.forEach((record: any) => {
                const rowKey = this.getRowKey(record)
                selectedKeys.push(rowKey)
                selectedRows.push(record)
              })
            }

            this.options.rowSelection.onChange(selectedRows, selectedKeys)
          }
        }
      }
    } as any)

    // 表格创建后
    return this
  }

  /**
   * 更新数据
   */

  /**
   * 更新数据
   */
  updateData(data: any[]) {
    if (!this.table) return

    const vtableData = this.convertData(data)
    this.table.setRecords(vtableData)
  }

  /**
   * 更新列配置
   */
  updateColumns(columns: Column[]) {
    if (!this.table) return

    // VTable 暂不支持动态更新列，需要重新创建
    // 这里先保存配置，下次刷新时生效
    this.options.columns = columns
  }

  /**
   * 更新主题
   */
  updateTheme(theme: CTableThemePreset | ThemeConfig, mode?: ThemeMode) {
    if (!this.table) return

    const { preset, mode: parsedMode } = this.parseTheme(theme)
    this.currentTheme = preset
    this.currentMode = mode ?? parsedMode

    // VTable 主题更新需要重新创建表格
    // 暂时先保存配置，下次刷新时生效
  }

  /**
   * 获取选中的行
   */
  getSelectedRows(): any[] {
    // VTable 的选择状态管理需要通过事件监听实现
    // 这里返回空数组，实际使用时需要通过 onChange 回调获取
    return []
  }

  /**
   * 设置选中的行
   */
  setSelectedRows(selectedRowKeys: any[]) {
    // VTable 的选择状态更新需要更新数据中的 checkbox 字段
    if (!this.table) return

    const data = this.convertData(this.options.data)
    data.forEach((row: any) => {
      const rowKey = this.getRowKey(row)
      row.checkbox = selectedRowKeys.includes(rowKey)
    })

    this.table.setRecords(data)
  }

  /**
   * 清除筛选
   */
  clearFilters() {
    console.log('VTableAdapter: clearFilters called')
    if (!this.table) return
  }

  /**
   * 获取列宽
   */
  getColumnWidth(columnKey: string): number {
    const stored = this.columnWidths.get(columnKey)
    if (stored !== undefined) return stored

    const column = this.options.columns.find(c => c.key === columnKey)
    if (column && typeof column.width === 'number') {
      return column.width
    }
    return 120
  }

  /**
   * 获取所有列宽
   */
  getColumnWidths(): Map<string, number> {
    return new Map(this.columnWidths)
  }

  /**
   * 设置列宽
   */
  setColumnWidth(columnKey: string, width: number): void {
    if (!this.table) return

    this.columnWidths.set(columnKey, width)

    const colIndex = this.options.columns.findIndex(c => c.key === columnKey)
    if (colIndex >= 0) {
      this.table.setColumnWidth(colIndex, width)
    }
  }

  /**
   * 销毁表格
   */
  destroy() {
    if (this.table) {
      try {
        // VTable 1.23.2 可能没有 destroy 方法
        // @ts-ignore - 尝试调用 destroy 方法
        if (typeof this.table.destroy === 'function') {
          this.table.destroy()
        }
      } catch (e) {
        // 忽略错误
      }
      // 清空容器
      this.container.innerHTML = ''
      this.table = null
    }
  }
}

/**
 * 创建 VTable 适配器实例
 */
export function createVTableAdapter(
  options: VTableAdapterOptions
): VTableAdapter {
  const adapter = new VTableAdapter(options)
  adapter.create()
  return adapter
}
