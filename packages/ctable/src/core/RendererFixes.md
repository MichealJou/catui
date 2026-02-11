/**
 * CanvasRenderer 修复方案
 * 修复 hover 双重边框问题
 *
 * 问题：highlightCell 方法中，fillRect 绘制背景后，
 * renderCell 会重新绘制边框，导致双重边框
 */

// 方案 1：拆分 renderCell，分离边框和内容渲染
// ============================================================

class CanvasRenderer extends RendererState {
  // ... 其他代码

  /**
   * 高亮单元格（修复双重边框问题）
   *
   * 修复策略：
   * 1. 只绘制 hover 背景
   * 2. 重新绘制文字内容（但不绘制边框）
   * 3. 保持原有边框不变
   */
  highlightCell(cell: Cell) {
    const { colors } = this.theme

    // 1. 绘制 hover 背景
    this.ctx.fillStyle = colors.hover
    this.ctx.fillRect(cell.x, cell.y, cell.width, cell.height)

    // 2. 重新绘制文字内容（不绘制边框）
    this.renderCellContentOnly(cell)
  }

  /**
   * 只渲染单元格内容，不渲染边框
   * 用于 hover 状态，避免双重边框
   */
  private renderCellContentOnly(cell: Cell) {
    const { colors, fonts, spacing } = this.theme
    const { column, data } = cell

    // 绘制文字
    this.ctx.font = `${fonts.cell.weight} ${fonts.cell.size} -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
    this.ctx.fillStyle = colors.text
    this.ctx.textAlign = column.align || 'left'
    this.ctx.textBaseline = 'middle'

    const dataValue = data[column.dataIndex || column.key]
    const text = column.render
      ? column.render(data, cell.row, column)
      : String(dataValue ?? '')

    const fittedText = fitText(
      text,
      cell.width - spacing.padding * 2,
      this.ctx.font,
      this.ctx
    )

    const textX = this.getTextX(
      cell.x,
      cell.width,
      column.align || 'left',
      spacing.padding
    )
    this.ctx.fillText(fittedText, textX, cell.y + cell.height / 2)
  }

  /**
   * 清除高亮（重新渲染整个表格）
   */
  clearHighlight() {
    // 触发完整的重新渲染，清除所有 hover 状态
    this.render()
  }
}

// 方案 2：使用图层概念，分别处理背景、边框、内容
// ============================================================

class CanvasRendererV2 extends RendererState {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number
  private dpr: number
  private theme: ThemeConfig
  private cells: Map<string, Cell>
  private hoverCell: Cell | null = null

  // ... 其他代码

  /**
   * 高亮单元格（V2 版本 - 使用图层）
   */
  highlightCell(cell: Cell) {
    this.hoverCell = cell
    this.render()
  }

  /**
   * 渲染方法（支持 hover 图层）
   */
  render(visibleRows: any[] = [], visibleCols: Column[] = []) {
    this.clear()

    if (visibleCols.length === 0) {
      return
    }

    const headerHeight = this.theme.spacing.header

    // 图层 1: 绘制表头
    this.renderHeader(visibleCols, headerHeight)

    // 图层 2: 绘制数据行背景
    this.renderRowBackgrounds(visibleRows, visibleCols, headerHeight)

    // 图层 3: 绘制 hover 背景（如果有）
    if (this.hoverCell) {
      this.renderHoverBackground(this.hoverCell)
    }

    // 图层 4: 绘制边框
    this.renderBorders(visibleRows, visibleCols, headerHeight)

    // 图层 5: 绘制文字内容
    this.renderCellContents(visibleRows, visibleCols, headerHeight)
  }

  /**
   * 渲染行背景
   */
  private renderRowBackgrounds(rows: any[], columns: Column[], headerHeight: number) {
    const { colors, spacing } = this.theme
    const cellHeight = spacing.cell

    rows.forEach((_, rowIndex) => {
      const y = headerHeight + rowIndex * cellHeight

      // 奇偶行斑马纹
      const isEven = rowIndex % 2 === 0
      this.ctx.fillStyle = isEven ? colors.background : (colors.stripe || colors.background)
      this.ctx.fillRect(0, y, this.width, cellHeight)
    })
  }

  /**
   * 渲染 hover 背景
   */
  private renderHoverBackground(cell: Cell) {
    const { colors } = this.theme

    this.ctx.fillStyle = colors.hover
    this.ctx.fillRect(cell.x, cell.y, cell.width, cell.height)
  }

  /**
   * 渲染边框（统一渲染，避免重复）
   */
  private renderBorders(rows: any[], columns: Column[], headerHeight: number) {
    const { colors, spacing } = this.theme
    const cellHeight = spacing.cell

    this.ctx.strokeStyle = colors.border
    this.ctx.lineWidth = spacing.border

    // 绘制表头边框
    this.drawHeaderBorders(columns, headerHeight)

    // 绘制数据行边框
    rows.forEach((_, rowIndex) => {
      const y = headerHeight + rowIndex * cellHeight
      this.ctx.beginPath()
      this.ctx.moveTo(0, y + cellHeight)
      this.ctx.lineTo(this.width, y + cellHeight)
      this.ctx.stroke()
    })

    // 绘制列边框
    let x = 0
    columns.forEach((col) => {
      x += col.width || 120
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, headerHeight + rows.length * cellHeight)
      this.ctx.stroke()
    })
  }

  /**
   * 渲染单元格内容
   */
  private renderCellContents(rows: any[], columns: Column[], headerHeight: number) {
    const { fonts, spacing } = this.theme
    const cellHeight = spacing.cell

    this.ctx.font = `${fonts.cell.weight} ${fonts.cell.size} -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
    this.ctx.fillStyle = this.theme.colors.text
    this.ctx.textBaseline = 'middle'

    rows.forEach((row, rowIndex) => {
      columns.forEach((col, colIndex) => {
        const x = this.getColumnX(columns, colIndex)
        const y = headerHeight + rowIndex * cellHeight

        const dataValue = row[col.dataIndex || col.key]
        const text = col.render
          ? col.render(row, rowIndex, col)
          : String(dataValue ?? '')

        const fittedText = fitText(
          text,
          (col.width || 120) - spacing.padding * 2,
          this.ctx.font,
          this.ctx
        )

        this.ctx.textAlign = col.align || 'left'
        const textX = this.getTextX(x, col.width || 120, col.align || 'left', spacing.padding)
        this.ctx.fillText(fittedText, textX, y + cellHeight / 2)
      })
    })
  }

  /**
   * 绘制表头边框
   */
  private drawHeaderBorders(columns: Column[], headerHeight: number) {
    const { colors, spacing } = this.theme

    this.ctx.strokeStyle = colors.border
    this.ctx.lineWidth = spacing.border

    // 绘制表头外边框
    this.ctx.strokeRect(0, 0, this.width, headerHeight)

    // 绘制列分隔线
    let x = 0
    columns.forEach((col) => {
      x += col.width || 120
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, headerHeight)
      this.ctx.stroke()
    })
  }
}

// 方案 3：使用离屏 Canvas 缓存（性能优化）
// ============================================================

class CanvasRendererV3 extends RendererState {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private offscreenCanvas: HTMLCanvasElement
  private offscreenCtx: CanvasRenderingContext2D
  private hoverCell: Cell | null = null

  constructor(canvas: HTMLCanvasElement, width: number, height: number, theme: ThemeConfig, selectable: boolean = false) {
    super()

    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.width = width
    this.height = height
    this.dpr = window.devicePixelRatio || 1
    this.theme = theme
    this.selectable = selectable

    // 创建离屏 Canvas
    this.offscreenCanvas = document.createElement('canvas')
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!

    this.initCanvas()
    this.initOffscreenCanvas()
  }

  private initOffscreenCanvas() {
    this.offscreenCanvas.width = this.width * this.dpr
    this.offscreenCanvas.height = this.height * this.dpr
    this.offscreenCtx.scale(this.dpr, this.dpr)
  }

  /**
   * 高亮单元格（使用离屏 Canvas）
   */
  highlightCell(cell: Cell) {
    this.hoverCell = cell

    // 1. 从离屏 Canvas 复制基础渲染
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.ctx.drawImage(this.offscreenCanvas, 0, 0)

    // 2. 绘制 hover 背景
    const { colors } = this.theme
    this.ctx.fillStyle = colors.hover
    this.ctx.fillRect(cell.x, cell.y, cell.width, cell.height)

    // 3. 重新绘制单元格内容（不绘制边框）
    this.renderCellContentOnly(cell)
  }

  /**
   * 渲染到离屏 Canvas（缓存基础渲染）
   */
  renderToOffscreen(visibleRows: any[] = [], visibleCols: Column[] = []) {
    const ctx = this.offscreenCtx
    ctx.clearRect(0, 0, this.width, this.height)

    if (visibleCols.length === 0) {
      return
    }

    const headerHeight = this.theme.spacing.header

    this.renderHeader(ctx, visibleCols, headerHeight)
    this.renderRows(ctx, visibleRows, visibleCols, headerHeight)
    this.renderGrid(ctx, visibleRows, visibleCols, headerHeight)
  }

  /**
   * 主渲染方法
   */
  render(visibleRows: any[] = [], visibleCols: Column[] = []) {
    // 先渲染到离屏 Canvas
    this.renderToOffscreen(visibleRows, visibleCols)

    // 再复制到主 Canvas
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.ctx.drawImage(this.offscreenCanvas, 0, 0)

    // 如果有 hover 单元格，绘制 hover 效果
    if (this.hoverCell) {
      const { colors } = this.theme
      this.ctx.fillStyle = colors.hover
      this.ctx.fillRect(this.hoverCell.x, this.hoverCell.y, this.hoverCell.width, this.hoverCell.height)
      this.renderCellContentOnly(this.hoverCell)
    }
  }

  /**
   * 清除高亮
   */
  clearHighlight() {
    this.hoverCell = null
    // 直接从离屏 Canvas 复制
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.ctx.drawImage(this.offscreenCanvas, 0, 0)
  }

  // ... 其他辅助方法
}

// 方案 4：优化 EventManager，减少不必要的渲染
// ============================================================

class OptimizedEventManager {
  private canvas: HTMLCanvasElement
  private renderer: any
  private hoverCell: Cell | null = null
  private hoverAnimationFrame: number | null = null

  /**
   * 优化的 hover 处理
   * 使用 requestAnimationFrame 节流，避免过度渲染
   */
  private handleMouseMove = (event: MouseEvent) => {
    const point = this.getEventPosition(event)
    const cell = this.renderer.hitTest(point)

    if (cell !== this.hoverCell) {
      // 取消之前的动画帧
      if (this.hoverAnimationFrame !== null) {
        cancelAnimationFrame(this.hoverAnimationFrame)
      }

      // 使用 requestAnimationFrame 节流
      this.hoverAnimationFrame = requestAnimationFrame(() => {
        this.renderer.clearHighlight()
        this.hoverCell = cell

        if (cell) {
          this.renderer.highlightCell(cell)
          this.emit('hover', { cell })
        } else {
          this.emit('mouseleave', {})
        }

        this.hoverAnimationFrame = null
      })
    }
  }
}

// 使用建议
// ============================================================

/**
 * 推荐方案：
 * - 小数据量（< 1000 行）：使用方案 1（简单有效）
 * - 中等数据量（1000-5000 行）：使用方案 2（图层分离）
 * - 大数据量（> 5000 行）：使用方案 3（离屏 Canvas 缓存）+ 方案 4（节流）
 */

// 快速修复（最小改动）
// ============================================================

/**
 * 如果不想重构太多代码，可以直接在现有代码中添加
 * renderCellContentOnly 方法，修改 highlightCell 调用它
 */

// 在现有 CanvasRenderer 中添加
private renderCellContentOnly(cell: Cell) {
  const { colors, fonts, spacing } = this.theme
  const { column, data } = cell

  // 只绘制文字，不绘制背景和边框
  this.ctx.font = `${fonts.cell.weight} ${fonts.cell.size} -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
  this.ctx.fillStyle = colors.text
  this.ctx.textAlign = column.align || 'left'
  this.ctx.textBaseline = 'middle'

  const dataValue = data[column.dataIndex || column.key]
  const text = column.render
    ? column.render(data, cell.row, column)
    : String(dataValue ?? '')

  const fittedText = fitText(
    text,
    cell.width - spacing.padding * 2,
    this.ctx.font,
    this.ctx
  )

  const textX = this.getTextX(
    cell.x,
    cell.width,
    column.align || 'left',
    spacing.padding
  )
  this.ctx.fillText(fittedText, textX, cell.y + cell.height / 2)
}

// 修改 highlightCell
highlightCell(cell: Cell) {
  const { colors } = this.theme

  // 绘制 hover 背景
  this.ctx.fillStyle = colors.hover
  this.ctx.fillRect(cell.x, cell.y, cell.width, cell.height)

  // 只绘制内容，不绘制边框（修复双重边框）
  this.renderCellContentOnly(cell)
}
