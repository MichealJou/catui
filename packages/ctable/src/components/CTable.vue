<template>
  <div class="ctable-wrapper" :class="{ 'is-loading': props.loading }">
    <!-- Loading 遮罩 -->
    <div v-if="props.loading" class="ctable-loading">
      <div class="ctable-loading-spinner"></div>
      <div class="ctable-loading-tip">加载中...</div>
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
  type CSSProperties
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
import { getThemePreset } from '../core/ThemeManager'
import CPagination from './CPagination.vue'

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
  'cell-click': [event: any]
  'row-click': [event: any]
  'selection-change': [selectedRows: any[], selectedKeys: any[]]
  scroll: [event: any]
  'sort-change': [field: string, order: SortOrder]
  'filter-change': [filters: FilterCondition[]]
  expand: [expanded: boolean, record: any]
  change: [pagination: any, filters: any, sorter: any]
  'column-resize': [info: ColumnResizeInfo]
  'column-resize-end': [info: ColumnResizeInfo]
}>()

// 组件引用
const containerRef = ref<HTMLElement>()
const vtableRef = ref<HTMLElement>()

// VTable 适配器
let vtableAdapter: VTableAdapter | null = null

// 当前数据
const currentData = computed(() => {
  return props.data || props.dataSource || []
})

// 分页相关
const effectivePagination = computed(() => {
  if (props.pagination === false) return null
  return props.pagination
})

const currentPage = computed(() => {
  return effectivePagination.value?.current || 1
})

const pageSize = computed(() => {
  return effectivePagination.value?.pageSize || 10
})

const total = computed(() => {
  return currentData.value.length
})

/**
 * 初始化 VTable
 */
const initVTable = () => {
  if (!vtableRef.value) return

  vtableAdapter = createVTableAdapter({
    container: vtableRef.value,
    columns: props.columns || [],
    data: currentData.value,
    theme: props.theme,
    rowKey: props.rowKey,
    rowSelection: {
      selectedRows: props.rowSelection?.selectedRowKeys || [],
      onChange: (selectedRows: any[], selectedKeys: any[]) => {
        emit('selection-change', selectedRows, selectedKeys)
        if (props.rowSelection?.onChange) {
          props.rowSelection.onChange(selectedRows, selectedKeys)
        }
      }
    },
    resizable: props.resizable,
    onRowClick: (row, index, event) => {
      emit('row-click', { row, index, event })
    },
    onCellClick: (cell, row, column, event) => {
      emit('cell-click', { cell, row, column, event })
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
      emit('scroll', event)
    },
    onColumnResize: info => {
      emit('column-resize', info)
    },
    onColumnResizeEnd: info => {
      emit('column-resize-end', info)
    }
  })
}

/**
 * 分页改变
 */
const handlePageChange = (page: number) => {
  if (
    effectivePagination.value &&
    typeof effectivePagination.value === 'object'
  ) {
    effectivePagination.value.current = page
  }
  emit('change', { ...effectivePagination.value, current: page }, null, null)
}

/**
 * 每页数量改变
 */
const handlePageSizeChange = (current: number, size: number) => {
  if (
    effectivePagination.value &&
    typeof effectivePagination.value === 'object'
  ) {
    effectivePagination.value.current = current
    effectivePagination.value.pageSize = size
  }
  emit(
    'change',
    { ...effectivePagination.value, current, pageSize: size },
    null,
    null
  )
}

// 监听数据变化
watch(
  () => currentData.value,
  (newData, oldData) => {
    // 只在数组引用真正改变时才更新
    if (newData !== oldData) {
      vtableAdapter?.updateData(newData)
    }
  }
)

// 监听列配置变化
watch(
  () => props.columns,
  (newColumns, oldColumns) => {
    // 比较数组引用和长度
    if (newColumns !== oldColumns) {
      vtableAdapter?.updateColumns(newColumns || [])
    }
  }
)

// 监听主题变化
watch(
  () => props.theme,
  newTheme => {
    vtableAdapter?.updateTheme(newTheme)
  }
)

// 监听行选择变化
watch(
  () => props.rowSelection?.selectedRowKeys,
  newKeys => {
    if (newKeys) {
      vtableAdapter?.setSelectedRows(newKeys)
    }
  },
  { deep: true }
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
