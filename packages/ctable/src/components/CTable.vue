<template>
  <div class="ctable-wrapper" :class="{ 'is-loading': mergedLoading }">
    <!-- Loading 遮罩 -->
    <div v-if="mergedLoading" class="ctable-loading">
      <slot v-if="$slots.loading" name="loading" :loading="mergedLoading" :tip="props.loadingTip || '加载中...'"></slot>
      <component v-else :is="loadingOverlayComponent"></component>
    </div>

    <!-- 表格容器 -->
    <div ref="vtableRef" class="ctable-table"></div>

    <!-- 分页器容器 -->
    <div
      v-if="effectivePagination"
      class="ctable-pagination"
    >
      <CPagination
        :current="currentPage"
        :default-current="effectivePagination.current"
        :page-size="pageSize"
        :default-page-size="effectivePagination.pageSize"
        :total="total"
        :show-size-changer="effectivePagination.showSizeChanger"
        :show-quick-jumper="effectivePagination.showQuickJumper"
        :show-total="effectivePagination.showTotal"
        :page-size-options="effectivePagination.pageSizeOptions"
        :simple="effectivePagination.simple"
        :size="effectivePagination.size"
        :hide-on-single-page="effectivePagination.hideOnSinglePage"
        :show-less-items="effectivePagination.showLessItems"
        :prev-text="effectivePagination.prevText"
        :next-text="effectivePagination.nextText"
        @change="handlePageChange"
        @show-size-change="handlePageSizeChange"
      >
        <!-- 分页插槽支持 -->
        <template v-if="$slots['pagination-total']" #total="slotProps">
          <slot name="pagination-total" v-bind="slotProps"></slot>
        </template>
        <template v-if="$slots['pagination-prev']" #prev="slotProps">
          <slot name="pagination-prev" v-bind="slotProps"></slot>
        </template>
        <template v-if="$slots['pagination-next']" #next="slotProps">
          <slot name="pagination-next" v-bind="slotProps"></slot>
        </template>
      </CPagination>
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
  nextTick,
  useSlots,
  h
} from 'vue'
import type {
  CTableProps,
  SortOrder,
  FilterCondition,
  ColumnResizeInfo
} from '../types'
import {
  createVTableAdapter,
  type VTableAdapter
} from '../adapters/VTableAdapter'
import { createLoadingComponent } from '../adapters/AdapterFactory'
import CPagination from './CPagination.vue'
import CSpinner from './CSpinner.vue'

defineOptions({
  name: 'CTable'
})

const props = withDefaults(defineProps<CTableProps>(), {
  rowKey: 'id',
  theme: 'ant-design',
  virtualScroll: true,
  selectable: false,
  bordered: false,
  stripe: true,
  loading: false
})

const emit = defineEmits<{
  'cell-click': [cell: any, row: any, column: any, event: any]
  'row-click': [row: any, index: number, event: any]
  'selection-change': [selectedRows: any[], selectedKeys: any[]]
  scroll: [scrollTop: number, scrollLeft: number]
  'sort-change': [field: string, order: SortOrder]
  'filter-change': [filters: FilterCondition[]]
  expand: [expanded: boolean, record: any]
  change: [pagination: any, filters: any, sorter: any]
  'column-resize': [info: ColumnResizeInfo]
  'column-resize-end': [info: ColumnResizeInfo]
}>()
const slots = useSlots()

// 组件引用
const vtableRef = ref<HTMLElement>()

// VTable 适配器
let vtableAdapter: VTableAdapter | null = null
const internalBusy = ref(false)
const mergedLoading = computed(() => props.loading || internalBusy.value)
const loadingOverlayComponent = computed(() =>
  createLoadingComponent(
    {
      spinning: true,
      tip: props.loadingTip || '加载中...',
      size: 'default'
    },
    {
      indicator:
        slots['loading-indicator'] ||
        (() => h(CSpinner, { size: 30, strokeWidth: 3, color: '#1677ff' }))
    },
    props.adapter
  )
)

const runWithBusy = async (task: () => void) => {
  if (props.loading) {
    task()
    return
  }
  const startedAt = Date.now()
  const minVisibleMs = 150
  internalBusy.value = true
  await nextTick()
  try {
    task()
  } finally {
    const elapsed = Date.now() - startedAt
    const waitMs = Math.max(0, minVisibleMs - elapsed)
    setTimeout(async () => {
      await nextTick()
      internalBusy.value = false
    }, waitMs)
  }
}

const shallowEqualKeys = (a?: any[], b?: any[]) => {
  if (a === b) return true
  if (!a || !b) return false
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

// 当前数据
const currentData = computed(() => {
  return props.data || props.dataSource || []
})

// 分页相关
const effectivePagination = computed(() => {
  if (props.pagination === false) return null
  return props.pagination
})

const paginationConfig = computed(() => {
  if (!effectivePagination.value || typeof effectivePagination.value !== 'object') {
    return null
  }
  return effectivePagination.value
})

const currentPage = ref(paginationConfig.value?.current || paginationConfig.value?.defaultCurrent || 1)
const pageSize = ref(paginationConfig.value?.pageSize || paginationConfig.value?.defaultPageSize || 10)

const total = computed(() => {
  return paginationConfig.value?.total ?? currentData.value.length
})

const paginatedData = computed(() => {
  if (!paginationConfig.value) {
    return currentData.value
  }
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return currentData.value.slice(start, end)
})

/**
 * 初始化 VTable
 */
const initVTable = () => {
  if (!vtableRef.value) return

  vtableAdapter = createVTableAdapter({
    container: vtableRef.value,
    columns: props.columns || [],
    data: paginatedData.value,
    width: vtableRef.value.clientWidth,
    height: vtableRef.value.clientHeight,
    theme: props.theme,
    stripe: props.stripe,
    stripeColor: props.stripeColor,
    bordered: props.bordered,
    rowKey: props.rowKey,
    rowSelection: {
      selectedRowKeys: props.rowSelection?.selectedRowKeys || [],
      onChange: (selectedKeys: any[], selectedRows: any[]) => {
        emit('selection-change', selectedRows, selectedKeys)
        if (props.rowSelection?.onChange) {
          props.rowSelection.onChange(selectedKeys, selectedRows)
        }
      }
    },
    resizable: props.resizable,
    onRowClick: (row, index, event) => {
      emit('row-click', row, index, event)
    },
    onCellClick: (cell, row, column, event) => {
      emit('cell-click', cell, row, column, event)
    },
    onSortChange: sorter => {
      emit('sort-change', sorter.field, sorter.order)
      emit('change', effectivePagination.value, null, sorter)
    },
    onFilterChange: filters => {
      emit('filter-change', filters)
      emit('change', effectivePagination.value, filters, null)
    },
    onScroll: event => {
      const scrollTop = Number((event as any)?.scrollTop ?? 0)
      const scrollLeft = Number((event as any)?.scrollLeft ?? 0)
      emit('scroll', scrollTop, scrollLeft)
    },
    onColumnResize: info => {
      emit('column-resize', info)
    },
    onColumnResizeEnd: info => {
      emit('column-resize-end', info)
    }
  })

  // 调用 create() 方法创建表格
  vtableAdapter.create()
}

/**
 * 分页改变
 */
const handlePageChange = (page: number, size?: number) => {
  currentPage.value = page
  if (typeof size === 'number') {
    pageSize.value = size
  }

  const mergedPagination = {
    ...(paginationConfig.value || {}),
    current: currentPage.value,
    pageSize: pageSize.value,
    total: total.value
  }

  paginationConfig.value?.onChange?.(currentPage.value, pageSize.value)
  emit('change', mergedPagination, null, null)
}

/**
 * 每页数量改变
 */
const handlePageSizeChange = (current: number, size: number) => {
  currentPage.value = current
  pageSize.value = size

  const mergedPagination = {
    ...(paginationConfig.value || {}),
    current,
    pageSize: size,
    total: total.value
  }

  paginationConfig.value?.onShowSizeChange?.(current, size)
  paginationConfig.value?.onChange?.(current, size)
  emit('change', mergedPagination, null, null)
}

// 监听分页配置变化（受控模式）
watch(
  () => [paginationConfig.value?.current, paginationConfig.value?.pageSize] as const,
  ([nextCurrent, nextPageSize]) => {
    if (typeof nextCurrent === 'number') {
      currentPage.value = nextCurrent
    }
    if (typeof nextPageSize === 'number') {
      pageSize.value = nextPageSize
    }
  }
)

// 数据/分页变化后，更新表格内容
watch(
  () => paginatedData.value,
  (newData, oldData) => {
    if (newData !== oldData) {
      vtableAdapter?.updateData(newData)
    }
  }
)

// 数据变化后，修正当前页边界
watch(
  () => [currentData.value.length, pageSize.value] as const,
  ([dataLength, size]) => {
    if (!paginationConfig.value) return
    const totalPages = Math.max(1, Math.ceil(dataLength / size))
    if (currentPage.value > totalPages) {
      currentPage.value = totalPages
    }
  }
)

// 监听列配置变化
watch(
  () => props.columns,
  async (newColumns, oldColumns) => {
    // 比较数组引用和长度
    if (newColumns !== oldColumns) {
      await runWithBusy(() => {
        vtableAdapter?.updateColumns(newColumns || [])
      })
    }
  }
)

// 监听主题变化
watch(
  () => props.theme,
  async newTheme => {
    await runWithBusy(() => {
      vtableAdapter?.updateTheme(newTheme)
    })
  }
)

watch(
  () => [props.stripe, props.stripeColor] as const,
  async ([stripe, stripeColor]) => {
    await runWithBusy(() => {
      vtableAdapter?.updateStripe(stripe, stripeColor)
    })
  }
)

watch(
  () => props.bordered,
  async bordered => {
    await runWithBusy(() => {
      vtableAdapter?.updateBordered(bordered)
    })
  }
)

// 监听行选择变化
watch(
  () => props.rowSelection?.selectedRowKeys,
  (newKeys, oldKeys) => {
    if (newKeys && !shallowEqualKeys(newKeys, oldKeys)) {
      vtableAdapter?.setSelectedRows(newKeys)
    }
  }
)

// 生命周期
onMounted(() => {
  initVTable()
})

onBeforeUnmount(() => {
  vtableAdapter?.destroy()
  vtableAdapter = null
})

// 暴露的方法
defineExpose({
  /**
   * 获取选中的行
   */
  getSelectedRows: () => {
    return vtableAdapter?.getSelectedRows() || []
  },

  /**
   * 清除选择
   */
  clearSelection: () => {
    vtableAdapter?.setSelectedRows([])
  },

  /**
   * 清除筛选
   */
  clearFilters: () => {
    vtableAdapter?.clearFilters?.()
  },

  /**
   * 刷新表格
   */
  refresh: () => {
    vtableAdapter?.updateData(currentData.value)
  },

  /**
   * 获取列宽
   */
  getColumnWidth: (columnKey: string) => {
    return vtableAdapter?.getColumnWidth(columnKey) ?? 120
  },

  /**
   * 获取所有列宽
   */
  getColumnWidths: () => {
    return vtableAdapter?.getColumnWidths() ?? new Map()
  },

  /**
   * 设置列宽
   */
  setColumnWidth: (columnKey: string, width: number) => {
    vtableAdapter?.setColumnWidth(columnKey, width)
  }
})
</script>

<style scoped>
.ctable-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.ctable-table {
  flex: 1;
  overflow: hidden;
}

.ctable-pagination {
  flex-shrink: 0;
}

/* Loading 状态 */
.ctable-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.ctable-loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1677ff;
  border-radius: 50%;
  animation: ctable-spin 1s linear infinite;
}

@keyframes ctable-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.ctable-loading-tip {
  margin-top: 12px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

/* 分页样式 */
.ctable-pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background: #ffffff;
  flex-shrink: 0;
}

/* 加载状态时表格区域有透明背景 */
.is-loading .ctable-table {
  opacity: 0.3;
}
</style>
