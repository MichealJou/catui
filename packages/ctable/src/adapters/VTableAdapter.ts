/**
 * VTableAdapter - VTable API 适配器
 * 将 CTable API 转换为 VTable API，保持用户 API 不变
 * 优化：让表格自动适应父容器
 */
import * as VTable from '@visactor/vtable'
import type {
  Column,
  ColumnResizeInfo,
  VTableAdapterOptions,
  SorterConfig,
  FilterConfig,
  ThemeConfig,
  RowSelectionConfig
} from '../types'
import {
  getVTableTheme,
  toVTableTheme,
  type ThemePreset,
  type ThemeMode
} from '../theme/vtable/index'

export interface VTableAdapterOptions {
  container: HTMLElement
  columns: Column[]
  data: any[]
  width?: number
  height?: number
  theme?: ThemeConfig
  rowKey?: string | ((row: any) => string)
  stripe?: boolean
  stripeColor?: string
  rowSelection?: RowSelectionConfig
  resizable?: boolean | ColumnResizeConfig
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
  }

  /**
   * 解析主题配置
   */
  private parseTheme(theme?: ThemeConfig | ThemePreset): { preset: ThemePreset; mode: ThemeMode } {
    // 默认主题
    const defaultPreset: ThemePreset = 'ant-design'
    const defaultMode: ThemeMode = 'light'

    if (!theme) {
      return { preset: defaultPreset, mode: defaultMode }
    }

    if (typeof theme === 'string') {
      // 预设主题（字符串形式）
      return { preset: theme as ThemePreset, mode: defaultMode }
    }

    // 对象形式配置
    const preset = (theme as any).preset as ThemePreset || defaultPreset
    const mode = (theme as any).mode || defaultMode

    return { preset, mode }
  }

  /**
   * 转换列配置为 VTable 格式
   */
  private convertColumns(columns: Column[]): any[] {
    return columns.map((col, index) => {
      // 复选框列
      if (col.key === '__checkbox__') {
        return {
          field: 'checkbox',
          title: '',
          width: col.width || 50,
          cellType: 'checkbox',
          // 不设置 headerType 避免显示三个点菜单图标
          headerType: undefined
        }
      }

      // 普通列
      return {
        field: col.key,
        title: col.title || '',
        width: col.width || 120,
        cellType: 'text'
      }
    })
  }

  /**
   * 转换数据格式
   */
  private convertData(data: any[]): any[] {
    // VTable 使用 records 数组格式
    return data
  }

  /**
   * 创建表格
   */
  create(): void {
    if (!this.container) return

    const vtableColumns = this.convertColumns(this.options.columns)
    const vtableData = this.convertData(this.options.data)

    // 不设置宽高，让 VTable 自动适应父容器
    const vtableOptions = { theme: this.parseTheme(this.options.theme) }

    this.table = new VTable.ListTable({
      container: this.container,
      columns: vtableColumns,
      data: vtableData,
      ...vtableOptions
    })
  }

  /**
   * 更新数据
   */
  updateData(data: any[]): void {
    if (!this.table) return
    this.table.setData(data)
  }

  /**
   * 更新列配置
   */
  updateColumns(columns: Column[]): void {
    if (!this.table) return
    this.table.setColumns(columns)
  }

  /**
   * 更新主题
   */
  updateTheme(theme: ThemeConfig | ThemePreset): void {
    if (!this.table) return

    const themeConfig = this.parseTheme(theme)
    this.table.setOptions(themeConfig)
  }

  /**
   * 设置斑马线
   */
  setStripe(enabled: boolean, color?: string): void {
    if (!this.table) return
    this.table.setOptions({ stripe: enabled, ...(color ? { stripe: { bgColor: color } } : {}) })
  }

  /**
   * 设置行选择
   */
  setRowSelection(selection: RowSelectionConfig): void {
    if (!this.table) return

    this.table.setOptions({
      rowSelection: {
        type: selection?.type || 'checkbox',
        selectedRows: selection?.selectedRowKeys || [],
        onChange: selection?.onChange
      }
    })
  }

  /**
   * 获取选中的行
   */
  getSelectedRows(): any[] {
    if (!this.table) return []
    return this.table.getSelectedRecords?.() || []
  }

  /**
   * 清除选择
   */
  clearSelection(): void {
    if (!this.table) return
    this.table.setSelectedRecords([])
  }

  /**
   * 刷新表格
   */
  refresh(): void {
    if (!this.table) return
    // VTable 会自动刷新数据
  }

  /**
   * 获取列宽
   */
  getColumnWidth(columnKey: string): number {
    return 120
  }

  /**
   * 获取所有列宽
   */
  getColumnWidths(): Map<string, number> {
    return new Map()
  }

  /**
   * 设置列宽
   */
  setColumnWidth(columnKey: string, width: number): void {
    // VTable 会自动处理列宽
  }

  /**
   * 销毁表格
   */
  destroy(): void {
    if (!this.table) return

    this.table.destroy()
    this.table = null
  }
}

/**
 * 创建 VTable 适配器实例
 */
export function createVTableAdapter(options: VTableAdapterOptions): VTableAdapter {
  return new VTableAdapter(options)
}
