import { BaseRenderer } from './BaseRenderer'
import type { RenderParams } from '../types'
import type { CellInfo } from '../core/TableEventManager'
import { Point } from '../utils/geometry'

/**
 * G2 渲染器
 * 基于 AntV G2 的表格渲染器
 *
 * 注意：需要安装 @antv/g2 依赖
 * npm install @antv/g2
 */
export class G2Renderer extends BaseRenderer {
  // G2 Chart 实例将在初始化时创建
  private chart: any = null
  private highlightedCell: CellInfo | null = null

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)

    // 动态导入 G2（如果可用）
    this.initG2()
  }

  /**
   * 初始化 G2 Chart
   */
  private async initG2(): Promise<void> {
    try {
      // 尝试动态导入 G2
      const g2Module = await import('@antv/g2')
      const { Chart } = g2Module

      // 创建 Chart 实例
      this.chart = new Chart({
        container: this.canvas,
        autoFit: true,
        width: this.width,
        height: this.height
      })

      console.log('G2 Chart initialized successfully')
    } catch (error) {
      console.warn('G2 is not installed. Falling back to Canvas API rendering.', error)
      console.info('To use G2 rendering, install @antv/g2: npm install @antv/g2')
    }
  }

  /**
   * 渲染表格
   */
  render(params: RenderParams): void {
    // 清除画布
    this.clear()

    // 更新尺寸
    this.width = params.viewport.width
    this.height = params.viewport.height
    this.resizeCanvas()

    // 如果 G2 可用，使用 G2 渲染
    if (this.chart) {
      this.renderWithG2(params)
    } else {
      // 否则使用原生 Canvas API 渲染
      this.renderWithCanvas(params)
    }
  }

  /**
   * 使用 G2 渲染
   */
  private renderWithG2(params: RenderParams): void {
    if (!this.chart) return

    // 更新 Chart 尺寸
    this.chart.forceFit()

    // 清空图表
    this.chart.clear()

    // 数据预处理
    const flatData = this.flattenData(params.data, params.columns)

    // 使用 G2 的 View 系统渲染表格
    // 这里只是示例，实际实现需要根据 G2 API 调整
    console.log('Rendering with G2...', { flatData, columns: params.columns })

    // 注意：实际的 G2 实现会更复杂
    // 这里的目的是展示架构思路
  }

  /**
   * 使用原生 Canvas API 渲染（G2 不可用时的后备方案）
   */
  private renderWithCanvas(params: RenderParams): void {
    const { data, columns, viewport, theme } = params

    // 绘制背景
    this.drawBackground(
      0,
      0,
      viewport.width,
      viewport.height,
      theme.colors?.background || '#ffffff'
    )

    // 绘制表头
    this.renderHeader(columns, theme)

    // 绘制数据行
    this.renderRows(data, columns, theme)

    // 绘制高亮单元格
    if (this.highlightedCell) {
      this.highlightCell(this.highlightedCell)
    }
  }

  /**
   * 渲染表头
   */
  private renderHeader(columns: any[], theme: any): void {
    const headerHeight = theme.spacing?.header || 55
    let x = 0

    // 绘制表头背景
    this.drawBackground(
      0,
      0,
      this.width,
      headerHeight,
      theme.colors?.header || '#fafafa'
    )

    // 绘制表头文字
    for (const column of columns) {
      const columnWidth = this.getColumnWidth(column)

      this.drawText(
        column.title,
        x + 16,
        headerHeight / 2,
        columnWidth - 32,
        {
          color: theme.colors?.text || '#333',
          fontSize: theme.fonts?.header?.size || '14px',
          fontWeight: theme.fonts?.header?.weight || '600',
          align: column.align || 'left'
        }
      )

      // 绘制分隔线
      this.drawBorder(
        x + columnWidth,
        0,
        0,
        headerHeight,
        theme.colors?.border || '#f0f0f0'
      )

      // 缓存表头单元格位置
      this.cacheCellPosition(`header-${column.key}`, {
        col: -1, // 表头使用 -1 表示
        row: -1,
        x,
        y: 0,
        width: columnWidth,
        height: headerHeight,
        data: column,
        column
      })

      x += columnWidth
    }
  }

  /**
   * 渲染数据行
   */
  private renderRows(data: any[], columns: any[], theme: any): void {
    const headerHeight = theme.spacing?.header || 55
    const rowHeight = theme.spacing?.cell || 55
    let y = headerHeight

    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex]

      // 绘制行背景
      this.drawBackground(
        0,
        y,
        this.width,
        rowHeight,
        theme.colors?.background || '#ffffff'
      )

      // 绘制分隔线
      this.drawBorder(
        0,
        y + rowHeight,
        this.width,
        0,
        theme.colors?.border || '#f0f0f0'
      )

      // 绘制单元格
      let x = 0
      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        const column = columns[colIndex]
        const columnWidth = this.getColumnWidth(column)

        // 绘制单元格内容
        this.drawText(
          String(row[column.key] || ''),
          x + 16,
          y + rowHeight / 2,
          columnWidth - 32,
          {
            color: theme.colors?.text || '#333',
            fontSize: theme.fonts?.cell?.size || '14px',
            fontWeight: theme.fonts?.cell?.weight || '400',
            align: column.align || 'left'
          }
        )

        // 绘制列分隔线
        this.drawBorder(
          x + columnWidth,
          y,
          0,
          rowHeight,
          theme.colors?.border || '#f0f0f0'
        )

        // 缓存单元格位置
        this.cacheCellPosition(`cell-${rowIndex}-${colIndex}`, {
          row: rowIndex,
          col: colIndex,
          x,
          y,
          width: columnWidth,
          height: rowHeight,
          data: row[column.key],
          column
        })

        x += columnWidth
      }

      y += rowHeight

      // 超出可视区域则停止渲染
      if (y > this.height) {
        break
      }
    }
  }

  /**
   * 高亮单元格
   */
  highlightCell(cell: CellInfo): void {
    this.highlightedCell = cell

    if (!this.ctx) return

    this.ctx.save()
    this.ctx.strokeStyle = '#1677ff'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(cell.x, cell.y, cell.width, cell.height)
    this.ctx.restore()
  }

  /**
   * 清除高亮
   */
  clearHighlight(): void {
    this.highlightedCell = null
    // 重新渲染以清除高亮
  }

  /**
   * 扁平化数据用于 G2
   */
  private flattenData(data: any[], columns: any[]): any[] {
    // 将表格数据转换为 G2 可用的格式
    return data.flatMap((row, rowIndex) =>
      columns.map((column, colIndex) => ({
        rowIndex,
        colIndex,
        key: column.key,
        value: row[column.key],
        x: this.getColumnX(columns, colIndex),
        y: rowIndex * 55 + 55 // header height + row index * row height
      }))
    )
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    super.destroy()

    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  }
}
