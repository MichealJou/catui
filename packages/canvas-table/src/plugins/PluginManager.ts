import { ITablePlugin, IPluginManager, PluginManagerState, PluginConfig } from '../types'
import { EventSystem } from './EventSystem'

export class PluginManager implements IPluginManager {
  private state: PluginManagerState
  private eventSystem: EventSystem
  
  constructor(eventSystem: EventSystem) {
    this.state = {
      plugins: new Map(),
      loaded: new Set(),
      table: null!
    }
    this.eventSystem = eventSystem
  }
  
  /**
   * 设置表格实例
   */
  setTable(table: any): void {
    this.state.table = table
  }
  
  /**
   * 注册插件
   */
  register(plugin: ITablePlugin): void {
    if (this.state.plugins.has(plugin.name)) {
      console.warn(`Plugin "${plugin.name}" is already registered`)
      return
    }
    
    // 检查依赖
    this.checkDependencies(plugin)
    
    // 注册到插件管理器
    this.state.plugins.set(plugin.name, plugin)
    
    console.log(`Plugin "${plugin.name}" registered successfully`)
  }
  
  /**
   * 注销插件
   */
  unregister(name: string): void {
    if (!this.state.plugins.has(name)) {
      console.warn(`Plugin "${name}" is not registered`)
      return
    }
    
    // 如果插件已加载，先卸载
    if (this.state.loaded.has(name)) {
      this.unload(name)
    }
    
    // 从插件管理器中移除
    this.state.plugins.delete(name)
    
    console.log(`Plugin "${name}" unregistered successfully`)
  }
  
  /**
   * 获取插件
   */
  get(name: string): ITablePlugin | undefined {
    return this.state.plugins.get(name)
  }
  
  /**
   * 获取所有已注册的插件名称
   */
  list(): string[] {
    return Array.from(this.state.plugins.keys())
  }
  
  /**
   * 获取所有已加载的插件名称
   */
  getLoaded(): string[] {
    return Array.from(this.state.loaded)
  }
  
  /**
   * 检查插件是否已加载
   */
  isLoaded(name: string): boolean {
    return this.state.loaded.has(name)
  }
  
  /**
   * 加载插件
   */
  async load(name: string): Promise<boolean> {
    if (!this.state.plugins.has(name)) {
      console.error(`Plugin "${name}" is not registered`)
      return false
    }
    
    if (this.state.loaded.has(name)) {
      console.warn(`Plugin "${name}" is already loaded`)
      return true
    }
    
    const plugin = this.state.plugins.get(name)!
    
    try {
      // 加载依赖
      await this.loadDependencies(plugin)
      
      // 安装插件
      plugin.install(this.state.table)
      
      // 标记为已加载
      this.state.loaded.add(name)
      
      console.log(`Plugin "${name}" loaded successfully`)
      return true
    } catch (error) {
      console.error(`Failed to load plugin "${name}":`, error)
      return false
    }
  }
  
  /**
   * 卸载插件
   */
  async unload(name: string): Promise<boolean> {
    if (!this.state.plugins.has(name)) {
      console.error(`Plugin "${name}" is not registered`)
      return false
    }
    
    if (!this.state.loaded.has(name)) {
      console.warn(`Plugin "${name}" is not loaded`)
      return true
    }
    
    const plugin = this.state.plugins.get(name)!
    
    try {
      // 卸载插件
      plugin.uninstall(this.state.table)
      
      // 标记为未加载
      this.state.loaded.delete(name)
      
      console.log(`Plugin "${name}" unloaded successfully`)
      return true
    } catch (error) {
      console.error(`Failed to unload plugin "${name}":`, error)
      return false
    }
  }
  
  /**
   * 批量加载插件
   */
  async loadBatch(names: string[]): Promise<void> {
    const promises = names.map(name => this.load(name))
    await Promise.allSettled(promises)
  }
  
  /**
   * 批量卸载插件
   */
  async unloadBatch(names: string[]): Promise<void> {
    const promises = names.map(name => this.unload(name))
    await Promise.allSettled(promises)
  }
  
  /**
   * 重新加载插件
   */
  async reload(name: string): Promise<boolean> {
    if (this.state.loaded.has(name)) {
      await this.unload(name)
    }
    return await this.load(name)
  }
  
  /**
   * 重新加载所有插件
   */
  async reloadAll(): Promise<void> {
    const loadedPlugins = Array.from(this.state.loaded)
    await this.unloadBatch(loadedPlugins)
    await this.loadBatch(loadedPlugins)
  }
  
  /**
   * 获取插件状态
   */
  getStatus(): { [key: string]: 'registered' | 'loaded' | 'not-registered' } {
    const status: { [key: string]: 'registered' | 'loaded' | 'not-registered' } = {}
    
    for (const [name] of this.state.plugins) {
      if (this.state.loaded.has(name)) {
        status[name] = 'loaded'
      } else {
        status[name] = 'registered'
      }
    }
    
    return status
  }
  
  /**
   * 获取插件信息
   */
  getPluginInfo(name: string): { name: string; version: string; dependencies?: string[]; loaded: boolean } | null {
    const plugin = this.state.plugins.get(name)
    if (!plugin) {
      return null
    }
    
    return {
      name: plugin.name,
      version: plugin.version,
      dependencies: plugin.dependencies,
      loaded: this.state.loaded.has(name)
    }
  }
  
  /**
   * 获取所有插件信息
   */
  getAllPluginInfo(): { name: string; version: string; dependencies?: string[]; loaded: boolean }[] {
    const info: { name: string; version: string; dependencies?: string[]; loaded: boolean }[] = []
    
    for (const [name, plugin] of this.state.plugins) {
      info.push({
        name: plugin.name,
        version: plugin.version,
        dependencies: plugin.dependencies,
        loaded: this.state.loaded.has(name)
      })
    }
    
    return info
  }
  
  /**
   * 检查并安装缺失的依赖
   */
  private checkDependencies(plugin: ITablePlugin): void {
    if (!plugin.dependencies || plugin.dependencies.length === 0) {
      return
    }
    
    const missingDependencies = plugin.dependencies.filter(dep => !this.state.plugins.has(dep))
    
    if (missingDependencies.length > 0) {
      throw new Error(`Plugin "${plugin.name}" depends on missing plugins: ${missingDependencies.join(', ')}`)
    }
  }
  
  /**
   * 加载插件依赖
   */
  private async loadDependencies(plugin: ITablePlugin): Promise<void> {
    if (!plugin.dependencies || plugin.dependencies.length === 0) {
      return
    }
    
    const loadPromises = plugin.dependencies.map(dep => 
      this.load(dep).catch(error => {
        console.error(`Failed to load dependency "${dep}" for plugin "${plugin.name}":`, error)
        throw error
      })
    )
    
    await Promise.all(loadPromises)
  }
  
  /**
   * 卸载插件的所有依赖
   */
  private async unloadDependencies(plugin: ITablePlugin): Promise<void> {
    if (!plugin.dependencies || plugin.dependencies.length === 0) {
      return
    }
    
    // 注意：这里可能需要更复杂的依赖关系处理
    // 简单实现：卸载所有依赖
    const unloadPromises = plugin.dependencies.map(dep => 
      this.unload(dep).catch(error => {
        console.error(`Failed to unload dependency "${dep}" for plugin "${plugin.name}":`, error)
      })
    )
    
    await Promise.all(unloadPromises)
  }
  
  /**
   * 获取插件配置
   */
  getPluginConfig(name: string): PluginConfig | null {
    const plugin = this.state.plugins.get(name)
    return plugin ? {} : null // 这里将在后续实现配置管理
  }
  
  /**
   * 设置插件配置
   */
  setPluginConfig(name: string, config: PluginConfig): void {
    const plugin = this.state.plugins.get(name)
    if (!plugin) {
      console.error(`Plugin "${name}" is not registered`)
      return
    }
    
    // 这里将在后续实现配置管理
    console.log(`Configuration set for plugin "${name}"`, config)
  }
  
  /**
   * 卸载所有插件
   */
  async unregisterAll(): Promise<void> {
    const loadedPlugins = Array.from(this.state.loaded)
    await this.unloadBatch(loadedPlugins)
    
    this.state.plugins.clear()
    this.state.loaded.clear()
    
    console.log('All plugins unregistered')
  }
  
  /**
   * 检查插件循环依赖
   */
  checkCircularDependency(pluginName: string, visited: Set<string> = new Set()): boolean {
    if (visited.has(pluginName)) {
      return true
    }
    
    const plugin = this.state.plugins.get(pluginName)
    if (!plugin || !plugin.dependencies) {
      return false
    }
    
    visited.add(pluginName)
    
    for (const dep of plugin.dependencies) {
      if (this.checkCircularDependency(dep, visited)) {
        return true
      }
    }
    
    visited.delete(pluginName)
    return false
  }
  
  /**
   * 验证插件依赖关系
   */
  validateDependencies(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    for (const [name, plugin] of this.state.plugins) {
      // 检查循环依赖
      if (this.checkCircularDependency(name)) {
        errors.push(`Plugin "${name}" has circular dependency`)
        continue
      }
      
      // 检查缺失依赖
      if (plugin.dependencies) {
        const missingDeps = plugin.dependencies.filter(dep => !this.state.plugins.has(dep))
        if (missingDeps.length > 0) {
          errors.push(`Plugin "${name}" has missing dependencies: ${missingDeps.join(', ')}`)
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}