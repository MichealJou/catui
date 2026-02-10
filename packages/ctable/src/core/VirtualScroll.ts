import { ref, computed } from 'vue'

export class VirtualScroll {
  private itemSize: number
  private scrollTop: number = 0
  private totalItems: number = 0
  private containerHeight: number = 0
  private bufferSize: number = 10 // 上下各缓冲10行，防止快速滚动白屏和内容重叠

  constructor(itemSize: number, bufferSize: number = 10) {
    this.itemSize = itemSize
    this.bufferSize = bufferSize
  }

  setDataCount(count: number) {
    this.totalItems = count
  }

  setContainerHeight(height: number) {
    this.containerHeight = height
  }

  setScrollTop(scrollTop: number) {
    // 边界检查：确保 scrollTop 在有效范围内
    const totalHeight = this.totalItems * this.itemSize
    const maxScrollTop = Math.max(0, totalHeight - this.containerHeight)
    this.scrollTop = Math.max(0, Math.min(scrollTop, maxScrollTop))
  }

  getScrollTop(): number {
    return this.scrollTop
  }

  getMaxScrollTop(): number {
    const totalHeight = this.totalItems * this.itemSize
    return Math.max(0, totalHeight - this.containerHeight)
  }

  getVisibleRange(containerHeight: number): { startIndex: number; endIndex: number } {
    const visibleCount = Math.ceil(containerHeight / this.itemSize)
    const startRowIndex = Math.floor(this.scrollTop / this.itemSize)

    // 计算带缓冲区的起始和结束索引
    // 向上扩展缓冲区，向下扩展更多缓冲区（因为用户通常向下滚动）
    let startIndex = Math.max(0, startRowIndex - this.bufferSize)
    let endIndex = Math.min(
      this.totalItems,
      startRowIndex + visibleCount + this.bufferSize
    )

    // 确保 endIndex 不会小于 startIndex
    if (endIndex <= startIndex) {
      endIndex = Math.min(this.totalItems, startIndex + visibleCount + this.bufferSize * 2)
    }

    return { startIndex, endIndex }
  }
}

export function useVirtualScroll(itemSize: number) {
  const scrollTop = ref(0)
  const containerHeight = ref(0)

  const virtualScroll = new VirtualScroll(itemSize)

  const visibleRange = computed(() => {
    virtualScroll.setContainerHeight(containerHeight.value)
    virtualScroll.setScrollTop(scrollTop.value)
    const result = virtualScroll.getVisibleRange(containerHeight.value)

    return result
  })

  return {
    scrollTop,
    containerHeight,
    visibleRange,
    virtualScroll
  }
}

