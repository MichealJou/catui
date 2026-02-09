<template>
  <div class="demo-container">
    <h1 class="demo-title">CTable - 高性能表格组件演示</h1>

    <p class="demo-description">
      基于 G2 的高性能表格组件，支持百万级数据渲染和丰富的交互功能。<br>
      兼容 Ant Design Vue / Element Plus / NaiveUI 主题。
    </p>
    
    <!-- 控制面板 -->
    <div class="controls">
      <button class="control-btn" @click="generateData(100)">
        生成 100 条数据
      </button>
      <button class="control-btn" @click="generateData(1000)">
        生成 1,000 条数据
      </button>
      <button class="control-btn" @click="generateData(10000)">
        生成 10,000 条数据
      </button>
      <button class="control-btn" @click="generateData(100000)">
        生成 100,000 条数据
      </button>
      <button class="control-btn" @click="generateData(1000000)">
        生成 1,000,000 条数据
      </button>
      <button class="control-btn" @click="clearData">
        清空数据
      </button>
      <button class="control-btn" @click="toggleTheme">
        主题: {{ getThemeDisplayName(currentTheme) }}
      </button>
      <button class="control-btn" @click="clearFilters">
        清除筛选
      </button>
    </div>

    <!-- 主题说明 -->
    <div class="theme-info">
      <span class="theme-label">当前主题:</span>
      <span class="theme-value">{{ getThemeDisplayName(currentTheme) }}</span>
      <span class="theme-desc">- {{ getThemeDescription(currentTheme) }}</span>
    </div>
    
    <!-- 表格容器 -->
    <div class="table-container" ref="tableContainerRef">
      <div class="table-title">数据表格 ({{ tableData.length }} 条记录)</div>

      <CTable
        v-if="tableWidth > 0"
        ref="canvasTableRef"
        :columns="columns"
        :dataSource="tableData"
        :width="tableWidth"
        :height="600"
        :theme="currentTheme"
        :virtual-scroll="true"
        :row-selection="{ type: 'checkbox', selectedRowKeys: selectedKeys }"
        @cell-click="handleCellClick"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
        @scroll="handleScroll"
        @sort-change="handleSortChange"
        @filter-change="handleFilterChange"
      />

      <div v-else class="loading-state">
        正在初始化表格...
      </div>
    </div>
    
    <!-- 信息面板 -->
    <div class="info-panel">
      <div class="info-item">
        <span class="info-label">当前数据量:</span>
        <span class="info-value">{{ tableData.length }} 条</span>
      </div>
      <div class="info-item">
        <span class="info-label">当前主题:</span>
        <span class="info-value">{{ currentTheme }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">选中行数:</span>
        <span class="info-value">{{ selectedKeys.length }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">最后操作:</span>
        <span class="info-value">{{ lastAction }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { CTable } from '@catui/ctable'
import type { Column } from '@catui/ctable'
import type { ThemePreset } from '@catui/ctable'

interface TestData {
  id: number
  name: string
  age: number
  address: string
  phone: string
  job: string
  salary: number
  date: string
}

// 数据
const tableData = ref<TestData[]>([])
const selectedKeys = ref<string[]>([])
const loading = ref(false)
const lastAction = ref('等待操作')

// 表格配置
const themePresets: ThemePreset[] = [
  'ant-design',
  'ant-design-dark',
  'element-plus',
  'element-plus-dark',
  'naive',
  'naive-dark'
]
const currentTheme = ref<ThemePreset>('ant-design')
const bordered = ref(true)

const columns = reactive<Column[]>([
  {
    key: '__checkbox__',
    title: '选择',
    width: 50,
    align: 'center'
  },
  {
    key: 'id',
    title: 'ID',
    width: 80,
    align: 'center',
    sortable: true
  },
  {
    key: 'name',
    title: '姓名',
    width: 120,
    align: 'left',
    sortable: true,
    filterable: true
  },
  {
    key: 'age',
    title: '年龄',
    width: 80,
    align: 'center',
    sortable: true,
    filterable: true
  },
  {
    key: 'job',
    title: '职业',
    width: 120,
    align: 'left',
    filterable: true
  },
  {
    key: 'address',
    title: '地址',
    width: 200,
    align: 'left'
  },
  {
    key: 'phone',
    title: '电话',
    width: 150,
    align: 'left'
  },
  {
    key: 'salary',
    title: '薪资',
    width: 100,
    align: 'right'
  },
  {
    key: 'date',
    title: '日期',
    width: 120,
    align: 'center'
  }
])

// 组件引用
const canvasTableRef = ref()
const tableContainerRef = ref<HTMLDivElement>()
const tableWidth = ref(0)  // 初始为0，会在 onMounted 中计算
let resizeObserver: ResizeObserver | null = null

// 监听容器大小变化
onMounted(() => {
  if (tableContainerRef.value) {
    // 初始化宽度
    updateTableWidth()

    // 设置 ResizeObserver 监听容器大小变化（添加防抖，避免频繁触发）
    const debouncedUpdateWidth = debounce(() => {
      const containerWidth = tableContainerRef.value!.clientWidth

      // 计算所有列的总宽度
      const columnsTotalWidth = columns.reduce((sum, col) => sum + (col.width || 120), 0)

      // 只在宽度真正改变时才更新
      const newWidth = Math.max(columnsTotalWidth, containerWidth - 2)
      if (Math.abs(newWidth - tableWidth.value) > 10) {
        tableWidth.value = newWidth
      }
    }, 200)

    resizeObserver = new ResizeObserver(debouncedUpdateWidth)
    resizeObserver.observe(tableContainerRef.value)
  }

  // 初始化时生成 1000 条数据
  generateData(1000)
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

const updateTableWidth = () => {
  if (tableContainerRef.value) {
    const containerWidth = tableContainerRef.value.clientWidth

    // 计算所有列的总宽度
    const columnsTotalWidth = columns.reduce((sum, col) => sum + (col.width || 120), 0)

    // 表格宽度 = Math.max(容器宽度, 列总宽度)
    // 这样可以确保：
    // 1. 当容器宽度 > 列总宽度时，表格扩展以填充容器（最后一列自动扩展）
    // 2. 当容器宽度 < 列总宽度时，表格保持列总宽度，出现横向滚动条
    tableWidth.value = Math.max(columnsTotalWidth, containerWidth - 2)
  }
}

// 防抖函数
const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number): T => {
  let timeoutId: ReturnType<typeof setTimeout>
  return ((...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }) as T
}

// 生成测试数据
const generateData = (count: number) => {
  loading.value = true
  lastAction.value = `生成 ${count} 条数据`

  const jobs = ['工程师', '设计师', '产品经理', '运营', '销售', '市场', '财务', '人事']
  const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安']

  // 小于等于 10000 条数据使用同步生成
  if (count <= 10000) {
    const data: TestData[] = []
    for (let i = 1; i <= count; i++) {
      data.push({
        id: i,
        name: `用户 ${i}`,
        age: 20 + Math.floor(Math.random() * 40),
        address: `${cities[Math.floor(Math.random() * cities.length)]}市第${i}大街`,
        phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        job: jobs[Math.floor(Math.random() * jobs.length)],
        salary: 5000 + Math.floor(Math.random() * 50000),
        date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString()
      })
    }
    tableData.value = data
    loading.value = false
    console.log(`生成了 ${count} 条数据`)
  } else {
    // 大数据量使用分批生成避免阻塞 UI
    setTimeout(() => {
      const batchSize = 10000
      const data: TestData[] = []
      let currentBatch = 0
      const totalBatches = Math.ceil(count / batchSize)

      const generateBatch = () => {
        const start = currentBatch * batchSize
        const end = Math.min(start + batchSize, count)

        for (let i = start + 1; i <= end; i++) {
          data.push({
            id: i,
            name: `用户 ${i}`,
            age: 20 + Math.floor(Math.random() * 40),
            address: `${cities[Math.floor(Math.random() * cities.length)]}市第${i}大街`,
            phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
            job: jobs[Math.floor(Math.random() * jobs.length)],
            salary: 5000 + Math.floor(Math.random() * 50000),
            date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString()
          })
        }

        currentBatch++

        if (currentBatch < totalBatches) {
          requestAnimationFrame(generateBatch)
        } else {
          tableData.value = data
          loading.value = false
          console.log(`生成了 ${count} 条数据`)
        }
      }

      generateBatch()
    }, 100)
  }
}

// 清空数据
const clearData = () => {
  tableData.value = []
  selectedKeys.value = []
  lastAction.value = '清空数据'
}

// 切换主题（循环切换所有预设）
const toggleTheme = () => {
  const currentIndex = themePresets.indexOf(currentTheme.value)
  const nextIndex = (currentIndex + 1) % themePresets.length
  currentTheme.value = themePresets[nextIndex]
  lastAction.value = `切换主题为 ${getThemeDisplayName(currentTheme.value)}`
}

// 获取主题显示名称
const getThemeDisplayName = (theme: ThemePreset): string => {
  const names: Record<ThemePreset, string> = {
    'ant-design': 'Ant Design',
    'ant-design-dark': 'Ant Design (暗黑)',
    'element-plus': 'Element Plus',
    'element-plus-dark': 'Element Plus (暗黑)',
    'naive': 'NaiveUI',
    'naive-dark': 'NaiveUI (暗黑)'
  }
  return names[theme] || theme
}

// 获取主题描述
const getThemeDescription = (theme: ThemePreset): string => {
  const descriptions: Record<ThemePreset, string> = {
    'ant-design': 'Ant Design Vue 默认主题',
    'ant-design-dark': 'Ant Design Vue 暗黑主题',
    'element-plus': 'Element Plus 默认主题',
    'element-plus-dark': 'Element Plus 暗黑主题',
    'naive': 'NaiveUI 默认主题',
    'naive-dark': 'NaiveUI 暗黑主题'
  }
  return descriptions[theme] || ''
}

// 事件处理
const handleRowClick = (row: TestData, index: number) => {
  lastAction.value = `点击第 ${index + 1} 行 (ID: ${row.id})`
  console.log('行点击:', row, index)
}

const handleCellClick = (cell: any, row: TestData, column: Column) => {
  lastAction.value = `点击单元格 (${column.key}: ${cell})`
  console.log('单元格点击:', cell, row, column)
}

const handleSelectionChange = (selectedRows: TestData[], keys: string[]) => {
  selectedKeys.value = keys
  lastAction.value = `选中 ${keys.length} 行数据`
  console.log('选择变化:', selectedRows, keys)
}

const handleScroll = (scrollTop: number, scrollLeft: number) => {
  console.log('滚动:', scrollTop, scrollLeft)
}

const handleSortChange = (field: string, order: any) => {
  const orderText = order === 'asc' ? '升序' : order === 'desc' ? '降序' : '无'
  lastAction.value = `排序字段: ${field}, 顺序: ${orderText}`
  console.log('排序变化:', field, order)
}

const handleFilterChange = (filters: any[]) => {
  lastAction.value = `筛选条件: ${filters.length} 个`
  console.log('筛选变化:', filters)
}

const clearFilters = () => {
  if (canvasTableRef.value) {
    canvasTableRef.value.clearFilters()
    lastAction.value = '清除所有筛选'
  }
}
</script>

<style scoped>
.demo-container {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.demo-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.demo-description {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
}

.table-container {
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
}

.table-title {
  background: #f5f5f5;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  color: #333;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.control-btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.control-btn:hover {
  background: #40a9ff;
}

.control-btn:active {
  background: #096dd9;
}

.theme-info {
  background: #e6f4ff;
  border: 1px solid #91caff;
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.theme-label {
  font-weight: 600;
  color: #1677ff;
}

.theme-value {
  font-weight: 600;
  color: #1677ff;
}

.theme-desc {
  color: #666;
}

.info-panel {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.info-item {
  font-size: 14px;
}

.info-label {
  font-weight: 600;
  color: #333;
}

.info-value {
  color: #666;
  margin-left: 8px;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #999;
  font-size: 16px;
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: #1677ff;
  font-size: 16px;
  background: #f0f5ff;
  border: 1px dashed #91caff;
  border-radius: 4px;
}
</style>
