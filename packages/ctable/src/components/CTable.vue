<template>
  <div
    ref="containerRef"
    class="ctable-container"
    :style="containerStyle"
  >
    <!-- 加载遮罩 -->
    <div v-if="props.loading" class="ctable-loading">
      <div class="ctable-loading-spinner"></div>
      <div class="ctable-loading-tip">{{ props.loadingTip || '加载中...' }}</div>
    </div>

    <!-- VTable 容器 -->
    <div
      ref="vtableRef"
      class="ctable-vtable"
      :style="vtableStyle"
    ></div>

    <!-- 分页器容器 -->
    <div
      v-if="effectivePagination"
      ref="paginationRef"
      class="ctable-pagination-wrapper"
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
  useSlots,
  type CSSProperties
} from 'vue'
import type {
  CTableProps,
  SortOrder,
  FilterCondition
} from '../types'
import { createVTableAdapter, type VTableAdapter } from '../adapters/VTableAdapter'
import { getThemePreset } from '../core/ThemeManager'
import CPagination from './CPagination.vue'

defineOptions({
  name: 'CTable'
})

const props = withDefaults(defineProps<CTableProps>(), {
  width: 1200,
  height: 600,
  rowKey: 'id',
  theme: 'ant-design',
  virtualScroll: true,
  selectable: false,
  selectableType: 'multiple',
  bordered: true,
  stripe: false,
  loading: false
})

const emit = defineEmits<{
  'cell-click': [event: any]
  'row-click': [event: any]
  'selection-change': [selectedRows: any[], selectedKeys: any[]]
  'scroll': [event: any]
  'sort-change': [field: string, order: SortOrder]
  'filter-change': [filters: FilterCondition[]]
  'expand': [expanded: boolean, record: any]
  'change': [pagination: any, filters: any, sorter: any]
}>()

// 组件引用
const containerRef = ref<HTMLElement>()
const vtableRef = ref<HTMLElement>()

// VTable 适配器
let vtableAdapter: VTableAdapter | null = null

// 计算属性
const containerStyle = computed<CSSProperties>(() => {
  const theme = typeof props.theme === 'string'
    ? getThemePreset(props.theme)
    : props.theme

  return {
    width: `${props.width}px`,
    height: `${props.height}px`,
    position: 'relative',
    border: props.bordered ? `1px solid ${theme?.colors?.border || '#f0f0f0'}` : 'none',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: theme?.colors?.background || '#ffffff'
  }
})

const vtableStyle = computed<CSSProperties>(() => {
  const paginationHeight = effectivePagination.value ? 50 : 0
  return {
    width: '100%',
    height: `${props.height - paginationHeight}px`
  }
})

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
 * 获取行唯一标识
 */
const getRowKey = (row: any): string => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }
  return String(row[props.rowKey || 'id'])
}

/**
 * 初始化 VTable
 */
const initVTable = () => {
  if (!vtableRef.value) return

  const paginationHeight = effectivePagination.value ? 50 : 0

  vtableAdapter = createVTableAdapter({
    container: vtableRef.value,
    columns: props.columns || [],
    data: currentData.value,
    width: props.width,
    height: props.height - paginationHeight,
    theme: props.theme,
    rowKey: props.rowKey,
    rowSelection: props.rowSelection,
    onRowClick: (row, index, event) => {
      emit('row-click', { row, index, event })
    },
    onCellClick: (cell, row, column, event) => {
      emit('cell-click', { cell, row, column, event })
    },
    onSortChange: (sorter) => {
      emit('sort-change', sorter.field, sorter.order)
      emit('change', effectivePagination.value, null, sorter)
    },
    onFilterChange: (filters) => {
      emit('filter-change', filters)
      emit('change', effectivePagination.value, filters, null)
    },
    onScroll: (event) => {
      emit('scroll', event)
    }
  })
}

/**
 * 分页改变
 */
const handlePageChange = (page: number) => {
  if (effectivePagination.value && typeof effectivePagination.value === 'object') {
    effectivePagination.value.current = page
  }
  emit('change', { ...effectivePagination.value, current: page }, null, null)
}

/**
 * 每页数量改变
 */
const handlePageSizeChange = (current: number, size: number) => {
  if (effectivePagination.value && typeof effectivePagination.value === 'object') {
    effectivePagination.value.current = current
    effectivePagination.value.pageSize = size
  }
  emit('change', { ...effectivePagination.value, current, pageSize: size }, null, null)
}

// 监听数据变化
watch(() => currentData.value, (newData) => {
  vtableAdapter?.updateData(newData)
}, { deep: true })

// 监听列配置变化
watch(() => props.columns, (newColumns) => {
  vtableAdapter?.updateColumns(newColumns || [])
}, { deep: true })

// 监听主题变化
watch(() => props.theme, (newTheme) => {
  vtableAdapter?.updateTheme(newTheme)
})

// 监听行选择变化
watch(() => props.rowSelection?.selectedRowKeys, (newKeys) => {
  if (newKeys) {
    vtableAdapter?.setSelectedRows(newKeys)
  }
}, { deep: true })

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
   * 滚动到指定位置
   */
  scrollTo: (options: { top?: number; left?: number }) => {
    // VTable 内置滚动支持
    console.log('scrollTo called with:', options)
  },

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
  }
})
</script>

<style scoped>
.ctable-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.65);
  user-select: none;
}

.ctable-vtable {
  width: 100%;
  overflow: hidden;
}

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

.ctable-pagination-wrapper {
  height: 50px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
