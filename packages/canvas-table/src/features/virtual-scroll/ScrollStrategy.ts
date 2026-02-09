/**
 * 滚动策略系统
 * 参考 Surely Vue 的智能虚拟滚动实现
 */

/**
 * 可见范围
 */
export interface VisibleRange {
  startIndex: number
  endIndex: number
}

/**
 * 滚动策略接口
 */
export interface IScrollStrategy {
  /**
   * 计算可见范围
   */
  calculateRange(scrollTop: number, viewportHeight: number, totalItems: number, itemSize: number): VisibleRange

  /**
   * 更新滚动速度
   */
  updateScrollSpeed(scrollTop: number, timestamp: number): void
}

/**
 * 简单滚动策略
 * 适用于小数据量（< 1000 条）
 */
export class SimpleScrollStrategy implements IScrollStrategy {
  calculateRange(
    scrollTop: number,
    viewportHeight: number,
    totalItems: number,
    itemSize: number
  ): VisibleRange {
    const visibleCount = Math.ceil(viewportHeight / itemSize)
    let startIndex = Math.floor(scrollTop / itemSize)
    let endIndex = startIndex + visibleCount

    // 边界检查
    if (startIndex < 0) startIndex = 0
    if (endIndex > totalItems) endIndex = totalItems

    return { startIndex, endIndex }
  }

  updateScrollSpeed(_scrollTop: number, _timestamp: number): void {
    // 简单策略不需要追踪速度
  }
}

/**
 * 高级滚动策略
 * 动态调整缓冲区大小，适用于大数据量
 */
export class AdvancedScrollStrategy implements IScrollStrategy {
  private bufferSize: number = 10
  private scrollSpeed: number = 0
  private lastScrollTop: number = 0
  private lastTimestamp: number = 0
  private speedHistory: number[] = []

  calculateRange(
    scrollTop: number,
    viewportHeight: number,
    totalItems: number,
    itemSize: number
  ): VisibleRange {
    const visibleCount = Math.ceil(viewportHeight / itemSize)
    let startIndex = Math.floor(scrollTop / itemSize)
    let endIndex = startIndex + visibleCount

    // 边界检查
    if (startIndex < 0) startIndex = 0
    if (endIndex > totalItems) endIndex = totalItems

    // 根据滚动速度动态调整缓冲区
    const dynamicBuffer = this.calculateDynamicBuffer()

    startIndex = Math.max(0, startIndex - dynamicBuffer)
    endIndex = Math.min(totalItems, endIndex + dynamicBuffer)

    return { startIndex, endIndex }
  }

  updateScrollSpeed(scrollTop: number, timestamp: number): void {
    if (this.lastTimestamp === 0) {
      this.lastScrollTop = scrollTop
      this.lastTimestamp = timestamp
      return
    }

    const deltaTime = timestamp - this.lastTimestamp
    const deltaScroll = Math.abs(scrollTop - this.lastScrollTop)

    // 计算滚动速度（像素/毫秒）
    this.scrollSpeed = deltaScroll / deltaTime

    // 更新历史记录（保留最近5次）
    this.speedHistory.push(this.scrollSpeed)
    if (this.speedHistory.length > 5) {
      this.speedHistory.shift()
    }

    this.lastScrollTop = scrollTop
    this.lastTimestamp = timestamp
  }

  /**
   * 根据滚动速度动态计算缓冲区大小
   */
  private calculateDynamicBuffer(): number {
    if (this.speedHistory.length === 0) {
      return this.bufferSize
    }

    // 计算平均滚动速度
    const avgSpeed = this.speedHistory.reduce((sum, speed) => sum + speed, 0) / this.speedHistory.length

    // 滚动速度快，增加缓冲区
    if (avgSpeed > 2) {
      return this.bufferSize * 3
    }

    // 滚动速度中等，正常缓冲区
    if (avgSpeed > 1) {
      return this.bufferSize * 2
    }

    // 滚动速度慢，减少缓冲区
    return Math.max(5, this.bufferSize)
  }

  /**
   * 设置基础缓冲区大小
   */
  setBufferSize(size: number) {
    this.bufferSize = size
  }

  /**
   * 获取当前滚动速度
   */
  getScrollSpeed(): number {
    return this.scrollSpeed
  }
}

/**
 * 自动滚动策略
 * 根据数据量自动选择简单策略或高级策略
 */
export class AutoScrollStrategy implements IScrollStrategy {
  private simpleStrategy: SimpleScrollStrategy
  private advancedStrategy: AdvancedScrollStrategy
  private threshold: number // 切换策略的数据量阈值

  constructor(threshold: number = 1000) {
    this.threshold = threshold
    this.simpleStrategy = new SimpleScrollStrategy()
    this.advancedStrategy = new AdvancedScrollStrategy()
  }

  calculateRange(
    scrollTop: number,
    viewportHeight: number,
    totalItems: number,
    itemSize: number
  ): VisibleRange {
    // 数据量小，使用简单策略
    if (totalItems < this.threshold) {
      return this.simpleStrategy.calculateRange(scrollTop, viewportHeight, totalItems, itemSize)
    }

    // 数据量大，使用高级策略
    return this.advancedStrategy.calculateRange(scrollTop, viewportHeight, totalItems, itemSize)
  }

  updateScrollSpeed(scrollTop: number, timestamp: number): void {
    this.advancedStrategy.updateScrollSpeed(scrollTop, timestamp)
  }

  /**
   * 设置策略切换阈值
   */
  setThreshold(threshold: number) {
    this.threshold = threshold
  }

  /**
   * 获取当前使用的策略
   */
  getCurrentStrategy(totalItems: number): 'simple' | 'advanced' {
    return totalItems < this.threshold ? 'simple' : 'advanced'
  }
}
