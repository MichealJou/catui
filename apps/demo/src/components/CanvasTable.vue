<template>
  <div
    class="canvas-table-container"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <canvas
      ref="canvasRef"
      :style="{ width: width + 'px', height: height + 'px' }"
      @click="handleClick"
      @wheel="handleScroll"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, PropType, ref } from 'vue'

interface Column {
  key: string
  title: string
  width?: number
  align?: string
}

interface Theme {
  background?: string
  border?: string
  header?: string
  textPrimary?: string
  scrollbarBg?: string
  scrollbarThumb?: string
}

const props = defineProps({
  data: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  columns: {
    type: Array as PropType<Column[]>,
    default: () => []
  },
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 400
  },
  virtual: {
    type: Boolean,
    default: true
  },
  renderer: {
    type: String,
    default: 'canvas'
  },
  theme: {
    type: Object as PropType<Theme>,
    default: () => ({})
  }
})

const emit = defineEmits(['row-click', 'cell-click', 'scroll'])

const canvasRef = ref<HTMLCanvasElement | null>(null)
const scrollTop = ref(0)
const scrollLeft = ref(0)
const isScrolling = ref(false)

const drawTable = (ctx: CanvasRenderingContext2D) => {
  // 清除画布
  ctx.clearRect(0, 0, props.width, props.height)

  // 绘制背景
  ctx.fillStyle = props.theme?.background || '#ffffff'
  ctx.fillRect(0, 0, props.width, props.height)

  // 绘制表头
  ctx.fillStyle = props.theme?.header || '#f5f5f5'
  ctx.fillRect(0, 0, props.width, 40)

  // 绘制表头文本
  ctx.fillStyle = props.theme?.textPrimary || '#333333'
  ctx.font = 'bold 14px Arial, sans-serif'

  let x = 0
  for (const column of props.columns) {
    const width = column.width || 120
    ctx.fillText(column.title, x + 10, 20)
    x += width
  }

  // 绘制数据行
  ctx.fillStyle = props.theme?.textPrimary || '#333333'
  ctx.font = '14px Arial, sans-serif'

  let y = 40 - (scrollTop.value % 40)

  // 计算起始行索引
  const startRow = Math.floor(scrollTop.value / 40)
  const endRow = Math.min(
    startRow + Math.ceil(props.height / 40) + 2,
    props.data.length
  )

  const visibleData = props.virtual
    ? props.data.slice(startRow, endRow)
    : props.data

  for (const row of visibleData) {
    if (y > props.height) break
    if (y < 40) {
      y += 40
      continue
    }

    x = 0 - scrollLeft.value
    for (const column of props.columns) {
      const width = column.width || 120
      if (x + width > 0 && x < props.width) {
        const text = row[column.key] || ''
        ctx.fillText(text, x + 10, y + 20)
      }
      x += width
    }
    y += 40
  }

  // 绘制滚动条
  const totalHeight = props.data.length * 40 + 40
  const totalWidth = props.columns.reduce(
    (sum, col) => sum + (col.width || 120),
    0
  )

  // 垂直滚动条
  if (totalHeight > props.height) {
    ctx.fillStyle = props.theme?.scrollbarBg || '#f0f0f0'
    ctx.fillRect(props.width - 10, 0, 10, props.height)

    const scrollThumbHeight = Math.max(
      20,
      (props.height / totalHeight) * props.height
    )
    const scrollThumbY =
      (scrollTop.value / (totalHeight - props.height)) *
      (props.height - scrollThumbHeight)

    ctx.fillStyle = props.theme?.scrollbarThumb || '#c0c0c0'
    ctx.fillRect(props.width - 8, scrollThumbY, 6, scrollThumbHeight)

    // 滚动条边框
    ctx.strokeStyle = props.theme?.border || '#e0e0e0'
    ctx.strokeRect(props.width - 10, 0, 10, props.height)
  }

  // 水平滚动条
  const totalWidth = props.columns.reduce(
    (sum, col) => sum + (col.width || 120),
    0
  )
  if (totalWidth > props.width) {
    ctx.fillStyle = props.theme?.scrollbarBg || '#f0f0f0'
    ctx.fillRect(0, props.height - 10, props.width, 10)

    const scrollThumbWidth = Math.max(
      20,
      (props.width / totalWidth) * props.width
    )
    const scrollThumbX =
      (scrollLeft.value / (totalWidth - props.width)) *
      (props.width - scrollThumbWidth)

    ctx.fillStyle = props.theme?.scrollbarThumb || '#c0c0c0'
    ctx.fillRect(scrollThumbX, props.height - 8, scrollThumbWidth, 6)

    // 滚动条边框
    ctx.strokeStyle = props.theme?.border || '#e0e0e0'
    ctx.strokeRect(0, props.height - 10, props.width, 10)
  }
}

const handleClick = (event: MouseEvent) => {
  if (!canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // 检查是否点击了滚动条
  if (x > props.width - 10) {
    // 垂直滚动条点击
    const totalHeight = props.data.length * 40 + 40
    const scrollRatio = (y / props.height) * totalHeight
    scrollTop.value = Math.max(
      0,
      Math.min(scrollRatio - props.height / 2, totalHeight - props.height)
    )
    drawTable(canvasRef.value.getContext('2d')!)
    return
  }

  if (y > props.height - 10) {
    // 水平滚动条点击
    const totalWidth = props.columns.reduce(
      (sum, col) => sum + (col.width || 120),
      0
    )
    const scrollRatio = (x / props.width) * totalWidth
    scrollLeft.value = Math.max(
      0,
      Math.min(scrollRatio - props.width / 2, totalWidth - props.width)
    )
    drawTable(canvasRef.value.getContext('2d')!)
    return
  }

  // 计算点击的行和列
  const rowIndex = Math.floor((y - 40 + scrollTop.value) / 40)
  const colIndex = Math.floor((x + scrollLeft.value) / 120)

  if (rowIndex >= 0 && rowIndex < props.data.length) {
    const row = props.data[rowIndex]
    const column = props.columns[colIndex]

    emit('row-click', row, rowIndex)
    emit('cell-click', row[column.key], row, column)
  }
}

const handleScroll = (event: WheelEvent) => {
  event.preventDefault()

  if (!canvasRef.value) return

  const delta = event.deltaY
  const totalHeight = props.data.length * 40 + 40

  // 更新滚动位置
  scrollTop.value = Math.max(
    0,
    Math.min(scrollTop.value + delta, totalHeight - props.height)
  )

  // 重绘
  drawTable(canvasRef.value.getContext('2d')!)

  // 发出滚动事件
  emit('scroll', scrollTop.value, scrollLeft.value)
}

// 初始化
onMounted(() => {
  if (canvasRef.value) {
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // 设置画布尺寸
    canvas.width = props.width
    canvas.height = props.height
    canvas.style.width = `${props.width}px`
    canvas.style.height = `${props.height}px`

    // 绘制初始表格
    drawTable(ctx)
  }
})

// 监听窗口大小变化
window.addEventListener('resize', () => {
  if (canvasRef.value) {
    drawTable(canvasRef.value.getContext('2d')!)
  }
})
</script>
