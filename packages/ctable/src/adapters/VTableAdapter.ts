/**
 * VTableAdapter - VTable API 适配器
 * 将 CTable API 转换为 VTable API，保持用户 API 不变
 */

import * as VTable from '@visactor/vtable'
import type { Column } from '../types'
import type { ThemeConfig } from '../theme'
import { getVTableTheme, toVTableTheme, type ThemePreset, type ThemeMode } from '../theme/vtable/index'

export interface VTableAdapterOptions {
  container: HTMLElement
  columns: Column[]
  data: any[]
  width: number
  height: number
  theme?: ThemePreset | ThemeConfig
  themeMode?: ThemeMode
  rowKey?: string | ((row: any) => string)
  rowSelection?: {
    type?: 'checkbox' | 'radio'
    selectedRowKeys?: any[]
    onChange?: (selectedRows: any[], selectedKeys: any[]) => void
  }
  onRowClick?: (row: any, index: number, event: Event) => void
  onCellClick?: (cell: any, row: any, column: Column, event: Event) => void
  onSortChange?: (sorter: any) => void
  onFilterChange?: (filters: any) => void
  onScroll?: (event: { scrollTop: number; scrollLeft: number }) => void
}

export class VTableAdapter {
  private table: any | null = null
  private container: HTMLElement
  private options: VTableAdapterOptions
  private currentTheme: ThemePreset = 'ant-design'
  private currentMode: ThemeMode = 'light'

  constructor(options: VTableAdapterOptions) {
    this.options = options
    this.container = options.container
    this.currentTheme = this.parseTheme(options.theme)
    this.currentMode = options.themeMode || 'light'
  }

  /**
   * 解析主题配置
   */
  private parseTheme(theme?: ThemePreset | ThemeConfig): ThemePreset {
    if (typeof theme === 'string') {
      return theme as ThemePreset
    }
    return 'ant-design'
  }

  /**
   * 转换列配置为 VTable 格式
   */
  private convertColumns(columns: Column[]): any[] {
    return columns.map(col => {
      const vtableCol: any = {
        field: col.key,
        title: col.title,  // VTable 使用 title
        width: col.width || 120
      }

      // 固定列 - VTable 使用 frozen: 'start' | 'end'
      if (col.fixed === 'left') {
        vtableCol.frozen = 'start'
      } else if (col.fixed === 'right') {
        vtableCol.frozen = 'end'
      }

      // 排序
      if (col.sortable || col.sorter) {
        vtableCol.sort = true
      }

      // 自定义渲染
      if (col.customRender || col.render) {
        vtableCol.cellRenderer = (args: any) => {
          const { table, col: column, row, value } = args
          const renderFn = col.customRender || col.render
          if (typeof renderFn === 'function') {
            return renderFn({ value, row, column, index: 0 })
          }
          return value
        }
      }

      return vtableCol
    })
  }

  /**
   * 转换数据为 VTable 格式
   */
  private convertData(data: any[]): any[] {
    if (!data) return []

    // VTable 使用数组格式，CTable 也是数组格式
    // 但需要处理行选择列
    return data.map((row, index) => {
      const result: any = {}

      // 复制所有字段
      Object.keys(row).forEach(key => {
        result[key] = row[key]
      })

      // 如果有选择列，添加 __selected__ 字段
      if (this.options.rowSelection?.selectedRowKeys) {
        const rowKey = this.getRowKey(row)
        result.__selected__ = this.options.rowSelection.selectedRowKeys.includes(rowKey)
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
    const frozenColCount = this.options.columns.filter(c => c.fixed === 'left').length
    const frozenColEndCount = this.options.columns.filter(c => c.fixed === 'right').length

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

      // 事件监听
      listeners: {
        // 点击单元格
        cellClick: (args: any) => {
          const { rowData, col: columnData } = args
          if (this.options.onCellClick) {
            const column = this.options.columns.find(c => c.key === columnData.field)
            if (column) {
              this.options.onCellClick(args, rowData, column, args.originalEvent)
            }
          }
        },

        // 点击行
        rowClick: (args: any) => {
          const { rowData } = args
          if (this.options.onRowClick) {
            // VTable 的 rowData 可能包含索引信息，这里暂时传 0
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
        }
      }
    } as any)

    return this
  }

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

    const vtableColumns = this.convertColumns(columns)
    // VTable 暂不支持动态更新列，需要重新创建
    // 这里先保存配置，下次刷新时生效
    this.options.columns = columns
  }

  /**
   * 更新主题
   */
  updateTheme(theme: ThemePreset | ThemeConfig, mode?: ThemeMode) {
    if (!this.table) return

    this.currentTheme = this.parseTheme(theme)
    this.currentMode = mode || this.currentMode

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
    // VTable 的选择状态更新需要更新数据中的 __selected__ 字段
    if (!this.table) return

    const data = this.convertData(this.options.data)
    data.forEach((row: any) => {
      const rowKey = this.getRowKey(row)
      row.__selected__ = selectedRowKeys.includes(rowKey)
    })

    this.table.setRecords(data)
  }

  /**
   * 清除筛选
   */
  clearFilters() {
    // VTable 的筛选清除需要重置筛选状态
    // 暂时先记录日志，VTable 的筛选 API 需要进一步研究
    console.log('VTableAdapter: clearFilters called')
    if (!this.table) return

    // TODO: 实现 VTable 的筛选清除逻辑
    // 可能需要调用 VTable 的 filter API 或重新渲染无筛选状态的数据
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
export function createVTableAdapter(options: VTableAdapterOptions): VTableAdapter {
  const adapter = new VTableAdapter(options)
  adapter.create()
  return adapter
}
