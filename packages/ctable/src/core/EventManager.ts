import { ref, type Ref } from 'vue'
import type { Column, Cell } from '../types'
import { Point } from '../utils/geometry'

export interface TableEvent {
  type: 'click' | 'dblclick' | 'hover' | 'mouseleave' | 'scroll'
  cell?: Cell
  data?: any
  column?: Column
  originalEvent?: Event
}

export class EventManager {
  private canvas: HTMLCanvasElement
  private renderer: any
  private listeners: WeakMap<HTMLElement, Set<EventListener>> = new WeakMap()
  private hoverCell: Cell | null = null
  private selectedCell: Cell | null = null
  
  constructor(canvas: HTMLCanvasElement, renderer: any) {
    this.canvas = canvas
    this.renderer = renderer
    this.bindEvents()
  }
  
  private bindEvents() {
    this.canvas.addEventListener('click', this.handleClick)
    this.canvas.addEventListener('dblclick', this.handleDoubleClick)
    this.canvas.addEventListener('mousemove', this.handleMouseMove)
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave)
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: true })
  }
  
  private getEventPosition(event: MouseEvent): Point {
    const rect = this.canvas.getBoundingClientRect()
    return new Point(
      event.clientX - rect.left,
      event.clientY - rect.top
    )
  }
  
  private handleClick = (event: MouseEvent) => {
    const point = this.getEventPosition(event)
    const cell = this.renderer.hitTest(point)
    
    if (cell) {
      this.emit('click', { cell, originalEvent: event })
      this.selectedCell = cell
      this.renderer.clearHighlight()
      this.renderer.highlightCell(cell)
      
      if (cell.column.key === '__checkbox__') {
        const rowIndex = cell.row
        this.renderer.toggleRowSelection(rowIndex)
      }
    }
  }
  
  private handleDoubleClick = (event: MouseEvent) => {
    const point = this.getEventPosition(event)
    const cell = this.renderer.hitTest(point)
    
    if (cell) {
      this.emit('dblclick', { cell, originalEvent: event })
    }
  }
  
  private handleMouseMove = (event: MouseEvent) => {
    const point = this.getEventPosition(event)
    const cell = this.renderer.hitTest(point)
    
    if (cell !== this.hoverCell) {
      this.renderer.clearHighlight()
      
      if (cell) {
        this.renderer.highlightCell(cell)
        this.emit('hover', { cell })
        this.hoverCell = cell
      } else {
        this.emit('mouseleave', {})
        this.hoverCell = null
      }
    }
  }
  
  private handleMouseLeave = () => {
    if (this.hoverCell) {
      this.renderer.clearHighlight()
      this.emit('mouseleave', {})
      this.hoverCell = null
    }
  }
  
  private handleWheel = (event: WheelEvent) => {
    this.emit('scroll', { originalEvent: event })
  }
  
  private emit(type: string, detail: any) {
    const customEvent = new CustomEvent(`table:${type}`, {
      detail,
      bubbles: true
    })
    this.canvas.dispatchEvent(customEvent)
  }
  
  destroy() {
    this.canvas.removeEventListener('click', this.handleClick)
    this.canvas.removeEventListener('dblclick', this.handleDoubleClick)
    this.canvas.removeEventListener('mousemove', this.handleMouseMove)
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave)
    this.canvas.removeEventListener('wheel', this.handleWheel)
  }
}

export function useTableEvents(
  canvas: HTMLCanvasElement,
  renderer: any
): {
  onClick: (callback: (event: TableEvent) => void) => void
  onDblClick: (callback: (event: TableEvent) => void) => void
  onHover: (callback: (event: TableEvent) => void) => void
  onMouseLeave: (callback: (event: TableEvent) => void) => void
  onScroll: (callback: (event: TableEvent) => void) => void
  destroy: () => void
} {
  const eventManager = new EventManager(canvas, renderer)
  
  const onClick = (callback: (event: TableEvent) => void) => {
    canvas.addEventListener('table:click', (e: any) => callback(e.detail))
  }
  
  const onDblClick = (callback: (event: TableEvent) => void) => {
    canvas.addEventListener('table:dblclick', (e: any) => callback(e.detail))
  }
  
  const onHover = (callback: (event: TableEvent) => void) => {
    canvas.addEventListener('table:hover', (e: any) => callback(e.detail))
  }
  
  const onMouseLeave = (callback: (event: TableEvent) => void) => {
    canvas.addEventListener('table:mouseleave', (e: any) => callback(e.detail))
  }
  
  const onScroll = (callback: (event: TableEvent) => void) => {
    canvas.addEventListener('table:scroll', (e: any) => callback(e.detail))
  }
  
  return {
    onClick,
    onDblClick,
    onHover,
    onMouseLeave,
    onScroll,
    destroy: () => eventManager.destroy()
  }
}
