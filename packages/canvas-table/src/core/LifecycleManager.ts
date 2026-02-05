import { EventSystem } from './EventSystem'

export interface LifecycleHooks {
  // 生命周期阶段
  onInit?: () => void
  onMount?: () => void
  onUpdate?: () => void
  onRender?: () => void
  onBeforeRender?: () => void
  onAfterRender?: () => void
  onResize?: () => void
  onScroll?: () => void
  onBeforeDestroy?: () => void
  onDestroy?: () => void
  
  // 数据生命周期
  onDataChange?: (data: any) => any
  onColumnChange?: (columns: any) => any
  onViewportChange?: (viewport: any) => any
  onThemeChange?: (theme: any) => any
  
  // 事件生命周期
  onEvent?: (event: string, data: any) => boolean
  onBeforeEvent?: (event: string, data: any) => boolean
  onAfterEvent?: (event: string, data: any) => void
}

export class LifecycleManager {
  private hooks: Map<string, Function[]> = new Map()
  private eventSystem: EventSystem
  private isActive: boolean = false
  private destroyed: boolean = false
  
  constructor(eventSystem: EventSystem) {
    this.eventSystem = eventSystem
    this.isActive = true
  }
  
  /**
   * 注册生命周期钩子
   */
  on(event: string, handler: Function): void {
    if (typeof handler !== 'function') {
      throw new Error('Lifecycle hook must be a function')
    }
    
    if (!this.hooks.has(event)) {
      this.hooks.set(event, [])
    }
    
    this.hooks.get(event)!.push(handler)
  }
  
  /**
   * 移除生命周期钩子
   */
  off(event: string, handler: Function): void {
    if (!this.hooks.has(event)) {
      return
    }
    
    const handlers = this.hooks.get(event)!
    const index = handlers.indexOf(handler)
    
    if (index > -1) {
      handlers.splice(index, 1)
    }
    
    if (handlers.length === 0) {
      this.hooks.delete(event)
    }
  }
  
  /**
   * 触发生命周期钩子
   */
  trigger(event: string, ...args: any[]): any[] {
    if (!this.isActive || this.destroyed) {
      return []
    }
    
    const handlers = this.hooks.get(event)
    if (!handlers || handlers.length === 0) {
      return []
    }
    
    const results: any[] = []
    
    for (const handler of handlers) {
      try {
        const result = handler(...args)
        results.push(result)
        
        // 如果返回 false，可以阻止后续处理
        if (result === false) {
          break
        }
      } catch (error) {
        console.error(`Error in lifecycle hook "${event}":`, error)
      }
    }
    
    return results
  }
  
  /**
   * 触发前置生命周期钩子
   */
  triggerBefore(event: string, ...args: any[]): boolean {
    const results = this.trigger(event, ...args)
    return !results.some(result => result === false)
  }
  
  /**
   * 触发后置生命周期钩子
   */
  triggerAfter(event: string, ...args: any[]): void {
    this.trigger(event, ...args)
  }
  
  /**
   * 执行完整的生命周期流程
   */
  async executeLifecycle(
    phase: string,
    beforeHook: string,
    mainHook: string,
    afterHook: string,
    ...args: any[]
  ): Promise<boolean> {
    try {
      // 执行前置钩子
      const canContinue = this.triggerBefore(beforeHook, ...args)
      if (!canContinue) {
        return false
      }
      
      // 执行主要逻辑
      this.trigger(mainHook, ...args)
      
      // 执行后置钩子
      this.triggerAfter(afterHook, ...args)
      
      return true
    } catch (error) {
      console.error(`Error executing lifecycle phase "${phase}":`, error)
      return false
    }
  }
  
  /**
   * 初始化生命周期
   */
  init(): void {
    if (this.destroyed) {
      throw new Error('Lifecycle manager has been destroyed')
    }
    
    this.trigger('init')
  }
  
  /**
   * 挂载生命周期
   */
  mount(): void {
    if (this.destroyed) {
      throw new Error('Lifecycle manager has been destroyed')
    }
    
    this.isActive = true
    this.trigger('mount')
  }
  
  /**
   * 更新生命周期
   */
  update(): void {
    if (!this.isActive || this.destroyed) {
      return
    }
    
    this.trigger('update')
  }
  
  /**
   * 渲染生命周期
   */
  render(): void {
    if (!this.isActive || this.destroyed) {
      return
    }
    
    this.trigger('beforeRender')
    this.trigger('render')
    this.trigger('afterRender')
  }
  
  /**
   * 调整大小生命周期
   */
  resize(): void {
    if (!this.isActive || this.destroyed) {
      return
    }
    
    this.trigger('resize')
  }
  
  /**
   * 滚动生命周期
   */
  scroll(): void {
    if (!this.isActive || this.destroyed) {
      return
    }
    
    this.trigger('scroll')
  }
  
  /**
   * 数据变化生命周期
   */
  dataChange(data: any): any {
    if (!this.isActive || this.destroyed) {
      return data
    }
    
    const results = this.trigger('dataChange', data)
    return results.length > 0 ? results[results.length - 1] : data
  }
  
  /**
   * 列变化生命周期
   */
  columnChange(columns: any): any {
    if (!this.isActive || this.destroyed) {
      return columns
    }
    
    const results = this.trigger('columnChange', columns)
    return results.length > 0 ? results[results.length - 1] : columns
  }
  
  /**
   * 视口变化生命周期
   */
  viewportChange(viewport: any): any {
    if (!this.isActive || this.destroyed) {
      return viewport
    }
    
    const results = this.trigger('viewportChange', viewport)
    return results.length > 0 ? results[results.length - 1] : viewport
  }
  
  /**
   * 主题变化生命周期
   */
  themeChange(theme: any): any {
    if (!this.isActive || this.destroyed) {
      return theme
    }
    
    const results = this.trigger('themeChange', theme)
    return results.length > 0 ? results[results.length - 1] : theme
  }
  
  /**
   * 事件处理生命周期
   */
  handleEvent(event: string, data: any): boolean {
    if (!this.isActive || this.destroyed) {
      return true
    }
    
    // 执行前置事件钩子
    const beforeResult = this.trigger('beforeEvent', event, data)
    if (beforeResult.some(result => result === false)) {
      return false
    }
    
    // 执行主要事件处理
    this.trigger('event', event, data)
    
    // 执行后置事件钩子
    this.trigger('afterEvent', event, data)
    
    return true
  }
  
  /**
   * 销毁生命周期
   */
  destroy(): void {
    if (this.destroyed) {
      return
    }
    
    this.isActive = false
    this.trigger('beforeDestroy')
    this.trigger('destroy')
    
    // 清理所有钩子
    this.hooks.clear()
    this.destroyed = true
    
    console.log('Lifecycle manager destroyed')
  }
  
  /**
   * 重置生命周期管理器
   */
  reset(): void {
    if (this.destroyed) {
      throw new Error('Cannot reset destroyed lifecycle manager')
    }
    
    this.isActive = true
    this.hooks.clear()
    this.init()
  }
  
  /**
   * 暂停生命周期
   */
  pause(): void {
    this.isActive = false
    this.trigger('pause')
  }
  
  /**
   * 恢复生命周期
   */
  resume(): void {
    this.isActive = true
    this.trigger('resume')
  }
  
  /**
   * 获取生命周期状态
   */
  getStatus(): {
    isActive: boolean
    destroyed: boolean
    hooks: { [key: string]: number }
  } {
    const hooksStatus: { [key: string]: number } = {}
    
    for (const [event, handlers] of this.hooks) {
      hooksStatus[event] = handlers.length
    }
    
    return {
      isActive: this.isActive,
      destroyed: this.destroyed,
      hooks: hooksStatus
    }
  }
  
  /**
   * 检查是否有特定钩子
   */
  hasHook(event: string): boolean {
    return this.hooks.has(event) && this.hooks.get(event)!.length > 0
  }
  
  /**
   * 获取特定钩子的数量
   */
  getHookCount(event: string): number {
    return this.hooks.get(event)?.length || 0
  }
  
  /**
   * 获取所有钩子列表
   */
  getHookList(): string[] {
    return Array.from(this.hooks.keys())
  }
  
  /**
   * 清理特定事件的钩子
   */
  clearHooks(event?: string): void {
    if (event) {
      this.hooks.delete(event)
    } else {
      this.hooks.clear()
    }
  }
  
  /**
   * 绑定到事件系统
   */
  bindEvents(): void {
    this.eventSystem.on('init', () => this.init())
    this.eventSystem.on('mount', () => this.mount())
    this.eventSystem.on('update', () => this.update())
    this.eventSystem.on('render', () => this.render())
    this.eventSystem.on('resize', () => this.resize())
    this.eventSystem.on('scroll', () => this.scroll())
    this.eventSystem.on('destroy', () => this.destroy())
  }
  
  /**
   * 解绑事件系统
   */
  unbindEvents(): void {
    this.eventSystem.off('init')
    this.eventSystem.off('mount')
    this.eventSystem.off('update')
    this.eventSystem.off('render')
    this.eventSystem.off('resize')
    this.eventSystem.off('scroll')
    this.eventSystem.off('destroy')
  }
}