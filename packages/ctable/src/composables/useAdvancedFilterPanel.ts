import { ref } from 'vue'

export function useAdvancedFilterPanel() {
  const advancedFilterPanel = ref({
    visible: false,
    tab: 'filter' as 'filter' | 'column',
    field: '',
    keyword: '',
    x: 16,
    y: 16
  })

  const openAdvancedFilterPanel = (options: {
    field: string
    keyword: string
    clientX: number
    clientY: number
    wrapperRect: DOMRect
  }) => {
    const panelWidth = 320
    const panelHeight = 220
    const baseX = options.clientX - options.wrapperRect.left
    const baseY = options.clientY - options.wrapperRect.top + 8
    const maxX = Math.max(8, options.wrapperRect.width - panelWidth - 8)
    const maxY = Math.max(8, options.wrapperRect.height - panelHeight - 8)

    advancedFilterPanel.value.visible = true
    advancedFilterPanel.value.tab = 'filter'
    advancedFilterPanel.value.field = options.field
    advancedFilterPanel.value.keyword = options.keyword
    advancedFilterPanel.value.x = Math.min(Math.max(8, baseX), maxX)
    advancedFilterPanel.value.y = Math.min(Math.max(8, baseY), maxY)
  }

  const closeAdvancedFilterPanel = () => {
    advancedFilterPanel.value.visible = false
  }

  return {
    advancedFilterPanel,
    openAdvancedFilterPanel,
    closeAdvancedFilterPanel
  }
}

