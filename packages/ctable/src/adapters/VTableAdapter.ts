/**
 * VTableAdapter - VTable API 适配器
 * 将 CTable API 转换为 VTable API，保持用户 API 不变
 */
import * as VTable from '@visactor/vtable'
import type {
  Column,
  ColumnDragConfig,
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
  size?: 'large' | 'middle' | 'small'
  headerAlign?: 'left' | 'center' | 'right'
  defaultAlign?: 'left' | 'center' | 'right'
  rowStyle?: (record: any, index: number) => Partial<{
    bgColor: string
    color: string
    fontWeight: string | number
  }>
  selectionStyle?: {
    borderColor?: string
    borderWidth?: number
    backgroundColor?: string
    hoverBackgroundColor?: string
  }
  rowSelection?: RowSelectionConfig
  resizable?: boolean | ResizeConfig
  onRowClick?: (row: any, index: number, event: any) => void
  onRowContextMenu?: (row: any, index: number, event: any) => void
  onCellClick?: (cell: any, row: any, column: any, event: any) => void
  onSortChange?: (sorter: SorterConfig) => void
  onFilterChange?: (filters: any[]) => void
  onFilterIconClick?: (payload: {
    field: string
    column?: Column
    event: Event
    clientX: number
    clientY: number
  }) => void
  onScroll?: (event: any) => void
  onColumnResize?: (info: ColumnResizeInfo) => void
  onColumnResizeEnd?: (info: ColumnResizeInfo) => void
  columnDragConfig?: ColumnDragConfig
  onColumnDragStart?: (payload: {
    source: { col: number; row: number; field: string }
    movingColumnOrRow?: 'column' | 'row'
    event?: Event
    column?: Column
  }) => void
  onColumnDragEnd?: (payload: {
    source: { col: number; row: number; field: string }
    target: { col: number; row: number; field: string }
    movingColumnOrRow?: 'column' | 'row'
    event?: Event
    oldColumn?: Column
    newColumn?: Column
  }) => void
  onColumnsChange?: (columns: Column[]) => void
  isTreeMode?: boolean
  treeChildrenField?: string
  treeIndentSize?: number
  defaultExpandAllRows?: boolean
  isExpandMode?: boolean
  expandRenderField?: string
  onTreeHierarchyStateChange?: (payload: {
    expanded: boolean
    record: any
    row: number
    col: number
  }) => void
  mergeCells?: Array<{
    rowIndex: number
    colIndex: number
    rowSpan?: number
    colSpan?: number
    text?: string
    style?: Record<string, any>
  }>
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
  private blockNextHeaderMove = false
  private dragSourceField = ''
  private dragSnapshotLeaves: Array<{
    fieldKey: string
    fixed?: 'left' | 'right'
    groupPath: string[]
    column: Column
  }> = []
  private dragHoverField = ''
  private dragHoverCol = -1
  private dragHoverRow = -1
  private restoreTimer: ReturnType<typeof setTimeout> | null = null
  private applyColumnsTimer: ReturnType<typeof setTimeout> | null = null
  private runtimeColumns: Column[] = []
  private baseColumns: Column[] = []
  private preparedData: any[] = []
  private nativeContextMenuHandler: ((event: MouseEvent) => void) | null = null
  private customMergeCache = new Map<string, any>()

  private getSizeToken(size?: 'large' | 'middle' | 'small') {
    const preset = this.parseTheme(this.options.theme).preset
    const family = preset.includes('element-plus')
      ? 'element-plus'
      : preset.includes('naive')
        ? 'naive'
        : 'ant-design'
    const sizeKey = size ?? 'middle'

    const byFamily = {
      'ant-design': {
        large: {
          cellFontSize: 14,
          headerFontSize: 14,
          cellPadding: [16, 8] as [number, number],
          headerPadding: [16, 8] as [number, number],
          rowHeight: 54,
          headerRowHeight: 54
        },
        middle: {
          cellFontSize: 14,
          headerFontSize: 14,
          cellPadding: [12, 8] as [number, number],
          headerPadding: [12, 8] as [number, number],
          rowHeight: 46,
          headerRowHeight: 46
        },
        small: {
          cellFontSize: 14,
          headerFontSize: 14,
          cellPadding: [8, 8] as [number, number],
          headerPadding: [8, 8] as [number, number],
          rowHeight: 38,
          headerRowHeight: 38
        }
      },
      'element-plus': {
        large: {
          cellFontSize: 14,
          headerFontSize: 14,
          cellPadding: [14, 10] as [number, number],
          headerPadding: [14, 10] as [number, number],
          rowHeight: 52,
          headerRowHeight: 52
        },
        middle: {
          cellFontSize: 14,
          headerFontSize: 14,
          cellPadding: [12, 10] as [number, number],
          headerPadding: [12, 10] as [number, number],
          rowHeight: 44,
          headerRowHeight: 44
        },
        small: {
          cellFontSize: 13,
          headerFontSize: 13,
          cellPadding: [8, 10] as [number, number],
          headerPadding: [8, 10] as [number, number],
          rowHeight: 36,
          headerRowHeight: 36
        }
      },
      naive: {
        large: {
          cellFontSize: 14,
          headerFontSize: 14,
          cellPadding: [12, 12] as [number, number],
          headerPadding: [12, 12] as [number, number],
          rowHeight: 48,
          headerRowHeight: 46
        },
        middle: {
          cellFontSize: 14,
          headerFontSize: 14,
          cellPadding: [10, 12] as [number, number],
          headerPadding: [10, 12] as [number, number],
          rowHeight: 42,
          headerRowHeight: 42
        },
        small: {
          cellFontSize: 13,
          headerFontSize: 13,
          cellPadding: [6, 12] as [number, number],
          headerPadding: [6, 12] as [number, number],
          rowHeight: 34,
          headerRowHeight: 34
        }
      }
    } as const

    return byFamily[family][sizeKey]
  }

  private getFilterHeaderIcon(active: boolean) {
    const stroke = active ? '#1677ff' : '#98a2b3'
    return {
      type: 'svg',
      name: 'ctable_filter_icon',
      funcType: 'ctable-filter',
      positionType: 'absoluteRight',
      visibleTime: 'always',
      cursor: 'pointer',
      width: 14,
      height: 14,
      marginRight: 6,
      svg: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 3h12M4.5 8h7M7 13h2" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/></svg>`
    }
  }

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
    const normalized = this
      .flattenLeafColumns(columns)
      .filter(col => col.key !== '__checkbox__')

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

  private flattenLeafColumns(columns: Column[], inheritedFixed?: 'left' | 'right'): Array<Column & { fixed?: 'left' | 'right' }> {
    const result: Array<Column & { fixed?: 'left' | 'right' }> = []
    columns.forEach(col => {
      if (col.hidden) return
      const fixed = (col.fixed ?? inheritedFixed) as 'left' | 'right' | undefined
      if (Array.isArray(col.children) && col.children.length > 0) {
        result.push(...this.flattenLeafColumns(col.children, fixed))
        return
      }
      result.push({
        ...col,
        fixed
      })
    })
    return result
  }

  private buildLeafMeta(columns: Column[], inheritedFixed?: 'left' | 'right', parentGroupPath: string[] = []) {
    const metas: Array<{
      fieldKey: string
      fixed?: 'left' | 'right'
      groupPath: string[]
      column: Column
    }> = []

    columns.forEach(col => {
      if (col.hidden || col.key === '__checkbox__') return
      const fixed = (col.fixed ?? inheritedFixed) as 'left' | 'right' | undefined
      const children = Array.isArray(col.children) ? col.children : []
      const nextPath = children.length > 0 ? [...parentGroupPath, col.key] : parentGroupPath
      if (children.length > 0) {
        metas.push(...this.buildLeafMeta(children, fixed, nextPath))
        return
      }
      const field = this.getColumnField(col)
      metas.push({
        fieldKey: this.fieldKey(field),
        fixed,
        groupPath: parentGroupPath,
        column: col
      })
    })

    return metas
  }

  private toLeafColIndex(tableCol: number): number {
    if (tableCol < 0) return -1
    return this.hasRowCheckbox ? tableCol - 1 : tableCol
  }

  private getSnapshotFieldByTableCol(tableCol: number): string {
    const leafIndex = this.toLeafColIndex(tableCol)
    if (leafIndex < 0 || leafIndex >= this.dragSnapshotLeaves.length) return ''
    return this.dragSnapshotLeaves[leafIndex]?.fieldKey ?? ''
  }

  private isSameGroupPath(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  private isColumnDraggable(column: Column): boolean {
    const dragConfig = this.options.columnDragConfig
    if (dragConfig?.enabled === false) return false
    if (typeof dragConfig?.visibleMethod === 'function' && !dragConfig.visibleMethod({ column })) {
      return false
    }
    if (typeof dragConfig?.disabledMethod === 'function' && dragConfig.disabledMethod({ column })) {
      return false
    }
    if (column.draggable === false) return false
    if (dragConfig) return true
    return !!column.draggable
  }

  private shouldRejectDefaultDrag(sourceMeta: {
    fieldKey: string
    fixed?: 'left' | 'right'
    groupPath: string[]
    column: Column
  } | undefined, targetMeta: {
    fieldKey: string
    fixed?: 'left' | 'right'
    groupPath: string[]
    column: Column
  } | undefined): boolean {
    if (!sourceMeta || !targetMeta) return false
    const dragConfig = this.options.columnDragConfig
    if (sourceMeta.fixed !== targetMeta.fixed) {
      return true
    }
    if (dragConfig?.isCrossDrag === true) {
      return false
    }
    return !this.isSameGroupPath(sourceMeta.groupPath, targetMeta.groupPath)
  }

  private clearDragRuntimeState() {
    this.dragSourceField = ''
    this.dragSnapshotLeaves = []
    this.dragHoverField = ''
    this.dragHoverCol = -1
    this.dragHoverRow = -1
    this.blockNextHeaderMove = false
  }

  private scheduleRestoreTable() {
    if (this.restoreTimer) {
      clearTimeout(this.restoreTimer)
      this.restoreTimer = null
    }
    this.restoreTimer = setTimeout(() => {
      this.restoreTimer = null
      this.destroy()
      this.create()
    }, 0)
  }

  private cloneColumns(columns: Column[]): Column[] {
    return columns.map(col => ({
      ...col,
      children: Array.isArray(col.children) ? this.cloneColumns(col.children) : undefined
    }))
  }

  private findLeaf(columns: Column[], fieldKey: string): {
    parent: Column[]
    index: number
    column: Column
  } | null {
    for (let i = 0; i < columns.length; i += 1) {
      const col = columns[i]
      if (col.hidden || col.key === '__checkbox__') continue
      if (Array.isArray(col.children) && col.children.length > 0) {
        const found = this.findLeaf(col.children, fieldKey)
        if (found) return found
        continue
      }
      if (this.fieldKey(this.getColumnField(col)) === fieldKey) {
        return {
          parent: columns,
          index: i,
          column: col
        }
      }
    }
    return null
  }

  private pruneEmptyGroups(columns: Column[]) {
    for (let i = columns.length - 1; i >= 0; i -= 1) {
      const col = columns[i]
      if (!Array.isArray(col.children)) continue
      this.pruneEmptyGroups(col.children)
      if (col.children.length === 0) {
        columns.splice(i, 1)
      }
    }
  }

  private moveLeafColumn(columns: Column[], sourceFieldKey: string, targetFieldKey: string): Column[] | null {
    if (!sourceFieldKey || !targetFieldKey || sourceFieldKey === targetFieldKey) {
      return null
    }
    const root = this.cloneColumns(columns)
    const source = this.findLeaf(root, sourceFieldKey)
    const target = this.findLeaf(root, targetFieldKey)
    if (!source || !target) return null

    const [moved] = source.parent.splice(source.index, 1)
    if (!moved) return null

    let targetParent = target.parent
    let targetIndex = target.index
    if (source.parent === targetParent && source.index < targetIndex) {
      targetIndex -= 1
    }
    targetParent.splice(Math.max(0, targetIndex), 0, moved)
    this.pruneEmptyGroups(root)
    return root
  }

  private normalizeTreeRecords(records: any[]): any[] {
    const childrenField = this.options.treeChildrenField || 'children'
    const visit = (rows: any[]): any[] => {
      return rows.map(row => {
        const children = Array.isArray(row?.[childrenField]) ? visit(row[childrenField]) : undefined
        if (childrenField === 'children') {
          return children ? { ...row, children, __ctable_origin__: row } : { ...row, __ctable_origin__: row }
        }
        const base = { ...row, __ctable_origin__: row }
        if (children) {
          ;(base as any).children = children
        }
        return base
      })
    }
    return visit(records || [])
  }

  private getTableRecords(): any[] {
    const records = this.options.data || []
    if (!this.options.isTreeMode) {
      this.preparedData = records
      return records
    }
    this.preparedData = this.normalizeTreeRecords(records)
    return this.preparedData
  }

  private scheduleApplyRuntimeColumns() {
    if (this.applyColumnsTimer) {
      clearTimeout(this.applyColumnsTimer)
      this.applyColumnsTimer = null
    }
    this.applyColumnsTimer = setTimeout(() => {
      this.applyColumnsTimer = null
      if (!this.table) return
      const containerWidth = this.options.width || this.container.clientWidth
      const nextColumns = this.convertColumns(this.runtimeColumns, containerWidth)
      if (typeof this.table.setColumns === 'function') {
        this.table.setColumns(nextColumns)
        this.options.onColumnsChange?.(this.cloneColumns(this.runtimeColumns))
      } else {
        this.scheduleRestoreTable()
      }
    }, 0)
  }

  private emitFilterChange(): void {
    if (!this.options.onFilterChange) return
    const filters = Array.from(this.activeFilters.entries()).map(([field, values]) => ({
      field,
      values: Array.from(values)
    }))
    this.options.onFilterChange(filters)
  }

  private refreshFilterHeaderIcons(): void {
    if (!this.table) return
    const containerWidth = this.options.width || this.container.clientWidth
    const sourceColumns = this.runtimeColumns.length > 0 ? this.runtimeColumns : this.options.columns
    const vtableColumns = this.convertColumns(sourceColumns, containerWidth)
    if (typeof this.table.setColumns === 'function') {
      this.table.setColumns(vtableColumns)
    }
  }

  private emitRowContextMenuFromCell(col: number, row: number, rawEvent?: any, nativeEvent?: MouseEvent): void {
    if (!this.table) return
    const hasCellAddr = col >= 0 && row >= 0
    const recordIndex = hasCellAddr
      ? Number(this.table.getRecordShowIndexByCell?.(col, row) ?? -1)
      : -1
    const rowData =
      rawEvent?.originData
      || (hasCellAddr ? this.table.getCellOriginRecord?.(col, row) : null)
      || this.preparedData[recordIndex]?.__ctable_origin__
      || this.options.data?.[recordIndex]
      || null

    const evt = nativeEvent || rawEvent?.event
    if (!rowData && !evt && !rawEvent) return
    this.options.onRowContextMenu?.(rowData, recordIndex, {
      nativeEvent: evt,
      clientX: Number(evt?.clientX ?? rawEvent?.x ?? 0),
      clientY: Number(evt?.clientY ?? rawEvent?.y ?? 0),
      rawEvent
    })
  }

  private buildMergeCache() {
    this.customMergeCache.clear()
    const merges = this.options.mergeCells || []
    merges.forEach(item => {
      const startRow = Number(item.rowIndex ?? -1)
      const startCol = Number(item.colIndex ?? -1)
      const rowSpan = Math.max(1, Number(item.rowSpan ?? 1))
      const colSpan = Math.max(1, Number(item.colSpan ?? 1))
      if (startRow < 0 || startCol < 0) return
      const range = {
        start: { row: startRow + 1, col: startCol + (this.hasRowCheckbox ? 1 : 0) },
        end: {
          row: startRow + rowSpan,
          col: startCol + colSpan - 1 + (this.hasRowCheckbox ? 1 : 0)
        }
      }
      for (let r = range.start.row; r <= range.end.row; r += 1) {
        for (let c = range.start.col; c <= range.end.col; c += 1) {
          this.customMergeCache.set(`${c}:${r}`, {
            range,
            text: item.text,
            style: item.style
          })
        }
      }
    })
  }

  private bindTableEvents(): void {
    if (!this.table) return

    this.table.on?.('scroll', (event: any) => {
      this.options.onScroll?.(event)
    })

    const emitCellClick = (event: any) => {
      const col = Number(event?.col ?? -1)
      const row = Number(event?.row ?? -1)
      const recordIndex = Number(this.table?.getRecordShowIndexByCell?.(col, row) ?? -1)
      const rowData =
        event?.originData
        || this.preparedData[recordIndex]?.__ctable_origin__
        || this.options.data[recordIndex]
      const field = this.fieldKey(this.table?.getHeaderField?.(col, row))
      const column = this.fieldColumnMap.get(field)
      this.options.onCellClick?.(
        {
          ...event,
          recordIndex
        },
        rowData,
        column,
        event?.event
      )
      if (rowData) {
        this.options.onRowClick?.(rowData, recordIndex, event?.event)
      }
    }

    this.table.on?.('click_cell', emitCellClick)
    // 部分场景 click_cell 不触发，补一个 mousedown_cell 兜底
    this.table.on?.('mousedown_cell', emitCellClick)

    this.table.on?.('contextmenu_cell', (event: any) => {
      const col = Number(event?.col ?? -1)
      const row = Number(event?.row ?? -1)
      this.emitRowContextMenuFromCell(col, row, event)
    })

    this.table.on?.('contextmenu_canvas', (event: any) => {
      const col = Number(event?.col ?? -1)
      const row = Number(event?.row ?? -1)
      this.emitRowContextMenuFromCell(col, row, event)
    })

    this.table.on?.('change_header_position_start', (event: any) => {
      const dragConfig = this.options.columnDragConfig
      const sourceField = this.fieldKey(this.table?.getHeaderField?.(event?.col, event?.row))
      this.dragSourceField = sourceField
      this.dragHoverField = ''
      this.dragHoverCol = -1
      this.dragHoverRow = -1
      this.dragSnapshotLeaves = this.buildLeafMeta(
        this.runtimeColumns.length > 0 ? this.runtimeColumns : this.options.columns
      )
      const column = this.fieldColumnMap.get(sourceField)
      this.options.onColumnDragStart?.({
        source: {
          col: Number(event?.col ?? -1),
          row: Number(event?.row ?? -1),
          field: sourceField
        },
        movingColumnOrRow: event?.movingColumnOrRow,
        event: event?.event,
        column
      })

      if (typeof dragConfig?.dragStartMethod === 'function' && column) {
        const maybe = dragConfig.dragStartMethod({ column })
        if (maybe instanceof Promise) {
          maybe.then(allowed => {
            if (allowed === false) {
              this.blockNextHeaderMove = true
            }
          })
          return
        }
        if (maybe === false) {
          this.blockNextHeaderMove = true
        }
      }
    })

    this.table.on?.('changing_header_position', (event: any) => {
      const hoverCol = Number(event?.col ?? -1)
      const hoverRow = Number(event?.row ?? -1)
      if (hoverCol < 0 || hoverRow < 0) return
      this.dragHoverCol = hoverCol
      this.dragHoverRow = hoverRow
      const hoverField = this.fieldKey(this.table?.getHeaderField?.(hoverCol, hoverRow))
      if (!hoverField) return
      this.dragHoverField = hoverField
    })

    this.table.on?.('change_header_position', (event: any) => {
      const sourceCol = Number(event?.source?.col ?? -1)
      const sourceRow = Number(event?.source?.row ?? -1)
      const targetCol = Number(event?.target?.col ?? -1)
      const targetRow = Number(event?.target?.row ?? -1)
      const sourceField = this.dragSourceField || this.fieldKey(this.table?.getHeaderField?.(sourceCol, sourceRow))
      const targetField = this.fieldKey(
        event?.target?.field
        ?? this.dragHoverField
        ?? this.table?.getHeaderField?.(targetCol, targetRow)
      ) || this.getSnapshotFieldByTableCol(targetCol)
      const effectiveTargetField =
        targetField
        || this.getSnapshotFieldByTableCol(this.dragHoverCol)
        || this.getSnapshotFieldByTableCol(targetCol)
      const oldColumn = this.fieldColumnMap.get(sourceField)
      const newColumn = this.fieldColumnMap.get(effectiveTargetField)

      const restore = () => {
        this.clearDragRuntimeState()
        this.scheduleRestoreTable()
      }

      const payload = {
        source: {
          col: sourceCol,
          row: sourceRow,
          field: sourceField
        },
        target: {
          col: targetCol,
          row: targetRow,
          field: effectiveTargetField
        },
        movingColumnOrRow: event?.movingColumnOrRow,
        event: event?.event as Event | undefined,
        oldColumn,
        newColumn
      }

      const dragConfig = this.options.columnDragConfig
      if (this.blockNextHeaderMove) {
        restore()
        return
      }

      const reordered = this.moveLeafColumn(
        this.runtimeColumns.length > 0 ? this.runtimeColumns : this.options.columns,
        sourceField,
        effectiveTargetField
      )
      if (reordered) {
        this.runtimeColumns = reordered
        this.options.columns = reordered
      }

      const finishEmit = () => {
        this.clearDragRuntimeState()
        if (reordered) {
          this.options.onColumnsChange?.(this.cloneColumns(this.runtimeColumns))
        }
        this.options.onColumnDragEnd?.(payload)
      }

      if (typeof dragConfig?.dragEndMethod === 'function') {
        const result = dragConfig.dragEndMethod({
          oldColumn,
          newColumn,
          oldIndex: sourceCol,
          newIndex: targetCol
        })
        if (result instanceof Promise) {
          result.then(allowed => {
            if (allowed === false) {
              restore()
              return
            }
            finishEmit()
          })
          return
        }
        if (result === false) {
          restore()
          return
        }
      }

      finishEmit()
    })

    this.table.on?.('change_header_position_fail', (event: any) => {
      const dragConfig = this.options.columnDragConfig
      if (dragConfig?.isCrossDrag && this.dragSourceField) {
        const targetCol = Number(
          event?.target?.col
          ?? (this.dragHoverCol >= 0 ? this.dragHoverCol : -1)
        )
        const targetRow = Number(
          event?.target?.row
          ?? (this.dragHoverRow >= 0 ? this.dragHoverRow : -1)
        )
        const targetField = this.fieldKey(
          event?.target?.field
          ?? this.dragHoverField
          ?? this.table?.getHeaderField?.(targetCol, targetRow)
        ) || this.getSnapshotFieldByTableCol(targetCol) || this.getSnapshotFieldByTableCol(this.dragHoverCol)
        const nextColumns = this.moveLeafColumn(
          this.runtimeColumns.length > 0 ? this.runtimeColumns : this.options.columns,
          this.dragSourceField,
          targetField
        )
        if (nextColumns) {
          this.runtimeColumns = nextColumns
          this.options.columns = nextColumns
          this.scheduleApplyRuntimeColumns()
          this.options.onColumnDragEnd?.({
            source: {
              col: Number(event?.source?.col ?? -1),
              row: Number(event?.source?.row ?? -1),
              field: this.dragSourceField
            },
            target: {
              col: targetCol,
              row: targetRow,
              field: targetField
            },
            movingColumnOrRow: event?.movingColumnOrRow,
            event: event?.event as Event | undefined,
            oldColumn: this.fieldColumnMap.get(this.dragSourceField),
            newColumn: this.fieldColumnMap.get(targetField)
          })
        }
      }
      this.clearDragRuntimeState()
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
      this.refreshFilterHeaderIcons()
      this.emitFilterChange()
    })

    this.table.on?.('dropdown_menu_clear', (event: any) => {
      const col = Number(event?.col ?? -1)
      const row = Number(event?.row ?? -1)
      const field = this.fieldKey(this.table.getHeaderField?.(col, row))
      if (!field) return
      this.activeFilters.delete(field)
      this.refreshFilterHeaderIcons()
      this.emitFilterChange()
    })

    this.table.on?.('icon_click', (event: any) => {
      const iconName = String(event?.name ?? event?.icon?.name ?? '')
      const funcType = String(event?.funcType ?? event?.icon?.funcType ?? '')
      if (iconName !== 'ctable_filter_icon' && funcType !== 'ctable-filter') return

      const col = Number(event?.col ?? -1)
      const row = Number(event?.row ?? -1)
      const field = this.fieldKey(this.table?.getHeaderField?.(col, row))
      if (!field) return
      const nativeEvent = event?.event as Event
      const mouseEvent = nativeEvent as MouseEvent
      this.options.onFilterIconClick?.({
        field,
        column: this.fieldColumnMap.get(field),
        event: nativeEvent,
        clientX: Number(mouseEvent?.clientX ?? event?.x ?? 0),
        clientY: Number(mouseEvent?.clientY ?? event?.y ?? 0)
      })
    })

    this.table.on?.('tree_hierarchy_state_change', (event: any) => {
      const expanded = String(event?.hierarchyState ?? '') === 'expand'
      const record = event?.originData || this.options.data?.[Number(event?.row ?? -1)] || null
      this.options.onTreeHierarchyStateChange?.({
        expanded,
        record,
        row: Number(event?.row ?? -1),
        col: Number(event?.col ?? -1)
      })
    })
  }

  constructor(options: VTableAdapterOptions) {
    this.options = options
    this.container = options.container
    this.baseColumns = this.cloneColumns(options.columns)
    this.runtimeColumns = this.cloneColumns(options.columns)
  }

  private disposeTableInstance(): void {
    if (this.nativeContextMenuHandler) {
      this.container.removeEventListener('contextmenu', this.nativeContextMenuHandler, true)
      this.nativeContextMenuHandler = null
    }
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
      this.clearDragRuntimeState()
      if (this.restoreTimer) {
        clearTimeout(this.restoreTimer)
        this.restoreTimer = null
      }
      if (this.applyColumnsTimer) {
        clearTimeout(this.applyColumnsTimer)
        this.applyColumnsTimer = null
      }
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
    const selectionBg =
      this.options.selectionStyle?.backgroundColor
      ?? colors.selectColor
      ?? colors.primaryColorBg
      ?? 'rgba(22,119,255,0.12)'
    const selectionBorder =
      this.options.selectionStyle?.borderColor
      ?? colors.primaryColor
      ?? '#1677ff'
    const selectionBorderWidth = Math.max(
      1,
      Math.min(4, Number(this.options.selectionStyle?.borderWidth ?? 1))
    )
    const hoverBg = this.options.selectionStyle?.hoverBackgroundColor ?? selectionBg
    const stripedBg = this.options.stripeColor ?? baseTheme?.stripeColor ?? '#fafafa'
    const sizeToken = this.getSizeToken(this.options.size)
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
        fontSize: sizeToken.cellFontSize,
        fontFamily: fonts.fontFamily ?? 'sans-serif',
        fontWeight: fonts.cellFontWeight ?? 400,
        lineHeight: fonts.lineHeight ?? 1.5,
        padding: [sizeToken.cellPadding[0], sizeToken.cellPadding[1]]
      },
      headerStyle: {
        bgColor: colors.headerBgColor ?? '#f7f7f7',
        color: colors.headerTextColor ?? 'rgba(0,0,0,0.88)',
        borderColor,
        borderLineWidth: borderWidth,
        fontSize: sizeToken.headerFontSize,
        fontFamily: fonts.fontFamily ?? 'sans-serif',
        fontWeight: fonts.headerFontWeight ?? 600,
        lineHeight: fonts.headerLineHeight ?? fonts.lineHeight ?? 1.5,
        padding: [sizeToken.headerPadding[0], sizeToken.headerPadding[1]]
      },
      rowHeaderStyle: {
        bgColor: colors.headerBgColor ?? '#f7f7f7',
        color: colors.headerTextColor ?? 'rgba(0,0,0,0.88)',
        borderColor,
        borderLineWidth: borderWidth,
        fontSize: sizeToken.headerFontSize,
        fontFamily: fonts.fontFamily ?? 'sans-serif',
        fontWeight: fonts.headerFontWeight ?? 600,
        lineHeight: fonts.headerLineHeight ?? fonts.lineHeight ?? 1.5,
        padding: [sizeToken.headerPadding[0], sizeToken.headerPadding[1]]
      },
      bodyStyle: {
        bgColor: bodyBg,
        color: colors.textColor ?? 'rgba(0,0,0,0.88)',
        borderColor,
        borderLineWidth: borderWidth,
        fontSize: sizeToken.cellFontSize,
        fontFamily: fonts.fontFamily ?? 'sans-serif',
        fontWeight: fonts.cellFontWeight ?? 400,
        lineHeight: fonts.lineHeight ?? 1.5,
        padding: [sizeToken.cellPadding[0], sizeToken.cellPadding[1]],
        hover: {
          cellBgColor: hoverBg
        }
      },
      frameStyle: {
        borderColor,
        borderLineWidth: borderWidth,
        cornerRadius: sizes.borderRadius ?? 0
      },
      selectionStyle: {
        // VTable 默认是 overlay 填充，纯色会覆盖文本；改为 replace 以保持文字可见
        selectionFillMode: 'replace',
        cellBgColor: selectionBg,
        cellBorderColor: selectionBorder,
        cellBorderLineWidth: selectionBorderWidth
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
    this.hasRowCheckbox = this.flattenLeafColumns(columns).some(col => col.key === '__checkbox__')
    const previousActiveFilters = new Map(this.activeFilters)
    this.fieldColumnMap.clear()
    this.activeFilters.clear()

    const leafColumnsForWidth: Array<{ source: Column; node: any }> = []
    let treeMarked = false

    const convertColumnNode = (col: Column, inheritedFixed?: 'left' | 'right'): any | null => {
      if (col.hidden || col.key === '__checkbox__') return null
      const fixed = (col.fixed ?? inheritedFixed) as 'left' | 'right' | undefined
      const children = Array.isArray(col.children) ? col.children : []

      if (children.length > 0) {
        const childColumns = children
          .map(child => convertColumnNode(child, fixed))
          .filter(Boolean)
        if (childColumns.length === 0) return null
        const groupNode: any = {
          title: col.title || '',
          columns: childColumns,
          dragHeader: this.isColumnDraggable(col),
          headerStyle: {
            textAlign: col.headerAlign ?? this.options.headerAlign ?? 'center'
          }
        }
        if (typeof col.width === 'number') {
          groupNode.width = col.width
        }
        return groupNode
      }

      const dataIndex = Array.isArray((col as any).dataIndex)
        ? (col as any).dataIndex[0]
        : (col as any).dataIndex
      const field = typeof dataIndex === 'string' && dataIndex.length > 0 ? dataIndex : col.key
      const fieldKey = this.fieldKey(field)
      const columnDef: any = {
        field,
        title: col.title || '',
        width: col.width || 120,
        frozen: fixed === 'left' ? 'start' : fixed === 'right' ? 'end' : undefined,
        dragOrder: this.isColumnDraggable(col),
        dragHeader: this.isColumnDraggable(col)
      }
      if (this.options.isTreeMode && !treeMarked) {
        columnDef.tree = true
        treeMarked = true
      }
      this.fieldColumnMap.set(fieldKey, col)

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
        const controlledFiltered = Array.isArray(col.filteredValue) && col.filteredValue.length > 0
        const uncontrolledFiltered = (previousActiveFilters.get(this.getColumnField(col))?.size ?? 0) > 0
        const active = controlledFiltered || uncontrolledFiltered
        columnDef.headerIcon =
          typeof col.filterIcon === 'string' || (col.filterIcon && typeof col.filterIcon === 'object')
            ? col.filterIcon
            : this.getFilterHeaderIcon(active)
      }

      if (Array.isArray(col.filteredValue) && col.filteredValue.length > 0) {
        this.activeFilters.set(fieldKey, new Set(col.filteredValue.map(v => String(v))))
      } else if (previousActiveFilters.has(fieldKey)) {
        const prev = previousActiveFilters.get(fieldKey)
        if (prev) {
          this.activeFilters.set(fieldKey, new Set(prev))
        }
      }

      const bodyAlign = col.align ?? this.options.defaultAlign ?? 'center'
      const headerAlign = col.headerAlign ?? this.options.headerAlign ?? 'center'
      columnDef.style = {
        ...(columnDef.style || {}),
        textAlign: bodyAlign
      }
      columnDef.headerStyle = {
        ...(columnDef.headerStyle || {}),
        textAlign: headerAlign
      }

      if (typeof col.render === 'function') {
        const render = col.render
        columnDef.fieldFormat = (record: any, _col?: number, row?: number) => {
          if (this.options.isExpandMode && record?.__ctable_expand_row__) {
            return field === this.options.expandRenderField
              ? String(record?.__ctable_expand_content__ ?? '')
              : ''
          }
          return render(record, Number(row ?? 0), col)
        }
      } else if (this.options.isExpandMode) {
        columnDef.fieldFormat = (record: any) => {
          if (!record?.__ctable_expand_row__) {
            return record?.[field]
          }
          return field === this.options.expandRenderField
            ? String(record?.__ctable_expand_content__ ?? '')
            : ''
        }
      }

      if (this.options.stripe === false) {
        columnDef.style = {
          ...(columnDef.style || {}),
          bgColor: this.bodyBgColor
        }
      }

      if (typeof this.options.rowStyle === 'function') {
        const getRowStyle = (args: any) => {
          const colIndex = Number(args?.col ?? -1)
          const rowIndex = Number(args?.row ?? -1)
          const recordShowIndex = Number(this.table?.getRecordShowIndexByCell?.(colIndex, rowIndex) ?? -1)
          const record =
            args?.record
            || this.preparedData[recordShowIndex]?.__ctable_origin__
            || this.options.data[recordShowIndex]
          return this.options.rowStyle?.(record, recordShowIndex) || {}
        }
        columnDef.style = {
          ...(columnDef.style || {}),
          bgColor: (args: any) => getRowStyle(args).bgColor,
          color: (args: any) => getRowStyle(args).color,
          fontWeight: (args: any) => getRowStyle(args).fontWeight
        }
      }

      leafColumnsForWidth.push({ source: col, node: columnDef })
      return columnDef
    }

    const vtableColumns = columns
      .map(col => convertColumnNode(col))
      .filter(Boolean)

    if (!containerWidth || containerWidth <= 0 || leafColumnsForWidth.length === 0) {
      return vtableColumns
    }

    const numericWidth = (w: unknown) => (typeof w === 'number' ? w : 0)
    const totalWidth = leafColumnsForWidth.reduce((sum, item) => sum + numericWidth(item.node.width), 0)
    const remain = Math.floor(containerWidth - totalWidth)
    if (remain <= 0) {
      return vtableColumns
    }

    const flexibleLeafCols = leafColumnsForWidth.filter(item => item.source.width == null)
    const targets = flexibleLeafCols.length > 0 ? flexibleLeafCols : leafColumnsForWidth
    const extra = Math.floor(remain / targets.length)
    const remainder = remain % targets.length
    targets.forEach((item, index) => {
      item.node.width = numericWidth(item.node.width) + extra + (index < remainder ? 1 : 0)
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

    if (this.runtimeColumns.length === 0) {
      this.runtimeColumns = this.cloneColumns(this.options.columns)
    }
    const sourceColumns = this.runtimeColumns
    const containerWidth = this.options.width || this.container.clientWidth
    const containerHeight = this.options.height || this.container.clientHeight
    const vtableColumns = this.convertColumns(sourceColumns, containerWidth)
    const tableRecords = this.getTableRecords()

    const vtableTheme = this.buildRuntimeTheme(this.options.theme)

    const listTableOptions: any = {
      container: this.container,
      width: containerWidth,
      height: containerHeight,
      defaultRowHeight: this.getSizeToken(this.options.size).rowHeight,
      defaultHeaderRowHeight: this.getSizeToken(this.options.size).headerRowHeight,
      records: tableRecords,
      columns: vtableColumns,
      theme: vtableTheme,
      // 避免点击单元格进入编辑态导致文本被编辑层覆盖
      editCellTrigger: 'api',
      // 启用单元格选中高亮，供 CTable 的 activeCell 可视化使用
      select: {
        disableSelect: false,
        disableHeaderSelect: true,
        disableDragSelect: true,
        disableSelectOnContextMenu: true
      },
      customConfig: {
        selectCellWhenCellEditorNotExists: false
      }
    }
    this.buildMergeCache()
    if (this.customMergeCache.size > 0) {
      listTableOptions.customMergeCell = (col: number, row: number) => {
        return this.customMergeCache.get(`${col}:${row}`) || null
      }
    }

    if (this.options.isTreeMode) {
      listTableOptions.rowHierarchyType = 'tree'
      listTableOptions.hierarchyIndent = this.options.treeIndentSize ?? 16
      listTableOptions.hierarchyExpandLevel = this.options.defaultExpandAllRows ? 999 : 0
    }

    const hasDraggableColumn = this.flattenLeafColumns(sourceColumns).some(col => this.isColumnDraggable(col))
    if (hasDraggableColumn) {
      listTableOptions.dragHeaderMode = 'column'
    }

    if (this.options.columnDragConfig?.showGuidesStatus === false) {
      listTableOptions.eventOptions = {
        ...(listTableOptions.eventOptions || {}),
        showDragOrderLine: false
      }
    }

    const frozenCounts = this.getFrozenCounts(sourceColumns)
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
    const initialSortColumn = sourceColumns.find(col => {
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
    if (this.nativeContextMenuHandler) {
      this.container.removeEventListener('contextmenu', this.nativeContextMenuHandler, true)
    }
    this.nativeContextMenuHandler = (event: MouseEvent) => {
      if (!this.table) return
      event.preventDefault()
      event.stopPropagation()
      ;(event as any).stopImmediatePropagation?.()
      const rect = this.container.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const addr =
        this.table.getCellAtRelativePosition?.(x, y)
        || this.table.getCellAt?.(x, y)
      const col = Number(addr?.col ?? -1)
      const row = Number(addr?.row ?? -1)
      this.emitRowContextMenuFromCell(col, row, { x, y, event }, event)
    }
    this.container.addEventListener('contextmenu', this.nativeContextMenuHandler, true)
  }

  /**
   * 更新数据
   */
  updateData(data: any[]): void {
    this.options.data = data
    if (!this.table) return
    const tableRecords = this.getTableRecords()
    this.isApplyingSelection = true
    this.table.setRecords(tableRecords)
    if (typeof this.table.renderWithRecreateCells === 'function') {
      this.table.renderWithRecreateCells()
    } else if (typeof this.table.render === 'function') {
      this.table.render()
    }
    this.isApplyingSelection = false
    this.buildMergeCache()
    if (this.hasRowCheckbox) {
      this.applySelectedKeys(this.options.rowSelection?.selectedRowKeys || [], false)
    }
  }

  getRowContextByClientPoint(clientX: number, clientY: number): { row: any; index: number } | null {
    if (!this.table) return null
    const containerRect = this.container.getBoundingClientRect()
    const x = clientX - containerRect.left
    const y = clientY - containerRect.top
    const addr =
      this.table.getCellAtRelativePosition?.(x, y)
      || this.table.getCellAt?.(x, y)
    const col = Number(addr?.col ?? -1)
    const row = Number(addr?.row ?? -1)
    if (col < 0 || row < 0) return { row: null, index: -1 }
    const recordIndex = Number(this.table.getRecordShowIndexByCell?.(col, row) ?? -1)
    const rowData =
      this.table.getCellOriginRecord?.(col, row)
      || this.preparedData[recordIndex]?.__ctable_origin__
      || this.options.data?.[recordIndex]
      || null
    return {
      row: rowData,
      index: recordIndex
    }
  }

  getCellContextByClientPoint(clientX: number, clientY: number): {
    row: any
    index: number
    field: string
    column?: Column
    col: number
    rowIndex: number
    rect?: { left: number; top: number; width: number; height: number }
  } | null {
    if (!this.table) return null
    const rect = this.container.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    const addr =
      this.table.getCellAtRelativePosition?.(x, y)
      || this.table.getCellAt?.(x, y)
    const col = Number(addr?.col ?? -1)
    const row = Number(addr?.row ?? -1)
    if (col < 0 || row < 0) return null

    const recordIndex = Number(this.table.getRecordShowIndexByCell?.(col, row) ?? -1)
    const rowData =
      this.table.getCellOriginRecord?.(col, row)
      || this.preparedData[recordIndex]?.__ctable_origin__
      || this.options.data?.[recordIndex]
      || null
    const field = this.fieldKey(this.table.getHeaderField?.(col, row))
    const cellRect = this.table.getCellRelativeRect?.(col, row)
    return {
      row: rowData,
      index: recordIndex,
      field,
      column: this.fieldColumnMap.get(field),
      col,
      rowIndex: row,
      rect: cellRect
        ? {
            left: Number(cellRect.left ?? 0),
            top: Number(cellRect.top ?? 0),
            width: Number(cellRect.width ?? 0),
            height: Number(cellRect.height ?? 0)
          }
        : undefined
    }
  }

  getCellContextByFieldIndex(field: string, index: number): {
    col: number
    row: number
    rect?: { left: number; top: number; width: number; height: number }
  } | null {
    if (!this.table || !field || index < 0) return null
    const addr = this.table.getCellAddrByFieldRecord?.(field, index)
    const col = Number(addr?.col ?? -1)
    const row = Number(addr?.row ?? -1)
    if (col < 0 || row < 0) return null
    const rect = this.table.getCellRelativeRect?.(col, row)
    return {
      col,
      row,
      rect: rect
        ? {
            left: Number(rect.left ?? 0),
            top: Number(rect.top ?? 0),
            width: Number(rect.width ?? 0),
            height: Number(rect.height ?? 0)
          }
        : undefined
    }
  }

  selectCellByFieldIndex(
    field: string,
    index: number,
    enableShiftSelectMode = false,
    enableCtrlSelectMode = false,
    replaceSelection = true
  ): void {
    if (!this.table || !field || index < 0) return
    const addr = this.table.getCellAddrByFieldRecord?.(field, index)
    const col = Number(addr?.col ?? -1)
    const row = Number(addr?.row ?? -1)
    if (col < 0 || row < 0) return
    if (replaceSelection) {
      this.table.clearSelected?.()
    }
    this.table.selectCell?.(
      col,
      row,
      enableShiftSelectMode,
      enableCtrlSelectMode,
      false
    )
  }

  clearCellSelection(): void {
    if (!this.table) return
    this.table.clearSelected?.()
  }

  appendRows(rows: any[]): void {
    if (!Array.isArray(rows) || rows.length === 0) return
    const nextData = [...(this.options.data || []), ...rows]
    this.updateData(nextData)
  }

  updateRow(
    matcher: ((row: any, index: number) => boolean) | any,
    patch: Partial<any> | ((row: any) => any)
  ): void {
    const source = this.options.data || []
    const next = source.map((row, index) => {
      const matched =
        typeof matcher === 'function'
          ? matcher(row, index)
          : row?.id === matcher || row?.key === matcher
      if (!matched) return row
      if (typeof patch === 'function') {
        return patch(row)
      }
      return { ...row, ...patch }
    })
    this.updateData(next)
  }

  removeRows(matcher: ((row: any, index: number) => boolean) | any[] | any): void {
    const source = this.options.data || []
    let next: any[] = source
    if (typeof matcher === 'function') {
      next = source.filter((row, index) => !matcher(row, index))
    } else if (Array.isArray(matcher)) {
      const keySet = new Set(matcher)
      next = source.filter(row => !keySet.has(row?.id) && !keySet.has(row?.key))
    } else {
      next = source.filter(row => row?.id !== matcher && row?.key !== matcher)
    }
    this.updateData(next)
  }

  /**
   * 更新列配置
   */
  updateColumns(columns: Column[]): void {
    this.options.columns = columns
    this.baseColumns = this.cloneColumns(columns)
    this.runtimeColumns = this.cloneColumns(columns)
    this.buildMergeCache()
    if (!this.table) return

    const containerWidth = this.options.width || this.container.clientWidth
    const vtableColumns = this.convertColumns(this.runtimeColumns, containerWidth)
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

  updateSize(size?: 'large' | 'middle' | 'small'): void {
    this.options.size = size
    if (!this.table) return
    this.scheduleRestoreTable()
  }

  updateColumnDragConfig(config?: ColumnDragConfig): void {
    this.options.columnDragConfig = config
    if (!this.table) return
    this.scheduleRestoreTable()
  }

  updateMergeCells(
    mergeCells?: Array<{
      rowIndex: number
      colIndex: number
      rowSpan?: number
      colSpan?: number
      text?: string
      style?: Record<string, any>
    }>
  ): void {
    this.options.mergeCells = mergeCells || []
    this.buildMergeCache()
    if (!this.table) return
    if (typeof this.table.renderWithRecreateCells === 'function') {
      this.table.renderWithRecreateCells()
      return
    }
    if (typeof this.table.render === 'function') {
      this.table.render()
      return
    }
    this.scheduleRestoreTable()
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
    this.activeFilters.clear()
    if (typeof this.table.clearFilterRules === 'function') {
      this.table.clearFilterRules()
    }
    this.refreshFilterHeaderIcons()
  }

  setFilterValues(field: string, values: any[]): void {
    if (!field) return
    const normalized = Array.isArray(values) ? values.filter(v => v !== undefined && v !== null && `${v}` !== '') : []
    if (normalized.length > 0) {
      this.activeFilters.set(field, new Set(normalized.map(v => String(v))))
    } else {
      this.activeFilters.delete(field)
    }
    this.refreshFilterHeaderIcons()
    this.emitFilterChange()
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
    if (!this.table || !this.hasRowCheckbox) return
    this.options.rowSelection = this.options.rowSelection || {}
    this.options.rowSelection.selectedRowKeys = []
    this.applySelectedKeys([], true)
  }

  invertSelection(): void {
    if (!this.table || !this.hasRowCheckbox) return
    const selectedKeySet = new Set(this.options.rowSelection?.selectedRowKeys || [])
    const nextKeys = (this.options.data || [])
      .map(record => this.getRowKey(record))
      .filter(key => !selectedKeySet.has(key))
    this.options.rowSelection = this.options.rowSelection || {}
    this.options.rowSelection.selectedRowKeys = nextKeys
    this.applySelectedKeys(nextKeys, true)
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

  getColumns(): Column[] {
    const source = this.runtimeColumns.length > 0 ? this.runtimeColumns : this.options.columns
    return this.cloneColumns(source)
  }

  setColumns(columns: Column[]): void {
    this.options.columns = columns
    this.baseColumns = this.cloneColumns(columns)
    this.runtimeColumns = this.cloneColumns(columns)
    if (!this.table) return
    const containerWidth = this.options.width || this.container.clientWidth
    const nextColumns = this.convertColumns(this.runtimeColumns, containerWidth)
    if (typeof this.table.setColumns === 'function') {
      this.table.setColumns(nextColumns)
      this.options.onColumnsChange?.(this.cloneColumns(this.runtimeColumns))
      return
    }
    this.scheduleRestoreTable()
  }

  resetColumns(): void {
    this.runtimeColumns = this.cloneColumns(this.baseColumns)
    this.options.columns = this.cloneColumns(this.baseColumns)
    if (!this.table) return
    const containerWidth = this.options.width || this.container.clientWidth
    const nextColumns = this.convertColumns(this.runtimeColumns, containerWidth)
    if (typeof this.table.setColumns === 'function') {
      this.table.setColumns(nextColumns)
      this.options.onColumnsChange?.(this.cloneColumns(this.runtimeColumns))
      return
    }
    this.scheduleRestoreTable()
  }

  expandAllTree(): void {
    if (!this.table || !this.options.isTreeMode) return
    if (typeof this.table.expandAllTreeNode === 'function') {
      this.table.expandAllTreeNode()
    }
  }

  collapseAllTree(): void {
    if (!this.table || !this.options.isTreeMode) return
    if (typeof this.table.collapseAllTreeNode === 'function') {
      this.table.collapseAllTreeNode()
    }
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
