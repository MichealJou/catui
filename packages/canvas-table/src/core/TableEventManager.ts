import { EventSystem } from './EventSystem'
import type { IEventSystem } from '../types'
import { Point } from '../utils/geometry'

/**
 * 表格事件接口
 */
export interface TableEvent {
  type: 'click' | 'dblclick' | 'hover' | 'mouseleave' | 'scroll' | 'cell-click' | 'row-click' | 'header-click'
  cell?: CellInfo
  data?: any
  rowIndex?: number
  columnIndex?: number
  originalEvent?: Event
}

/**
 * 单元格信息
 */
export interface CellInfo {
  row: number
  col: number
  x: number
  y: number
  width: number
  height: number
  data?: any
}

/**
 * 表格事件管理器
 * 整合了 EventSystem 和 Canvas 特定的事件处理
 */
export class TableEventManager implements IEventSystem {
  private eventSystem: EventSystem
  private canvas: HTMLCanvasElement
  private renderer: any
  private hoverCell: CellInfo | null = null
  private selectedCell: CellInfo | null = null
  private boundHandlers: Map<string, Function> = new Map()

  constructor(canvas: HTMLCanvasElement, renderer: any) {
    this.canvas = canvas
    this.renderer = renderer
    this.eventSystem = new EventSystem()
    this.bindEvents()
  }

  /**
   * 绑定 Canvas 事件
   */
  private bindEvents(): void {
    const handleClick = this.handleClick.bind(this)
    const handleDoubleClick = this.handleDoubleClick.bind(this)
    const handleMouseMove = this.handleMouseMove.bind(this)
    const handleMouseLeave = this.handleMouseLeave.bind(this)
    const handleWheel = this.handleWheel.bind(this)

    this.canvas.addEventListener('click', handleClick)
    this.canvas.addEventListener('dblclick', handleDoubleClick)
    this.canvas.addEventListener('mousemove', handleMouseMove)
    this.canvas.addEventListener('mouseleave', handleMouseLeave)
    this.canvas.addEventListener('wheel', handleWheel, { passive: true })

    // 保存绑定的处理器，用于解绑
    this.boundHandlers.set('click', handleClick)
    this.boundHandlers.set('dblclick', handleDoubleClick)
    this.boundHandlers.set('mousemove', handleMouseMove)
    this.boundHandlers.set('mouseleave', handleMouseLeave)
    this.boundHandlers.set('wheel', handleWheel)
  }

  /**
   * 获取鼠标在 Canvas 中的位置
   */
  private getEventPosition(event: MouseEvent): Point {
    const rect = this.canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    return new Point(
      (event.clientX - rect.left) * dpr,
      (event.clientY - rect.top) * dpr
    )
  }

  /**
   * 处理点击事件
   */
  private handleClick = (event: MouseEvent): void => {
    const point = this.getEventPosition(event)
    const cell = this.hitTest(point)

    if (cell) {
      // 触发内部事件
      this.eventSystem.emit('cell-click', { cell, originalEvent: event })

      // 触发自定义 DOM 事件
      this.emit('click', { cell, originalEvent: event })

      this.selectedCell = cell

      // 如果渲染器有高亮方法，调用它
      if (this.renderer.clearHighlight && this.renderer.highlightCell) {
        this.renderer.clearHighlight()
        this.renderer.highlightCell(cell)
      }
    }
  }

  /**
   * 处理双击事件
   */
  private handleDoubleClick = (event: MouseEvent): void => {
    const point = this.getEventPosition(event)
    const cell = this.hitTest(point)

    if (cell) {
      this.eventSystem.emit('cell-dblclick', { cell, originalEvent: event })
      this.emit('dblclick', { cell, originalEvent: event })
    }
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove = (event: MouseEvent): void => {
    const point = this.getEventPosition(event)
    const cell = this.hitTest(point)

    if (cell !== this.hoverCell) {
      // 清除之前的高亮
      if (this.renderer.clearHighlight) {
        this.renderer.clearHighlight()
      }

      if (cell) {
        // 高亮当前单元格
        if (this.renderer.highlightCell) {
          this.renderer.highlightCell(cell)
        }

        this.eventSystem.emit('cell-hover', { cell })
        this.emit('hover', { cell })
        this.hoverCell = cell
      } else {
        this.eventSystem.emit('cell-mouseleave', {})
        this.emit('mouseleave', {})
        this.hoverCell = null
      }
    }
  }

  /**
   * 处理鼠标离开事件
   */
  private handleMouseLeave = (): void => {
    if (this.hoverCell) {
      if (this.renderer.clearHighlight) {
        this.renderer.clearHighlight()
      }

      this.eventSystem.emit('cell-mouseleave', {})
      this.emit('mouseleave', {})
      this.hoverCell = null
    }
  }

  /**
   * 处理滚轮事件
   */
  private handleWheel = (event: WheelEvent): void => {
    this.eventSystem.emit('scroll', {
      scrollTop: event.deltaY,
      scrollLeft: event.deltaX,
      originalEvent: event
    })
    this.emit('scroll', { originalEvent: event })
  }

  /**
   * 碰撞检测 - 找到点击位置的单元格
   */
  private hitTest(point: Point): CellInfo | null {
    if (!this.renderer.hitTest) {
      return null
    }

    return this.renderer.hitTest(point)
  }

  /**
   * 发射自定义 DOM 事件
   */
  private emit(type: string, detail: any): void {
    const customEvent = new CustomEvent(`table:${type}`, {
      detail,
      bubbles: true
    })
    this.canvas.dispatchEvent(customEvent)
  }

  /**
   * 注册事件监听器（EventSystem 接口实现）
   */
  on(event: string, handler: Function): void {
    this.eventSystem.on(event, handler)
  }

  /**
   * 移除事件监听器（EventSystem 接口实现）
   */
  off(event: string, handler?: Function): void {
    this.eventSystem.off(event, handler)
  }

  /**
   * 触发事件（EventSystem 接口实现）
   */
  emit(event: string, data?: any): void {
    this.eventSystem.emit(event, data)
  }

  /**
   * 注册一次性事件监听器（EventSystem 接口实现）
   */
  once(event: string, handler: Function): void {
    this.eventSystem.once(event, handler)
  }

  /**
   * 获取悬停的单元格
   */
  getHoverCell(): CellInfo | null {
    return this.hoverCell
  }

  /**
   * 获取选中的单元格
   */
  getSelectedCell(): CellInfo | null {
    return this.selectedCell
  }

  /**
   * 清除选中状态
   */
  clearSelection(): void {
    this.selectedCell = null
  }

  /**
   * 销毁事件管理器
   */
  destroy(): void {
    // 解绑所有事件
    this.boundHandlers.forEach((handler, event) => {
      if (event === 'wheel') {
        this.canvas.removeEventListener(event, handler as any, { passive: true } as any)
      } else {
        this.canvas.removeEventListener(event, handler as any)
      }
    })

    this.boundHandlers.clear()
    this.eventSystem.removeAll()
    this.hoverCell = null
    this.selectedCell = null
  }

  /**
   * 获取底层 EventSystem 实例
   */
  getEventSystem(): EventSystem {
    return this.eventSystem
  }
}

/**
 * Vue 3 Composition API 风格的表格事件 Hook
 */
export function useTableEvents(
  canvas: HTMLCanvasElement,
  renderer: any
) {
  const eventManager = new TableEventManager(canvas, renderer)

  return {
    eventManager,

    // 便捷方法
    onCellClick: (callback: (event: TableEvent) => void) => {
      eventManager.on('cell-click', callback)
    },

    onCellDblClick: (callback: (event: TableEvent) => void) => {
      eventManager.on('cell-dblclick', callback)
    },

    onCellHover: (callback: (event: TableEvent) => void) => {
      eventManager.on('cell-hover', callback)
    },

    onScroll: (callback: (event: TableEvent) => void) => {
      eventManager.on('scroll', callback)
    },

    destroy: () => eventManager.destroy()
  }
}
