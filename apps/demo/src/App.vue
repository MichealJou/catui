<template>
  <div class="demo-container">
    <h1 class="demo-title">Canvas Table 组件演示 (S2)</h1>
    <p class="demo-description">
      基于 AntV S2 的高性能 Canvas 表格组件，支持百万级数据渲染和丰富的交互功能。
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
      <button class="control-btn" @click="clearData">
        清空数据
      </button>
      <button class="control-btn" @click="toggleVirtual">
        虚拟滚动: {{ virtual ? '开启' : '关闭' }}
      </button>
      <button class="control-btn" @click="toggleTheme">
        主题: {{ currentTheme }}
      </button>
      <button class="control-btn" @click="toggleToolbar">
        工具栏: {{ showToolbar ? '显示' : '隐藏' }}
      </button>
    </div>
    
    <!-- 表格容器 -->
    <div class="table-container">
      <div class="table-title">数据表格 ({{ tableData.length }} 条记录)</div>
      <S2Table
        v-if="tableData.length > 0"
        ref="s2TableRef"
        :data="tableData"
        :columns="columns"
        :width="1200"
        :height="600"
        :mode="currentMode"
        :theme="currentTheme"
        :showHeader="showHeader"
        :showFooter="showFooter"
        :bordered="bordered"
        :loading="loading"
        :virtual="virtual"
        :interactive="interactive"
        :toolbar="toolbarConfig"
        :pagination="pagination"
        :rowKey="'id'"
        @row-click="handleRowClick"
        @cell-click="handleCellClick"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @filter-change="handleFilterChange"
        @pagination-change="handlePaginationChange"
        @scroll="handleScroll"
        @tool-click="handleToolClick"
        @data-change="handleDataChange"
      />
      <div v-else class="empty-state">
        点击按钮生成测试数据
      </div>
    </div>
    
    <!-- 信息面板 -->
    <div class="info-panel">
      <div class="info-item">
        <span class="info-label">当前数据量:</span>
        <span class="info-value">{{ tableData.length }} 条</span>
      </div>
      <div class="info-item">
        <span class="info-label">表格模式:</span>
        <span class="info-value">{{ currentMode }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">当前主题:</span>
        <span class="info-value">{{ currentTheme }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">虚拟滚动:</span>
        <span class="info-value">{{ virtual ? '开启' : '关闭' }}</span>
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
import { ref, reactive } from 'vue'
import S2Table from './components/S2Table.vue'
import type { Column } from './types/s2-table'

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
const currentMode = ref<'grid' | 'tree' | 'compact'>('grid')
const currentTheme = ref<'default' | 'dark' | 'gray'>('default')
const showHeader = ref(true)
const showFooter = ref(false)
const bordered = ref(true)
const virtual = ref(true)
const showToolbar = ref(true)

const columns = reactive<Column[]>([
  {
    key: 'id',
    title: 'ID',
    width: 80,
    type: 'data',
    align: 'center',
    sortable: true
  },
  {
    key: 'name',
    title: '姓名',
    width: 120,
    type: 'row',
    sortable: true,
    align: 'left'
  },
  {
    key: 'age',
    title: '年龄',
    width: 80,
    type: 'data',
    sortable: true,
    align: 'center'
  },
  {
    key: 'job',
    title: '职业',
    width: 120,
    type: 'row',
    align: 'left'
  },
  {
    key: 'address',
    title: '地址',
    width: 200,
    type: 'row',
    align: 'left'
  },
  {
    key: 'phone',
    title: '电话',
    width: 150,
    type: 'data',
    align: 'left'
  },
  {
    key: 'salary',
    title: '薪资',
    width: 100,
    type: 'data',
    sortable: true,
    align: 'right'
  },
  {
    key: 'date',
    title: '日期',
    width: 120,
    type: 'data',
    align: 'center'
  }
])

// 交互配置
const interactive = reactive({
  hoverHighlight: true,
  selectedCellHighlight: true,
  rowSelection: true,
  columnSelection: false,
  cellEdit: false,
  dragDrop: false,
  multiSort: true
})

// 工具栏配置
const toolbarConfig = reactive({
  show: showToolbar.value,
  tools: ['filter', 'sort', 'export', 'refresh']
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 100,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: true,
  pageSizeOptions: [10, 20, 50, 100, 500]
})

// 组件引用
const s2TableRef = ref()

// 生成测试数据
const generateData = (count: number) => {
  loading.value = true
  lastAction.value = `生成 ${count} 条数据`
  
  setTimeout(() => {
    const jobs = ['工程师', '设计师', '产品经理', '运营', '销售', '市场', '财务', '人事']
    const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安']
    
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
    pagination.total = count
    pagination.current = 1
    loading.value = false
  }, 100)
}

// 清空数据
const clearData = () => {
  tableData.value = []
  selectedKeys.value = []
  lastAction.value = '清空数据'
}

// 切换虚拟滚动
const toggleVirtual = () => {
  virtual.value = !virtual.value
  lastAction.value = `切换虚拟滚动为 ${virtual.value ? '开启' : '关闭'}`
}

// 切换主题
const toggleTheme = () => {
  const themes: Array<'default' | 'dark' | 'gray'> = ['default', 'dark', 'gray']
  const currentIndex = themes.indexOf(currentTheme.value)
  const nextIndex = (currentIndex + 1) % themes.length
  currentTheme.value = themes[nextIndex]
  lastAction.value = `切换主题为 ${currentTheme.value}`
}

// 切换工具栏
const toggleToolbar = () => {
  showToolbar.value = !showToolbar.value
  toolbarConfig.show = showToolbar.value
  lastAction.value = `切换工具栏为 ${showToolbar.value ? '显示' : '隐藏'}`
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

const handleSortChange = (sortInfo: any) => {
  lastAction.value = `排序变化: ${JSON.stringify(sortInfo)}`
  console.log('排序变化:', sortInfo)
}

const handleFilterChange = (filterInfo: any) => {
  lastAction.value = `筛选变化: ${JSON.stringify(filterInfo)}`
  console.log('筛选变化:', filterInfo)
}

const handlePaginationChange = (pageInfo: any) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  lastAction.value = `分页变化: 第 ${pageInfo.current} 页，每页 ${pageInfo.pageSize} 条`
  console.log('分页变化:', pageInfo)
}

const handleScroll = (scrollTop: number, scrollLeft: number) => {
  console.log('滚动:', scrollTop, scrollLeft)
}

const handleToolClick = (tool: string, event: MouseEvent) => {
  lastAction.value = `工具栏点击: ${tool}`
  console.log('工具栏点击:', tool, event)
}

const handleDataChange = (data: any[]) => {
  tableData.value = data
}

// 初始化
generateData(100)
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
  overflow: hidden;
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
</style>