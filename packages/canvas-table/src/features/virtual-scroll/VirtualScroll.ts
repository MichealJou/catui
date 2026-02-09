/**
 * 虚拟滚动核心类
 * 用于管理大数据量下的可见范围计算
 */
export class VirtualScroll {
  private itemSize: number
  private scrollTop: number = 0
  private totalItems: number = 0
  private bufferSize: number = 5

  constructor(itemSize: number, bufferSize: number = 5) {
    this.itemSize = itemSize
    this.bufferSize = bufferSize
  }

  /**
   * 设置数据总量
   */
  setDataCount(count: number) {
    this.totalItems = count
  }

  /**
   * 设置滚动位置
   */
  setScrollTop(scrollTop: number) {
    this.scrollTop = scrollTop
  }

  /**
   * 获取可见范围
   */
  getVisibleRange(containerHeight: number): VisibleRange {
    const visibleCount = Math.ceil(containerHeight / this.itemSize)
    let startIndex = Math.floor(this.scrollTop / this.itemSize)
    let endIndex = startIndex + visibleCount

    // 边界检查
    if (startIndex < 0) startIndex = 0
    if (endIndex > this.totalItems) endIndex = this.totalItems

    // 添加缓冲区
    startIndex = Math.max(0, startIndex - this.bufferSize)
    endIndex = Math.min(this.totalItems, endIndex + this.bufferSize)

    return { startIndex, endIndex }
  }

  /**
   * 获取总高度（包括不可见部分）
   */
  getTotalHeight(): number {
    return this.totalItems * this.itemSize
  }

  /**
   * 设置缓冲区大小
   */
  setBufferSize(size: number) {
    this.bufferSize = size
  }

  /**
   * 获取滚动到指定项目的位置
   */
  getScrollToItem(index: number): number {
    return index * this.itemSize
  }
}

/**
 * 可见范围
 */
export interface VisibleRange {
  startIndex: number
  endIndex: number
}

/**
 * 滚动配置
 */
export interface ScrollConfig {
  /** 项目高度 */
  itemSize: number
  /** 缓冲区大小 */
  bufferSize?: number
  /** 是否启用虚拟滚动 */
  enabled?: boolean
}

/**
 * Vue 3 Composition API 风格的虚拟滚动 Hook
 */
export function useVirtualScroll(config: ScrollConfig) {
  const scrollTop = ref(0)
  const containerHeight = ref(0)

  const virtualScroll = new VirtualScroll(
    config.itemSize,
    config.bufferSize || 5
  )

  const visibleRange = computed(() => {
    if (!config.enabled) {
      return { startIndex: 0, endIndex: virtualScroll['totalItems'] }
    }
    return virtualScroll.getVisibleRange(containerHeight.value)
  })

  const totalHeight = computed(() => virtualScroll.getTotalHeight())

  return {
    scrollTop,
    containerHeight,
    visibleRange,
    totalHeight,
    virtualScroll
  }
}

// 导出 Vue 相关
import { ref, computed } from 'vue'
