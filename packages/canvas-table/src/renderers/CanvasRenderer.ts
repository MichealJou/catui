import { IRenderer, ICanvasRenderer, RenderParams, UpdateParams, Viewport, ThemeConfig } from '../types/RendererTypes'

export interface CanvasStyle {
  background?: string
  border?: string
  header?: string
  headerBorder?: string
  rowHover?: string
  rowSelected?: string
  textPrimary?: string
  textSecondary?: string
  scrollbarBg?: string
  scrollbarThumb?: string
}

export interface CellConfig {
  x: number
  y: number
  width: number
  height: number
  text?: string
  value?: any
  row?: number
  column?: number
  selected?: boolean
  hovered?: boolean
  header?: boolean
}

export class CanvasRenderer implements ICanvasRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D | null
  private viewport: Viewport
  private theme: ThemeConfig
  private cellHeight: number = 40
  private cellWidth: number = 120
  private dirtyRegions: { x: number; y: number; width: number; height: number }[] = []
  
  constructor(canvas: HTMLCanvasElement, viewport: Viewport, theme: ThemeConfig) {
    this.canvas = canvas
    this.viewport = viewport
    this.theme = theme
    this.ctx = canvas.getContext('2d')
    
    // 设置画布尺寸
    this.resizeCanvas()
    
    // 设置默认样式
    this.setupDefaultStyles()
  }
  
  /**
   * 获取画布上下文
   */
  getContext(): CanvasRenderingContext2D | null {
    return this.ctx
  }
  
  /**
   * 渲染
   */
  render(params: RenderParams): void {
    this.viewport = params.viewport
    this.theme = params.theme
    
    // 清除画布
    this.clear()
    
    // 绘制背景
    this.drawBackground(0, 0, this.viewport.width, this.viewport.height)
    
    // 绘制表头
    if (params.columns.length > 0) {
      this.drawHeader(params.columns)
    }
    
    // 绘制数据行
    this.drawRows(params.data, params.columns, params.selected)
    
    // 绘制选中状态
    this.drawSelections(params.selected, params.columns)
    
    // 绘制滚动条
    if (params.viewport.showScrollbar !== false) {
      this.drawScrollbar()
    }
  }
  
  /**
   * 更新渲染
   */
  update(params: UpdateParams): void {
    if (params.viewport) {
      this.viewport = params.viewport
      this.resizeCanvas()
    }
    
    if (params.theme) {
      this.theme = params.theme
    }
    
    // 重新渲染
    this.render(params as RenderParams)
  }
  
  /**
   * 清除画布
   */
  clear(): void {
    if (!this.ctx) return
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.dirtyRegions = []
  }
  
  /**
   * 调整尺寸
   */
  resize(width: number, height: number): void {
    this.viewport.width = width
    this.viewport.height = height
    this.resizeCanvas()
  }
  
  /**
   * 销毁渲染器
   */
  destroy(): void {
    this.clear()
    this.ctx = null
    this.dirtyRegions = []
  }
  
  /**
   * 设置画布尺寸
   */
  private resizeCanvas(): void {
    const dpr = window.devicePixelRatio || 1
    
    // 设置画布显示尺寸
    this.canvas.width = this.viewport.width * dpr
    this.canvas.height = this.viewport.height * dpr
    
    // 设置画布样式尺寸
    this.canvas.style.width = `${this.viewport.width}px`
    this.canvas.style.height = `${this.viewport.height}px`
    
    // 缩放上下文以支持高DPI
    if (this.ctx) {
      this.ctx.scale(dpr, dpr)
    }
  }
  
  /**
   * 设置默认样式
   */
  private setupDefaultStyles(): void {
    if (!this.ctx) return
    
    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'middle'
    this.ctx.font = '14px Arial, sans-serif'
  }
  
  /**
   * 绘制背景
   */
  drawBackground(x: number, y: number, width: number, height: number): void {
    if (!this.ctx) return
    
    // 保存当前状态
    this.ctx.save()
    
    // 设置背景样式
    this.ctx.fillStyle = this.theme.background || '#ffffff'
    this.ctx.fillRect(x, y, width, height)
    
    // 恢复状态
    this.ctx.restore()
  }
  
  /**
   * 绘制边框
   */
  drawBorder(x: number, y: number, width: number, height: number): void {
    if (!this.ctx) return
    
    // 保存当前状态
    this.ctx.save()
    
    // 设置边框样式
    this.ctx.strokeStyle = this.theme.border || '#e0e0e0'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(x, y, width, height)
    
    // 恢复状态
    this.ctx.restore()
  }
  
  /**
   * 绘制表头
   */
  drawHeader(arg1: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): void {
    // 重载处理
    if (Array.isArray(arg1)) {
      // 绘制完整表头
      this.drawHeaderColumns(arg1)
    } else {
      // 绘制单个表头单元格
      this.drawHeaderCell(arg1, arg2!, arg3!, arg4!, arg5!)
    }
  }
  
  private drawHeaderColumns(columns: any[]): void {
    if (!this.ctx || columns.length === 0) return
    
    const headerHeight = this.cellHeight
    
    // 绘制表头背景
    this.ctx.fillStyle = this.theme.header || '#f5f5f5'
    this.ctx.fillRect(0, 0, this.viewport.width, headerHeight)
    
    // 绘制表头边框
    this.ctx.strokeStyle = this.theme.headerBorder || '#e0e0e0'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(0, 0, this.viewport.width, headerHeight)
    
    // 绘制表头文本
    this.ctx.fillStyle = this.theme.textPrimary || '#333333'
    this.ctx.font = 'bold 14px Arial, sans-serif'
    
    let x = 0
    for (const column of columns) {
      const width = column.width || this.cellWidth
      
      // 绘制表头背景
      if (column.fixed === 'left') {
        this.ctx.fillStyle = this.theme.header || '#f0f0f0'
        this.ctx.fillRect(x, 0, width, headerHeight)
      }
      
      // 绘制表头文本
      this.ctx.fillStyle = this.theme.textPrimary || '#333333'
      this.drawText(
        column.title,
        x + 10,
        headerHeight / 2,
        width - 20,
        headerHeight
      )
      
      // 绘制分隔线
      if (x < this.viewport.width - width) {
        this.ctx.strokeStyle = this.theme.headerBorder || '#e0e0e0'
        this.ctx.beginPath()
        this.ctx.moveTo(x + width, 0)
        this.ctx.lineTo(x + width, headerHeight)
        this.ctx.stroke()
      }
      
      x += width
    }
  }
  
  private drawHeaderCell(x: number, y: number, width: number, height: number, content: any): void {
    if (!this.ctx) return
    
    // 绘制表头背景
    this.ctx.fillStyle = this.theme.header || '#f5f5f5'
    this.ctx.fillRect(x, y, width, height)
    
    // 绘制表头边框
    this.drawBorder(x, y, width, height)
    
    // 绘制表头内容
    this.drawText(
      content.toString(),
      x + 10,
      y + height / 2,
      width - 20,
      height,
      'center'
    )
  }
  
  /**
   * 绘制数据行
   */
  drawRows(data: any[], columns: any[], selected: any[]): void {
    if (!this.ctx || data.length === 0) return
    
    const startY = this.cellHeight // 从表头下方开始
    let currentY = startY
    
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex]
      const isSelected = selected.includes(row)
      const isHovered = false // 这里需要传入悬停状态
      
      // 绘制行背景
      this.drawRowBackground(0, currentY, this.viewport.width, this.cellHeight, isSelected, isHovered)
      
      // 绘制行数据
      this.drawRowData(row, columns, currentY, rowIndex)
      
      currentY += this.cellHeight
      
      // 如果超出视口，停止绘制
      if (currentY > this.viewport.height) {
        break
      }
    }
  }
  
  /**
   * 绘制行背景
   */
  private drawRowBackground(x: number, y: number, width: number, height: number, isSelected: boolean, isHovered: boolean): void {
    if (!this.ctx) return
    
    // 保存当前状态
    this.ctx.save()
    
    // 设置背景样式
    if (isSelected) {
      this.ctx.fillStyle = this.theme.rowSelected || '#e6f7ff'
    } else if (isHovered) {
      this.ctx.fillStyle = this.theme.rowHover || '#f9f9f9'
    } else {
      this.ctx.fillStyle = this.theme.background || '#ffffff'
    }
    
    this.ctx.fillRect(x, y, width, height)
    
    // 绘制分隔线
    this.ctx.strokeStyle = this.theme.border || '#e0e0e0'
    this.ctx.lineWidth = 1
    this.ctx.beginPath()
    this.ctx.moveTo(x, y + height)
    this.ctx.lineTo(x + width, y + height)
    this.ctx.stroke()
    
    // 恢复状态
    this.ctx.restore()
  }
  
  /**
   * 绘制行数据
   */
  private drawRowData(row: any, columns: any[], y: number, rowIndex: number): void {
    if (!this.ctx) return
    
    let x = 0
    for (const column of columns) {
      const width = column.width || this.cellWidth
      
      // 绘制单元格内容
      if (column.render) {
        // 自定义渲染
        const content = column.render(row[column.key], row, column, rowIndex)
        this.drawCellContent(content, x, y, width, this.cellHeight, column)
      } else {
        // 默认文本渲染
        const text = row[column.key] || ''
        this.drawText(
          text.toString(),
          x + 10,
          y + this.cellHeight / 2,
          width - 20,
          this.cellHeight,
          column.align || 'left'
        )
      }
      
      x += width
    }
  }
  
  /**
   * 绘制单元格内容
   */
  drawCellContent(content: any, x: number, y: number, width: number, height: number, column: any): void {
    if (!this.ctx) return
    
    // 根据内容类型进行绘制
    if (typeof content === 'string') {
      this.drawText(content, x + 10, y + height / 2, width - 20, height, column.align || 'left')
    } else if (typeof content === 'number') {
      this.drawText(content.toString(), x + 10, y + height / 2, width - 20, height, column.align || 'right')
    } else if (content instanceof HTMLElement) {
      // 如果是HTML元素，需要特殊处理
      // 这里简化为文本渲染
      const text = content.textContent || ''
      this.drawText(text, x + 10, y + height / 2, width - 20, height, column.align || 'left')
    }
  }
  
  /**
   * 绘制文本
   */
  drawText(text: string, x: number, y: number, maxWidth: number, height: number, align: string = 'left'): void {
    if (!this.ctx) return
    
    // 保存当前状态
    this.ctx.save()
    
    // 设置文本样式
    this.ctx.fillStyle = this.theme.textPrimary || '#333333'
    this.ctx.font = '14px Arial, sans-serif'
    
    // 处理文本对齐
    if (align === 'center') {
      this.ctx.textAlign = 'center'
      x = x + maxWidth / 2
    } else if (align === 'right') {
      this.ctx.textAlign = 'right'
      x = x + maxWidth
    } else {
      this.ctx.textAlign = 'left'
    }
    
    // 文本换行处理
    this.wrapText(text, x, y, maxWidth, height)
    
    // 恢复状态
    this.ctx.restore()
  }
  
  /**
   * 文本换行处理
   */
  private wrapText(text: string, x: number, y: number, maxWidth: number, maxHeight: number): void {
    if (!this.ctx) return
    
    const words = text.split(' ')
    let line = ''
    let lineY = y - maxHeight / 2 + 14 // 从顶部开始
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      const metrics = this.ctx.measureText(testLine)
      const testWidth = metrics.width
      
      if (testWidth > maxWidth && i > 0) {
        this.ctx.fillText(line, x, lineY)
        line = words[i] + ' '
        lineY += 20 // 行高
      } else {
        line = testLine
      }
    }
    
    this.ctx.fillText(line, x, lineY)
  }
  
  /**
   * 绘制选择状态
   */
  drawSelections(selected: any[], columns: any[]): void {
    if (!this.ctx || selected.length === 0) return
    
    const startY = this.cellHeight
    let currentY = startY
    
    for (const row of selected) {
      // 找到行索引
      const rowIndex = this.findRowIndex(row)
      if (rowIndex === -1) continue
      
      // 绘制选择框
      this.drawSelection(0, currentY, this.viewport.width, this.cellHeight)
      
      currentY += this.cellHeight
    }
  }
  
  /**
   * 绘制单个选择框
   */
  drawSelection(x: number, y: number, width: number, height: number): void {
    if (!this.ctx) return
    
    // 保存当前状态
    this.ctx.save()
    
    // 设置选择样式
    this.ctx.fillStyle = this.theme.rowSelected || '#e6f7ff'
    this.ctx.fillRect(x, y, width, height)
    
    // 设置边框样式
    this.ctx.strokeStyle = this.theme.rowSelected || '#1890ff'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(x, y, width, height)
    
    // 恢复状态
    this.ctx.restore()
  }
  
  /**
   * 绘制滚动条
   */
  drawScrollbar(): void {
    if (!this.ctx) return
    
    const scrollbarWidth = 10
    const scrollbarHeight = 100
    const scrollbarX = this.viewport.width - scrollbarWidth
    const scrollbarY = this.viewport.height - scrollbarHeight
    
    // 绘制滚动条背景
    this.ctx.fillStyle = this.theme.scrollbarBg || '#f0f0f0'
    this.ctx.fillRect(scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight)
    
    // 绘制滚动条滑块
    this.ctx.fillStyle = this.theme.scrollbarThumb || '#c0c0c0'
    this.ctx.fillRect(scrollbarX + 2, scrollbarY + 10, scrollbarWidth - 4, 20)
  }
  
  /**
   * 绘制单元格
   */
  drawCell(x: number, y: number, width: number, height: number, content: any): void {
    if (!this.ctx) return
    
    // 绘制单元格背景
    this.drawBackground(x, y, width, height)
    
    // 绘制单元格边框
    this.drawBorder(x, y, width, height)
    
    // 绘制单元格内容
    this.drawCellContent(content, x, y, width, height, {})
  }
  
  
  
  /**
   * 添加脏区域
   */
  addDirtyRegion(x: number, y: number, width: number, height: number): void {
    this.dirtyRegions.push({ x, y, width, height })
  }
  
  /**
   * 渲染脏区域
   */
  renderDirtyRegions(): void {
    for (const region of this.dirtyRegions) {
      // 重新渲染脏区域
      this.renderRegion(region.x, region.y, region.width, region.height)
    }
    this.dirtyRegions = []
  }
  
  /**
   * 渲染指定区域
   */
  private renderRegion(x: number, y: number, width: number, height: number): void {
    // 这里需要根据具体的数据重新渲染指定区域
    // 简化实现，清除区域并重新绘制
    if (this.ctx) {
      this.ctx.clearRect(x, y, width, height)
    }
  }
  
  /**
   * 查找行索引
   */
  private findRowIndex(row: any): number {
    // 这里需要根据实际的数据结构查找行索引
    // 简化实现，返回 -1
    return -1
  }
  
  /**
   * 设置单元格高度
   */
  setCellHeight(height: number): void {
    this.cellHeight = height
  }
  
  /**
   * 设置单元格宽度
   */
  setCellWidth(width: number): void {
    this.cellWidth = width
  }
  
  /**
   * 获取脏区域数量
   */
  getDirtyRegionCount(): number {
    return this.dirtyRegions.length
  }
  
  /**
   * 清除脏区域
   */
  clearDirtyRegions(): void {
    this.dirtyRegions = []
  }
}