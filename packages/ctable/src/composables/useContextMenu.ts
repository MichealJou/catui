import { ref } from 'vue'

interface OpenContextMenuOptions {
  clientX: number
  clientY: number
  row?: any
  index?: number
  wrapperRect: DOMRect
  itemCount: number
}

export function useContextMenu() {
  const contextMenuState = ref({
    visible: false,
    x: 16,
    y: 16,
    row: null as any,
    index: -1
  })
  const contextMenuOpenedAt = ref(0)

  const closeContextMenu = () => {
    contextMenuState.value.visible = false
    contextMenuState.value.row = null
    contextMenuState.value.index = -1
  }

  const openContextMenu = (options: OpenContextMenuOptions) => {
    const menuWidth = 220
    const menuHeight = Math.max(48, options.itemCount * 38 + 12)
    const x = options.clientX - options.wrapperRect.left
    const y = options.clientY - options.wrapperRect.top
    const maxX = Math.max(8, options.wrapperRect.width - menuWidth - 8)
    const maxY = Math.max(8, options.wrapperRect.height - menuHeight - 8)

    contextMenuState.value.visible = true
    contextMenuState.value.row = options.row ?? null
    contextMenuState.value.index = typeof options.index === 'number' ? options.index : -1
    contextMenuState.value.x = Math.min(Math.max(8, x), maxX)
    contextMenuState.value.y = Math.min(Math.max(8, y), maxY)
    contextMenuOpenedAt.value = Date.now()
  }

  const shouldKeepByGuard = (event: MouseEvent) => {
    if (typeof event?.button === 'number' && event.button !== 0) return true
    return Date.now() - contextMenuOpenedAt.value < 180
  }

  return {
    contextMenuState,
    contextMenuOpenedAt,
    openContextMenu,
    closeContextMenu,
    shouldKeepByGuard
  }
}

