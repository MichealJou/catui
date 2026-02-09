<template>
  <div
    ref="containerRef"
    class="ctable-container"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <canvas
      ref="canvasRef"
      class="ctable-canvas"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { CTable } from '../core/Table'
import { G2Renderer } from '../renderers/G2Renderer'
import { DEFAULT_THEME, DARK_THEME } from '../theme/presets'
import type { Column, ThemeConfig } from '../types'

/**
 * CTable 组件 Props
 */
export interface CTableProps {
  /** 数据 */
  data: any[]
  /** 列定义 */
  columns: Column[]
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 主题 */
  theme?: ThemeConfig
  /** 主题名称 */
  themeName?: 'default' | 'dark'
  /** 行的键 */
  rowKey?: string
}

/**
 * CTable 组件事件
 */
export interface CTableEmits {
  (e: 'cell-click', cell: any, row: any, column: Column): void
  (e: 'row-click', row: any, index: number): void
  (e: 'selection-change', selectedRows: any[]): void
  (e: 'scroll', scrollTop: number, scrollLeft: number): void
}

// Props 定义
const props = withDefaults(defineProps<CTableProps>(), {
  width: 800,
  height: 600,
  themeName: 'default',
  rowKey: 'id'
})

// Emits 定义
const emit = defineEmits<CTableEmits>()

// Refs
const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()

// 表格实例
let tableInstance: CTable | null = null
let renderer: G2Renderer | null = null

/**
 * 初始化表格
 */
const initTable = () => {
  if (!canvasRef.value) return

  // 创建渲染器
  renderer = new G2Renderer(canvasRef.value)

  // 创建表格实例
  tableInstance = new CTable({
    canvas: canvasRef.value,
    data: props.data,
    columns: props.columns,
    width: props.width,
    height: props.height,
    theme: props.theme || (props.themeName === 'dark' ? DARK_THEME : DEFAULT_THEME),
    renderer
  })

  // 设置事件监听
  setupEventListeners()

  // 初始渲染
  tableInstance.render()
}

/**
 * 设置事件监听
 */
const setupEventListeners = () => {
  if (!tableInstance) return

  // 监听单元格点击
  tableInstance.on('cell-click', (event: any) => {
    const { cell } = event
    const row = props.data[cell.row]
    const column = props.columns[cell.col]

    emit('cell-click', cell, row, column)
    emit('row-click', row, cell.row)
  })

  // 监听选择变化
  tableInstance.on('selection-change', (selectedRows: any[]) => {
    emit('selection-change', selectedRows)
  })

  // 监听滚动
  tableInstance.on('scroll', (event: any) => {
    emit('scroll', event.scrollTop, event.scrollLeft)
  })
}

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    if (tableInstance) {
      tableInstance.setData(newData)
    }
  },
  { deep: true }
)

// 监听列变化
watch(
  () => props.columns,
  (newColumns) => {
    if (tableInstance) {
      tableInstance.setColumns(newColumns)
    }
  },
  { deep: true }
)

// 监听主题变化
watch(
  () => props.themeName,
  (newThemeName) => {
    if (tableInstance) {
      const theme = newThemeName === 'dark' ? DARK_THEME : DEFAULT_THEME
      tableInstance.setTheme(theme)
    }
  }
)

// 监听尺寸变化
watch(
  () => [props.width, props.height],
  ([newWidth, newHeight]) => {
    if (tableInstance) {
      tableInstance.resize(newWidth as number, newHeight as number)
    }
  }
)

// 生命周期钩子
onMounted(async () => {
  await nextTick()
  initTable()
})

onUnmounted(() => {
  // 销毁表格实例
  if (tableInstance) {
    tableInstance.destroy()
  }

  // 销毁渲染器
  if (renderer) {
    renderer.destroy()
  }
})

// 暴露方法给父组件
defineExpose({
  /**
   * 获取表格实例
   */
  getTable: () => tableInstance,

  /**
   * 获取选中的行
   */
  getSelectedRows: () => tableInstance?.getSelectedRows() || [],

  /**
   * 清除选择
   */
  clearSelection: () => tableInstance?.clearSelection(),

  /**
   * 刷新表格
   */
  refresh: () => tableInstance?.render()
})
</script>

<style scoped>
.ctable-container {
  position: relative;
  overflow: hidden;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.ctable-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.ctable-canvas:hover {
  cursor: default;
}
</style>
