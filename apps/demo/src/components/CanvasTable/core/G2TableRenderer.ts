import { Chart } from '@antv/g2'
import type { Column, ThemeConfig, Cell, SortOrder } from '../types'

export class G2TableRenderer {
  private chart: Chart | null = null
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
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
  private filterState: Set<string> = new Set() // 存储有激活筛选的字段
  
  constructor(canvas: HTMLCanvasElement, width: number, height: number, theme: ThemeConfig, selectable: boolean = false) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.width = width
    this.height = height
    this.theme = theme
    this.selectable = selectable
    
    this.initChart()
    this.initCanvas()
  }
  
  private initChart() {
    if (this.chart) {
      this.chart.destroy()
    }
    
    this.chart = new Chart({
      container: this.canvas,
      autoFit: false,
      width: this.width,
      height: this.height,
      padding: [0, 0, 0, 0]
    })
  }
  
  resize(width: number, height: number) {
    this.width = width
    this.height = height
    
    if (this.chart) {
      this.chart.changeSize(width, height)
    }
    
    this.initCanvas()
  }
  
  private initCanvas() {
    const dpr = (window as any).devicePixelRatio || 1
    this.canvas.width = this.width * dpr
    this.canvas.height = this.height * dpr
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    this.ctx.scale(dpr, dpr)
  }
  
  setTheme(theme: ThemeConfig) {
    this.theme = theme
    this.render()
  }
  
  setData(data: any[], columns: Column[]) {
    console.log('[G2TableRenderer] setData:', {
      dataLength: data.length,
      columnsLength: columns.length
    });
    this.data = data
    this.columns = columns
  }
  
  setVisibleData(startIndex: number, endIndex: number) {
    this.startIndex = startIndex
    this.endIndex = endIndex
    this.visibleRows = this.data.slice(startIndex, endIndex)
    this.render()
  }
  
  render() {
    if (!this.ctx) {
      return
    }

    // 清除画布
    this.ctx.clearRect(0, 0, this.width, this.height)

    const headerHeight = this.theme.spacing.header
    const cellHeight = this.theme.spacing.cell

    console.log('[G2TableRenderer] render:', {
      totalData: this.data.length,
      visibleRows: this.visibleRows.length,
      columns: this.columns.length,
      startIndex: this.startIndex,
      endIndex: this.endIndex,
      highlightedCell: this.highlightedCell,
      canvasSize: { width: this.width, height: this.height }
    })

    // 设置裁剪区域，确保所有绘制都在表格范围内
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.rect(0, 0, this.width, this.height)
    this.ctx.clip()

    // 绘制内容
    this.renderHeader(headerHeight)
    this.renderVisibleRows(headerHeight, cellHeight)
    this.renderGrid(headerHeight, cellHeight)

    if (this.highlightedCell) {
      this.drawHighlightedCell(headerHeight, cellHeight)
    }

    // 恢复裁剪状态
    this.ctx.restore()
  }
  
  private renderHeader(headerHeight: number) {
    const { colors, fonts, spacing } = this.theme

    console.log('[renderHeader] columns:', this.columns.length, 'headerHeight:', headerHeight)

    // 计算原始列宽总和（用于判断是否需要扩展）
    let originalTotalWidth = 0
    for (const col of this.columns) {
      originalTotalWidth += col.width || 120
    }

    this.columns.forEach((col, colIndex) => {
      const x = this.getColumnX(colIndex)
      let width = col.width || 120

      // 不绘制超出 Canvas 宽度的列
      if (x >= this.width) {
        return
      }

      // 如果是最后一列且列总宽度小于容器宽度，自动扩展以填充剩余空间
      if (colIndex === this.columns.length - 1 && originalTotalWidth < this.width) {
        width = this.width - x
      }

      // 如果列超出边界，只绘制可见部分
      const visibleWidth = Math.min(width, this.width - x)

      this.ctx.fillStyle = colors.header
      this.ctx.fillRect(x, 0, visibleWidth, headerHeight)

      // ant-design-vue 风格：表头底部有更粗的边框
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

      this.ctx.font = `${fonts.header.weight} ${fonts.header.size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
      this.ctx.fillStyle = colors.text
      this.ctx.textAlign = col.align || 'left'
      this.ctx.textBaseline = 'middle'

      // 计算文本区域宽度（如果是可排序列，预留排序图标空间）
      const hasSort = col.sortable
      const hasFilter = col.filterable
      const iconWidth = (hasSort ? 16 : 0) + (hasFilter ? 16 : 0)
      const text = this.fitText(col.title, visibleWidth - spacing.padding * 2 - iconWidth)
      const textX = this.getTextX(x, visibleWidth, col.align || 'left', spacing.padding)
      this.ctx.fillText(text, textX, headerHeight / 2)

      // 绘制图标（从右到左）
      let iconX = x + visibleWidth - 20

      // 绘制筛选图标
      if (hasFilter) {
        this.renderFilterIcon(iconX, headerHeight / 2, this.filterState.has(col.key))
        iconX -= 16
      }

      // 绘制排序图标
      if (hasSort) {
        const sortOrder = this.sortState.get(col.key)
        this.renderSortIcon(iconX, headerHeight / 2, sortOrder)
      }
    })
  }

  /**
   * 绘制筛选图标（漏斗）
   */
  private renderFilterIcon(x: number, y: number, isActive: boolean) {
    const size = 6

    // 设置颜色
    if (isActive) {
      this.ctx.fillStyle = this.theme.colors.primary
      this.ctx.strokeStyle = this.theme.colors.primary
    } else {
      this.ctx.fillStyle = this.theme.colors.text
      this.ctx.strokeStyle = this.theme.colors.text
    }
    this.ctx.lineWidth = 1.5

    // 绘制漏斗形状
    this.ctx.beginPath()
    // 上宽
    this.ctx.moveTo(x - size, y - size / 2)
    this.ctx.lineTo(x + size, y - size / 2)
    // 下窄
    this.ctx.lineTo(x + size / 3, y + size / 2)
    this.ctx.lineTo(x - size / 3, y + size / 2)
    this.ctx.closePath()

    if (isActive) {
      this.ctx.fill()
    } else {
      this.ctx.stroke()
    }

    // 绘制漏斗底部线条
    this.ctx.beginPath()
    this.ctx.moveTo(x - size / 3, y + size / 2)
    this.ctx.lineTo(x + size / 3, y + size / 2)
    this.ctx.stroke()
  }

  /**
   * 设置筛选状态
   */
  setFilterState(field: string, isActive: boolean) {
    if (isActive) {
      this.filterState.add(field)
    } else {
      this.filterState.delete(field)
    }
    this.render()
  }

  /**
   * 获取筛选状态
   */
  getFilterState(field: string): boolean {
    return this.filterState.has(field)
  }

  /**
   * 清除所有筛选状态
   */
  clearAllFilterStates() {
    this.filterState.clear()
    this.render()
  }

  /**
   * 绘制排序图标
   */
  private renderSortIcon(x: number, y: number, order: SortOrder) {
    const iconSize = 6
    const gap = 2

    this.ctx.fillStyle = this.theme.colors.text
    this.ctx.strokeStyle = this.theme.colors.text
    this.ctx.lineWidth = 1.5

    if (order === 'asc') {
      // 上升箭头（实心）
      this.ctx.beginPath()
      this.ctx.moveTo(x, y - gap)
      this.ctx.lineTo(x - iconSize / 2, y - gap - iconSize)
      this.ctx.lineTo(x + iconSize / 2, y - gap - iconSize)
      this.ctx.closePath()
      this.ctx.fill()

      // 下降箭头（空心）
      this.ctx.beginPath()
      this.ctx.moveTo(x, y + gap)
      this.ctx.lineTo(x - iconSize / 2, y + gap + iconSize)
      this.ctx.lineTo(x + iconSize / 2, y + gap + iconSize)
      this.ctx.stroke()
    } else if (order === 'desc') {
      // 上升箭头（空心）
      this.ctx.beginPath()
      this.ctx.moveTo(x, y - gap)
      this.ctx.lineTo(x - iconSize / 2, y - gap - iconSize)
      this.ctx.lineTo(x + iconSize / 2, y - gap - iconSize)
      this.ctx.stroke()

      // 下降箭头（实心）
      this.ctx.beginPath()
      this.ctx.moveTo(x, y + gap)
      this.ctx.lineTo(x - iconSize / 2, y + gap + iconSize)
      this.ctx.lineTo(x + iconSize / 2, y + gap + iconSize)
      this.ctx.closePath()
      this.ctx.fill()
    } else {
      // 无排序状态：显示两个空心箭头
      this.ctx.beginPath()
      this.ctx.moveTo(x, y - gap)
      this.ctx.lineTo(x - iconSize / 2, y - gap - iconSize)
      this.ctx.lineTo(x + iconSize / 2, y - gap - iconSize)
      this.ctx.stroke()

      this.ctx.beginPath()
      this.ctx.moveTo(x, y + gap)
      this.ctx.lineTo(x - iconSize / 2, y + gap + iconSize)
      this.ctx.lineTo(x + iconSize / 2, y + gap + iconSize)
      this.ctx.stroke()
    }
  }

  /**
   * 设置排序状态
   */
  setSortState(field: string, order: SortOrder) {
    this.sortState.set(field, order)
    this.render()
  }

  /**
   * 获取排序状态
   */
  getSortState(field: string): SortOrder | undefined {
    return this.sortState.get(field)
  }

  /**
   * 清除所有排序状态
   */
  clearAllSortStates() {
    this.sortState.clear()
    this.render()
  }
  
  private renderVisibleRows(headerHeight: number, cellHeight: number) {
    const { colors, fonts, spacing } = this.theme

    // 计算原始列宽总和（用于判断是否需要扩展）
    let originalTotalWidth = 0
    for (const col of this.columns) {
      originalTotalWidth += col.width || 120
    }

    this.visibleRows.forEach((row: any, rowIndex: number) => {
      const actualRowIndex = this.startIndex + rowIndex
      const y = headerHeight + rowIndex * cellHeight

      // 不绘制超出 Canvas 高度的行（只有当行的顶部超出边界时才跳过）
      if (y >= this.height) {
        return
      }

      // ant-design-vue 风格：隔行变色（斑马纹）
      const isStripe = colors.stripe && actualRowIndex % 2 === 1

      this.columns.forEach((col, colIndex) => {
        const x = this.getColumnX(colIndex)
        let width = col.width || 120

        // 不绘制超出 Canvas 宽度的列
        if (x >= this.width) {
          return
        }

        // 如果是最后一列且列总宽度小于容器宽度，自动扩展以填充剩余空间
        if (colIndex === this.columns.length - 1 && originalTotalWidth < this.width) {
          width = this.width - x
        }

        // 如果列超出边界，只绘制可见部分
        const visibleWidth = Math.min(width, this.width - x)

        // 绘制单元格背景（支持斑马纹）
        this.ctx.fillStyle = isStripe ? (colors.stripe || colors.background) : colors.background
        this.ctx.fillRect(x, y, visibleWidth, cellHeight)

        // 绘制单元格边框（ant-design-vue 风格）
        this.ctx.strokeStyle = colors.border
        this.ctx.lineWidth = spacing.border
        this.ctx.strokeRect(x, y, visibleWidth, cellHeight)

        // 绘制文字
        this.ctx.font = `${fonts.cell.weight} ${fonts.cell.size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
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
  
  private renderGrid(headerHeight: number, cellHeight: number) {
    const { colors, spacing } = this.theme

    // 计算实际表格内容的总宽度（使用扩展后的宽度）
    const totalWidth = this.getTotalColumnsWidth()
    // 水平线条应该延伸到的位置
    const gridLineWidth = Math.min(totalWidth, this.width)

    // 只绘制可见行之间的横线（不包括最后一行下方）
    const maxVisibleY = this.height

    for (let localRowIndex = 0; localRowIndex < this.visibleRows.length - 1; localRowIndex++) {
      const y = headerHeight + (localRowIndex + 1) * cellHeight

      // 不绘制超出 Canvas 高度的线条
      if (y < maxVisibleY) {
        this.ctx.strokeStyle = colors.border
        this.ctx.lineWidth = spacing.border
        this.ctx.beginPath()
        this.ctx.moveTo(0, y)
        this.ctx.lineTo(gridLineWidth, y)
        this.ctx.stroke()
      }
    }

    // 绘制表格底部边框
    const bottomY = headerHeight + this.visibleRows.length * cellHeight
    if (bottomY < this.height) {
      this.ctx.strokeStyle = colors.border
      this.ctx.lineWidth = spacing.border
      this.ctx.beginPath()
      this.ctx.moveTo(0, bottomY)
      this.ctx.lineTo(gridLineWidth, bottomY)
      this.ctx.stroke()
    }

    // 不再需要绘制右侧边框，因为最后一列已经自动扩展到容器边缘
  }

  /**
   * 计算所有列的总宽度（如果小于容器宽度，返回容器宽度）
   */
  private getTotalColumnsWidth(): number {
    let totalWidth = 0
    for (const col of this.columns) {
      totalWidth += col.width || 120
    }
    // 如果列总宽度小于容器宽度，返回容器宽度（表格填充整个容器）
    return Math.max(totalWidth, this.width)
  }
  
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
  
  private fitText(text: string, maxWidth: number): string {
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
  
  highlightCell(cell: Cell | any) {
    // 先清除之前的高亮
    if (this.highlightedCell) {
      const oldCell = this.highlightedCell
      this.highlightedCell = cell
      // 只重新渲染受影响的区域
      this.renderCellHighlight(oldCell, false)
      if (cell) {
        this.renderCellHighlight(cell, true)
      }
    } else {
      this.highlightedCell = cell
      if (cell) {
        this.renderCellHighlight(cell, true)
      }
    }
  }

  clearHighlight() {
    if (this.highlightedCell) {
      const cell = this.highlightedCell
      this.highlightedCell = null
      this.renderCellHighlight(cell, false)
    }
  }

  /**
   * 渲染单元格高亮（局部重绘）
   */
  private renderCellHighlight(cell: Cell | any, isHighlight: boolean) {
    if (!cell || !this.ctx) return

    const { colors } = this.theme
    const { row, col, x, y, width = 100, height } = cell
    const headerHeight = this.theme.spacing.header
    const cellHeight = this.theme.spacing.cell

    // 计算实际的数据索引
    const localRowIndex = row - this.startIndex

    if (localRowIndex >= 0 && localRowIndex < this.visibleRows.length) {
      const rowData = this.visibleRows[localRowIndex]
      const column = this.columns[col]

      if (!rowData || !column) return

      // 重新绘制单元格背景
      if (isHighlight) {
        this.ctx.fillStyle = colors.hover
      } else {
        this.ctx.fillStyle = colors.background
      }
      this.ctx.fillRect(x, y, width, height)

      // 重新绘制单元格边框
      this.ctx.strokeStyle = colors.border
      this.ctx.lineWidth = this.theme.spacing.border
      this.ctx.strokeRect(x, y, width, height)

      // 重新绘制单元格文字
      this.ctx.font = `${this.theme.fonts.cell.weight} ${this.theme.fonts.cell.size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
      this.ctx.fillStyle = colors.text
      this.ctx.textAlign = column.align || 'left'
      this.ctx.textBaseline = 'middle'

      const dataValue = rowData[column.dataIndex || column.key]
      const text = column.render ? column.render(rowData, row, column) : String(dataValue ?? '')
      const fittedText = this.fitText(text, width - this.theme.spacing.padding * 2)
      const textX = this.getTextX(x, width, column.align || 'left', this.theme.spacing.padding)
      this.ctx.fillText(fittedText, textX, y + cellHeight / 2)
    }
  }

  private drawHighlightedCell(headerHeight: number, cellHeight: number) {
    // 这个方法已经不需要了，保留以避免破坏性更改
    if (!this.highlightedCell || !this.ctx) return

    const { colors } = this.theme
    const { row, col, x, y, width = 100, height = 40 } = this.highlightedCell

    if (row !== undefined && col !== undefined && y !== undefined) {
      const localRowIndex = row - this.startIndex

      if (localRowIndex >= 0 && localRowIndex < this.visibleRows.length) {
        // 使用半透明的高亮色，避免覆盖文字
        this.ctx.fillStyle = colors.hover + '40' // 添加透明度
        this.ctx.fillRect(x, y, width, cellHeight)
      }
    }
  }
  
  destroy() {
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  }
}
