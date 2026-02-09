import type { Column, Cell, ThemeConfig, RenderTask } from '../types'
import { Point, Rect, measureText, fitText } from '../utils/geometry'
import { CheckboxRenderer } from '../renderers/CheckboxRenderer'

export class CanvasRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number
  private dpr: number
  private theme: ThemeConfig
  private cells: Map<string, Cell> = new Map()
  private renderQueue: RenderTask[] = []
  private checkboxRenderer: CheckboxRenderer
  private selectable: boolean = false
  private selectedRows: Set<number> = new Set()
  private checkboxColumn: number | null = null
  
  constructor(canvas: HTMLCanvasElement, width: number, height: number, theme: ThemeConfig, selectable: boolean = false) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.width = width
    this.height = height
    this.dpr = window.devicePixelRatio || 1
    this.theme = theme
    this.selectable = selectable
    this.checkboxRenderer = new CheckboxRenderer()
    
    this.initCanvas()
  }
  
  private initCanvas() {
    this.canvas.width = this.width * this.dpr
    this.canvas.height = this.height * this.dpr
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    this.ctx.scale(this.dpr, this.dpr)
  }
  
  resize(width: number, height: number) {
    this.width = width
    this.height = height
    this.initCanvas()
    this.render()
  }
  
  setTheme(theme: ThemeConfig) {
    this.theme = theme
    this.render()
  }
  
  updateCell(cell: Cell) {
    const key = `${cell.row}-${cell.col}`
    this.cells.set(key, cell)
    this.renderCell(cell)
  }
  
  render(visibleRows: any[] = [], visibleCols: Column[] = []) {
    this.clear()
    
    if (visibleCols.length === 0) {
      return
    }
    
    const headerHeight = this.theme.spacing.header
    
    this.renderHeader(visibleCols, headerHeight)
    this.renderRows(visibleRows, visibleCols, headerHeight)
    this.renderGrid(visibleRows, visibleCols, headerHeight)
  }
  
  private clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.renderQueue = []
  }
  
  private renderHeader(columns: Column[], headerHeight: number) {
    const { colors, fonts, spacing } = this.theme
    
    columns.forEach((col, index) => {
      const x = this.getColumnX(columns, index)
      const y = 0
      
      this.ctx.fillStyle = colors.header
      this.ctx.fillRect(x, 0, col.width || 120, headerHeight)
      
      this.ctx.strokeStyle = colors.border
      this.ctx.lineWidth = spacing.border
      this.ctx.strokeRect(x, 0, col.width || 120, headerHeight)
      
      this.ctx.font = `${fonts.header.weight} ${fonts.header.size} -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
      this.ctx.fillStyle = colors.text
      this.ctx.textAlign = col.align || 'left'
      this.ctx.textBaseline = 'middle'
      
      const text = fitText(
        col.title,
        (col.width || 120) - spacing.padding * 2,
        this.ctx.font,
        this.ctx
      )
      
      const textX = this.getTextX(x, col.width || 120, col.align || 'left', spacing.padding)
      this.ctx.fillText(text, textX, headerHeight / 2)
    })
  }
  
  private renderRows(rows: any[], columns: Column[], headerHeight: number) {
    const { colors, fonts, spacing } = this.theme
    const cellHeight = spacing.cell
    let checkboxColIndex = -1
    
    if (this.selectable) {
      checkboxColIndex = columns.findIndex(col => col.key === '__checkbox__')
    }
    
    rows.forEach((row, rowIndex) => {
      columns.forEach((col, colIndex) => {
        let x = this.getColumnX(columns, colIndex)
        let width = col.width || 120
        let renderColIndex = colIndex
        
        if (checkboxColIndex !== -1 && colIndex >= checkboxColIndex) {
          renderColIndex = colIndex + 1
        }
        
        const y = headerHeight + rowIndex * cellHeight
        
        if (col.key === '__checkbox__') {
          const checkboxX = x + (width - cellHeight) / 2
          const checkboxY = y + (cellHeight - cellHeight) / 2
          const isChecked = this.selectedRows.has(rowIndex)
          
          this.checkboxRenderer.draw(this.ctx, checkboxX, checkboxY, isChecked)
          
          const cell: Cell = {
            row: rowIndex,
            col: colIndex,
            x: checkboxX,
            y,
            width: cellHeight,
            height: cellHeight,
            data: row,
            column: col
          }
          
          this.cells.set(`${rowIndex}-${colIndex}`, cell)
        } else {
          const cell: Cell = {
            row: rowIndex,
            col: renderColIndex,
            x,
            y,
            width,
            height: cellHeight,
            data: row,
            column: col
          }
          
          this.cells.set(`${rowIndex}-${renderColIndex}`, cell)
          this.renderCell(cell)
        }
      })
    })
  }
  
  private renderCell(cell: Cell) {
    const { colors, fonts, spacing } = this.theme
    
    this.ctx.fillStyle = colors.background
    this.ctx.fillRect(cell.x, cell.y, cell.width, cell.height)
    
    this.ctx.strokeStyle = colors.border
    this.ctx.lineWidth = spacing.border
    this.ctx.strokeRect(cell.x, cell.y, cell.width, cell.height)
    
    this.ctx.font = `${fonts.cell.weight} ${fonts.cell.size} -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
    this.ctx.fillStyle = colors.text
    this.ctx.textAlign = cell.column.align || 'left'
    this.ctx.textBaseline = 'middle'
    
    const dataValue = cell.data[cell.column.dataIndex || cell.column.key]
    const text = cell.column.render
      ? cell.column.render(cell.data, cell.row, cell.column)
      : String(dataValue ?? '')
    
    const fittedText = fitText(
      text,
      cell.width - spacing.padding * 2,
      this.ctx.font,
      this.ctx
    )
    
    const textX = this.getTextX(cell.x, cell.width, cell.column.align || 'left', spacing.padding)
    this.ctx.fillText(fittedText, textX, cell.y + cell.height / 2)
  }
  
  private renderGrid(rows: any[], columns: Column[], headerHeight: number) {
    const { colors, spacing } = this.theme
    const cellHeight = spacing.cell
    
    this.ctx.strokeStyle = colors.border
    this.ctx.lineWidth = spacing.border
    
    rows.forEach((_, rowIndex) => {
      const y = headerHeight + (rowIndex + 1) * cellHeight
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.width, y)
      this.ctx.stroke()
    })
  }
  
  private getColumnX(columns: Column[], index: number): number {
    let x = 0
    for (let i = 0; i < index; i++) {
      x += columns[i].width || 120
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
  
  hitTest(point: Point): Cell | null {
    for (const cell of this.cells.values()) {
      const rect = new Rect(cell.x, cell.y, cell.width, cell.height)
      if (rect.contains(point)) {
        return cell
      }
    }
    return null
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
  
  highlightCell(cell: Cell) {
    const { colors } = this.theme
    this.ctx.fillStyle = colors.hover
    this.ctx.fillRect(cell.x, cell.y, cell.width, cell.height)
    this.renderCell(cell)
  }
  
  clearHighlight() {
    this.render()
  }
  
  destroy() {
    this.cells.clear()
  }
}
