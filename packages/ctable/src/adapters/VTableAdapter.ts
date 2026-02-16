/**
 * VTableAdapter - VTable API 适配器
 * 将 CTable API 转换为 VTable API，保持用户 API 不变
 */
import * as VTable from '@visactor/vtable'
import type {
  Column,
  ColumnResizeInfo,
  ResizeConfig,
  SorterConfig,
  ThemeConfig,
  RowSelectionConfig
} from '../types'
import {
  getVTableTheme,
  type ThemePreset,
  type ThemeMode
} from '../theme/vtable/index'

export interface VTableAdapterOptions {
  container: HTMLElement
  columns: Column[]
  data: any[]
  width?: number
  height?: number
  theme?: ThemeConfig | ThemePreset
  rowKey?: string | ((row: any) => string)
  stripe?: boolean
  stripeColor?: string
  bordered?: boolean
  rowSelection?: RowSelectionConfig
  resizable?: boolean | ResizeConfig
  onRowClick?: (row: any, index: number, event: any) => void
  onCellClick?: (cell: any, row: any, column: any, event: any) => void
  onSortChange?: (sorter: SorterConfig) => void
  onFilterChange?: (filters: any[]) => void
  onScroll?: (event: any) => void
  onColumnResize?: (info: ColumnResizeInfo) => void
  onColumnResizeEnd?: (info: ColumnResizeInfo) => void
}

export class VTableAdapter {
  private table: any | null = null
  private container: HTMLElement
  private options: VTableAdapterOptions
  private hasRowCheckbox = false
  private isApplyingSelection = false
  private bodyBgColor = '#ffffff'
  private fieldColumnMap = new Map<string, Column>()
  private activeFilters = new Map<string, Set<any>>()

  private normalizeSortOrder(order: unknown): 'asc' | 'desc' | 'normal' {
    const normalized = String(order ?? '').toLowerCase()
    if (normalized === 'asc' || normalized === 'ascend') return 'asc'
    if (normalized === 'desc' || normalized === 'descend') return 'desc'
    return 'normal'
  }

  private shallowEqualKeys(a?: any[], b?: any[]) {
    if (a === b) return true
    if (!a || !b) return false
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  private getFrozenCounts(columns: Column[]) {
    const normalized = columns.filter(col => col.key !== '__checkbox__')

    let left = 0
    for (const col of normalized) {
      if (col.fixed === 'left') {
        left += 1
      } else {
        break
      }
    }

    let right = 0
    for (let i = normalized.length - 1; i >= 0; i -= 1) {
      if (normalized[i].fixed === 'right') {
        right += 1
      } else {
        break
      }
    }

    if (this.hasRowCheckbox) {
      left += 1
    }

    return { left, right }
  }

  private fieldKey(field: unknown): string {
    if (Array.isArray(field)) {
      return field.map(v => String(v)).join('.')
    }
    return String(field ?? '')
  }

  private getColumnField(column: Column): string {
    const dataIndex = (column as any).dataIndex
    if (Array.isArray(dataIndex) && dataIndex.length > 0) {
      return String(dataIndex[0])
    }
    if (typeof dataIndex === 'string' && dataIndex.length > 0) {
      return dataIndex
    }
    return String(column.key)
  }

  private emitFilterChange(): void {
    if (!this.options.onFilterChange) return
    const filters = Array.from(this.activeFilters.entries()).map(([field, values]) => ({
      field,
      values: Array.from(values)
    }))
    this.options.onFilterChange(filters)
  }

  private bindTableEvents(): void {
    if (!this.table) return

    this.table.on?.('scroll', (event: any) => {
      this.options.onScroll?.(event)
    })

    this.table.on?.('sort_click', (event: any) => {
      const field = this.fieldKey(event?.field)
      const column = this.fieldColumnMap.get(field)
      const normalizedOrder = this.normalizeSortOrder(event?.order)
      const order = normalizedOrder === 'normal' ? null : normalizedOrder

      // 只更新排序图标状态，不让 VTable 内部再次排序，避免与 CTable 的数据管线冲突。
      if (typeof this.table.updateSortState === 'function') {
        this.table.updateSortState(
          {
            field,
            order: normalizedOrder
          },
          false
        )
      }

      this.options.onSortChange?.({
        field,
        order,
        sorter: typeof column?.sorter === 'function' ? column.sorter : undefined
      })

      return false
    })

    this.table.on?.('dropdown_menu_click', (event: any) => {
      const field =
        this.fieldKey(event?.field)
        || this.fieldKey(this.table.getHeaderField?.(Number(event?.col ?? -1), Number(event?.row ?? -1)))
      if (!field) return
      const selected = this.activeFilters.get(field) || new Set<any>()
      const menuKey = String(event?.menuKey ?? event?.value ?? event?.text ?? '')
      if (!menuKey) return
      const shouldSelect =
        typeof event?.highlight === 'boolean'
          ? event.highlight
          : !selected.has(menuKey)
      if (shouldSelect) {
        selected.add(menuKey)
      } else {
        selected.delete(menuKey)
      }
      this.activeFilters.set(field, selected)
      this.emitFilterChange()
    })

    this.table.on?.('dropdown_menu_clear', (event: any) => {
      const col = Number(event?.col ?? -1)
      const row = Number(event?.row ?? -1)
      const field = this.fieldKey(this.table.getHeaderField?.(col, row))
      if (!field) return
      this.activeFilters.delete(field)
      this.emitFilterChange()
    })
  }

  constructor(options: VTableAdapterOptions) {
    this.options = options
    this.container = options.container
  }

  private disposeTableInstance(): void {
    if (!this.table) return

    const instance: any = this.table
    try {
      if (typeof instance.release === 'function') {
        instance.release()
      } else if (typeof instance.destroy === 'function') {
        instance.destroy()
      } else if (typeof instance.dispose === 'function') {
        instance.dispose()
      }
    } finally {
      this.table = null
      this.isApplyingSelection = false
    }
  }

  /**
   * 解析主题配置
   */
  private parseTheme(theme?: ThemeConfig | ThemePreset): { preset: ThemePreset; mode: ThemeMode } {
    const defaultPreset: ThemePreset = 'ant-design'
    const defaultMode: ThemeMode = 'light'

    if (!theme) {
      return { preset: defaultPreset, mode: defaultMode }
    }

    if (typeof theme === 'string') {
      const preset = theme as ThemePreset
      const mode: ThemeMode = preset.endsWith('-dark') ? 'dark' : defaultMode
      return { preset, mode }
    }

    const preset = (theme as any).preset as ThemePreset || defaultPreset
    const mode = (theme as any).mode || defaultMode

    return { preset, mode }
  }

  private buildRuntimeTheme(theme?: ThemeConfig | ThemePreset) {
    const themeConfig = this.parseTheme(theme)
    const baseTheme = getVTableTheme(themeConfig.preset, themeConfig.mode)
    const colors = baseTheme?.colors || {}
    const fonts = baseTheme?.fonts || {}
    const sizes = baseTheme?.sizes || {}

    const borderWidth = this.options.bordered === false ? 0 : (sizes.borderWidth ?? 1)
    const borderColor = this.options.bordered === false ? 'transparent' : (colors.cellBorderColor ?? colors.borderColor ?? '#e5e7eb')

    const plainBg = colors.bgColor ?? '#ffffff'
    this.bodyBgColor = plainBg
    const stripedBg = this.options.stripeColor ?? baseTheme?.stripeColor ?? '#fafafa'
    const bodyBg =
      this.options.stripe === false
        ? plainBg
        : (args: any) => {
            const frozenRowCount = Number(args?.table?.frozenRowCount ?? 0)
            const row = Number(args?.row ?? 0)
            return ((row - frozenRowCount) & 1) === 1 ? stripedBg : plainBg
          }

    return {
      underlayBackgroundColor: plainBg,
      defaultStyle: {
        bgColor: plainBg,
        color: colors.textColor ?? 'rgba(0,0,0,0.88)',
        borderColor,
        borderLineWidth: borderWidth,
        fontSize: fonts.fontSize ?? 14,
        fontFamily: fonts.fontFamily ?? 'sans-serif',
        fontWeight: fonts.cellFontWeight ?? 400,
        lineHeight: fonts.lineHeight ?? 1.5,
        padding: [sizes.cellPaddingVertical ?? 12, sizes.cellPaddingHorizontal ?? 8]
      },
      headerStyle: {
        bgColor: colors.headerBgColor ?? '#f7f7f7',
        color: colors.headerTextColor ?? 'rgba(0,0,0,0.88)',
        borderColor,
        borderLineWidth: borderWidth,
        fontSize: fonts.headerFontSize ?? fonts.fontSize ?? 14,
        fontFamily: fonts.fontFamily ?? 'sans-serif',
        fontWeight: fonts.headerFontWeight ?? 600,
        lineHeight: fonts.headerLineHeight ?? fonts.lineHeight ?? 1.5,
        padding: [sizes.headerPaddingVertical ?? 12, sizes.headerPaddingHorizontal ?? 8]
      },
      rowHeaderStyle: {
        bgColor: colors.headerBgColor ?? '#f7f7f7',
        color: colors.headerTextColor ?? 'rgba(0,0,0,0.88)',
        borderColor,
        borderLineWidth: borderWidth,
        fontSize: fonts.headerFontSize ?? fonts.fontSize ?? 14,
        fontFamily: fonts.fontFamily ?? 'sans-serif',
        fontWeight: fonts.headerFontWeight ?? 600,
        lineHeight: fonts.headerLineHeight ?? fonts.lineHeight ?? 1.5,
        padding: [sizes.headerPaddingVertical ?? 12, sizes.headerPaddingHorizontal ?? 8]
      },
      bodyStyle: {
        bgColor: bodyBg,
        color: colors.textColor ?? 'rgba(0,0,0,0.88)',
        borderColor,
        borderLineWidth: borderWidth,
        fontSize: fonts.fontSize ?? 14,
        fontFamily: fonts.fontFamily ?? 'sans-serif',
        fontWeight: fonts.cellFontWeight ?? 400,
        lineHeight: fonts.lineHeight ?? 1.5,
        padding: [sizes.cellPaddingVertical ?? 12, sizes.cellPaddingHorizontal ?? 8],
        hover: {
          cellBgColor: colors.hoverColor ?? 'rgba(0,0,0,0.03)'
        }
      },
      frameStyle: {
        borderColor,
        borderLineWidth: borderWidth,
        cornerRadius: sizes.borderRadius ?? 0
      },
      selectionStyle: {
        cellBgColor: colors.selectColor ?? '#e6f4ff',
        cellBorderColor: colors.selectBorderColor ?? colors.primaryColor ?? '#1677ff',
        cellBorderLineWidth: 1
      },
      frozenColumnLine: {
        shadow: {
          width: baseTheme?.frozenColumn?.shadowSize ?? 4,
          startColor: baseTheme?.frozenColumn?.shadowColor ?? 'rgba(0,0,0,0.06)',
          endColor: 'rgba(0,0,0,0)',
          visible: 'always'
        }
      },
      scrollStyle: {
        scrollRailColor: 'rgba(0,0,0,0.08)',
        scrollSliderColor: 'rgba(0,0,0,0.22)',
        scrollSliderCornerRadius: 4,
        width: 8
      }
    }
  }

  /**
   * 转换列配置为 VTable 格式
   */
  private convertColumns(columns: Column[], containerWidth?: number): any[] {
    const normalizedColumns = columns.filter(col => col.key !== '__checkbox__')
    this.hasRowCheckbox = columns.some(col => col.key === '__checkbox__')
    this.fieldColumnMap.clear()
    this.activeFilters.clear()

    const vtableColumns = normalizedColumns.map((col) => {
      const dataIndex = Array.isArray((col as any).dataIndex)
        ? (col as any).dataIndex[0]
        : (col as any).dataIndex
      const field = typeof dataIndex === 'string' && dataIndex.length > 0 ? dataIndex : col.key
      const columnDef: any = {
        field,
        title: col.title || '',
        width: col.width || 120,
        frozen: col.fixed === 'left' ? 'start' : col.fixed === 'right' ? 'end' : undefined
      }
      this.fieldColumnMap.set(this.fieldKey(field), col)

      if (col.sortable || col.sorter) {
        columnDef.showSort = true
        columnDef.sort =
          typeof col.sorter === 'function'
            ? (a: any, b: any, order: string) => {
                const result = col.sorter?.(a, b) ?? 0
                return order === 'desc' ? -result : result
              }
            : true
      }

      if (Array.isArray(col.filters) && col.filters.length > 0) {
        columnDef.dropDownMenu = col.filters.map(option => ({
          text: option.text,
          menuKey: String(option.value)
        }))
      }

      if (Array.isArray(col.filteredValue) && col.filteredValue.length > 0) {
        this.activeFilters.set(
          this.getColumnField(col),
          new Set(col.filteredValue.map(v => String(v)))
        )
      }

      if (col.align) {
        columnDef.style = {
          ...(columnDef.style || {}),
          textAlign: col.align
        }
      }

      if (typeof col.render === 'function') {
        const render = col.render
        columnDef.fieldFormat = (record: any, _col?: number, row?: number) => {
          return render(record, Number(row ?? 0), col)
        }
      }

      if (this.options.stripe === false) {
        columnDef.style = {
          ...(columnDef.style || {}),
          bgColor: this.bodyBgColor
        }
      }

      return columnDef
    })

    // 列宽不足容器时，自动补齐剩余空间，避免右侧留白。
    if (!containerWidth || containerWidth <= 0 || vtableColumns.length === 0) {
      return vtableColumns
    }

    const numericWidth = (w: unknown) => (typeof w === 'number' ? w : 0)
    const totalWidth = vtableColumns.reduce((sum, col) => sum + numericWidth(col.width), 0)
    const remain = Math.floor(containerWidth - totalWidth)
    if (remain <= 0) {
      return vtableColumns
    }

    const flexibleCols = vtableColumns.filter((col, index) => {
      const source = normalizedColumns[index]
      return source.width == null
    })
    const targets = flexibleCols.length > 0
      ? flexibleCols
      : vtableColumns.filter((_, index) => normalizedColumns[index].key !== '__checkbox__')

    if (targets.length === 0) {
      return vtableColumns
    }

    const extra = Math.floor(remain / targets.length)
    const remainder = remain % targets.length
    targets.forEach((col, index) => {
      col.width = numericWidth(col.width) + extra + (index < remainder ? 1 : 0)
    })

    return vtableColumns
  }

  private getRowKey(record: any): any {
    const rowKey = this.options.rowKey
    if (typeof rowKey === 'function') {
      return rowKey(record)
    }
    if (typeof rowKey === 'string') {
      return record?.[rowKey]
    }
    return record?.id
  }

  private getRowIndexByRecordIndex(recordIndex: number): number {
    if (!this.table) return recordIndex + 1
    if (typeof this.table.getRecordStartRowByRecordIndex === 'function') {
      return this.table.getRecordStartRowByRecordIndex(recordIndex)
    }
    return recordIndex + 1
  }

  private syncSelectionFromTable(triggerChange = true): void {
    if (!this.table || !this.hasRowCheckbox || !this.options.rowSelection) return

    const selectedKeys: any[] = []
    const selectedRows: any[] = []

    this.options.data.forEach((record, recordIndex) => {
      const row = this.getRowIndexByRecordIndex(recordIndex)
      const checked = this.table.getCellCheckboxState?.(0, row) === true
      if (checked) {
        selectedRows.push(record)
        selectedKeys.push(this.getRowKey(record))
      }
    })

    this.options.rowSelection.selectedRowKeys = selectedKeys
    if (triggerChange) {
      this.options.rowSelection.onChange?.(selectedKeys, selectedRows)
    }
  }

  private applySelectedKeys(keys: any[], triggerChange = false): void {
    if (!this.table || !this.hasRowCheckbox) return

    this.isApplyingSelection = true
    const keySet = new Set(keys ?? [])
    this.options.data.forEach((record, recordIndex) => {
      const row = this.getRowIndexByRecordIndex(recordIndex)
      const checked = keySet.has(this.getRowKey(record))
      const currentChecked = this.table.getCellCheckboxState?.(0, row) === true
      if (currentChecked !== checked) {
        this.table.setCellCheckboxState?.(0, row, checked)
      }
    })
    this.isApplyingSelection = false

    this.syncSelectionFromTable(triggerChange)
  }

  private bindSelectionEvents(): void {
    if (!this.table || !this.hasRowCheckbox || !this.options.rowSelection) return

    this.table.on?.('checkbox_state_change', () => {
      if (this.isApplyingSelection) return
      this.syncSelectionFromTable(true)
    })

    this.applySelectedKeys(this.options.rowSelection.selectedRowKeys || [], false)
  }

  /**
   * 创建表格
   */
  create(): void {
    if (!this.container) return
    // 防止重复 create 导致旧实例残留与事件叠加
    this.disposeTableInstance()

    const containerWidth = this.options.width || this.container.clientWidth
    const containerHeight = this.options.height || this.container.clientHeight
    const vtableColumns = this.convertColumns(this.options.columns, containerWidth)

    const vtableTheme = this.buildRuntimeTheme(this.options.theme)

    const listTableOptions: any = {
      container: this.container,
      width: containerWidth,
      height: containerHeight,
      records: this.options.data,
      columns: vtableColumns,
      theme: vtableTheme,
      // 避免点击单元格进入编辑态导致文本被编辑层覆盖
      editCellTrigger: 'api',
      // 关闭单元格选中高亮，保持与三大 UI 表格点击行为一致
      select: {
        disableSelect: true,
        disableHeaderSelect: true,
        disableDragSelect: true
      },
      customConfig: {
        selectCellWhenCellEditorNotExists: false
      }
    }

    const frozenCounts = this.getFrozenCounts(this.options.columns)
    if (frozenCounts.left > 0) {
      listTableOptions.frozenColCount = frozenCounts.left
    }
    if (frozenCounts.right > 0) {
      listTableOptions.rightFrozenColCount = frozenCounts.right
    }

    if (this.hasRowCheckbox) {
      const checkboxColumnWidth =
        typeof this.options.rowSelection?.columnWidth === 'number'
          ? this.options.rowSelection.columnWidth
          : 52
      listTableOptions.rowSeriesNumber = {
        title: '',
        width: checkboxColumnWidth,
        headerType: 'checkbox',
        cellType: this.options.rowSelection?.type === 'radio' ? 'radio' : 'checkbox',
        format: () => '',
        dragOrder: false,
        style: {
          textAlign: 'center',
          padding: [0, 0, 0, 0],
          ...(this.options.stripe === false ? { bgColor: this.bodyBgColor } : {})
        },
        headerStyle: {
          textAlign: 'center',
          padding: [0, 0, 0, 0]
        }
      }
      listTableOptions.enableCheckboxCascade = true
      listTableOptions.enableHeaderCheckboxCascade = true
    }

    this.table = new VTable.ListTable(listTableOptions)
    const initialSortColumn = this.options.columns.find(col => {
      const order = this.normalizeSortOrder(col.sortOrder)
      return order === 'asc' || order === 'desc'
    })
    if (initialSortColumn && typeof this.table.updateSortState === 'function') {
      this.table.updateSortState(
        {
          field: this.getColumnField(initialSortColumn),
          order: this.normalizeSortOrder(initialSortColumn.sortOrder)
        },
        false
      )
    }
    this.bindTableEvents()
    this.bindSelectionEvents()
  }

  /**
   * 更新数据
   */
  updateData(data: any[]): void {
    this.options.data = data
    if (!this.table) return
    this.isApplyingSelection = true
    this.table.setRecords(data)
    if (typeof this.table.renderWithRecreateCells === 'function') {
      this.table.renderWithRecreateCells()
    } else if (typeof this.table.render === 'function') {
      this.table.render()
    }
    this.isApplyingSelection = false
    if (this.hasRowCheckbox) {
      this.applySelectedKeys(this.options.rowSelection?.selectedRowKeys || [], false)
    }
  }

  /**
   * 更新列配置
   */
  updateColumns(columns: Column[]): void {
    this.options.columns = columns
    if (!this.table) return

    const containerWidth = this.options.width || this.container.clientWidth
    const vtableColumns = this.convertColumns(columns, containerWidth)
    if (typeof this.table.setColumns === 'function') {
      this.table.setColumns(vtableColumns)
      return
    }

    this.destroy()
    this.create()
  }

  /**
   * 更新主题
   */
  updateTheme(theme?: ThemeConfig | ThemePreset): void {
    this.options.theme = theme
    if (!this.table) return

    const vtableTheme = this.buildRuntimeTheme(theme)

    if (typeof this.table.setTheme === 'function') {
      this.table.setTheme(vtableTheme)
      return
    }

    this.destroy()
    this.create()
  }

  /**
   * 更新斑马纹配置
   */
  updateStripe(stripe?: boolean, stripeColor?: string): void {
    this.options.stripe = stripe
    this.options.stripeColor = stripeColor
    // 斑马线开关在部分版本 setTheme 下会出现状态残留，直接重建保证结果一致。
    this.destroy()
    this.create()
  }

  /**
   * 更新边框配置
   */
  updateBordered(bordered?: boolean): void {
    this.options.bordered = bordered
    this.updateTheme(this.options.theme)
  }

  /**
   * 设置选中行
   */
  setSelectedRows(_keys: any[]): void {
    if (!this.table) return
    this.options.rowSelection = this.options.rowSelection || {}
    if (this.shallowEqualKeys(this.options.rowSelection.selectedRowKeys, _keys)) {
      return
    }
    this.options.rowSelection.selectedRowKeys = _keys
    this.applySelectedKeys(_keys, false)
  }

  /**
   * 清除筛选
   */
  clearFilters(): void {
    if (!this.table) return
    if (typeof this.table.clearFilterRules === 'function') {
      this.table.clearFilterRules()
    }
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
    // VTable 的选择 API 暂时未实现
  }

  /**
   * 获取列宽
   */
  getColumnWidth(_columnKey: string): number {
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
  setColumnWidth(_columnKey: string, _width: number): void {
    // VTable 会自动处理列宽
  }

  /**
   * 销毁表格
   */
  destroy(): void {
    this.disposeTableInstance()
  }
}

/**
 * 创建 VTable 适配器实例
 */
export function createVTableAdapter(options: VTableAdapterOptions): VTableAdapter {
  return new VTableAdapter(options)
}
