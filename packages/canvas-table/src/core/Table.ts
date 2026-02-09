import { EventSystem } from './EventSystem'
import { LifecycleManager } from './LifecycleManager'
import { PluginManager } from '../plugins/PluginManager'
import { ThemeManager } from '../theme/ThemeManager'
import type {
  Column,
  TableProps,
  ThemeConfig,
  ITablePlugin,
  IRenderer
} from '../types'

/**
 * 表格配置选项
 */
export interface TableOptions extends Partial<TableProps> {
  /** Canvas 元素 */
  canvas: HTMLCanvasElement
  /** 初始主题 */
  theme?: ThemeConfig
  /** 插件列表 */
  plugins?: ITablePlugin[]
  /** 渲染器 */
  renderer?: IRenderer
}

/**
 * CTable 核心类
 * 整合所有核心系统，提供统一的表格功能
 */
export class CTable {
  // 核心系统
  private eventSystem: EventSystem
  private lifecycle: LifecycleManager
  private pluginManager: PluginManager
  private themeManager: ThemeManager

  // 渲染器
  private renderer: IRenderer | null = null

  // 数据
  private data: any[] = []
  private columns: Column[] = []
  private selectedRows: Set<any> = new Set()

  // 配置
  private config: TableOptions

  // 状态
  private isDestroyed: boolean = false
  private isInitialized: boolean = false

  constructor(options: TableOptions) {
    this.config = options

    // 初始化核心系统
    this.eventSystem = new EventSystem()
    this.lifecycle = new LifecycleManager(this.eventSystem)
    this.pluginManager = new PluginManager(this.eventSystem)
    this.themeManager = new ThemeManager(options.theme)

    // 绑定生命周期事件
    this.lifecycle.bindEvents()

    // 初始化
    this.init(options)
  }

  /**
   * 初始化表格
   */
  private init(options: TableOptions): void {
    if (this.isDestroyed) {
      throw new Error('Cannot initialize destroyed table')
    }

    // 触发生命周期钩子
    this.lifecycle.trigger('init')

    // 设置 Canvas
    if (options.canvas) {
      this.setupCanvas(options.canvas)
    }

    // 设置数据
    if (options.data) {
      this.setData(options.data)
    }

    // 设置列
    if (options.columns) {
      this.setColumns(options.columns)
    }

    // 设置渲染器
    if (options.renderer) {
      this.setRenderer(options.renderer)
    }

    // 注册插件
    if (options.plugins && options.plugins.length > 0) {
      options.plugins.forEach(plugin => {
        this.use(plugin)
      })
    }

    this.isInitialized = true
    this.lifecycle.trigger('mount')
  }

  /**
   * 设置 Canvas
   */
  private setupCanvas(canvas: HTMLCanvasElement): void {
    // 处理高 DPI
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
  }

  /**
   * 设置数据
   */
  setData(data: any[]): void {
    const oldData = this.data
    this.data = data

    // 触发数据变化事件
    this.eventSystem.emit('data-change', data)

    // 触发生命周期钩子
    this.lifecycle.dataChange(data)

    // 重新渲染
    this.render()
  }

  /**
   * 获取数据
   */
  getData(): any[] {
    return this.data
  }

  /**
   * 设置列
   */
  setColumns(columns: Column[]): void {
    const oldColumns = this.columns
    this.columns = columns

    // 触发列变化事件
    this.eventSystem.emit('columns-change', columns)

    // 触发生命周期钩子
    this.lifecycle.columnChange(columns)

    // 重新渲染
    this.render()
  }

  /**
   * 获取列
   */
  getColumns(): Column[] {
    return this.columns
  }

  /**
   * 设置渲染器
   */
  setRenderer(renderer: IRenderer): void {
    this.renderer = renderer
    this.render()
  }

  /**
   * 获取渲染器
   */
  getRenderer(): IRenderer | null {
    return this.renderer
  }

  /**
   * 设置主题
   */
  setTheme(theme: ThemeConfig): void {
    this.themeManager.setTheme(theme)

    // 触发主题变化事件
    this.eventSystem.emit('theme-change', theme)

    // 触发生命周期钩子
    this.lifecycle.themeChange(theme)

    // 重新渲染
    this.render()
  }

  /**
   * 获取主题
   */
  getTheme(): ThemeConfig {
    return this.themeManager.getTheme()
  }

  /**
   * 渲染表格
   */
  render(): void {
    if (!this.renderer || this.isDestroyed) {
      return
    }

    // 触发生命周期钩子
    this.lifecycle.render()

    // 调用渲染器
    this.renderer.render({
      data: this.data,
      columns: this.columns,
      viewport: {
        width: this.config.width || 800,
        height: this.config.height || 600,
        scrollTop: 0,
        scrollLeft: 0,
        clientWidth: this.config.width || 800,
        clientHeight: this.config.height || 600
      },
      selected: Array.from(this.selectedRows),
      theme: this.getTheme()
    })
  }

  /**
   * 使用插件
   */
  use(plugin: ITablePlugin): void {
    this.pluginManager.register(plugin)

    // 如果表格已初始化，立即加载插件
    if (this.isInitialized) {
      this.pluginManager.load(plugin.name)
    }
  }

  /**
   * 卸载插件
   */
  unuse(pluginName: string): void {
    this.pluginManager.unregister(pluginName)
  }

  /**
   * 选择行
   */
  selectRow(row: any): void {
    this.selectedRows.add(row)
    this.eventSystem.emit('selection-change', Array.from(this.selectedRows))
    this.render()
  }

  /**
   * 取消选择行
   */
  deselectRow(row: any): void {
    this.selectedRows.delete(row)
    this.eventSystem.emit('selection-change', Array.from(this.selectedRows))
    this.render()
  }

  /**
   * 切换行选择状态
   */
  toggleRowSelection(row: any): void {
    if (this.selectedRows.has(row)) {
      this.deselectRow(row)
    } else {
      this.selectRow(row)
    }
  }

  /**
   * 清除所有选择
   */
  clearSelection(): void {
    this.selectedRows.clear()
    this.eventSystem.emit('selection-change', [])
    this.render()
  }

  /**
   * 获取选中的行
   */
  getSelectedRows(): any[] {
    return Array.from(this.selectedRows)
  }

  /**
   * 注册事件监听器
   */
  on(event: string, handler: Function): void {
    this.eventSystem.on(event, handler)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, handler?: Function): void {
    this.eventSystem.off(event, handler)
  }

  /**
   * 触发事件
   */
  emit(event: string, data?: any): void {
    this.eventSystem.emit(event, data)
  }

  /**
   * 注册生命周期钩子
   */
  hook(hook: string, handler: Function): void {
    this.lifecycle.on(hook, handler)
  }

  /**
   * 调整大小
   */
  resize(width: number, height: number): void {
    this.config.width = width
    this.config.height = height

    // 触发生命周期钩子
    this.lifecycle.resize()

    // 重新渲染
    this.render()
  }

  /**
   * 销毁表格
   */
  destroy(): void {
    if (this.isDestroyed) {
      return
    }

    this.isDestroyed = true

    // 触发生命周期钩子
    this.lifecycle.trigger('beforeDestroy')
    this.lifecycle.trigger('destroy')

    // 清理插件
    this.pluginManager.unregisterAll()

    // 清理生命周期
    this.lifecycle.destroy()

    // 清理主题管理器
    this.themeManager.destroy()

    // 清理事件系统
    this.eventSystem.removeAll()

    // 清理数据
    this.data = []
    this.columns = []
    this.selectedRows.clear()
  }

  /**
   * 获取表格状态
   */
  getStatus(): {
    isInitialized: boolean
    isDestroyed: boolean
    dataCount: number
    columnCount: number
    selectedCount: number
  } {
    return {
      isInitialized: this.isInitialized,
      isDestroyed: this.isDestroyed,
      dataCount: this.data.length,
      columnCount: this.columns.length,
      selectedCount: this.selectedRows.size
    }
  }

  /**
   * 获取事件系统
   */
  getEventSystem(): EventSystem {
    return this.eventSystem
  }

  /**
   * 获取生命周期管理器
   */
  getLifecycle(): LifecycleManager {
    return this.lifecycle
  }

  /**
   * 获取插件管理器
   */
  getPluginManager(): PluginManager {
    return this.pluginManager
  }

  /**
   * 获取主题管理器
   */
  getThemeManager(): ThemeManager {
    return this.themeManager
  }
}

/**
 * 创建表格实例的工厂函数
 */
export function createTable(options: TableOptions): CTable {
  return new CTable(options)
}
