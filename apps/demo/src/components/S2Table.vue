<template>
  <div class="s2-table-container" :style="{ width: width + 'px', height: height + 'px' }">
    <!-- 工具栏 -->
    <div v-if="toolbar?.show" class="s2-toolbar">
      <div class="s2-toolbar-left">
        <button 
          v-for="tool in toolbar.tools" 
          :key="tool"
          class="s2-tool-btn"
          @click="handleToolbarClick(tool, $event)"
        >
          {{ getToolName(tool) }}
        </button>
      </div>
      <div class="s2-toolbar-right">
        <button class="s2-tool-btn s2-tool-btn-refresh" @click="refresh">
          刷新
        </button>
      </div>
    </div>

    <!-- S2 表格容器 -->
    <div 
      ref="s2ContainerRef"
      class="s2-table-content"
      :style="{ 
        width: width + 'px', 
        height: toolbar?.show ? (height - 40) + 'px' : height + 'px'
      }"
    >
      <SheetComponent
        v-if="s2DataConfig"
        :dataCfg="s2DataConfig"
        :options="s2Options"
        @loaded="onS2Loaded"
        @row-cell:click="onRowClick"
        @cell:click="onCellClick"
        @scroll="onScroll"
      />
      <!-- 加载状态 -->
      <div v-if="loading" class="s2-loading">
        <div class="s2-loading-spinner"></div>
        <div class="s2-loading-text">加载中...</div>
      </div>
    </div>

    <!-- 分页器 -->
    <div v-if="pagination" class="s2-pagination">
      <div class="s2-pagination-info">
        共 {{ pagination.total }} 条记录
      </div>
      <div class="s2-pagination-controls">
        <button 
          class="s2-pagination-btn" 
          @click="handlePageChange(pagination.current - 1)"
          :disabled="pagination.current <= 1"
        >
          上一页
        </button>
        <span class="s2-pagination-current">
          {{ pagination.current }} / {{ Math.ceil(pagination.total / pagination.pageSize) }}
        </span>
        <button 
          class="s2-pagination-btn" 
          @click="handlePageChange(pagination.current + 1)"
          :disabled="pagination.current >= Math.ceil(pagination.total / pagination.pageSize)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { SheetComponent } from '@antv/s2-vue'
import type { S2DataConfig, S2Options } from '@antv/s2'
import { S2DataTransformer } from '../utils/s2-data-transformer'
import { S2ThemeManager } from '../utils/s2-theme-manager'
import type { Column } from '../types/s2-table'

// Props 定义
const props = withDefaults(defineProps<{
  data: any[]
  columns: Column[]
  width: number
  height: number
  mode?: 'grid' | 'tree' | 'compact'
  theme?: 'default' | 'dark' | 'gray'
  showHeader?: boolean
  showFooter?: boolean
  bordered?: boolean
  loading?: boolean
  virtual?: boolean
  interactive?: {
    hoverHighlight: boolean
    selectedCellHighlight: boolean
    rowSelection?: boolean
    columnSelection?: boolean
    cellEdit?: boolean
    dragDrop?: boolean
    multiSort?: boolean
  }
  toolbar?: {
    show: boolean
    tools: string[]
    position?: 'top' | 'bottom' | 'right'
  }
  pagination?: {
    current: number
    pageSize: number
    total: number
    showSizeChanger?: boolean
    showQuickJumper?: boolean
    showTotal?: boolean
    pageSizeOptions?: number[]
  }
  rowKey?: string
}>(), {
  mode: 'grid',
  theme: 'default',
  showHeader: true,
  showFooter: false,
  bordered: true,
  loading: false,
  virtual: false,
  interactive: () => ({
    hoverHighlight: true,
    selectedCellHighlight: true
  }),
  toolbar: () => ({
    show: false,
    tools: []
  }),
  rowKey: 'id'
})

// Emits 定义
const emit = defineEmits<{
  'row-click': [row: any, index: number]
  'cell-click': [cell: any, row: any, column: Column]
  'selection-change': [selectedRows: any[], selectedKeys: string[]]
  'sort-change': [sortInfo: any]
  'filter-change': [filterInfo: any]
  'pagination-change': [pagination: any]
  'scroll': [scrollTop: number, scrollLeft: number]
  'tool-click': [tool: string, event: MouseEvent]
  'data-change': [data: any[]]
  'columns-change': [columns: Column[]]
}>()

// 响应式状态
const s2ContainerRef = ref<HTMLDivElement>()
const s2Instance = ref<any>(null)
const s2ThemeManager = new S2ThemeManager()

// 数据转换器
const dataTransformer = reactive({
  transformToS2Data: (data: any[], columns: any[]) => {
    return S2DataTransformer.transformToS2Data(data, columns)
  }
})

// 计算属性
const s2DataConfig = computed(() => {
  if (!props.data || !props.columns) return null
  return dataTransformer.transformToS2Data(props.data, props.columns)
})

const s2Options = computed((): S2Options => {
  return {
    width: props.width,
    height: props.height - (props.toolbar?.show ? 40 : 0),
    showHeader: props.showHeader,
    showFooter: props.showFooter,
    debug: false,
    interaction: {
      hoverHighlight: props.interactive?.hoverHighlight ?? true,
      selectedCellHighlight: props.interactive?.selectedCellHighlight ?? true,
    },
    tooltip: {
      showTooltip: true,
    },
    frozenRowCount: 0,
    frozenColCount: 0,
    theme: s2ThemeManager.toS2Theme(),
  }
})

// 监听数据变化
watch(() => props.data, (newData) => {
  // 数据变化会通过计算属性自动更新
}, { deep: true })

// 监听列变化
watch(() => props.columns, (newColumns) => {
  // 列变化会通过计算属性自动更新
}, { deep: true })

// 监听主题变化
watch(() => props.theme, (newTheme) => {
  s2ThemeManager.setTheme(newTheme)
}, { deep: true })

// S2 事件处理
const onS2Loaded = (s2: any) => {
  s2Instance.value = s2
}

const onRowClick = (event: any) => {
  if (s2Instance.value) {
    const cell = s2Instance.value.getCell(event.target)
    if (cell?.getMeta()) {
      const data = cell.getMeta().data
      const index = props.data.findIndex(item => item[props.rowKey] === data?.[props.rowKey])
      emit('row-click', data, index)
    }
  }
}

const onCellClick = (event: any) => {
  if (s2Instance.value) {
    const cell = s2Instance.value.getCell(event.target)
    if (cell?.getMeta()) {
      const data = cell.getMeta().data
      const col = getColumn(cell.getMeta().field)
      emit('cell-click', data?.[cell.getMeta().field], data, col)
    }
  }
}

const onScroll = (event: any) => {
  emit('scroll', event.scrollTop, event.scrollLeft)
}

// 获取列信息
const getColumn = (field: string) => {
  return props.columns.find(col => col.dataIndex === field || col.key === field)
}

// 获取工具名称
const getToolName = (tool: string): string => {
  const toolNames: Record<string, string> = {
    filter: '筛选',
    sort: '排序',
    export: '导出',
    setting: '设置',
    fullScreen: '全屏',
    refresh: '刷新'
  }
  return toolNames[tool] || tool
}

// 工具栏点击
const handleToolbarClick = (tool: string, event: MouseEvent) => {
  emit('tool-click', tool, event)
  
  switch (tool) {
    case 'refresh':
      refresh()
      break
    case 'export':
      exportData('csv')
      break
    case 'filter':
      showFilter()
      break
    case 'sort':
      showSort()
      break
  }
}

// 分页变化
const handlePageChange = (page: number) => {
  if (props.pagination) {
    const newPagination = {
      ...props.pagination,
      current: page
    }
    emit('pagination-change', newPagination)
  }
}

// 刷新
const refresh = () => {
  // 通过强制更新数据来刷新
}

// 导出数据
const exportData = (format: 'csv' | 'xlsx' | 'json') => {
  if (!s2Instance.value) return

  try {
    const data = props.data
    switch (format) {
      case 'csv':
        exportToCSV(data)
        break
      case 'xlsx':
        exportToExcel(data)
        break
      case 'json':
        exportToJSON(data)
        break
    }
  } catch (error) {
    console.error('Failed to export data:', error)
  }
}

// 导出为 CSV
const exportToCSV = (data: any[]) => {
  if (!data.length) return

  const headers = props.columns.map(col => col.title)
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      props.columns.map(col => {
        const value = row[col.dataIndex || col.key]
        return typeof value === 'string' ? `"${value}"` : value
      }).join(',')
    )
  ].join('\n')

  downloadFile(csvContent, 'table.csv', 'text/csv')
}

// 导出为 JSON
const exportToJSON = (data: any[]) => {
  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, 'table.json', 'application/json')
}

// 导出为 Excel
const exportToExcel = (data: any[]) => {
  // 简化实现，实际可以使用 xlsx 库
  console.log('Export to Excel:', data)
}

// 下载文件
const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// 显示筛选
const showFilter = () => {
  console.log('Show filter dialog')
}

// 显示排序
const showSort = () => {
  console.log('Show sort dialog')
}

// 实例 API
const getInstance = () => {
  return {
    s2: s2Instance.value,
    container: s2ContainerRef.value,
    dataTransformer,
    themeManager: s2ThemeManager,
    getData: () => props.data,
    setData: (data: any[]) => {
      emit('data-change', data)
    },
    getSelectedRows: () => {
      if (!s2Instance.value) return []
      // S2 暂不直接支持选择行，返回空数组
      return []
    },
    getSelectedKeys: () => {
      if (!s2Instance.value) return []
      // S2 暂不直接支持选择行，返回空数组
      return []
    },
    setTheme: (theme: string) => {
      s2ThemeManager.setTheme(theme)
    },
    exportData: (format: 'csv' | 'xlsx' | 'json') => {
      exportData(format)
    },
    refresh: refresh,
    destroy: () => {
      if (s2Instance.value) {
        s2Instance.value.destroy()
        s2Instance.value = null
      }
    }
  }
}

// 导出实例
defineExpose({
  getInstance
})
</script>

<style scoped>
/* Ant Design 风格样式 */
.s2-table-container {
  position: relative;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.s2-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 46px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  z-index: 10;
}

.s2-toolbar-left {
  display: flex;
  gap: 8px;
}

.s2-toolbar-right {
  display: flex;
  gap: 8px;
}

.s2-tool-btn {
  padding: 4px 15px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #ffffff;
  color: rgba(0, 0, 0, 0.88);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  line-height: 1.5714285714285714;
  min-width: 60px;
}

.s2-tool-btn:hover {
  border-color: #40a9ff;
  color: #40a9ff;
  background: #fff;
}

.s2-tool-btn:active {
  border-color: #096dd9;
  color: #096dd9;
  background: #f0faff;
}

.s2-tool-btn-refresh {
  background: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.s2-tool-btn-refresh:hover {
  background: #40a9ff;
  border-color: #40a9ff;
  color: #fff;
}

.s2-tool-btn-refresh:active {
  background: #096dd9;
  border-color: #096dd9;
  color: #fff;
}

.s2-table-content {
  position: relative;
  overflow: hidden;
}

.s2-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.s2-loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f0f0f0;
  border-top: 2px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

.s2-loading-text {
  color: #8c8c8c;
  font-size: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.s2-pagination {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  z-index: 10;
}

.s2-pagination-info {
  color: rgba(0, 0, 0, 0.88);
  font-size: 14px;
}

.s2-pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.s2-pagination-btn {
  padding: 4px 15px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #ffffff;
  color: rgba(0, 0, 0, 0.88);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  line-height: 1.5714285714285714;
  min-width: auto;
}

.s2-pagination-btn:hover:not(:disabled) {
  border-color: #40a9ff;
  color: #40a9ff;
  background: #fff;
}

.s2-pagination-btn:disabled {
  color: rgba(0, 0, 0, 0.25);
  border-color: #d9d9d9;
  background: #f5f5f5;
  cursor: not-allowed;
}

.s2-pagination-btn:active:not(:disabled) {
  border-color: #096dd9;
  color: #096dd9;
  background: #f0faff;
}

.s2-pagination-current {
  color: rgba(0, 0, 0, 0.88);
  font-size: 14px;
  padding: 0 8px;
  min-width: 38px;
  text-align: center;
}
</style>