import type { IRenderer, RenderParams, UpdateParams } from '../types'
import type { CellInfo } from '../core/TableEventManager'
import type { Column } from '../types'
import { Point } from '../utils/geometry'

/**
 * 渲染器基类
 * 提供所有渲染器的通用接口和基础实现
 */
export abstract class BaseRenderer implements IRenderer {
  protected canvas: HTMLCanvasElement
  protected ctx: CanvasRenderingContext2D | null = null
  protected width: number = 0
  protected height: number = 0

  // 单元格位置缓存
  protected cellPositions: Map<string, CellInfo> = new Map()

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  /**
   * 渲染 - 子类必须实现
   */
  abstract render(params: RenderParams): void

  /**
   * 清除画布
   */
  clear(): void {
    if (!this.ctx) return
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.cellPositions.clear()
  }

  /**
   * 更新渲染
   */
  update(params: UpdateParams): void {
    if (params.viewport) {
      this.width = params.viewport.width
      this.height = params.viewport.height
      this.resizeCanvas()
    }

    // 转换为 RenderParams 并调用 render
    this.render(params as RenderParams)
  }

  /**
   * 调整画布尺寸
   */
  resize(width: number, height: number): void {
    this.width = width
    this.height = height
    this.resizeCanvas()
  }

  /**
   * 调整 Canvas 尺寸（处理 DPI）
   */
  protected resizeCanvas(): void {
    const dpr = window.devicePixelRatio || 1

    // 设置 Canvas 实际尺寸
    this.canvas.width = this.width * dpr
    this.canvas.height = this.height * dpr

    // 设置 Canvas 显示尺寸
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`

    // 缩放上下文
    if (this.ctx) {
      this.ctx.scale(dpr, dpr)
    }
  }

  /**
   * 绘制背景
   */
  protected drawBackground(x: number, y: number, width: number, height: number, color: string): void {
    if (!this.ctx) return

    this.ctx.save()
    this.ctx.fillStyle = color
    this.ctx.fillRect(x, y, width, height)
    this.ctx.restore()
  }

  /**
   * 绘制边框
   */
  protected drawBorder(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    lineWidth: number = 1
  ): void {
    if (!this.ctx) return

    this.ctx.save()
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = lineWidth
    this.ctx.strokeRect(x, y, width, height)
    this.ctx.restore()
  }

  /**
   * 绘制文本
   */
  protected drawText(
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    options: {
      color?: string
      fontSize?: string
      fontWeight?: string
      fontFamily?: string
      align?: CanvasTextAlign
      baseline?: CanvasTextBaseline
    } = {}
  ): void {
    if (!this.ctx) return

    this.ctx.save()

    // 设置样式
    this.ctx.fillStyle = options.color || '#333'
    this.ctx.font = `${options.fontWeight || 'normal'} ${options.fontSize || '14px'} ${options.fontFamily || 'Arial, sans-serif'}`
    this.ctx.textAlign = options.align || 'left'
    this.ctx.textBaseline = options.baseline || 'middle'

    // 绘制文本
    let drawX = x
    if (options.align === 'center') {
      drawX = x + maxWidth / 2
    } else if (options.align === 'right') {
      drawX = x + maxWidth
    }

    this.ctx.fillText(text, drawX, y)

    this.ctx.restore()
  }

  /**
   * 绘制圆角矩形
   */
  protected drawRoundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color: string
  ): void {
    if (!this.ctx) return

    this.ctx.save()
    this.ctx.fillStyle = color
    this.ctx.beginPath()

    if (width < 2 * radius) radius = width / 2
    if (height < 2 * radius) radius = height / 2

    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.arcTo(x + width, y, x + width, y + height, radius)
    this.ctx.arcTo(x + width, y + height, x, y + height, radius)
    this.ctx.arcTo(x, y + height, x, y, radius)
    this.ctx.arcTo(x, y, x + width, y, radius)
    this.ctx.closePath()

    this.ctx.fill()
    this.ctx.restore()
  }

  /**
   * 碰撞检测 - 查找点击位置的单元格
   */
  hitTest(point: Point): CellInfo | null {
    // 遍历所有缓存的单元格位置
    for (const cell of this.cellPositions.values()) {
      const rect = {
        x: cell.x,
        y: cell.y,
        width: cell.width,
        height: cell.height
      }

      if (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
      ) {
        return cell
      }
    }

    return null
  }

  /**
   * 缓存单元格位置
   */
  protected cacheCellPosition(key: string, cell: CellInfo): void {
    this.cellPositions.set(key, cell)
  }

  /**
   * 高亮单元格
   */
  highlightCell(cell: CellInfo): void {
    // 子类可以实现具体的高亮效果
  }

  /**
   * 清除高亮
   */
  clearHighlight(): void {
    // 子类可以实现具体的清除逻辑
  }

  /**
   * 获取列的 x 坐标
   */
  protected getColumnX(columns: Column[], columnIndex: number): number {
    let x = 0
    for (let i = 0; i < columnIndex; i++) {
      x += columns[i].width || 100
    }
    return x
  }

  /**
   * 获取列的宽度
   */
  protected getColumnWidth(column: Column): number {
    return column.width || column.minWidth || 100
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    this.clear()
    this.cellPositions.clear()
    this.ctx = null
  }

  /**
   * 获取 Canvas 上下文
   */
  getContext(): CanvasRenderingContext2D | null {
    return this.ctx
  }

  /**
   * 获取 Canvas 元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas
  }
}
