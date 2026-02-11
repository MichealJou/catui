/**
 * CTable 组件适配器类型定义
 * 支持多种组件库（ant-design-vue、element-plus、naive-ui）和自定义插槽
 */

// ============================================================
// 从主类型文件导入
// ============================================================

import type { PaginationConfig } from '../types'

// 重新导出分页配置，保持 API 一致性
export type { PaginationConfig }

// ============================================================
// 分页组件适配器接口
// ============================================================

/**
 * 分页事件接口
 */
export interface PaginationEmits {
  /** 页码或每页条数变化 */
  change: (page: number, pageSize: number) => void
  /** 每页条数变化 */
  showSizeChange?: (current: number, size: number) => void
}

/**
 * 分页组件插槽接口
 */
export interface PaginationSlots {
  /** 总数显示插槽 */
  total?: (props: { total: number; range: [number, number] }) => any
  /** 上一页插槽 */
  prev?: (props: { disabled: boolean }) => any
  /** 下一页插槽 */
  next?: (props: { disabled: boolean }) => any
  /** 上一页文字插槽 */
  prevText?: () => any
  /** 下一页文字插槽 */
  nextText?: () => any
  /** 页码选项插槽 */
  pageItem?: (props: {
    page: number
    active: boolean
    disabled: boolean
  }) => any
  /** 每页条数选项插槽 */
  pageSizeOption?: (props: { size: number }) => any
  /** 自定义渲染插槽 */
  itemRender?: (props: {
    page: number
    type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next'
    originalElement?: any
  }) => any
}

/**
 * 分页组件适配器接口
 *
 * 所有分页适配器必须实现此接口
 * 适配器负责将不同组件库的分页组件统一接口
 */
export interface PaginationAdapter {
  /** 组件名称 */
  name: string
  /** 组件库来源 */
  source: 'ant-design-vue' | 'element-plus' | 'naive-ui' | 'custom' | 'default'

  /**
   * 创建分页组件
   * @param config 分页配置
   * @param emits 分页事件
   * @param slots 分页插槽（用户自定义）
   * @returns Vue 组件
   */
  createComponent(
    config: PaginationConfig,
    emits: PaginationEmits,
    slots?: PaginationSlots
  ): any

  /**
   * 检查组件库是否可用
   * @returns 是否可用
   */
  isAvailable(): boolean
}

// ============================================================
// 组件库类型
// ============================================================

/**
 * 支持的组件库类型
 */
export type ComponentLibrary =
  | 'ant-design-vue'
  | 'element-plus'
  | 'naive-ui'
  | 'default'

/**
 * 组件适配器配置
 */
export interface AdapterConfig {
  /** 优先使用的组件库 */
  library?: ComponentLibrary
  /** 自定义适配器 */
  customAdapters?: {
    pagination?: PaginationAdapter
    loading?: LoadingAdapter
  }
  /** 是否强制使用自定义适配器 */
  forceCustom?: boolean
}

// ============================================================
// 加载组件适配器接口
// ============================================================

/**
 * 加载配置接口
 */
export interface LoadingConfig {
  spinning?: boolean
  delay?: number
  size?: 'small' | 'default' | 'large'
  tip?: string
  wrapperClassName?: string
}

/**
 * 加载组件插槽接口
 */
export interface LoadingSlots {
  /** 默认内容插槽 */
  default?: () => any
  /** 自定义加载指示器插槽 */
  indicator?: () => any
}

/**
 * 加载组件适配器接口
 *
 * 所有加载适配器必须实现此接口
 * 适配器负责将不同组件库的加载组件统一接口
 */
export interface LoadingAdapter {
  /** 组件名称 */
  name: string
  /** 组件库来源 */
  source: 'ant-design-vue' | 'element-plus' | 'naive-ui' | 'custom' | 'default'

  /**
   * 创建加载组件
   * @param config 加载配置
   * @param slots 加载插槽（用户自定义）
   * @returns Vue 组件
   */
  createComponent(config: LoadingConfig, slots?: LoadingSlots): any

  /**
   * 检查组件库是否可用
   * @returns 是否可用
   */
  isAvailable(): boolean
}
