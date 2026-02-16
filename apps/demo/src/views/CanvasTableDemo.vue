<template>
  <div class="demo-page">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <div class="header-content">
        <div class="page-header-left">
          <h1 class="page-title">CatUI 表格演示</h1>
          <p class="page-subtitle">高性能 Canvas 表格组件</p>
        </div>
        <div class="page-header-right">
          <a href="https://github.com" target="_blank" class="github-link">
            <svg viewBox="0 0 24 24" fill="currentColor" class="github-icon">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8 8-9.8 15.602-15.602 24 6.626 24 12 18.627 24 12 24c5.302 0 9.8-3.438 9.8-8 0-4.626-2.373-8-5.602-8-15.602C21.627 1.373 16.598 0 12 0zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6zm-3-10c-.552 0-1 .448-1 1s-.448 1 1 1-.448 1-1-.448-1-1-1-.552 0-1-.448-1-1zm4 8c-.552 0-1-.448-1-1s-.448-1-1-1-.448-1-1-1 .552 0 1 .448 1 1 1-.448 1-1 1z"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-wrapper">
      <!-- 上方控制面板区 -->
      <div class="control-section-wrapper">
        <!-- 控制面板 -->
        <div class="control-card">
          <!-- 标题栏：包含标题和统计 -->
          <div class="card-header control-card-header">
            <div class="card-header-left control-header-left">
              <span class="header-icon-wrap">
                <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/>
                  <path d="M9 3v18M15 8v4M15 12h3M3 9h3" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </span>
              <div class="control-header-text">
                <span class="card-title">控制面板</span>
                <p class="card-subtitle">快速配置数据量、主题风格与交互能力</p>
              </div>
            </div>
            <div class="header-stats">
              <div class="stat-pill">
                <span class="stat-pill-label">数据总量</span>
                <span class="stat-pill-value">{{ data.length.toLocaleString() }}</span>
              </div>
              <div class="stat-pill">
                <span class="stat-pill-label">已选中</span>
                <span class="stat-pill-value stat-pill-value-success">{{ selectedRows.length }}</span>
              </div>
            </div>
          </div>

          <div class="control-shell">
            <div class="control-tabs">
              <button
                class="control-tab"
                :class="{ active: activeControlGroup === 'data' }"
                @click="activeControlGroup = 'data'"
              >
                📊 数据与列
              </button>
              <button
                class="control-tab"
                :class="{ active: activeControlGroup === 'style' }"
                @click="activeControlGroup = 'style'"
              >
                🎨 主题与排序
              </button>
              <button
                class="control-tab"
                :class="{ active: activeControlGroup === 'feature' }"
                @click="activeControlGroup = 'feature'"
              >
                ⚙️ 表格功能
              </button>
            </div>

            <div v-show="activeControlGroup === 'data'" class="control-grid">
              <div class="control-item">
                <span class="row-label">📊 数据量</span>
                <div class="btn-group-inline">
                  <button
                    v-for="item in dataOptions"
                    :key="item.value"
                    class="data-btn-inline"
                    :class="{ active: currentDataSize === item.value }"
                    @click="loadData(item.value)"
                  >
                    {{ item.label }}
                  </button>
                </div>
              </div>

              <div class="control-item">
                <span class="row-label">🧱 列数量</span>
                <div class="btn-group-inline">
                  <button
                    v-for="count in columnOptions"
                    :key="count"
                    class="data-btn-inline"
                    :class="{ active: columnCount === count }"
                    @click="switchColumnCount(count)"
                  >
                    {{ count }}列
                  </button>
                </div>
              </div>
            </div>

            <div v-show="activeControlGroup === 'style'" class="control-grid">
              <div class="control-item">
                <span class="row-label">🎨 主题风格</span>
                <div class="btn-group-inline">
                  <button
                    v-for="theme in themes"
                    :key="theme.value"
                    class="theme-btn-inline"
                    :class="{ active: currentTheme === theme.value }"
                    @click="switchTheme(theme.value)"
                  >
                    {{ theme.label }}
                  </button>
                </div>
              </div>

              <div class="control-item">
                <span class="row-label">🔃 排序模式</span>
                <div class="btn-group-inline">
                  <button
                    class="data-btn-inline"
                    :class="{ active: sortMode === 'local' }"
                    @click="sortMode = 'local'"
                  >
                    本地排序
                  </button>
                  <button
                    class="data-btn-inline"
                    :class="{ active: sortMode === 'remote' }"
                    @click="sortMode = 'remote'"
                  >
                    远程排序
                  </button>
                </div>
              </div>

              <div class="control-item">
                <span class="row-label">🧪 筛选模式</span>
                <div class="btn-group-inline">
                  <button
                    class="data-btn-inline"
                    :class="{ active: filterMode === 'local' }"
                    @click="filterMode = 'local'"
                  >
                    本地筛选
                  </button>
                  <button
                    class="data-btn-inline"
                    :class="{ active: filterMode === 'remote' }"
                    @click="filterMode = 'remote'"
                  >
                    远程筛选
                  </button>
                </div>
              </div>
            </div>

            <div v-show="activeControlGroup === 'feature'" class="control-grid">
              <div class="control-item control-item-full">
                <span class="row-label">⚙️ 表格功能</span>
                <div class="toggle-group-inline">
                  <label class="toggle-item-inline">
                    <input type="checkbox" v-model="stripe" />
                    <span>斑马纹</span>
                  </label>
                  <label class="toggle-item-inline">
                    <input type="checkbox" v-model="selectable" />
                    <span>可选择</span>
                  </label>
                  <label class="toggle-item-inline">
                    <input type="checkbox" v-model="bordered" />
                    <span>边框</span>
                  </label>
                  <label class="toggle-item-inline">
                    <input type="checkbox" v-model="showPagination" />
                    <span>分页</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表格卡片 -->
      <main class="table-area">
        <div class="table-card">
          <div class="card-header table-card-header">
            <div class="card-header-left">
              <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/>
                <path d="M3 9h18M9 21V9" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <h3 class="card-title">表格预览</h3>
            </div>
            <div class="card-header-right">
              <span class="status-badge" :class="{ loading: loading }">
                <span v-if="loading" class="loading-dot"></span>
                {{ loading ? '加载中...' : '就绪' }}
              </span>
            </div>
          </div>

          <div class="table-container" :class="{ loading: loading }">
            <CTable
              :columns="tableColumns"
              :data="data"
              :stripe="stripe"
              :selectable="selectable"
              :selectable-type="selectable ? 'multiple' : undefined"
              :row-selection="rowSelectionConfig"
              :pagination="paginationConfig"
              :bordered="bordered"
              :loading="loading"
              :sort-mode="sortMode"
              :filter-mode="filterMode"
              :on-sort-request="handleSortRequest"
              :on-filter-request="handleFilterRequest"
              :theme="currentTheme"
              @cell-click="handleCellClick"
              @row-click="handleRowClick"
              @selection-change="handleSelectionChange"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CTable, { type Column, type ThemePreset } from '@catui/ctable'
import { getTableData, type MockDataItem } from '../api/mock'

type DemoTableRow = MockDataItem & { __index__: number }

// 数据配置
const dataOptions = [
  { label: '100条', value: 100, count: '100' },
  { label: '1千', value: 1000, count: '1K' },
  { label: '1万', value: 10000, count: '10K' },
  { label: '10万', value: 100000, count: '100K' },
  { label: '100万', value: 1000000, count: '1M' }
]

// 数据状态
const data = ref<DemoTableRow[]>([])
const rawData = ref<DemoTableRow[]>([])
const loading = ref(false)
const selectedRows = ref<any[]>([])
const selectedRowKeys = ref<any[]>([])
const columnOptions = [10, 20, 50, 100] as const
const columnCount = ref<number>(10)
const currentDataSize = ref<number>(10000)
const activeControlGroup = ref<'data' | 'style' | 'feature'>('data')

// 功能开关
const stripe = ref(true)
const selectable = ref(true)
const bordered = ref(true)
const showPagination = ref(true)
const sortMode = ref<'local' | 'remote'>('local')
const filterMode = ref<'local' | 'remote'>('local')
const remoteFilters = ref<Record<string, any[]>>({})
const remoteSorter = ref<{ field: string; order: 'asc' | 'desc' | null } | null>(null)

const paginationCurrent = ref(1)
const paginationPageSize = ref(20)

const rowSelectionConfig = computed(() => {
  if (!selectable.value) return undefined
  return {
    type: 'checkbox' as const,
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: any[], rows: any[]) => {
      selectedRowKeys.value = keys
      selectedRows.value = rows
    }
  }
})

const paginationConfig = computed(() => {
  if (!showPagination.value) return false
  return {
    current: paginationCurrent.value,
    pageSize: paginationPageSize.value,
    total: data.value.length,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: [10, 20, 50, 100],
    showTotal: (total: number, range: [number, number]) =>
      `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
    onChange: (page: number, pageSize: number) => {
      paginationCurrent.value = page
      paginationPageSize.value = pageSize
    },
    onShowSizeChange: (current: number, size: number) => {
      paginationCurrent.value = current
      paginationPageSize.value = size
    }
  }
})

const performanceColumnTemplates: Column[] = [
  { key: '__index__', title: '序号', dataIndex: '__index__', width: 72, align: 'center', fixed: 'left' },
  { key: 'id', title: 'ID', dataIndex: 'id', width: 80, align: 'center', sortable: true },
  {
    key: 'name',
    title: '姓名',
    dataIndex: 'name',
    width: 140,
    sortable: true,
    sorter: (a: any, b: any) => String(a?.name ?? '').localeCompare(String(b?.name ?? ''))
  },
  { key: 'age', title: '年龄', dataIndex: 'age', width: 100, align: 'center', sortable: true },
  { key: 'address', title: '地址', dataIndex: 'address', width: 240 },
  { key: 'email', title: '邮箱', dataIndex: 'email', width: 220 },
  {
    key: 'role',
    title: '角色',
    dataIndex: 'role',
    width: 120,
    align: 'center',
    sortable: true,
    filters: [
      { text: '管理员', value: '管理员' },
      { text: '普通用户', value: '普通用户' },
      { text: '访客', value: '访客' }
    ]
  },
  {
    key: 'status',
    title: '状态',
    dataIndex: 'status',
    width: 100,
    align: 'center',
    sortable: true,
    filters: [
      { text: '在职', value: '在职' },
      { text: '离职', value: '离职' },
      { text: '休假', value: '休假' }
    ]
  }
]

const buildColumns = (count: number): Column[] => {
  const cols: Column[] = []
  for (let i = 0; i < count; i += 1) {
    if (i < performanceColumnTemplates.length) {
      const tpl = performanceColumnTemplates[i]
      cols.push({
        ...tpl,
        key: `${tpl.key}__${i + 1}`
      })
      continue
    }

    const metricIndex = i - performanceColumnTemplates.length + 1
    cols.push({
      key: `metric_${metricIndex}`,
      title: `指标${metricIndex}`,
      dataIndex: 'id',
      width: 110,
      align: 'right',
      sortable: true,
      render: (record: any) => {
        const id = Number(record?.id ?? 0)
        const value = (id * (metricIndex * 13 + 7)) % 100000
        return value.toLocaleString()
      }
    })
  }
  return cols
}

const tableColumns = computed<Column[]>(() => {
  const cols: Column[] = buildColumns(columnCount.value)

  if (cols.length > 0) {
    cols[cols.length - 1] = {
      ...cols[cols.length - 1],
      fixed: 'right'
    }
  }

  if (selectable.value) {
    cols.unshift({ key: '__checkbox__', title: '', width: 52, align: 'center', fixed: 'left' })
  }

  return cols
})

// 主题配置
const currentTheme = ref<ThemePreset>('ant-design')

const themes: Array<{ value: ThemePreset; label: string; color: string }> = [
  { value: 'ant-design', label: 'Ant Design', color: '#1677ff' },
  { value: 'element-plus', label: 'Element Plus', color: '#409eff' },
  { value: 'naive', label: 'Naive UI', color: '#18a058' }
]

// 加载数据
const loadData = async (count: number) => {
  currentDataSize.value = count
  loading.value = true
  try {
    const result = await getTableData(count)
    rawData.value = result.map((item, index) => ({
      ...item,
      __index__: index + 1
    }))
    data.value = rawData.value
    paginationCurrent.value = 1
    selectedRows.value = []
    selectedRowKeys.value = []
    remoteFilters.value = {}
    remoteSorter.value = null
  } finally {
    loading.value = false
  }
}

// 切换主题
const switchTheme = (theme: ThemePreset) => {
  currentTheme.value = theme
}

const switchColumnCount = (count: number) => {
  columnCount.value = count
}

// 事件处理
const handleCellClick = (cell: any, row: any, column: any) => {
  console.log('Cell clicked:', cell, row, column)
}

const handleRowClick = (row: any, index: number) => {
  console.log('Row clicked:', row, index)
}

const handleSelectionChange = (rows: any[], keys: any[]) => {
  selectedRows.value = rows
  selectedRowKeys.value = keys
  console.log('Selection changed:', rows, keys)
}

const handleSortRequest = async (sorter: any) => {
  if (sortMode.value !== 'remote') return
  const field = String(sorter?.field ?? '')
  const order = sorter?.order as 'asc' | 'desc' | null
  remoteSorter.value = field ? { field, order } : null

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 180))
    data.value = applyRemoteQuery(rawData.value, remoteFilters.value, remoteSorter.value)
    paginationCurrent.value = 1
  } finally {
    loading.value = false
  }
}

const handleFilterRequest = async (filters: Record<string, any[]>) => {
  if (filterMode.value !== 'remote') return
  remoteFilters.value = filters

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 180))
    data.value = applyRemoteQuery(rawData.value, remoteFilters.value, remoteSorter.value)
    paginationCurrent.value = 1
  } finally {
    loading.value = false
  }
}

const applyRemoteQuery = (
  source: DemoTableRow[],
  filters: Record<string, any[]>,
  sorter: { field: string; order: 'asc' | 'desc' | null } | null
) => {
  let result = source.slice()

  const filterEntries = Object.entries(filters).filter(([, values]) => Array.isArray(values) && values.length > 0)
  if (filterEntries.length > 0) {
    result = result.filter(record =>
      filterEntries.every(([field, values]) => {
        const value = (record as any)?.[field]
        return values.includes(value) || values.map(v => String(v)).includes(String(value))
      })
    )
  }

  if (sorter?.field && sorter.order) {
    result.sort((a: any, b: any) => {
      const va = a?.[sorter.field]
      const vb = b?.[sorter.field]
      const compare =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va ?? '').localeCompare(String(vb ?? ''))
      return sorter.order === 'desc' ? -compare : compare
    })
  }

  return result
}

// 初始化加载数据
loadData(10000)
</script>

<style scoped>
/* ========== 页面基础 ========== */
.demo-page {
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
}

/* ========== 顶部标题栏 ========== */
.page-header {
  background: white;
  border-bottom: 1px solid #e8e8e8;
  padding: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  width: 100%;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 650;
  color: #1f1f2f;
  letter-spacing: -0.2px;
}

.page-subtitle {
  margin: 0;
  font-size: 13px;
  color: #858585;
}

.page-header-right {
  display: flex;
  gap: 12px;
}

.github-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #1f1f2f;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.github-link:hover {
  background: #1677ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
}

.github-icon {
  width: 20px;
  height: 20px;
}

/* ========== 主内容区 ========== */
.main-wrapper {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 16px;
  padding: 14px 16px 16px;
  width: 100%;
  min-height: calc(100vh - 96px);
}

/* ========== 上方控制面板区 ========== */
.control-section-wrapper {
  display: flex;
  width: 100%;
}

/* ========== 控制卡片 ========== */
.control-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* 标题栏：包含标题和统计 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #eceff3;
  background: #fbfcfe;
  min-height: 52px;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-card-header {
  padding: 14px 18px;
  min-height: 64px;
  background:
    linear-gradient(180deg, rgba(246, 249, 255, 0.95) 0%, rgba(251, 252, 254, 1) 100%);
}

.table-card-header {
  background: #f9fbff;
}

.control-header-left {
  gap: 12px;
}

.header-icon-wrap {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(22, 119, 255, 0.12);
  border: 1px solid rgba(22, 119, 255, 0.18);
}

.header-icon {
  width: 18px;
  height: 18px;
  color: #1677ff;
  flex-shrink: 0;
}

.control-header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}

.card-subtitle {
  margin: 0;
  color: #667085;
  font-size: 12px;
  line-height: 1.4;
}

/* 标题栏统计信息 */
.header-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #dbe5f3;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
}

.stat-pill-label {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
}

.stat-pill-value {
  font-size: 14px;
  font-weight: 800;
  color: #1677ff;
  letter-spacing: 0.2px;
}

.stat-pill-value-success {
  color: #059669;
}

/* ========== 控制网格 ========== */
.control-shell {
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 4px;
  border-radius: 10px;
  background: #f5f8fc;
  border: 1px solid #e6edf7;
}

.control-tab {
  border: 1px solid transparent;
  background: transparent;
  color: #4b5563;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-tab:hover {
  background: #ffffff;
  border-color: #d6e3f6;
}

.control-tab.active {
  background: #ffffff;
  border-color: #1677ff;
  color: #1677ff;
  box-shadow: 0 1px 6px rgba(22, 119, 255, 0.14);
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(320px, 1fr));
  gap: 10px;
}

.control-item {
  min-width: 0;
  border: 1px solid #edf1f7;
  background: #fcfdff;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-item-full {
  grid-column: 1 / -1;
}

.row-label {
  font-size: 12px;
  font-weight: 700;
  color: #4b5563;
  white-space: nowrap;
  letter-spacing: 0.2px;
}

/* ========== 按钮组 ========== */
.btn-group-inline {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.data-btn-inline,
.theme-btn-inline {
  padding: 6px 14px;
  background: #f5f7fa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #595959;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.data-btn-inline:hover,
.theme-btn-inline:hover {
  background: #e6f4ff;
  border-color: #1677ff;
  color: #1677ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(22, 119, 255, 0.15);
}

.theme-btn-inline.active {
  background: #1677ff;
  border-color: #1677ff;
  color: white;
}

.data-btn-inline.active {
  background: #e6f4ff;
  border-color: #1677ff;
  color: #1677ff;
  font-weight: 600;
}

/* ========== 开关组 ========== */
.toggle-group-inline {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.toggle-item-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: #595959;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s ease;
  border: 1px solid #e8edf5;
  background: #fff;
}

.toggle-item-inline:hover {
  background: rgba(22, 119, 255, 0.04);
}

.toggle-item-inline input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #1677ff;
}

.table-area {
  display: flex;
  flex-direction: column;
  min-height: 520px;
  min-width: 0;
}

@media (max-width: 1100px) {
  .control-grid {
    grid-template-columns: 1fr;
  }
}

.table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 520px;
}

.table-card .card-header {
  justify-content: space-between;
}

.card-header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #f0f9ff;
  color: #18a058;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-badge.loading {
  background: #fff7e6;
  color: #d97706;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.table-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
}

.table-container.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* 确保表格铺满容器 */
.table-container :deep(.ctable-wrapper) {
  width: 100%;
  height: 100%;
}

/* ========== 响应式 ========== */
@media (max-width: 1200px) {
  .header-content {
    padding: 16px 20px;
  }

  .main-wrapper {
    padding: 16px;
    min-height: calc(100vh - 88px);
  }

  .btn-group-inline,
  .toggle-group-inline {
    width: 100%;
    flex-wrap: wrap;
  }

  .table-area {
    min-height: 460px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .card-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .control-card-header {
    padding: 12px 14px;
  }

  .card-subtitle {
    display: none;
  }

  .header-stats {
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
  }

  .table-area {
    min-height: 400px;
  }
}
</style>
