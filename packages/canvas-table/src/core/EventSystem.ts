import { IEventSystem, EventMap, IEventListener, IEventContext } from '../types/EventTypes'

export class EventSystem implements IEventSystem {
  private events: EventMap = {}
  private context: IEventContext | null = null
  
  constructor() {
    this.events = {}
  }
  
  /**
   * 注册事件监听器
   */
  on(event: string, handler: Function): void {
    if (typeof handler !== 'function') {
      throw new Error('Event handler must be a function')
    }
    
    if (!this.events[event]) {
      this.events[event] = []
    }
    
    // 检查是否已存在相同的处理器
    const existingHandler = this.events[event].find(h => h.handler === handler)
    if (!existingHandler) {
      this.events[event].push({
        handler,
        once: false,
        priority: 0
      })
    }
  }
  
  /**
   * 移除事件监听器
   */
  off(event: string, handler?: Function): void {
    if (!this.events[event]) {
      return
    }
    
    if (handler) {
      this.events[event] = this.events[event].filter(
        h => h.handler !== handler
      )
    } else {
      // 如果没有提供 handler，移除所有监听器
      this.events[event] = []
    }
    
    // 如果事件没有监听器了，删除事件
    if (this.events[event].length === 0) {
      delete this.events[event]
    }
  }
  
  /**
   * 触发事件
   */
  emit(event: string, data?: any): void {
    if (!this.events[event]) {
      return
    }
    
    // 创建事件上下文
    const context: IEventContext = {
      preventDefault: () => {
        // 可以在这里添加默认行为阻止逻辑
      },
      stopPropagation: () => {
        // 可以在这里添加事件传播阻止逻辑
      },
      target: this,
      currentTarget: this,
      data
    }
    
    // 按优先级排序处理器
    const handlers = [...this.events[event]].sort((a, b) => b.priority - a.priority)
    
    // 执行处理器
    for (const listener of handlers) {
      try {
        listener.handler.call(this, { ...listener, context }, context)
        
        // 如果是一次性监听器，移除它
        if (listener.once) {
          this.off(event, listener.handler)
        }
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error)
      }
    }
  }
  
  /**
   * 注册一次性事件监听器
   */
  once(event: string, handler: Function): void {
    if (typeof handler !== 'function') {
      throw new Error('Event handler must be a function')
    }
    
    if (!this.events[event]) {
      this.events[event] = []
    }
    
    // 检查是否已存在相同的处理器
    const existingHandler = this.events[event].find(h => h.handler === handler)
    if (!existingHandler) {
      this.events[event].push({
        handler,
        once: true,
        priority: 0
      })
    }
  }
  
  /**
   * 移除指定事件的所有监听器
   */
  remove(event: string): void {
    delete this.events[event]
  }
  
  /**
   * 移除所有事件监听器
   */
  removeAll(): void {
    this.events = {}
  }
  
  /**
   * 检查是否有指定事件的监听器
   */
  has(event: string): boolean {
    return !!this.events[event] && this.events[event].length > 0
  }
  
  /**
   * 获取指定事件的所有监听器
   */
  getListeners(event: string): Function[] {
    if (!this.events[event]) {
      return []
    }
    
    return this.events[event].map(listener => listener.handler)
  }
  
  /**
   * 获取事件监听器总数
   */
  count(): number {
    let total = 0
    for (const event in this.events) {
      total += this.events[event].length
    }
    return total
  }
  
  /**
   * 批量注册事件
   */
  onBatch(events: Record<string, Function>): void {
    for (const [event, handler] of Object.entries(events)) {
      this.on(event, handler)
    }
  }
  
  /**
   * 批量移除事件
   */
  offBatch(events: Record<string, Function>): void {
    for (const [event, handler] of Object.entries(events)) {
      this.off(event, handler)
    }
  }
  
  /**
   * 添加优先级支持
   */
  onWithPriority(event: string, handler: Function, priority: number = 0): void {
    if (typeof handler !== 'function') {
      throw new Error('Event handler must be a function')
    }
    
    if (!this.events[event]) {
      this.events[event] = []
    }
    
    // 移除相同的处理器
    this.events[event] = this.events[event].filter(h => h.handler !== handler)
    
    // 添加带优先级的处理器
    this.events[event].push({
      handler,
      once: false,
      priority
    })
    
    // 重新排序
    this.events[event].sort((a, b) => b.priority - a.priority)
  }
  
  /**
   * 获取事件统计信息
   */
  getStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {}
    for (const event in this.events) {
      stats[event] = this.events[event].length
    }
    return stats
  }
  
  /**
   * 检查是否是特定事件的监听器
   */
  hasListener(event: string, handler: Function): boolean {
    if (!this.events[event]) {
      return false
    }
    
    return this.events[event].some(h => h.handler === handler)
  }
  
  /**
   * 获取处理器信息
   */
  getListenerInfo(event: string): IEventListener[] {
    if (!this.events[event]) {
      return []
    }
    
    return [...this.events[event]]
  }
}