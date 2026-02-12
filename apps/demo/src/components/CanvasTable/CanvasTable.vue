<template>
  <div
    ref="containerRef"
    class="canvas-table-container"
    :style="containerStyle"
  >
    <canvas
      ref="canvasRef"
      class="canvas-table"
      :width="width"
      :height="height"
    />
    <!-- 自定义滚动条 -->
    <div v-if="showScrollbar" class="custom-scrollbar" :style="scrollbarStyle">
      <div
        class="scrollbar-thumb"
        :style="scrollbarThumbStyle"
        @mousedown="handleScrollbarDragStart"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  computed,
  watch,
  type CSSProperties
} from 'vue'
import type { TableProps, Column, SortOrder, FilterCondition } from './types'
import { G2TableRenderer } from './core/G2TableRenderer'
import { useVirtualScroll } from './core/VirtualScroll'
import { useThemeManager, DEFAULT_THEME } from './core/ThemeManager'
import { SortManager } from './core/SortManager'
import { FilterManager } from './core/FilterManager'

defineOptions({
  name: 'CanvasTable'
})

const props = withDefaults(defineProps<TableProps>(), {
  width: 1200,
  height: 600,
  rowKey: 'id',
  virtualScroll: true,
  selectable: false,
  selectableType: 'single'
})

const emit = defineEmits<{
  'cell-click': [event: any]
  'row-click': [event: any]
  'selection-change': [selection: any[]]
  scroll: [event: any]
  'sort-change': [field: string, order: SortOrder]
  'filter-change': [filters: FilterCondition[]]
}>()

const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()

const { themeManager, setTheme, getTheme } = useThemeManager()

const renderer = ref<G2TableRenderer>()
const virtualScroll = useVirtualScroll(getTheme().spacing.cell)
const sortManager = new SortManager()
const filterManager = new FilterManager()

const selectedRows = ref<any[]>([])
const hoveredCell = ref<any>(null)

// 滚动条相关状态
const scrollbarDragging = ref(false)
const scrollbarDragStartY = ref(0)
const scrollbarDragStartScrollTop = ref(0)

const containerStyle = computed<CSSProperties>(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  position: 'relative' as const,
  overflow: 'hidden' as const,
  backgroundColor: getTheme().colors.background
}))

// 是否显示滚动条
const showScrollbar = computed(() => {
  if (!props.virtualScroll || !props.data.length) return false
  const totalHeight = props.data.length * getTheme().spacing.cell
  const containerHeight = props.height - getTheme().spacing.header
  return totalHeight > containerHeight
})

// 滚动条样式
const scrollbarStyle = computed<CSSProperties>(() => {
  // 表格已完全填充容器宽度（最后一列自动扩展）
  // 滚动条紧贴容器右边缘，与 ant-design-vue 表格样式一致
  return {
    position: 'absolute' as const,
    right: '0px',
    top: `${getTheme().spacing.header}px`,
    width: '10px',
    height: `${props.height - getTheme().spacing.header}px`,
    backgroundColor: 'transparent',
    cursor: 'pointer'
  }
})

// 滚动条滑块样式
const scrollbarThumbStyle = computed<CSSProperties>(() => {
  const totalHeight = props.data.length * getTheme().spacing.cell
  const containerHeight = props.height - getTheme().spacing.header
  const maxScrollTop = Math.max(0, totalHeight - containerHeight)
  const scrollbarHeight = props.height - getTheme().spacing.header
  const thumbHeight = Math.max(
    30,
    (containerHeight / totalHeight) * scrollbarHeight
  )
  const thumbTop =
    (virtualScroll.scrollTop.value / maxScrollTop) *
    (scrollbarHeight - thumbHeight)

  return {
    position: 'absolute' as const,
    top: `${thumbTop}px`,
    right: '2px',
    width: '6px',
    height: `${thumbHeight}px`,
    backgroundColor: scrollbarDragging.value
      ? 'rgba(0, 0, 0, 0.4)'
      : 'rgba(0, 0, 0, 0.2)',
    borderRadius: '3px',
    transition: scrollbarDragging.value ? 'none' : 'background-color 0.2s'
  }
})

// 先筛选，再排序
const sortedData = computed(() => {
  const filtered = filterManager.filterData(props.data)
  return sortManager.sortData(filtered)
})

const visibleData = computed(() => {
  if (!props.virtualScroll) {
    return sortedData.value
  }
  const { startIndex, endIndex } = virtualScroll.visibleRange.value
  return sortedData.value.slice(startIndex, endIndex)
})

const initTable = () => {
  if (!canvasRef.value || !containerRef.value) {
    return
  }

  const theme = props.theme || DEFAULT_THEME
  const cellHeight = theme.spacing.cell || 55
  const headerHeight = theme.spacing.header || 55

  // 先设置容器高度，确保 visibleRange 计算正确
  virtualScroll.containerHeight.value = props.height - headerHeight
  virtualScroll.virtualScroll.setDataCount(props.data.length)

  renderer.value = new G2TableRenderer(
    canvasRef.value,
    props.width,
    props.height,
    theme,
    props.selectable
  )

  renderer.value.setData(props.data, props.columns)

  bindEvents()

  // 强制更新一次 visibleRange
  renderTable()
}

const bindEvents = () => {
  if (!canvasRef.value) return

  canvasRef.value.addEventListener('click', handleClick)
  canvasRef.value.addEventListener('mousemove', handleMouseMove)
  canvasRef.value.addEventListener('mouseleave', handleMouseLeave)
  canvasRef.value.addEventListener('wheel', handleWheel, { passive: false })
}

const handleClick = (event: MouseEvent) => {
  if (!renderer.value) return

  const rect = canvasRef.value!.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const cell = hitTest(x, y)

  // 处理表头点击（排序）
  if (cell && cell.type === 'header' && cell.colIndex !== undefined) {
    const column = props.columns[cell.colIndex]
    if (column && column.sortable) {
      handleSort(column)
    }
    return
  }

  if (cell && cell.row !== undefined && cell.type === 'cell') {
    emit('cell-click', { cell, originalEvent: event })
    emit('row-click', { row: cell.row, data: sortedData.value[cell.row] })

    if (props.selectable) {
      if (props.selectableType === 'single') {
        const rowData = sortedData.value[cell.row]
        selectedRows.value = [rowData]
      } else {
        const rowData = sortedData.value[cell.row]
        const index = selectedRows.value.findIndex(
          row => row[props.rowKey] === rowData[props.rowKey]
        )

        if (index !== -1) {
          selectedRows.value.splice(index, 1)
        } else {
          selectedRows.value.push(rowData)
        }
      }

      emit('selection-change', selectedRows.value)
    }
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (!renderer.value) return

  const rect = canvasRef.value!.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const cell = hitTest(x, y)

  console.log('[handleMouseMove]', {
    x,
    y,
    cell: JSON.parse(JSON.stringify(cell))
  })

  if (cell && cell.row !== undefined && cell.col !== undefined) {
    hoveredCell.value = cell
    renderer.value.highlightCell(cell)
  } else {
    hoveredCell.value = null
    renderer.value?.clearHighlight()
  }
}

const handleMouseLeave = () => {
  hoveredCell.value = null
  renderer.value?.clearHighlight()
}

const handleSort = (column: Column) => {
  const newOrder = sortManager.toggleSort(column.key, column.sorter)

  // 更新渲染器的排序状态（用于显示排序图标）
  if (renderer.value) {
    renderer.value.setSortState(column.key, newOrder)
  }

  // 触发排序变化事件
  emit('sort-change', column.key, newOrder)

  // 重新渲染表格
  renderTable()
}

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()

  if (!props.virtualScroll) return

  // 计算 scrollTop 边界
  const totalHeight = props.data.length * getTheme().spacing.cell
  const maxScrollTop = Math.max(
    0,
    totalHeight - virtualScroll.containerHeight.value
  )
  const newScrollTop = Math.max(
    0,
    Math.min(virtualScroll.scrollTop.value + event.deltaY, maxScrollTop)
  )

  virtualScroll.scrollTop.value = newScrollTop

  console.log('[handleWheel]', {
    deltaY: event.deltaY,
    scrollTop: virtualScroll.scrollTop.value,
    maxScrollTop: maxScrollTop,
    visibleRange: virtualScroll.visibleRange.value
  })

  emit('scroll', { scrollTop: virtualScroll.scrollTop.value, scrollLeft: 0 })
  renderTable()
}

// 滚动条拖动处理
const handleScrollbarDragStart = (event: MouseEvent) => {
  event.preventDefault()
  scrollbarDragging.value = true
  scrollbarDragStartY.value = event.clientY
  scrollbarDragStartScrollTop.value = virtualScroll.scrollTop.value

  document.addEventListener('mousemove', handleScrollbarDragMove)
  document.addEventListener('mouseup', handleScrollbarDragEnd)
}

const handleScrollbarDragMove = (event: MouseEvent) => {
  if (!scrollbarDragging.value) return

  const totalHeight = props.data.length * getTheme().spacing.cell
  const containerHeight = props.height - getTheme().spacing.header
  const maxScrollTop = Math.max(0, totalHeight - containerHeight)
  const scrollbarHeight = props.height - getTheme().spacing.header
  const thumbHeight = Math.max(
    30,
    (containerHeight / totalHeight) * scrollbarHeight
  )
  const maxThumbTop = scrollbarHeight - thumbHeight

  const deltaY = event.clientY - scrollbarDragStartY.value
  const deltaScrollTop = (deltaY / maxThumbTop) * maxScrollTop
  const newScrollTop = Math.max(
    0,
    Math.min(scrollbarDragStartScrollTop.value + deltaScrollTop, maxScrollTop)
  )

  virtualScroll.scrollTop.value = newScrollTop
  emit('scroll', { scrollTop: newScrollTop, scrollLeft: 0 })
  renderTable()
}

const handleScrollbarDragEnd = () => {
  scrollbarDragging.value = false
  document.removeEventListener('mousemove', handleScrollbarDragMove)
  document.removeEventListener('mouseup', handleScrollbarDragEnd)
}

const hitTest = (x: number, y: number) => {
  const { startIndex } = virtualScroll.visibleRange.value
  const headerHeight = getTheme().spacing.header
  const cellHeight = getTheme().spacing.cell

  // 表头点击检测
  if (y < headerHeight) {
    let currentX = 0
    for (let i = 0; i < props.columns.length; i++) {
      const colWidth = props.columns[i].width || 120

      // 最后一列可能自动扩展
      let actualWidth = colWidth
      if (i === props.columns.length - 1) {
        const totalWidth = props.columns.reduce(
          (sum, col) => sum + (col.width || 120),
          0
        )
        if (totalWidth < props.width) {
          actualWidth = props.width - currentX
        }
      }

      if (x >= currentX && x < currentX + actualWidth) {
        return {
          type: 'header',
          colIndex: i,
          column: props.columns[i],
          y
        }
      }

      currentX += colWidth
    }
    return { type: 'header', y }
  }

  const rowIndex = Math.floor((y - headerHeight) / cellHeight) + startIndex

  if (rowIndex < 0 || rowIndex >= sortedData.value.length) {
    return null
  }

  let currentX = 0
  for (let i = 0; i < props.columns.length; i++) {
    const colWidth = props.columns[i].width || 120

    // 最后一列可能自动扩展
    let actualWidth = colWidth
    if (i === props.columns.length - 1) {
      const totalWidth = props.columns.reduce(
        (sum, col) => sum + (col.width || 120),
        0
      )
      if (totalWidth < props.width) {
        actualWidth = props.width - currentX
      }
    }

    if (x >= currentX && x < currentX + actualWidth) {
      return {
        type: 'cell',
        row: rowIndex,
        col: i,
        x: currentX,
        y: headerHeight + (rowIndex - startIndex) * cellHeight,
        width: actualWidth,
        height: cellHeight,
        data: sortedData.value[rowIndex],
        column: props.columns[i]
      }
    }

    currentX += colWidth
  }

  return null
}

const renderTable = () => {
  if (!renderer.value) return

  const { startIndex, endIndex } = virtualScroll.visibleRange.value

  console.log('[renderTable]', {
    startIndex,
    endIndex,
    totalData: props.data.length,
    containerHeight: virtualScroll.containerHeight.value
  })

  renderer.value.setVisibleData(startIndex, endIndex)
}

const handleScroll = (scrollTop: number) => {
  virtualScroll.scrollTop.value = scrollTop
  renderTable()
}

watch(
  () => props.data,
  () => {
    console.log('[watch] props.data changed:', props.data.length)
    virtualScroll.virtualScroll.setDataCount(props.data.length)
    if (renderer.value) {
      renderer.value.setData(props.data, props.columns)
    }
    renderTable()
  },
  { deep: true }
)

watch(
  () => props.columns,
  () => {
    console.log('[watch] props.columns changed')
    if (renderer.value) {
      renderer.value.setData(props.data, props.columns)
    }
    renderTable()
  },
  { deep: true }
)

watch(
  () => props.width,
  () => {
    if (renderer.value) {
      renderer.value.resize(props.width, props.height)
      renderTable()
    }
  }
)

watch(
  () => props.height,
  () => {
    if (renderer.value) {
      renderer.value.resize(props.width, props.height)
      renderTable()
    }
  }
)

watch(
  () => props.theme,
  newTheme => {
    if (newTheme && renderer.value) {
      renderer.value.setTheme(newTheme)
      renderTable()
    }
  },
  { deep: true }
)

onMounted(() => {
  initTable()
})

onBeforeUnmount(() => {
  renderer.value?.destroy()
})

defineExpose({
  scrollTo: handleScroll,
  getSelectedRows: () => selectedRows.value,
  clearSelection: () => {
    selectedRows.value = []
    renderer.value?.clearSelection()
    emit('selection-change', [])
  },
  clearFilters: () => {
    filterManager.clearAll()
    if (renderer.value) {
      renderer.value.clearAllFilterStates()
    }
    emit('filter-change', [])
    renderTable()
  },
  refresh: () => {
    renderTable()
  }
})
</script>

<style scoped>
.canvas-table-container {
  position: relative;
  overflow: hidden;
}

.canvas-table {
  display: block;
}

.custom-scrollbar {
  transition: opacity 0.2s;
}

.custom-scrollbar:hover {
  opacity: 1 !important;
}

.scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3) !important;
}
</style>
