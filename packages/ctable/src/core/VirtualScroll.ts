import { ref, computed } from 'vue'

export class VirtualScroll {
  private itemSize: number
  private scrollTop: number = 0
  private totalItems: number = 0
  private containerHeight: number = 0

  constructor(itemSize: number) {
    this.itemSize = itemSize
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
    let startIndex = Math.floor(this.scrollTop / this.itemSize)
    let endIndex = startIndex + visibleCount

    if (endIndex > this.totalItems) {
      endIndex = this.totalItems
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

