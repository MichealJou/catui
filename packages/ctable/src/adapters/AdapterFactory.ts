/**
 * 组件适配器工厂
 *
 * 负责创建和管理组件适配器
 * 默认使用 ant-design-vue，如果不可用则使用内置默认组件
 */

import type {
  PaginationAdapter,
  PaginationConfig,
  PaginationEmits,
  PaginationSlots,
  LoadingAdapter,
  LoadingConfig,
  LoadingSlots,
  AdapterConfig,
  ComponentLibrary
} from './types'
import { DefaultPaginationAdapter } from './DefaultPaginationAdapter'
import { AntDesignVuePaginationAdapter } from './AntDesignVuePaginationAdapter'
import {
  DefaultLoadingAdapter,
  AntDesignVueLoadingAdapter,
  ElementPlusLoadingAdapter,
  NaiveUiLoadingAdapter
} from './LoadingAdapters'

/**
 * 适配器管理器
 */
export class AdapterManager {
  private config: AdapterConfig
  private customAdapters: Map<string, PaginationAdapter | LoadingAdapter>

  constructor(config: AdapterConfig = {}) {
    this.config = config
    this.customAdapters = new Map()

    // 注册自定义适配器
    if (config.customAdapters) {
      if (config.customAdapters.pagination) {
        this.registerPaginationAdapter(
          'custom',
          config.customAdapters.pagination
        )
      }
      if (config.customAdapters.loading) {
        this.registerLoadingAdapter('custom', config.customAdapters.loading)
      }
    }
  }

  /**
   * 注册自定义分页适配器
   */
  registerPaginationAdapter(name: string, adapter: PaginationAdapter) {
    this.customAdapters.set(name, adapter)
  }

  /**
   * 注册自定义加载适配器
   */
  registerLoadingAdapter(name: string, adapter: LoadingAdapter) {
    this.customAdapters.set(name, adapter)
  }

  /**
   * 获取分页适配器
   *
   * 优先级：
   * 1. 如果 forceCustom=true 且有自定义适配器，使用自定义
   * 2. 如果指定了 library，尝试使用对应的适配器
   * 3. 默认尝试 ant-design-vue
   * 4. 最后使用默认适配器
   */
  getPaginationAdapter(): PaginationAdapter {
    // 1. 强制使用自定义适配器
    if (this.config.forceCustom && this.customAdapters.has('custom')) {
      const adapter = this.customAdapters.get('custom')!
      console.log('[CTable] Using custom pagination adapter')
      return adapter as PaginationAdapter
    }

    const library = this.config.library

    // 2. 用户指定的组件库
    if (library === 'ant-design-vue') {
      if (AntDesignVuePaginationAdapter.isAvailable()) {
        console.log('[CTable] Using ant-design-vue pagination adapter')
        return AntDesignVuePaginationAdapter
      } else {
        console.warn(
          '[CTable] ant-design-vue requested but not available. Falling back to default.'
        )
      }
    } else if (library === 'element-plus') {
      // TODO: 实现 element-plus 适配器
      console.warn(
        '[CTable] element-plus adapter not implemented yet. Using default.'
      )
    } else if (library === 'naive-ui') {
      // TODO: 实现 naive-ui 适配器
      console.warn(
        '[CTable] naive-ui adapter not implemented yet. Using default.'
      )
    }

    // 3. 默认尝试 ant-design-vue
    if (!library || library === 'default') {
      if (AntDesignVuePaginationAdapter.isAvailable()) {
        console.log(
          '[CTable] Using ant-design-vue pagination adapter (default)'
        )
        return AntDesignVuePaginationAdapter
      }
    }

    // 4. 使用默认适配器
    console.log('[CTable] Using default pagination adapter (built-in)')
    return DefaultPaginationAdapter
  }

  /**
   * 获取加载适配器
   *
   * 优先级：
   * 1. 如果 forceCustom=true 且有自定义适配器，使用自定义
   * 2. 如果指定了 library，尝试使用对应的适配器
   * 3. 默认尝试 ant-design-vue
   * 4. 最后使用默认适配器
   */
  getLoadingAdapter(): LoadingAdapter {
    // 1. 强制使用自定义适配器
    if (this.config.forceCustom && this.customAdapters.has('custom')) {
      const adapter = this.customAdapters.get('custom')!
      console.log('[CTable] Using custom loading adapter')
      return adapter as LoadingAdapter
    }

    const library = this.config.library

    // 2. 用户指定的组件库
    if (library === 'ant-design-vue') {
      if (AntDesignVueLoadingAdapter.isAvailable()) {
        console.log('[CTable] Using ant-design-vue loading adapter')
        return AntDesignVueLoadingAdapter
      } else {
        console.warn(
          '[CTable] ant-design-vue requested but not available. Falling back to default.'
        )
      }
    } else if (library === 'element-plus') {
      if (ElementPlusLoadingAdapter.isAvailable()) {
        console.log('[CTable] Using element-plus loading adapter')
        return ElementPlusLoadingAdapter
      } else {
        console.warn(
          '[CTable] element-plus requested but not available. Falling back to default.'
        )
      }
    } else if (library === 'naive-ui') {
      if (NaiveUiLoadingAdapter.isAvailable()) {
        console.log('[CTable] Using naive-ui loading adapter')
        return NaiveUiLoadingAdapter
      } else {
        console.warn(
          '[CTable] naive-ui requested but not available. Falling back to default.'
        )
      }
    }

    // 3. 默认尝试 ant-design-vue
    if (!library || library === 'default') {
      if (AntDesignVueLoadingAdapter.isAvailable()) {
        console.log('[CTable] Using ant-design-vue loading adapter (default)')
        return AntDesignVueLoadingAdapter
      }
    }

    // 4. 使用默认适配器
    console.log('[CTable] Using default loading adapter (built-in)')
    return DefaultLoadingAdapter
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AdapterConfig>) {
    this.config = { ...this.config, ...config }
  }

  /**
   * 获取当前配置
   */
  getConfig(): AdapterConfig {
    return { ...this.config }
  }
}

/**
 * 全局适配器管理器实例
 */
let globalAdapterManager: AdapterManager | null = null

/**
 * 获取全局适配器管理器
 */
export function getAdapterManager(): AdapterManager {
  if (!globalAdapterManager) {
    globalAdapterManager = new AdapterManager()
  }
  return globalAdapterManager
}

/**
 * 初始化全局适配器配置
 */
export function initAdapterManager(config: AdapterConfig) {
  globalAdapterManager = new AdapterManager(config)
  return globalAdapterManager
}

/**
 * 便捷函数：创建分页组件
 */
export function createPaginationComponent(
  config: PaginationConfig,
  emits: PaginationEmits,
  slots?: PaginationSlots,
  adapterConfig?: AdapterConfig
) {
  const manager = adapterConfig
    ? new AdapterManager(adapterConfig)
    : getAdapterManager()

  const adapter = manager.getPaginationAdapter()
  return adapter.createComponent(config, emits, slots)
}

/**
 * 便捷函数：创建加载组件
 */
export function createLoadingComponent(
  config: LoadingConfig,
  slots?: LoadingSlots,
  adapterConfig?: AdapterConfig
) {
  const manager = adapterConfig
    ? new AdapterManager(adapterConfig)
    : getAdapterManager()

  const adapter = manager.getLoadingAdapter()
  return adapter.createComponent(config, slots)
}

/**
 * 便捷函数：检查指定组件库是否可用
 */
export function isLibraryAvailable(library: ComponentLibrary): boolean {
  switch (library) {
    case 'ant-design-vue':
      return (
        AntDesignVuePaginationAdapter.isAvailable() ||
        AntDesignVueLoadingAdapter.isAvailable()
      )
    case 'element-plus':
      return ElementPlusLoadingAdapter.isAvailable()
    case 'naive-ui':
      return NaiveUiLoadingAdapter.isAvailable()
    case 'default':
      return true
    default:
      return false
  }
}

/**
 * 导出所有可用的适配器
 */
export {
  DefaultPaginationAdapter,
  AntDesignVuePaginationAdapter,
  DefaultLoadingAdapter,
  AntDesignVueLoadingAdapter,
  ElementPlusLoadingAdapter,
  NaiveUiLoadingAdapter
}

/**
 * 导出类型
 */
export type {
  PaginationAdapter,
  PaginationConfig,
  PaginationEmits,
  PaginationSlots,
  LoadingAdapter,
  LoadingConfig,
  LoadingSlots,
  AdapterConfig,
  ComponentLibrary
}
