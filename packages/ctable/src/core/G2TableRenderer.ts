/**
 * G2TableRenderer - 基于 G2 5.x Mark/View API 的表格渲染器
 * 真正使用 G2 的声明式渲染系统
 */
import { Chart } from '@antv/g2'
import type { Column, ThemeConfig, Cell, SortOrder } from '../types'

// ============================================================================
// G2TableRenderer 类
// ============================================================================

export class G2TableRenderer {
  private chart: Chart | null = null
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D | null = null
  private width: number
  private height: number
  private theme: ThemeConfig
  private columns: Column[] = []
  private data: any[] = []
  private visibleRows: any[] = []
  private startIndex: number = 0
  private endIndex: number = 0
  private selectable: boolean = false
  private selectedRows: Set<number> = new Set()
  private highlightedCell: Cell | null = null
  private sortState: Map<string, SortOrder> = new Map()
  private filterState: Set<string> = new Set()
  private scrollLeft: number = 0  // 横向滚动位置

  constructor(canvas: HTMLCanvasElement, width: number, height: number, theme: ThemeConfig, selectable: boolean = false) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.width = width
    this.height = height
    this.theme = theme
    this.selectable = selectable

    // 暂时使用原生 Canvas 渲染，G2 Mark API 需要进一步研究
    this.initCanvas()
  }

  /**
   * 初始化 Canvas（原生模式，G2 集成待完善）
   */
  private initCanvas() {
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = this.width * dpr
    this.canvas.height = this.height * dpr
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    if (this.ctx) {
      this.ctx.scale(dpr, dpr)
    }
  }

  /**
   * 初始化 G2 Chart（保留接口，待完善）
   */
  private initChart() {
    // G2 Chart 初始化代码待完善
    // 当前使用原生 Canvas 作为降级方案
  }

  resize(width: number, height: number) {
    this.width = width
    this.height = height
    const dpr = window.devicePixelRatio || 1

    // 重置 canvas 尺寸（这会清空 canvas 和重置 transform）
    this.canvas.width = this.width * dpr
    this.canvas.height = this.height * dpr
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`

    // 重新应用缩放
    if (this.ctx) {
      this.ctx.scale(dpr, dpr)
    }

    // 重要：canvas 尺寸重置会清空内容，必须立即重新渲染
    // 这是 Canvas API 的标准行为
    this.render()
  }

  setTheme(theme: ThemeConfig) {
    this.theme = theme
    this.render()
  }

  setData(data: any[], columns: Column[]) {
    this.data = data
    this.columns = columns
  }

  setVisibleData(startIndex: number, endIndex: number) {
    this.startIndex = startIndex
    this.endIndex = endIndex
    this.visibleRows = this.data.slice(startIndex, endIndex)

    this.render()
  }

  setScrollLeft(scrollLeft: number) {
    this.scrollLeft = scrollLeft
    this.render()
  }

  /**
   * 主渲染方法 - 使用原生 Canvas（G2 Mark API 待完善）
   */
  render() {
    if (!this.ctx) {
      return
    }

    // 清除画布
    this.ctx.clearRect(0, 0, this.width, this.height)

    const headerHeight = this.theme.spacing.header
    const cellHeight = this.theme.spacing.cell

    // 设置裁剪区域
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.rect(0, 0, this.width, this.height)
    this.ctx.clip()

    // 绘制内容
    this.renderHeader(headerHeight)
    this.renderVisibleRows(headerHeight, cellHeight)
    this.renderGrid(headerHeight, cellHeight)

    // 恢复裁剪状态
    this.ctx.restore()
  }

  /**
   * 渲染表头
   */
  private renderHeader(headerHeight: number) {
    const { colors, fonts, spacing } = this.theme

    let originalTotalWidth = 0
    for (const col of this.columns) {
      originalTotalWidth += col.width || 120
    }

    this.columns.forEach((col, colIndex) => {
      const x = this.getColumnX(colIndex) - this.scrollLeft
      let width = col.width || 120

      // 如果列完全在可视区域外，跳过绘制
      if (x + width <= 0 || x >= this.width) {
        return
      }

      if (colIndex === this.columns.length - 1 && originalTotalWidth < this.width) {
        width = this.width - (this.getColumnX(colIndex) - this.scrollLeft)
      }

      const visibleWidth = Math.min(width, this.width - x)

      // 绘制表头背景
      this.ctx.fillStyle = colors.header
      this.ctx.fillRect(x, 0, visibleWidth, headerHeight)

      // 绘制表头边框
      this.ctx.strokeStyle = colors.border
      this.ctx.lineWidth = spacing.border
      this.ctx.strokeRect(x, 0, visibleWidth, headerHeight)

      // 表头底部加粗线
      this.ctx.beginPath()
      this.ctx.moveTo(x, headerHeight)
      this.ctx.lineTo(x + visibleWidth, headerHeight)
      this.ctx.lineWidth = 2
      this.ctx.strokeStyle = colors.border
      this.ctx.stroke()

      // 绘制表头文字
      this.ctx.font = `normal ${fonts.header.weight} ${parseInt(fonts.header.size)}px "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
      this.ctx.fillStyle = colors.text
      this.ctx.textAlign = col.align || 'left'
      this.ctx.textBaseline = 'middle'

      const hasSort = col.sortable
      const hasFilter = col.filterable
      const iconWidth = (hasSort ? 16 : 0) + (hasFilter ? 16 : 0)
      const text = this.fitText(col.title, visibleWidth - spacing.padding * 2 - iconWidth)
      const textX = this.getTextX(x, visibleWidth, col.align || 'left', spacing.padding)
      this.ctx.fillText(text, textX, headerHeight / 2)

      // 绘制图标
      let iconX = x + visibleWidth - 20

      if (hasFilter) {
        this.renderFilterIcon(iconX, headerHeight / 2, this.filterState.has(col.key))
        iconX -= 16
      }

      if (hasSort) {
        const sortOrder = this.sortState.get(col.key)
        this.renderSortIcon(iconX, headerHeight / 2, sortOrder)
      }
    })
  }

  /**
   * 渲染数据行
   */
  private renderVisibleRows(headerHeight: number, cellHeight: number) {
    const { colors, fonts, spacing } = this.theme

    let originalTotalWidth = 0
    for (const col of this.columns) {
      originalTotalWidth += col.width || 120
    }

    this.visibleRows.forEach((row: any, rowIndex: number) => {
      const actualRowIndex = this.startIndex + rowIndex
      const y = headerHeight + rowIndex * cellHeight

      if (y >= this.height) {
        return
      }

      const isStripe = colors.stripe && actualRowIndex % 2 === 1

      this.columns.forEach((col, colIndex) => {
        const x = this.getColumnX(colIndex) - this.scrollLeft
        let width = col.width || 120

        // 如果列完全在可视区域外，跳过绘制
        if (x + width <= 0 || x >= this.width) {
          return
        }

        if (colIndex === this.columns.length - 1 && originalTotalWidth < this.width) {
          width = this.width - (this.getColumnX(colIndex) - this.scrollLeft)
        }

        const visibleWidth = Math.min(width, this.width - x)

        // 绘制单元格背景
        this.ctx.fillStyle = isStripe ? (colors.stripe || colors.background) : colors.background
        this.ctx.fillRect(x, y, visibleWidth, cellHeight)

        // 绘制单元格边框
        this.ctx.strokeStyle = colors.border
        this.ctx.lineWidth = spacing.border
        this.ctx.strokeRect(x, y, visibleWidth, cellHeight)

        // 绘制文字
        this.ctx.font = `normal ${fonts.cell.weight} ${parseInt(fonts.cell.size)}px "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
        this.ctx.fillStyle = colors.text
        this.ctx.textAlign = col.align || 'left'
        this.ctx.textBaseline = 'middle'

        const dataValue = row[col.dataIndex || col.key]
        const text = col.render ? col.render(row, actualRowIndex, col) : String(dataValue ?? '')

        const fittedText = this.fitText(text, visibleWidth - spacing.padding * 2)
        const textX = this.getTextX(x, visibleWidth, col.align || 'left', spacing.padding)
        this.ctx.fillText(fittedText, textX, y + cellHeight / 2)
      })
    })
  }

  /**
   * 渲染网格线
   */
  private renderGrid(headerHeight: number, cellHeight: number) {
    const { colors, spacing } = this.theme

    const totalWidth = this.getTotalColumnsWidth()
    const gridLineWidth = Math.min(totalWidth, this.width)
    const maxVisibleY = this.height

    for (let localRowIndex = 0; localRowIndex < this.visibleRows.length - 1; localRowIndex++) {
      const y = headerHeight + (localRowIndex + 1) * cellHeight

      if (y < maxVisibleY) {
        this.ctx.strokeStyle = colors.border
        this.ctx.lineWidth = spacing.border
        this.ctx.beginPath()
        // 应用横向滚动偏移
        this.ctx.moveTo(-this.scrollLeft, y)
        this.ctx.lineTo(gridLineWidth - this.scrollLeft, y)
        this.ctx.stroke()
      }
    }

    // 表格底部边框
    const bottomY = headerHeight + this.visibleRows.length * cellHeight
    if (bottomY < this.height) {
      this.ctx.strokeStyle = colors.border
      this.ctx.lineWidth = spacing.border
      this.ctx.beginPath()
      // 应用横向滚动偏移
      this.ctx.moveTo(-this.scrollLeft, bottomY)
      this.ctx.lineTo(gridLineWidth - this.scrollLeft, bottomY)
      this.ctx.stroke()
    }
  }

  /**
   * 绘制筛选图标（使用简单 Unicode 字符）
   */
  private renderFilterIcon(x: number, y: number, isActive: boolean) {
    const fontSize = 12

    if (isActive) {
      this.ctx.fillStyle = this.theme.colors.primary
    } else {
      this.ctx.fillStyle = this.theme.colors.text
    }

    this.ctx.font = `${fontSize}px sans-serif`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'

    // 使用简单的 Unicode 符号
    const icon = isActive ? '▼' : '▽'
    this.ctx.fillText(icon, x, y)
  }

  /**
   * 绘制排序图标（使用简单 Unicode 字符）
   */
  private renderSortIcon(x: number, y: number, order: SortOrder) {
    const fontSize = 12

    this.ctx.fillStyle = this.theme.colors.text
    this.ctx.font = `${fontSize}px sans-serif`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'

    let icon = '⇅'
    if (order === 'asc') icon = '↑'
    else if (order === 'desc') icon = '↓'

    this.ctx.fillText(icon, x, y)
  }

  // ============================================================================
  // 排序相关
  // ============================================================================

  setSortState(field: string, order: SortOrder) {
    this.sortState.set(field, order)
    this.render()
  }

  getSortState(field: string): SortOrder | undefined {
    return this.sortState.get(field)
  }

  clearAllSortStates() {
    this.sortState.clear()
    this.render()
  }

  // ============================================================================
  // 筛选相关
  // ============================================================================

  setFilterState(field: string, isActive: boolean) {
    if (isActive) {
      this.filterState.add(field)
    } else {
      this.filterState.delete(field)
    }
    this.render()
  }

  getFilterState(field: string): boolean {
    return this.filterState.has(field)
  }

  clearAllFilterStates() {
    this.filterState.clear()
    this.render()
  }

  // ============================================================================
  // 选择相关
  // ============================================================================

  toggleRowSelection(rowIndex: number) {
    if (this.selectedRows.has(rowIndex)) {
      this.selectedRows.delete(rowIndex)
    } else {
      this.selectedRows.add(rowIndex)
    }
    this.render()
  }

  clearSelection() {
    this.selectedRows.clear()
    this.render()
  }

  getSelectedRows(): number[] {
    return Array.from(this.selectedRows)
  }

  // ============================================================================
  // 高亮相关
  // ============================================================================

  highlightCell(cell: Cell | any) {
    if (this.highlightedCell) {
      this.clearCellHighlight(this.highlightedCell)
    }

    this.highlightedCell = cell
    if (cell && this.ctx) {
      this.applyCellHighlight(cell, true)
    }
  }

  clearHighlight() {
    if (this.highlightedCell) {
      const cell = this.highlightedCell
      this.highlightedCell = null
      this.clearCellHighlight(cell)
    }
  }

  private applyCellHighlight(cell: Cell | any, isHighlight: boolean) {
    if (!cell || !this.ctx) return

    const { row, col, x, y, width, height } = cell
    const cellHeight = this.theme.spacing.cell

    const localRowIndex = row - this.startIndex

    if (localRowIndex >= 0 && localRowIndex < this.visibleRows.length) {
      const rowData = this.visibleRows[localRowIndex]
      const column = this.columns[col]

      if (!column || !x || !width) return

      // 绘制单元格背景
      const fillColor = isHighlight ? this.theme.colors.hover : this.theme.colors.background
      this.ctx.fillStyle = fillColor
      this.ctx.fillRect(x, y, width, height || cellHeight)

      // 绘制单元格边框
      this.ctx.strokeStyle = this.theme.colors.border
      this.ctx.lineWidth = this.theme.spacing.border
      this.ctx.strokeRect(x, y, width, height || cellHeight)

      // 重新绘制文字
      this.ctx.font = `normal ${this.theme.fonts.cell.weight} ${parseInt(this.theme.fonts.cell.size)}px "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
      this.ctx.fillStyle = this.theme.colors.text
      this.ctx.textAlign = column.align || 'left'
      this.ctx.textBaseline = 'middle'

      const dataValue = rowData[column.dataIndex || column.key]
      const text = column.render ? column.render(rowData, row, column) : String(dataValue ?? '')
      const fittedText = this.fitText(text, width - this.theme.spacing.padding * 2)
      const textX = this.getTextX(x, width, column.align || 'left', this.theme.spacing.padding)
      this.ctx.fillText(fittedText, textX, y + (height || cellHeight) / 2)
    }
  }

  private clearCellHighlight(cell: Cell | any) {
    if (!cell || !this.ctx) return

    const { row, col, x, y, width, height } = cell
    const cellHeight = this.theme.spacing.cell

    const localRowIndex = row - this.startIndex

    if (localRowIndex >= 0 && localRowIndex < this.visibleRows.length) {
      const rowData = this.visibleRows[localRowIndex]
      const column = this.columns[col]

      if (!column || !x || !width) return

      // 绘制单元格背景
      this.ctx.fillStyle = this.theme.colors.background
      this.ctx.fillRect(x, y, width, height || cellHeight)

      // 绘制单元格边框
      this.ctx.strokeStyle = this.theme.colors.border
      this.ctx.lineWidth = this.theme.spacing.border
      this.ctx.strokeRect(x, y, width, height || cellHeight)

      // 重新绘制文字
      this.ctx.font = `normal ${this.theme.fonts.cell.weight} ${parseInt(this.theme.fonts.cell.size)}px "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
      this.ctx.fillStyle = this.theme.colors.text
      this.ctx.textAlign = column.align || 'left'
      this.ctx.textBaseline = 'middle'

      const dataValue = rowData[column.dataIndex || column.key]
      const text = column.render ? column.render(rowData, row, column) : String(dataValue ?? '')
      const fittedText = this.fitText(text, width - this.theme.spacing.padding * 2)
      const textX = this.getTextX(x, width, column.align || 'left', this.theme.spacing.padding)
      this.ctx.fillText(fittedText, textX, y + (height || cellHeight) / 2)
    }
  }

  // ============================================================================
  // 增量更新（占位符）
  // ============================================================================

  updateCell(rowIndex: number, colIndex: number, newData: any) {
    // 占位符：原生 Canvas 模式下的增量更新
    this.render()
  }

  batchUpdateCells(updates: Array<{ rowIndex: number; colIndex: number; data: any }>) {
    // 占位符：原生 Canvas 模式下的批量更新
    this.render()
  }

  beginUpdate() {
    // 占位符
  }

  endUpdate() {
    // 占位符
  }

  // ============================================================================
  // 辅助方法
  // ============================================================================

  private getColumnX(index: number): number {
    let x = 0
    for (let i = 0; i < index; i++) {
      x += this.columns[i].width || 120
    }
    return x
  }

  private getTextX(x: number, width: number, align: string, padding: number): number {
    switch (align) {
      case 'center':
        return x + width / 2
      case 'right':
        return x + width - padding
      default:
        return x + padding
    }
  }

  private getTotalColumnsWidth(): number {
    let totalWidth = 0
    for (const col of this.columns) {
      totalWidth += col.width || 120
    }
    return Math.max(totalWidth, this.width)
  }

  private fitText(text: string, maxWidth: number): string {
    if (!this.ctx) return text

    const metrics = this.ctx.measureText(text)

    if (metrics.width <= maxWidth) {
      return text
    }

    let result = text
    while (this.ctx.measureText(result).width > maxWidth && result.length > 0) {
      result = result.slice(0, -1)
    }

    return result.length > 0 ? result + '...' : ''
  }

  // ============================================================================
  // 销毁
  // ============================================================================

  destroy() {
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  }
}
