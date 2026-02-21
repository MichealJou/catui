<template>
  <div
    class="ctable-wrapper"
    :class="{ 'is-loading': mergedLoading, 'is-sorting': isSortTransitioning }"
    :style="wrapperStyle"
    role="region"
    tabindex="0"
    :aria-label="ariaLabel"
    @contextmenu.capture="handleNativeContextMenu"
    @mousedown.capture="handleWrapperMouseDown"
    @click.capture="handleWrapperClick"
    @keydown.capture="handleWrapperKeydown"
    @dblclick.capture="handleWrapperDblClick"
  >
    <div v-if="$slots.header" class="ctable-header">
      <slot name="header"></slot>
    </div>

    <!-- Loading 遮罩 -->
    <div v-if="mergedLoading" class="ctable-loading">
      <slot v-if="$slots.loading" name="loading" :loading="mergedLoading" :tip="resolvedLocale.loadingTip"></slot>
      <component v-else :is="loadingOverlayComponent"></component>
    </div>

    <!-- 表格容器 -->
    <div ref="vtableRef" class="ctable-table" role="grid"></div>
    <img
      v-if="sortGhost.visible && sortGhost.src"
      class="ctable-sort-ghost"
      :src="sortGhost.src"
      alt=""
      aria-hidden="true"
    />

    <div v-if="$slots.summary" class="ctable-summary">
      <slot name="summary" :data="processedData"></slot>
    </div>

    <div
      v-if="advancedFilterPanel.visible"
      class="ctable-advanced-filter"
      :style="{ left: `${advancedFilterPanel.x}px`, top: `${advancedFilterPanel.y}px` }"
    >
      <div class="ctable-advanced-filter-tabs">
        <button
          class="ctable-advanced-filter-tab"
          :class="{ active: advancedFilterPanel.tab === 'filter' }"
          @click="advancedFilterPanel.tab = 'filter'"
        >
          {{ resolvedLocale.filterTab }}
        </button>
        <button
          class="ctable-advanced-filter-tab"
          :class="{ active: advancedFilterPanel.tab === 'column' }"
          @click="advancedFilterPanel.tab = 'column'"
        >
          {{ resolvedLocale.columnTab }}
        </button>
      </div>
      <div v-if="advancedFilterPanel.tab === 'filter'" class="ctable-advanced-filter-body">
        <input
          v-model.trim="advancedFilterPanel.keyword"
          class="ctable-advanced-filter-input"
          :placeholder="resolvedLocale.filterPlaceholder"
          @keydown.enter.prevent="applyAdvancedFilter"
        />
        <div class="ctable-advanced-filter-actions">
          <button class="ctable-advanced-filter-btn primary" @click="applyAdvancedFilter">{{ resolvedLocale.filterSearch }}</button>
          <button class="ctable-advanced-filter-btn" @click="resetAdvancedFilter">{{ resolvedLocale.filterReset }}</button>
        </div>
      </div>
      <div v-else class="ctable-advanced-filter-body">
        <label
          v-for="col in columnToggleOptions"
          :key="col.key"
          class="ctable-advanced-filter-col-item"
        >
          <input
            type="checkbox"
            :checked="!col.hidden"
            @change="onColumnToggle(col.key, $event)"
          />
          <span>{{ col.title || col.key }}</span>
        </label>
      </div>
    </div>

    <div
      v-if="contextMenuState.visible"
      class="ctable-context-menu"
      role="menu"
      :style="{ left: `${contextMenuState.x}px`, top: `${contextMenuState.y}px` }"
    >
      <button
        v-for="item in contextMenuItems"
        :key="item.key"
        class="ctable-context-menu-item"
        :class="{ danger: !!item.danger, divided: !!item.divided }"
        role="menuitem"
        :disabled="typeof item.disabled === 'function' ? item.disabled({ row: contextMenuState.row, index: contextMenuState.index }) : !!item.disabled"
        @click="handleContextMenuAction(item)"
      >
        <span class="ctable-context-menu-main">
          <span v-if="item.icon" class="ctable-context-menu-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </span>
        <span v-if="item.shortcut" class="ctable-context-menu-shortcut">{{ item.shortcut }}</span>
      </button>
    </div>

    <div
      v-if="cellEditor.visible"
      class="ctable-inline-editor"
      :style="{ left: `${cellEditor.x}px`, top: `${cellEditor.y}px`, width: `${cellEditor.width}px`, height: `${cellEditor.height}px` }"
      @click.stop
    >
      <component
        v-if="cellEditor.customComponent"
        :is="cellEditor.customComponent"
        class="ctable-inline-editor-control"
        :value="cellEditor.inputValue"
        :model-value="cellEditor.inputValue"
        v-bind="cellEditor.editorProps"
        :record="cellEditor.row"
        :column="cellEditor.column"
        :field="cellEditor.field"
        @update:value="onEditorModelUpdate"
        @update:modelValue="onEditorModelUpdate"
        @change="onEditorModelUpdate"
      />
      <template v-else-if="cellEditor.editorType === 'select'">
        <component
          v-if="cellEditor.library === 'ant-design-vue' && antSelectComp"
          :is="antSelectComp"
          class="ctable-inline-editor-control"
          :value="cellEditor.inputValue"
          :options="cellEditor.options"
          v-bind="cellEditor.editorProps"
          style="width: 100%;"
          @update:value="onEditorChangeAndConfirm"
          @change="onEditorChangeAndConfirm"
        />
        <component
          v-else-if="cellEditor.library === 'naive-ui' && naiveSelectComp"
          :is="naiveSelectComp"
          class="ctable-inline-editor-control"
          :value="cellEditor.inputValue"
          :options="cellEditor.options"
          v-bind="cellEditor.editorProps"
          style="width: 100%;"
          @update:value="onEditorChangeAndConfirm"
          @update:modelValue="onEditorChangeAndConfirm"
        />
        <component
          v-else-if="cellEditor.library === 'element-plus' && elementSelectComp"
          :is="elementSelectComp"
          class="ctable-inline-editor-control"
          :model-value="cellEditor.inputValue"
          v-bind="cellEditor.editorProps"
          style="width: 100%;"
          @update:modelValue="onEditorChangeAndConfirm"
          @change="onEditorChangeAndConfirm"
        >
          <component
            :is="elementOptionComp || 'option'"
            v-for="opt in cellEditor.options"
            :key="String(opt?.value)"
            :label="opt?.label ?? opt?.value"
            :value="opt?.value"
          >
            {{ opt?.label ?? opt?.value }}
          </component>
        </component>
        <select
          v-else
          v-model="cellEditor.inputValue"
          class="ctable-inline-editor-input"
          v-bind="cellEditor.editorProps"
          @change="confirmCellEditor"
        >
          <option
            v-for="opt in cellEditor.options"
            :key="String(opt?.value)"
            :value="String(opt?.value ?? '')"
          >
            {{ opt?.label ?? opt?.value }}
          </option>
        </select>
      </template>
      <template v-else-if="cellEditor.editorType === 'radio'">
        <component
          v-if="cellEditor.library === 'ant-design-vue' && antRadioGroupComp"
          :is="antRadioGroupComp"
          class="ctable-inline-editor-control"
          :value="cellEditor.inputValue"
          :options="cellEditor.options"
          v-bind="cellEditor.editorProps"
          @change="(e: any) => onEditorChangeAndConfirm(e?.target?.value)"
        />
        <component
          v-else-if="cellEditor.library === 'naive-ui' && naiveRadioGroupComp"
          :is="naiveRadioGroupComp"
          class="ctable-inline-editor-control"
          :value="cellEditor.inputValue"
          v-bind="cellEditor.editorProps"
          @update:value="onEditorChangeAndConfirm"
        >
          <component
            :is="naiveRadioComp || 'label'"
            v-for="opt in cellEditor.options"
            :key="String(opt?.value)"
            :value="opt?.value"
          >
            {{ opt?.label ?? opt?.value }}
          </component>
        </component>
        <component
          v-else-if="cellEditor.library === 'element-plus' && elementRadioGroupComp"
          :is="elementRadioGroupComp"
          class="ctable-inline-editor-control"
          :model-value="cellEditor.inputValue"
          v-bind="cellEditor.editorProps"
          @update:modelValue="onEditorChangeAndConfirm"
        >
          <component
            :is="elementRadioComp || 'label'"
            v-for="opt in cellEditor.options"
            :key="String(opt?.value)"
            :label="opt?.value"
          >
            {{ opt?.label ?? opt?.value }}
          </component>
        </component>
        <select
          v-else
          v-model="cellEditor.inputValue"
          class="ctable-inline-editor-input"
          v-bind="cellEditor.editorProps"
          @change="confirmCellEditor"
        >
          <option
            v-for="opt in cellEditor.options"
            :key="String(opt?.value)"
            :value="opt?.value"
          >
            {{ opt?.label ?? opt?.value }}
          </option>
        </select>
      </template>
      <component
        v-else-if="cellEditor.editorType === 'checkbox' && cellEditor.library === 'ant-design-vue' && antCheckboxComp"
        :is="antCheckboxComp"
        class="ctable-inline-editor-control"
        :checked="!!cellEditor.inputValue"
        v-bind="cellEditor.editorProps"
        @change="(e: any) => onEditorChangeAndConfirm(!!e?.target?.checked)"
      />
      <component
        v-else-if="cellEditor.editorType === 'checkbox' && cellEditor.library === 'naive-ui' && naiveCheckboxComp"
        :is="naiveCheckboxComp"
        class="ctable-inline-editor-control"
        :checked="!!cellEditor.inputValue"
        v-bind="cellEditor.editorProps"
        @update:checked="onEditorChangeAndConfirm"
      />
      <component
        v-else-if="cellEditor.editorType === 'checkbox' && cellEditor.library === 'element-plus' && elementCheckboxComp"
        :is="elementCheckboxComp"
        class="ctable-inline-editor-control"
        :model-value="!!cellEditor.inputValue"
        v-bind="cellEditor.editorProps"
        @update:modelValue="onEditorChangeAndConfirm"
      />
      <component
        v-else-if="cellEditor.editorType === 'switch' && cellEditor.library === 'ant-design-vue' && antSwitchComp"
        :is="antSwitchComp"
        class="ctable-inline-editor-control"
        :checked="!!cellEditor.inputValue"
        v-bind="cellEditor.editorProps"
        @change="onEditorChangeAndConfirm"
      />
      <component
        v-else-if="cellEditor.editorType === 'switch' && cellEditor.library === 'naive-ui' && naiveSwitchComp"
        :is="naiveSwitchComp"
        class="ctable-inline-editor-control"
        :value="!!cellEditor.inputValue"
        v-bind="cellEditor.editorProps"
        @update:value="onEditorChangeAndConfirm"
      />
      <component
        v-else-if="cellEditor.editorType === 'switch' && cellEditor.library === 'element-plus' && elementSwitchComp"
        :is="elementSwitchComp"
        class="ctable-inline-editor-control"
        :model-value="!!cellEditor.inputValue"
        v-bind="cellEditor.editorProps"
        @update:modelValue="onEditorChangeAndConfirm"
      />
      <component
        v-else-if="cellEditor.editorType === 'number' && cellEditor.library === 'ant-design-vue' && antInputNumberComp"
        :is="antInputNumberComp"
        class="ctable-inline-editor-control"
        :value="cellEditor.inputValue"
        v-bind="cellEditor.editorProps"
        style="width: 100%;"
        @update:value="onEditorModelUpdate"
        @change="onEditorModelUpdate"
      />
      <component
        v-else-if="cellEditor.editorType === 'number' && cellEditor.library === 'naive-ui' && naiveInputNumberComp"
        :is="naiveInputNumberComp"
        class="ctable-inline-editor-control"
        :value="cellEditor.inputValue"
        v-bind="cellEditor.editorProps"
        style="width: 100%;"
        @update:value="onEditorModelUpdate"
      />
      <component
        v-else-if="cellEditor.editorType === 'number' && cellEditor.library === 'element-plus' && elementInputNumberComp"
        :is="elementInputNumberComp"
        class="ctable-inline-editor-control"
        :model-value="cellEditor.inputValue"
        v-bind="cellEditor.editorProps"
        style="width: 100%;"
        @update:modelValue="onEditorModelUpdate"
      />
      <component
        v-else-if="cellEditor.editorType === 'date' && cellEditor.library === 'ant-design-vue' && antDatePickerComp"
        :is="antDatePickerComp"
        class="ctable-inline-editor-control"
        :value="cellEditor.inputValue"
        :value-format="cellEditor.editorProps?.valueFormat || 'YYYY-MM-DD'"
        :format="cellEditor.editorProps?.format || 'YYYY-MM-DD'"
        v-bind="cellEditor.editorProps"
        style="width: 100%;"
        @update:value="onEditorModelUpdate"
        @change="onEditorModelUpdate"
      />
      <component
        v-else-if="cellEditor.editorType === 'time' && cellEditor.library === 'ant-design-vue' && antTimePickerComp"
        :is="antTimePickerComp"
        class="ctable-inline-editor-control"
        :value="cellEditor.inputValue"
        :value-format="cellEditor.editorProps?.valueFormat || 'HH:mm:ss'"
        :format="cellEditor.editorProps?.format || 'HH:mm:ss'"
        v-bind="cellEditor.editorProps"
        style="width: 100%;"
        @update:value="onEditorModelUpdate"
        @change="onEditorModelUpdate"
      />
      <component
        v-else-if="cellEditor.editorType === 'datetime' && cellEditor.library === 'ant-design-vue' && antDatePickerComp"
        :is="antDatePickerComp"
        class="ctable-inline-editor-control"
        :value="cellEditor.inputValue"
        :show-time="cellEditor.editorProps?.showTime ?? true"
        :value-format="cellEditor.editorProps?.valueFormat || 'YYYY-MM-DD HH:mm:ss'"
        :format="cellEditor.editorProps?.format || 'YYYY-MM-DD HH:mm:ss'"
        v-bind="cellEditor.editorProps"
        style="width: 100%;"
        @update:value="onEditorModelUpdate"
        @change="onEditorModelUpdate"
      />
      <component
        v-else-if="cellEditor.editorType === 'date' && cellEditor.library === 'element-plus' && elementDatePickerComp"
        :is="elementDatePickerComp"
        class="ctable-inline-editor-control"
        type="date"
        :model-value="cellEditor.inputValue"
        :value-format="cellEditor.editorProps?.valueFormat || 'YYYY-MM-DD'"
        :format="cellEditor.editorProps?.format || 'YYYY-MM-DD'"
        v-bind="cellEditor.editorProps"
        style="width: 100%;"
        @update:modelValue="onEditorModelUpdate"
        @change="onEditorModelUpdate"
      />
      <component
        v-else-if="cellEditor.editorType === 'time' && cellEditor.library === 'element-plus' && elementTimePickerComp"
        :is="elementTimePickerComp"
        class="ctable-inline-editor-control"
        :model-value="cellEditor.inputValue"
        :value-format="cellEditor.editorProps?.valueFormat || 'HH:mm:ss'"
        :format="cellEditor.editorProps?.format || 'HH:mm:ss'"
        v-bind="cellEditor.editorProps"
        style="width: 100%;"
        @update:modelValue="onEditorModelUpdate"
        @change="onEditorModelUpdate"
      />
      <component
        v-else-if="cellEditor.editorType === 'datetime' && cellEditor.library === 'element-plus' && elementDatePickerComp"
        :is="elementDatePickerComp"
        class="ctable-inline-editor-control"
        type="datetime"
        :model-value="cellEditor.inputValue"
        :value-format="cellEditor.editorProps?.valueFormat || 'YYYY-MM-DD HH:mm:ss'"
        :format="cellEditor.editorProps?.format || 'YYYY-MM-DD HH:mm:ss'"
        v-bind="cellEditor.editorProps"
        style="width: 100%;"
        @update:modelValue="onEditorModelUpdate"
        @change="onEditorModelUpdate"
      />
      <component
        v-else-if="cellEditor.editorType === 'date' && cellEditor.library === 'naive-ui' && naiveDatePickerComp"
        :is="naiveDatePickerComp"
        class="ctable-inline-editor-control"
        type="date"
        :value="cellEditor.inputValue"
        :value-format="cellEditor.editorProps?.valueFormat || 'yyyy-MM-dd'"
        :format="cellEditor.editorProps?.format || 'yyyy-MM-dd'"
        v-bind="cellEditor.editorProps"
        style="width: 100%;"
        @update:value="onEditorModelUpdate"
      />
      <component
        v-else-if="cellEditor.editorType === 'time' && cellEditor.library === 'naive-ui' && naiveTimePickerComp"
        :is="naiveTimePickerComp"
        class="ctable-inline-editor-control"
        :value="cellEditor.inputValue"
        :value-format="cellEditor.editorProps?.valueFormat || 'HH:mm:ss'"
        :format="cellEditor.editorProps?.format || 'HH:mm:ss'"
        v-bind="cellEditor.editorProps"
        style="width: 100%;"
        @update:value="onEditorModelUpdate"
      />
      <component
        v-else-if="cellEditor.editorType === 'datetime' && cellEditor.library === 'naive-ui' && naiveDatePickerComp"
        :is="naiveDatePickerComp"
        class="ctable-inline-editor-control"
        type="datetime"
        :value="cellEditor.inputValue"
        :value-format="cellEditor.editorProps?.valueFormat || 'yyyy-MM-dd HH:mm:ss'"
        :format="cellEditor.editorProps?.format || 'yyyy-MM-dd HH:mm:ss'"
        v-bind="cellEditor.editorProps"
        style="width: 100%;"
        @update:value="onEditorModelUpdate"
      />
      <component
        v-else-if="cellEditor.editorType === 'textarea' && cellEditor.library === 'ant-design-vue' && antTextAreaComp"
        :is="antTextAreaComp"
        class="ctable-inline-editor-control"
        :value="cellEditor.inputValue"
        v-bind="cellEditor.editorProps"
        :auto-size="cellEditor.editorProps?.autoSize ?? { minRows: 1, maxRows: 6 }"
        @update:value="onEditorModelUpdate"
        @change="onEditorModelUpdate"
      />
      <component
        v-else-if="cellEditor.editorType === 'password' && cellEditor.library === 'ant-design-vue' && antPasswordComp"
        :is="antPasswordComp"
        class="ctable-inline-editor-control"
        :value="cellEditor.inputValue"
        v-bind="cellEditor.editorProps"
        @update:value="onEditorModelUpdate"
        @change="onEditorModelUpdate"
      />
      <component
        v-else-if="cellEditor.library === 'ant-design-vue' && antInputComp"
        :is="antInputComp"
        class="ctable-inline-editor-control"
        :value="cellEditor.inputValue"
        :type="cellEditor.editorType === 'password' ? 'password' : 'text'"
        v-bind="cellEditor.editorProps"
        @update:value="onEditorModelUpdate"
        @change="onEditorModelUpdate"
      />
      <component
        v-else-if="cellEditor.library === 'naive-ui' && naiveInputComp"
        :is="naiveInputComp"
        class="ctable-inline-editor-control"
        :value="cellEditor.inputValue"
        :type="cellEditor.editorType === 'textarea' ? 'textarea' : (cellEditor.editorType === 'password' ? 'password' : 'text')"
        v-bind="cellEditor.editorProps"
        @update:value="onEditorModelUpdate"
      />
      <component
        v-else-if="cellEditor.library === 'element-plus' && elementInputComp"
        :is="elementInputComp"
        class="ctable-inline-editor-control"
        :model-value="cellEditor.inputValue"
        :type="cellEditor.editorType === 'textarea' ? 'textarea' : (cellEditor.editorType === 'password' ? 'password' : 'text')"
        v-bind="cellEditor.editorProps"
        @update:modelValue="onEditorModelUpdate"
      />
      <input
        v-else-if="cellEditor.editorType === 'checkbox' || cellEditor.editorType === 'switch'"
        v-model="cellEditor.inputValue"
        class="ctable-inline-editor-input"
        type="checkbox"
        v-bind="cellEditor.editorProps"
        @change="confirmCellEditor"
      />
      <textarea
        v-else-if="cellEditor.editorType === 'textarea'"
        v-model="cellEditor.inputValue"
        class="ctable-inline-editor-input"
        v-bind="cellEditor.editorProps"
      />
      <input
        v-else
        v-model="cellEditor.inputValue"
        class="ctable-inline-editor-input"
        :type="resolveNativeInputType(cellEditor.editorType)"
        v-bind="cellEditor.editorProps"
      />
      <div v-if="cellEditor.error" class="ctable-inline-editor-error">{{ cellEditor.error }}</div>
    </div>

    <!-- 分页器容器 -->
    <div
      v-if="effectivePagination"
      class="ctable-pagination"
      :class="`ctable-pagination-${paginationThemePreset}`"
    >
      <component :is="paginationComponent" />
    </div>

    <div v-if="$slots.footer" class="ctable-footer">
      <slot name="footer"></slot>
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
  h,
  shallowRef
} from 'vue'
import type {
  CTableProps,
  Column,
  ContextMenuItem,
  SorterConfig,
  SortOrder,
  FilterCondition,
  ColumnResizeInfo,
  QueryRequestPayload,
  CellEditContext,
  RowEditContext,
  EditorType
} from '../types'
import {
  createVTableAdapter,
  type VTableAdapter
} from '../adapters/VTableAdapter'
import { createLoadingComponent, createPaginationComponent } from '../adapters/AdapterFactory'
import { useContextMenu } from '../composables/useContextMenu'
import { useAdvancedFilterPanel } from '../composables/useAdvancedFilterPanel'
import { useTablePipeline } from '../composables/useTablePipeline'
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
  loading: false,
  locale: 'zh-CN',
  editable: false,
  editMode: 'cell',
  editTrigger: 'manual',
  keyboardNavigation: true,
  clipboard: true,
  sortTransition: true,
  sortTransitionDuration: 220,
  sortMode: 'local',
  filterMode: 'local',
  paginationMode: 'local',
  headerAlign: 'center',
  defaultAlign: 'center'
})

const emit = defineEmits<{
  'cell-click': [cell: any, row: any, column: any, event: any]
  'row-click': [row: any, index: number, event: any]
  'row-contextmenu': [row: any, index: number, event: any]
  'selection-change': [selectedRows: any[], selectedKeys: any[]]
  scroll: [scrollTop: number, scrollLeft: number]
  'sort-change': [field: string, order: SortOrder]
  'filter-change': [filters: FilterCondition[]]
  'column-visibility-change': [columnKey: string, visible: boolean]
  expand: [expanded: boolean, record: any]
  change: [pagination: any, filters: any, sorter: any]
  'column-resize': [info: ColumnResizeInfo]
  'column-resize-end': [info: ColumnResizeInfo]
  'column-drag-start': [payload: any]
  'column-drag-end': [payload: any]
  'columns-change': [columns: Column[]]
  'context-menu-click': [item: ContextMenuItem, row: any, index: number]
  'data-change': [rows: any[], reason?: string]
  'cell-edit-start': [payload: CellEditContext]
  'cell-edit-end': [payload: CellEditContext & { nextValue: any }]
  'cell-validate-error': [payload: CellEditContext & { message: string }]
  'row-edit-start': [payload: RowEditContext]
  'row-edit-save': [payload: RowEditContext]
  'row-edit-cancel': [payload: RowEditContext]
}>()
const slots = useSlots()
const LOCALE_PACKS = {
  'zh-CN': {
    loadingTip: '加载中...',
    filterTab: '过滤',
    columnTab: '列',
    filterPlaceholder: '请输入关键字',
    filterSearch: '搜索',
    filterReset: '重置',
    contextCopyJson: '复制行数据'
  },
  'en-US': {
    loadingTip: 'Loading...',
    filterTab: 'Filter',
    columnTab: 'Columns',
    filterPlaceholder: 'Enter keyword',
    filterSearch: 'Search',
    filterReset: 'Reset',
    contextCopyJson: 'Copy row as JSON'
  }
} as const

// 组件引用
const vtableRef = ref<HTMLElement>()

// VTable 适配器
let vtableAdapter: VTableAdapter | null = null
const ariaLabel = computed(() => 'CTable')
const internalBusy = ref(false)
const mergedLoading = computed(() => props.loading || internalBusy.value)
const isSortTransitioning = ref(false)
let sortTransitionTimer: ReturnType<typeof setTimeout> | null = null
const sortGhost = ref<{ visible: boolean; src: string }>({
  visible: false,
  src: ''
})
const sortTransitionDuration = computed(() => {
  const raw = Number(props.sortTransitionDuration ?? 220)
  if (!Number.isFinite(raw)) return 220
  return Math.max(80, Math.min(1200, Math.round(raw)))
})
const wrapperStyle = computed(() => ({
  '--ctable-sort-transition-duration': `${sortTransitionDuration.value}ms`
}))
const inferAdapterLibrary = (): 'ant-design-vue' | 'element-plus' | 'naive-ui' | 'default' => {
  if (props.adapter?.library) return props.adapter.library
  const theme = props.theme as any
  const preset = typeof theme === 'string' ? theme : theme?.preset
  if (typeof preset === 'string') {
    if (preset.includes('element-plus')) return 'element-plus'
    if (preset.includes('naive')) return 'naive-ui'
    return 'ant-design-vue'
  }
  return 'ant-design-vue'
}
const loadingPrimaryColor = computed(() => {
  const library = inferAdapterLibrary()
  if (library === 'element-plus') return '#409eff'
  if (library === 'naive-ui') return '#18a058'
  return '#1677ff'
})
const loadingOverlayComponent = computed(() =>
  createLoadingComponent(
    {
      spinning: true,
      tip: props.loadingTip || resolvedLocale.value.loadingTip,
      size: 'default'
    },
    {
      indicator:
        slots['loading-indicator'] ||
        (() => h(CSpinner, { size: 30, strokeWidth: 3, color: loadingPrimaryColor.value }))
    },
    {
      ...props.adapter,
      library: inferAdapterLibrary()
    }
  )
)
const resolvedLocale = computed(() => {
  const base = LOCALE_PACKS[props.locale || 'zh-CN'] || LOCALE_PACKS['zh-CN']
  return {
    ...base,
    ...props.i18n
  }
})

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

const captureTableSnapshot = (): string => {
  const host = vtableRef.value
  if (!host) return ''
  const canvases = Array.from(host.querySelectorAll('canvas')) as HTMLCanvasElement[]
  if (canvases.length === 0) return ''
  const target = canvases.find(c => c.width > 0 && c.height > 0) || canvases[0]
  if (!target || target.width <= 0 || target.height <= 0) return ''
  try {
    return target.toDataURL('image/png')
  } catch {
    return ''
  }
}

const runSortTransition = () => {
  if (!props.sortTransition) return
  const snapshot = captureTableSnapshot()
  if (snapshot) {
    sortGhost.value = {
      visible: true,
      src: snapshot
    }
  } else {
    sortGhost.value = {
      visible: false,
      src: ''
    }
  }
  if (sortTransitionTimer) {
    clearTimeout(sortTransitionTimer)
    sortTransitionTimer = null
  }
  isSortTransitioning.value = true
  sortTransitionTimer = setTimeout(() => {
    isSortTransitioning.value = false
    sortGhost.value = {
      visible: false,
      src: ''
    }
    sortTransitionTimer = null
  }, sortTransitionDuration.value + 30)
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
const importedDataOverride = ref<any[] | null>(null)
const currentData = computed(() => {
  if (importedDataOverride.value) return importedDataOverride.value
  return props.data || props.dataSource || []
})
const treeChildrenField = computed(() => props.childrenColumnName || 'children')
const expandChildrenField = '__ctable_expand_children__'
const isTreeMode = computed(() => {
  const rows = currentData.value || []
  if (!Array.isArray(rows) || rows.length === 0) return false
  const field = treeChildrenField.value
  return rows.some(row => Array.isArray((row as any)?.[field]) && (row as any)[field].length > 0)
})
const isExpandMode = computed(() => typeof props.expandedRowRender === 'function' && !isTreeMode.value)
const getRowKeyValue = (row: any) => {
  if (typeof props.rowKey === 'function') return props.rowKey(row)
  const keyField = typeof props.rowKey === 'string' ? props.rowKey : 'id'
  return row?.[keyField]
}
const flattenLeafColumns = (columns: Column[] = []): Column[] => {
  const result: Column[] = []
  columns.forEach(col => {
    if (col.hidden || col.key === '__checkbox__') return
    if (Array.isArray(col.children) && col.children.length > 0) {
      result.push(...flattenLeafColumns(col.children))
      return
    }
    result.push(col)
  })
  return result
}

const internalSorter = ref<SorterConfig | null>(null)
const internalFilters = ref<Record<string, any[]>>({})
const internalSelectedKeys = ref<any[]>(props.rowSelection?.selectedRowKeys || [])
const internalExpandedKeys = ref<any[]>(props.expandedRowKeys || [])
const keywordFilterTokenPrefix = '__kw__:'
const keywordFilters = ref<Record<string, string>>({})
const activeCell = ref<{
  rowKey: any
  field: string
  row: any
  index: number
} | null>(null)
const selectionRange = ref<{
  startRowKey: any
  startField: string
  endRowKey: any
  endField: string
} | null>(null)
const lastPointer = ref<{ x: number; y: number } | null>(null)
const cellEditorOpenedAt = ref(0)
const cellEditor = ref<{
  visible: boolean
  x: number
  y: number
  width: number
  height: number
  rowKey: any
  index: number
  row: any
  field: string
  column: Column | null
  customComponent: any
  library: 'ant-design-vue' | 'element-plus' | 'naive-ui' | 'default'
  editorType: EditorType
  editorProps: Record<string, any>
  options: Array<{ label: string; value: any }>
  inputValue: any
  error: string
}>({
  visible: false,
  x: 0,
  y: 0,
  width: 120,
  height: 36,
  rowKey: '',
  index: -1,
  row: null,
  field: '',
  column: null,
  customComponent: null,
  library: 'default',
  editorType: 'input',
  editorProps: {},
  options: [],
  inputValue: '',
  error: ''
})
const rowEditor = ref<{
  active: boolean
  rowKey: any
  index: number
  originalRow: any
  draftRow: any
  editableFields: string[]
}>({
  active: false,
  rowKey: '',
  index: -1,
  originalRow: null,
  draftRow: null,
  editableFields: []
})
const {
  advancedFilterPanel,
  openAdvancedFilterPanel,
  closeAdvancedFilterPanel
} = useAdvancedFilterPanel()
const {
  contextMenuState,
  openContextMenu,
  closeContextMenu,
  shouldKeepByGuard
} = useContextMenu()

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

const paginationThemePreset = computed<'ant-design' | 'element-plus' | 'naive'>(() => {
  const theme = props.theme as any
  const preset = typeof theme === 'string' ? theme : theme?.preset
  if (typeof preset !== 'string') return 'ant-design'
  if (preset.includes('element-plus')) return 'element-plus'
  if (preset.includes('naive')) return 'naive'
  return 'ant-design'
})
const adapterLibrary = computed<'ant-design-vue' | 'element-plus' | 'naive-ui' | 'default'>(() => {
  return inferAdapterLibrary()
})
const antInputComp = shallowRef<any>(null)
const antPasswordComp = shallowRef<any>(null)
const antTextAreaComp = shallowRef<any>(null)
const antInputNumberComp = shallowRef<any>(null)
const antSelectComp = shallowRef<any>(null)
const antCheckboxComp = shallowRef<any>(null)
const antSwitchComp = shallowRef<any>(null)
const antRadioGroupComp = shallowRef<any>(null)
const antRadioComp = shallowRef<any>(null)
const antDatePickerComp = shallowRef<any>(null)
const antTimePickerComp = shallowRef<any>(null)
const elementInputComp = shallowRef<any>(null)
const elementInputNumberComp = shallowRef<any>(null)
const elementSelectComp = shallowRef<any>(null)
const elementOptionComp = shallowRef<any>(null)
const elementCheckboxComp = shallowRef<any>(null)
const elementSwitchComp = shallowRef<any>(null)
const elementRadioGroupComp = shallowRef<any>(null)
const elementRadioComp = shallowRef<any>(null)
const elementDatePickerComp = shallowRef<any>(null)
const elementTimePickerComp = shallowRef<any>(null)
const naiveInputComp = shallowRef<any>(null)
const naiveInputNumberComp = shallowRef<any>(null)
const naiveSelectComp = shallowRef<any>(null)
const naiveCheckboxComp = shallowRef<any>(null)
const naiveSwitchComp = shallowRef<any>(null)
const naiveRadioGroupComp = shallowRef<any>(null)
const naiveRadioComp = shallowRef<any>(null)
const naiveDatePickerComp = shallowRef<any>(null)
const naiveTimePickerComp = shallowRef<any>(null)

const loadInlineEditorComponents = async (library: 'ant-design-vue' | 'element-plus' | 'naive-ui' | 'default') => {
  if (library === 'ant-design-vue' && !antInputComp.value) {
    try {
      const mod = await import('ant-design-vue')
      antInputComp.value = mod?.Input || null
      antPasswordComp.value = mod?.Input?.Password || null
      antTextAreaComp.value = mod?.Input?.TextArea || null
      antInputNumberComp.value = mod?.InputNumber || null
      antSelectComp.value = mod?.Select || null
      antCheckboxComp.value = mod?.Checkbox || null
      antSwitchComp.value = mod?.Switch || null
      antRadioGroupComp.value = mod?.Radio?.Group || null
      antRadioComp.value = mod?.Radio || null
      antDatePickerComp.value = mod?.DatePicker || null
      antTimePickerComp.value = mod?.TimePicker || mod?.DatePicker || null
    } catch {}
  }
  if (library === 'element-plus' && !elementInputComp.value) {
    try {
      const mod = await import('element-plus')
      elementInputComp.value = mod?.ElInput || null
      elementInputNumberComp.value = mod?.ElInputNumber || null
      elementSelectComp.value = mod?.ElSelect || null
      elementOptionComp.value = mod?.ElOption || null
      elementCheckboxComp.value = mod?.ElCheckbox || null
      elementSwitchComp.value = mod?.ElSwitch || null
      elementRadioGroupComp.value = mod?.ElRadioGroup || null
      elementRadioComp.value = mod?.ElRadio || null
      elementDatePickerComp.value = mod?.ElDatePicker || null
      elementTimePickerComp.value = mod?.ElTimePicker || mod?.ElDatePicker || null
    } catch {}
  }
  if (library === 'naive-ui' && !naiveInputComp.value) {
    try {
      const mod = await import('naive-ui')
      naiveInputComp.value = mod?.NInput || null
      naiveInputNumberComp.value = mod?.NInputNumber || null
      naiveSelectComp.value = mod?.NSelect || null
      naiveCheckboxComp.value = mod?.NCheckbox || null
      naiveSwitchComp.value = mod?.NSwitch || null
      naiveRadioGroupComp.value = mod?.NRadioGroup || null
      naiveRadioComp.value = mod?.NRadio || null
      naiveDatePickerComp.value = mod?.NDatePicker || null
      naiveTimePickerComp.value = mod?.NTimePicker || null
    } catch {}
  }
}

const currentPage = ref(paginationConfig.value?.current || paginationConfig.value?.defaultCurrent || 1)
const pageSize = ref(paginationConfig.value?.pageSize || paginationConfig.value?.defaultPageSize || 10)
const {
  getColumnField,
  getRecordValue,
  normalizeSortOrder,
  effectiveSortMode,
  effectiveFilterMode,
  effectivePaginationMode,
  buildActiveSorters,
  processedData,
  total,
  paginatedData
} = useTablePipeline({
  props,
  currentData,
  isTreeMode,
  treeChildrenField,
  internalSorter,
  internalFilters,
  keywordFilterTokenPrefix,
  paginationConfig,
  currentPage,
  pageSize
})

const emitRemoteQuery = (sorterOverride?: SorterConfig | null) => {
  if (!props.onQueryRequest) return
  const activeSorters = buildActiveSorters()
  const primarySorter =
    sorterOverride
    ?? (activeSorters.length > 0 ? activeSorters[0] : (internalSorter.value || null))
  const payload: QueryRequestPayload = {
    pagination: {
      current: currentPage.value,
      pageSize: pageSize.value,
      total: total.value
    },
    filters: internalFilters.value,
    sorter: primarySorter,
    sorters: activeSorters
  }
  const run = async () => {
    const proxy = props.requestProxy
    try {
      const nextPayload = proxy?.beforeRequest
        ? await proxy.beforeRequest(payload)
        : payload
      const result = await props.onQueryRequest?.(nextPayload)
      await proxy?.afterRequest?.(nextPayload, result)
    } catch (error) {
      proxy?.onError?.(error, payload)
    }
  }
  void run()
}

const commitDataChange = (nextRows: any[], reason: string) => {
  importedDataOverride.value = nextRows
  props.onDataChange?.(nextRows, reason)
  emit('data-change', nextRows, reason)
}

const getColumnByField = (field: string): Column | null => {
  const leaves = flattenLeafColumns(props.columns || [])
  return leaves.find(col => getColumnField(col) === field) || null
}

const isColumnEditable = (column: Column | null, row: any, index: number) => {
  if (!column) return false
  if (props.editable) return column.editable !== false
  return !!column.editable
}

const validateCellValue = (
  column: Column | null,
  value: any,
  row: any,
  index: number
) => {
  if (!column?.validator) return { ok: true as const, message: '' }
  const result = column.validator(value, row, index)
  if (result === true) return { ok: true as const, message: '' }
  return { ok: false as const, message: typeof result === 'string' ? result : '校验失败' }
}

const buildRowEditContext = () => {
  if (!rowEditor.value.active) return null
  const draftRow = rowEditor.value.draftRow || {}
  const originalRow = rowEditor.value.originalRow || {}
  const changedFields = rowEditor.value.editableFields.filter(
    field => draftRow?.[field] !== originalRow?.[field]
  )
  return {
    row: draftRow,
    index: rowEditor.value.index,
    rowKey: rowEditor.value.rowKey,
    draftRow,
    originalRow,
    changedFields
  }
}

const setCellValueByRowKey = (rowKey: any, field: string, value: any, reason = 'edit') => {
  const rows = currentData.value || []
  const idx = rows.findIndex(row => String(getRowKeyValue(row)) === String(rowKey))
  if (idx < 0) return false
  const next = rows.slice()
  next[idx] = {
    ...next[idx],
    [field]: value
  }
  commitDataChange(next, reason)
  return true
}

const setRowValueByRowKey = (rowKey: any, nextRow: any, reason = 'row-edit') => {
  const rows = currentData.value || []
  const idx = rows.findIndex(row => String(getRowKeyValue(row)) === String(rowKey))
  if (idx < 0) return false
  const next = rows.slice()
  next[idx] = nextRow
  commitDataChange(next, reason)
  return true
}

const updateRangeSelection = (nextCell: { rowKey: any; field: string }, useShift: boolean) => {
  if (!activeCell.value) {
    selectionRange.value = null
    return
  }
  if (!useShift) {
    selectionRange.value = null
    return
  }
  selectionRange.value = {
    startRowKey: selectionRange.value?.startRowKey ?? activeCell.value.rowKey,
    startField: selectionRange.value?.startField ?? activeCell.value.field,
    endRowKey: nextCell.rowKey,
    endField: nextCell.field
  }
}

const focusCellByPosition = (nextRowIndex: number, nextColIndex: number, useShift = false) => {
  const rows = paginatedData.value || []
  const cols = flattenLeafColumns(props.columns || [])
  if (rows.length === 0 || cols.length === 0) return
  const rowIndex = Math.max(0, Math.min(rows.length - 1, nextRowIndex))
  const colIndex = Math.max(0, Math.min(cols.length - 1, nextColIndex))
  const row = rows[rowIndex]
  const field = getColumnField(cols[colIndex])
  const nextCell = {
    rowKey: getRowKeyValue(row),
    field,
    row,
    index: rowIndex
  }
  updateRangeSelection(nextCell, useShift)
  activeCell.value = nextCell
}

const findActiveCellPosition = () => {
  if (!activeCell.value) return null
  const rows = paginatedData.value || []
  const cols = flattenLeafColumns(props.columns || [])
  const rowIndex = rows.findIndex(row => String(getRowKeyValue(row)) === String(activeCell.value?.rowKey))
  const colIndex = cols.findIndex(col => getColumnField(col) === activeCell.value?.field)
  if (rowIndex < 0 || colIndex < 0) return null
  return { rowIndex, colIndex, rows, cols }
}

const getActiveCellContext = () => {
  const position = findActiveCellPosition()
  if (!position || !activeCell.value) return null
  const { rowIndex, colIndex, rows, cols } = position
  return {
    rowIndex,
    colIndex,
    row: rows[rowIndex],
    column: cols[colIndex],
    field: activeCell.value.field
  }
}

const closeAllEditors = () => {
  cellEditor.value.visible = false
  cellEditor.value.error = ''
  cellEditor.value.editorProps = {}
}

const resolveInlineRect = (field: string, rowIndex: number, fallback?: { clientX?: number; clientY?: number }) => {
  const tableRect = vtableRef.value?.getBoundingClientRect()
  const byPoint =
    typeof fallback?.clientX === 'number' && typeof fallback?.clientY === 'number'
      ? vtableAdapter?.getCellContextByClientPoint?.(fallback.clientX, fallback.clientY)
      : null
  const byField = vtableAdapter?.getCellContextByFieldIndex?.(field, rowIndex)
  const raw = byPoint?.rect || byField?.rect
  if (raw && raw.width > 0 && raw.height > 0) {
    return {
      x: Number((tableRect?.left ?? 0) + raw.left),
      y: Number((tableRect?.top ?? 0) + raw.top),
      width: Math.max(80, Number(raw.width)),
      height: Math.max(30, Number(raw.height))
    }
  }
  if (tableRect) {
    const px = typeof fallback?.clientX === 'number' ? fallback.clientX : (lastPointer.value?.x ?? tableRect.left + 8)
    const py = typeof fallback?.clientY === 'number' ? fallback.clientY : (lastPointer.value?.y ?? tableRect.top + 8)
    return {
      x: Math.max(0, px),
      y: Math.max(0, py),
      width: 180,
      height: 36
    }
  }
  return { x: 8, y: 8, width: 180, height: 36 }
}

const getColumnEditorType = (column: Column | null): EditorType => {
  const raw = column?.editor as any
  const byString = typeof raw === 'string' ? raw : (raw && typeof raw === 'object' ? raw.type : undefined)
  if (
    byString === 'password'
    || byString === 'textarea'
    || byString === 'number'
    || byString === 'select'
    || byString === 'radio'
    || byString === 'checkbox'
    || byString === 'switch'
    || byString === 'date'
    || byString === 'time'
    || byString === 'datetime'
  ) {
    return byString
  }
  return 'input'
}

const resolveNativeInputType = (editorType: EditorType) => {
  if (editorType === 'number') return 'number'
  if (editorType === 'password') return 'password'
  if (editorType === 'date') return 'date'
  if (editorType === 'time') return 'time'
  if (editorType === 'datetime') return 'datetime-local'
  return 'text'
}

const resolveCustomEditor = (column: Column | null) => {
  const raw = column?.editor as any
  if (!raw) return null
  if (typeof raw === 'string') return null
  if (typeof raw === 'function') {
    return { component: raw, props: {} as Record<string, any> }
  }
  if (typeof raw === 'object' && raw.component) {
    return { component: raw.component, props: raw.props || {} }
  }
  return { component: raw, props: {} as Record<string, any> }
}

const getEditorInitialValue = (
  column: Column | null,
  value: any,
  row: any,
  index: number,
  field: string
) => {
  const formatValue = column?.editorOptions?.formatValue
  if (typeof formatValue === 'function') {
    return formatValue(value, { row, index, column: column as Column, field, value })
  }
  return value
}

const normalizeOptionItems = (column: Column | null, items: any[]): Array<{ label: string; value: any }> => {
  const fieldNames = column?.editorOptions?.fieldNames || {}
  const labelKey = fieldNames.label || 'label'
  const valueKey = fieldNames.value || 'value'
  return (items || []).map((item: any) => {
    if (item && typeof item === 'object') {
      const label = item[labelKey] ?? item.label ?? item[valueKey] ?? item.value
      const value = item[valueKey] ?? item.value ?? item[labelKey] ?? item.label
      return { ...item, label: String(label ?? ''), value }
    }
    return {
      label: String(item ?? ''),
      value: item
    }
  })
}

const loadEditorOptions = async (column: Column | null, ctx: CellEditContext) => {
  const direct = column?.editorOptions?.options
  if (Array.isArray(direct) && direct.length > 0) {
    return normalizeOptionItems(column, direct)
  }
  const source = column?.editorOptions?.dataSource
  if (Array.isArray(source)) {
    return normalizeOptionItems(column, source)
  }
  if (typeof source === 'function') {
    try {
      const result = await Promise.resolve(source(ctx))
      return normalizeOptionItems(column, Array.isArray(result) ? result : [])
    } catch {
      return []
    }
  }
  return []
}

const toEditorValue = (
  column: Column | null,
  inputValue: any,
  currentValue: any,
  row: any,
  index: number,
  field: string
) => {
  const parse = column?.editorOptions?.parse
  if (typeof parse === 'function') {
    return parse(inputValue, { row, index, column: column as Column, field, value: currentValue })
  }
  const editorType = getColumnEditorType(column)
  if (editorType === 'number') {
    const parsed = Number(inputValue)
    return Number.isFinite(parsed) ? parsed : currentValue
  }
  return inputValue
}

const onEditorModelUpdate = (value: any, extra?: any) => {
  if (typeof extra !== 'undefined') {
    cellEditor.value.inputValue = extra
    return
  }
  if (value && typeof value === 'object' && 'target' in value) {
    cellEditor.value.inputValue = (value as any).target?.value ?? ''
    return
  }
  cellEditor.value.inputValue = value
}

const onEditorChangeAndConfirm = (value: any) => {
  onEditorModelUpdate(value)
  confirmCellEditor()
}

const focusInlineEditor = () => {
  nextTick(() => {
    const host = vtableRef.value?.closest('.ctable-wrapper') as HTMLElement | null
    if (!host) return
    const el = host.querySelector(
      '.ctable-inline-editor input, .ctable-inline-editor textarea, .ctable-inline-editor .ant-input, .ctable-inline-editor .el-input__inner, .ctable-inline-editor .n-input__input-el'
    ) as HTMLInputElement | HTMLTextAreaElement | null
    if (!el) return
    el.focus()
    if (typeof (el as HTMLInputElement).select === 'function') {
      ;(el as HTMLInputElement).select()
    }
  })
}

const openCellEditor = async (
  target: { rowKey: any; field: string; index: number; row: any },
  anchor?: { clientX?: number; clientY?: number }
) => {
  const column = getColumnByField(target.field)
  if (!isColumnEditable(column, target.row, target.index)) return

  const isRowModeEditingCurrentRow =
    props.editMode === 'row'
    && rowEditor.value.active
    && String(rowEditor.value.rowKey) === String(target.rowKey)
  const currentValue = isRowModeEditingCurrentRow
    ? rowEditor.value.draftRow?.[target.field]
    : target.row?.[target.field]
  const editCtx: CellEditContext = {
    row: target.row,
    index: target.index,
    column: column as Column,
    field: target.field,
    value: currentValue
  }
  emit('cell-edit-start', editCtx)
  closeAllEditors()
  const box = resolveInlineRect(target.field, target.index, anchor)
  const editorType = getColumnEditorType(column)
  const customEditor = resolveCustomEditor(column)
  const customComponent = customEditor?.component || (props.adapter as any)?.customAdapters?.editor || null
  const ctx: CellEditContext = {
    row: target.row,
    index: target.index,
    column: column as Column,
    field: target.field,
    value: currentValue
  }
  const editorPropsRaw = customEditor?.props
  const editorProps =
    typeof editorPropsRaw === 'function'
      ? editorPropsRaw(ctx) || {}
      : { ...(column?.editorOptions?.props || {}), ...(editorPropsRaw || {}) }
  const needOptions = editorType === 'select' || editorType === 'radio'
  cellEditor.value = {
    visible: true,
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    rowKey: target.rowKey,
    index: target.index,
    row: target.row,
    field: target.field,
    column,
    customComponent,
    library: adapterLibrary.value,
    editorType,
    editorProps,
    options: needOptions ? [] : normalizeOptionItems(column, column?.editorOptions?.options || []),
    inputValue: getEditorInitialValue(column, currentValue, target.row, target.index, target.field),
    error: ''
  }
  if (needOptions) {
    if (cellEditor.value.editorProps && typeof cellEditor.value.editorProps === 'object') {
      cellEditor.value.editorProps = {
        ...cellEditor.value.editorProps,
        loading: true
      }
    }
    const options = await loadEditorOptions(column, ctx)
    if (
      !cellEditor.value.visible
      || String(cellEditor.value.rowKey) !== String(target.rowKey)
      || cellEditor.value.field !== target.field
    ) {
      return
    }
    cellEditor.value.options = options
    if (cellEditor.value.editorProps && typeof cellEditor.value.editorProps === 'object') {
      cellEditor.value.editorProps = {
        ...cellEditor.value.editorProps,
        loading: false
      }
    }
  }
  cellEditorOpenedAt.value = Date.now()
  focusInlineEditor()
}

const confirmCellEditor = () => {
  if (!cellEditor.value.visible) return
  const column = cellEditor.value.column
  const nextValue = toEditorValue(
    column,
    cellEditor.value.inputValue,
    cellEditor.value.row?.[cellEditor.value.field],
    cellEditor.value.row,
    cellEditor.value.index,
    cellEditor.value.field
  )
  const valid = validateCellValue(column, nextValue, cellEditor.value.row, cellEditor.value.index)
  if (!valid.ok) {
    cellEditor.value.error = valid.message
    emit('cell-validate-error', {
      row: cellEditor.value.row,
      index: cellEditor.value.index,
      column: column as Column,
      field: cellEditor.value.field,
      value: cellEditor.value.row?.[cellEditor.value.field],
      message: valid.message
    })
    return
  }
  if (
    props.editMode === 'row'
    && rowEditor.value.active
    && String(rowEditor.value.rowKey) === String(cellEditor.value.rowKey)
  ) {
    rowEditor.value.draftRow = {
      ...(rowEditor.value.draftRow || {}),
      [cellEditor.value.field]: nextValue
    }
  } else {
    const updated = setCellValueByRowKey(cellEditor.value.rowKey, cellEditor.value.field, nextValue, 'cell-edit')
    if (!updated) return
  }
  emit('cell-edit-end', {
    row: cellEditor.value.row,
    index: cellEditor.value.index,
    column: column as Column,
    field: cellEditor.value.field,
    value: cellEditor.value.row?.[cellEditor.value.field],
    nextValue
  })
  closeAllEditors()
}

const cancelCellEditor = () => {
  closeAllEditors()
}

const openRowEditor = (
  target: { rowKey: any; index: number; row: any; field?: string },
  anchor?: { clientX?: number; clientY?: number }
) => {
  const leaves = flattenLeafColumns(props.columns || [])
  const editableCols = leaves
    .filter(col => !String(getColumnField(col)).startsWith('__'))
    .filter(col => isColumnEditable(col, target.row, target.index))
  if (editableCols.length === 0) return
  const preferred = target.field
    ? editableCols.find(col => getColumnField(col) === target.field)
    : null
  const chosen = preferred || editableCols[0]
  if (rowEditor.value.active && String(rowEditor.value.rowKey) !== String(target.rowKey)) {
    const switched = saveEditRow()
    if (!switched) return
  }
  const isSameRow = rowEditor.value.active && String(rowEditor.value.rowKey) === String(target.rowKey)
  if (!isSameRow) {
    rowEditor.value = {
      active: true,
      rowKey: target.rowKey,
      index: target.index,
      originalRow: { ...(target.row || {}) },
      draftRow: { ...(target.row || {}) },
      editableFields: editableCols.map(col => getColumnField(col))
    }
    const startCtx = buildRowEditContext()
    if (startCtx) emit('row-edit-start', startCtx)
  } else {
    rowEditor.value.index = target.index
    rowEditor.value.editableFields = editableCols.map(col => getColumnField(col))
  }
  openCellEditor(
    {
      rowKey: target.rowKey,
      field: getColumnField(chosen),
      index: target.index,
      row: target.row
    },
    anchor
  )
}

const saveEditRow = () => {
  if (!rowEditor.value.active) return false
  confirmCellEditor()
  if (cellEditor.value.visible) return false
  const draft = rowEditor.value.draftRow || {}
  const original = rowEditor.value.originalRow || {}
  const row = draft
  for (const field of rowEditor.value.editableFields) {
    const column = getColumnByField(field)
    const valid = validateCellValue(column, draft?.[field], row, rowEditor.value.index)
    if (!valid.ok) {
      emit('cell-validate-error', {
        row,
        index: rowEditor.value.index,
        column: column as Column,
        field,
        value: original?.[field],
        message: valid.message
      })
      return false
    }
  }
  const updated = setRowValueByRowKey(
    rowEditor.value.rowKey,
    {
      ...(rowEditor.value.originalRow || {}),
      ...(draft || {})
    },
    'row-edit'
  )
  if (!updated) return false
  const ctx = buildRowEditContext()
  if (ctx) emit('row-edit-save', ctx)
  rowEditor.value = {
    active: false,
    rowKey: '',
    index: -1,
    originalRow: null,
    draftRow: null,
    editableFields: []
  }
  closeAllEditors()
  return true
}

const cancelEditRow = () => {
  if (!rowEditor.value.active) return false
  const ctx = buildRowEditContext()
  if (ctx) emit('row-edit-cancel', ctx)
  rowEditor.value = {
    active: false,
    rowKey: '',
    index: -1,
    originalRow: null,
    draftRow: null,
    editableFields: []
  }
  closeAllEditors()
  return true
}

const startEditCell = async (ctx?: { rowKey: any; field: string; index: number; row: any }) => {
  let target = ctx || activeCell.value
  if (!target) {
    const rows = paginatedData.value || []
    const cols = flattenLeafColumns(props.columns || [])
    if (rows.length === 0 || cols.length === 0) return
    const row = rows[0]
    const field = getColumnField(cols[0])
    target = {
      rowKey: getRowKeyValue(row),
      field,
      row,
      index: 0
    }
    activeCell.value = target
  }
  if (!target) return
  openCellEditor(target)
}

const setActiveCellByPayload = (payload: {
  row: any
  index: number
  field: string
}, useShift = false) => {
  if (!payload?.row || payload.index < 0 || !payload.field) return
  const nextCell = {
    rowKey: getRowKeyValue(payload.row),
    field: payload.field,
    row: payload.row,
    index: payload.index
  }
  updateRangeSelection(nextCell, useShift)
  activeCell.value = nextCell
  vtableAdapter?.selectCellByFieldIndex?.(payload.field, payload.index, useShift, false, true)
}

const isEditTriggerEnabled = (trigger: 'click' | 'dblclick' | 'enter') => {
  return props.editable && props.editTrigger === trigger
}

const openEditorByMode = (
  target: { rowKey: any; field: string; index: number; row: any },
  anchor?: { clientX?: number; clientY?: number }
) => {
  if (!props.editable) return
  if (props.editMode === 'row') {
    openRowEditor(
      {
        rowKey: target.rowKey,
        index: target.index,
        row: target.row,
        field: target.field
      },
      anchor
    )
    return
  }
  openCellEditor(target, anchor)
}

const getRangeCellsAsTsv = () => {
  const rows = paginatedData.value || []
  const cols = flattenLeafColumns(props.columns || [])
  if (rows.length === 0 || cols.length === 0) return ''

  const current = activeCell.value
  if (!current) return ''

  const startRowKey = selectionRange.value?.startRowKey ?? current.rowKey
  const endRowKey = selectionRange.value?.endRowKey ?? current.rowKey
  const startField = selectionRange.value?.startField ?? current.field
  const endField = selectionRange.value?.endField ?? current.field

  const rowStart = rows.findIndex(row => String(getRowKeyValue(row)) === String(startRowKey))
  const rowEnd = rows.findIndex(row => String(getRowKeyValue(row)) === String(endRowKey))
  const colStart = cols.findIndex(col => getColumnField(col) === startField)
  const colEnd = cols.findIndex(col => getColumnField(col) === endField)
  if (rowStart < 0 || rowEnd < 0 || colStart < 0 || colEnd < 0) return ''

  const minRow = Math.min(rowStart, rowEnd)
  const maxRow = Math.max(rowStart, rowEnd)
  const minCol = Math.min(colStart, colEnd)
  const maxCol = Math.max(colStart, colEnd)
  const lines: string[] = []
  for (let r = minRow; r <= maxRow; r += 1) {
    const values: string[] = []
    for (let c = minCol; c <= maxCol; c += 1) {
      const field = getColumnField(cols[c])
      values.push(String(rows[r]?.[field] ?? ''))
    }
    lines.push(values.join('\t'))
  }
  return lines.join('\n')
}

const pasteTsvToActiveCell = (text: string) => {
  const ctx = getActiveCellContext()
  if (!ctx || !text) return
  const rows = currentData.value || []
  const leaves = flattenLeafColumns(props.columns || [])
  const startRowIndex = rows.findIndex(row => String(getRowKeyValue(row)) === String(getRowKeyValue(ctx.row)))
  if (startRowIndex < 0) return

  const startColIndex = leaves.findIndex(col => getColumnField(col) === ctx.field)
  if (startColIndex < 0) return

  const grid = text
    .split(/\r?\n/)
    .filter(line => line.length > 0)
    .map(line => line.split('\t'))
  if (grid.length === 0) return

  const next = rows.slice()
  grid.forEach((cells, rowOffset) => {
    const rowIndex = startRowIndex + rowOffset
    if (rowIndex >= next.length) return
    const row = { ...next[rowIndex] }
    cells.forEach((value, colOffset) => {
      const colIndex = startColIndex + colOffset
      if (colIndex >= leaves.length) return
      const col = leaves[colIndex]
      if (!isColumnEditable(col, row, rowIndex)) return
      row[getColumnField(col)] = value
    })
    next[rowIndex] = row
  })
  commitDataChange(next, 'clipboard-paste')
}

const startEditRow = async (rowIndex?: number) => {
  const rows = paginatedData.value || []
  if (rows.length === 0) return
  const targetIndex =
    typeof rowIndex === 'number'
      ? rowIndex
      : (activeCell.value ? rows.findIndex(row => String(getRowKeyValue(row)) === String(activeCell.value?.rowKey)) : 0)
  if (targetIndex < 0 || targetIndex >= rows.length) return
  const row = rows[targetIndex]
  openRowEditor({
    rowKey: getRowKeyValue(row),
    index: targetIndex,
    row
  })
}

const paginationComponent = computed(() => {
  if (!effectivePagination.value) return null
  return createPaginationComponent(
    {
      current: currentPage.value,
      defaultCurrent: effectivePagination.value.current,
      pageSize: pageSize.value,
      defaultPageSize: effectivePagination.value.pageSize,
      total: total.value,
      showSizeChanger: effectivePagination.value.showSizeChanger,
      showQuickJumper: effectivePagination.value.showQuickJumper,
      showTotal: effectivePagination.value.showTotal,
      pageSizeOptions: effectivePagination.value.pageSizeOptions,
      simple: effectivePagination.value.simple,
      size: effectivePagination.value.size,
      hideOnSinglePage: effectivePagination.value.hideOnSinglePage,
      showLessItems: effectivePagination.value.showLessItems,
      prevText: effectivePagination.value.prevText,
      nextText: effectivePagination.value.nextText
    },
    {
      change: handlePageChange,
      showSizeChange: handlePageSizeChange
    },
    {
      total: slots['pagination-total'] as any,
      prev: slots['pagination-prev'] as any,
      next: slots['pagination-next'] as any
    },
    {
      ...props.adapter,
      library: adapterLibrary.value
    }
  )
})

const visibleExpandedKeys = computed(() => props.expandedRowKeys ?? internalExpandedKeys.value)

const tableRenderData = computed(() => {
  const base = paginatedData.value
  if (!isExpandMode.value) return base
  const keys = new Set((visibleExpandedKeys.value || []).map(k => String(k)))
  return base.map(record => {
    const key = String(getRowKeyValue(record))
    if (!keys.has(key)) {
      return {
        ...record,
        [expandChildrenField]: []
      }
    }
    const content = props.expandedRowRender?.(record)
    const text = typeof content === 'string' ? content : String(content ?? '')
    return {
      ...record,
      [expandChildrenField]: [
        {
          __ctable_expand_row__: true,
          __ctable_parent_key__: key,
          __ctable_expand_content__: text
        }
      ]
    }
  })
})

const resolvedMergeCells = computed(() => {
  const explicit = (props.mergeCells || []).map(item => ({ ...item }))
  const rows = tableRenderData.value || []
  const leaves = flattenLeafColumns(props.columns || [])
  if (rows.length === 0 || leaves.length === 0) return explicit

  const occupied = new Set<string>()
  explicit.forEach(item => {
    const rowSpan = Math.max(1, Number(item.rowSpan || 1))
    const colSpan = Math.max(1, Number(item.colSpan || 1))
    for (let r = item.rowIndex; r < item.rowIndex + rowSpan; r += 1) {
      for (let c = item.colIndex; c < item.colIndex + colSpan; c += 1) {
        occupied.add(`${r}:${c}`)
      }
    }
  })

  for (let r = 0; r < rows.length; r += 1) {
    const row = rows[r]
    for (let c = 0; c < leaves.length; c += 1) {
      if (occupied.has(`${r}:${c}`)) continue
      const col = leaves[c]
      if (!col.mergeCell) continue
      const ctx: CellEditContext = {
        row,
        index: r,
        column: col,
        field: getColumnField(col),
        value: row?.[getColumnField(col)]
      }
      const rowSpanRaw = typeof col.rowSpan === 'function' ? col.rowSpan(ctx) : col.rowSpan
      const colSpanRaw = typeof col.colSpan === 'function' ? col.colSpan(ctx) : col.colSpan
      const rowSpan = Math.max(1, Number(rowSpanRaw || 1))
      const colSpan = Math.max(1, Number(colSpanRaw || 1))
      if (rowSpan <= 1 && colSpan <= 1) continue
      explicit.push({
        rowIndex: r,
        colIndex: c,
        rowSpan,
        colSpan
      })
      for (let rr = r; rr < r + rowSpan; rr += 1) {
        for (let cc = c; cc < c + colSpan; cc += 1) {
          occupied.add(`${rr}:${cc}`)
        }
      }
    }
  }

  return explicit
})

const escapeCsvCell = (value: unknown): string => {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

const exportCsv = (fileName = `ctable-${Date.now()}.csv`) => {
  const columns = (props.columns || []).filter(col => col.key !== '__checkbox__' && !col.hidden)
  const headers = columns.map(col => escapeCsvCell(col.title ?? col.key)).join(',')
  const rows = processedData.value.map(record =>
    columns.map(col => escapeCsvCell(getRecordValue(record, col))).join(',')
  )
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const exportExcel = async (
  fileName = `ctable-${Date.now()}.xlsx`,
  sheetName = 'Sheet1'
) => {
  const columns = (props.columns || []).filter(col => col.key !== '__checkbox__' && !col.hidden)
  const headerRow = columns.map(col => String(col.title ?? col.key))
  const dataRows = processedData.value.map(record =>
    columns.map(col => getRecordValue(record, col))
  )
  const { utils, writeFileXLSX } = await import('xlsx')
  const worksheet = utils.aoa_to_sheet([headerRow, ...dataRows])
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, sheetName)
  writeFileXLSX(workbook, fileName)
}

const parseCsvLine = (line: string) => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]
    if (char === '"' && inQuotes && next === '"') {
      current += '"'
      i += 1
      continue
    }
    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
      continue
    }
    current += char
  }
  result.push(current)
  return result
}

const applyImportedRows = (
  rows: any[],
  meta: { source: 'csv' | 'xlsx'; mode: 'replace' | 'append' }
) => {
  props.onImportData?.(rows, meta)
  const next = meta.mode === 'append' ? [...(currentData.value || []), ...rows] : rows
  if (!props.onImportData) {
    importedDataOverride.value = next
  }
}

const importCsvText = (
  text: string,
  options?: {
    hasHeader?: boolean
    mode?: 'replace' | 'append'
  }
) => {
  const rows = String(text || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(parseCsvLine)
  if (rows.length === 0) return []
  const hasHeader = options?.hasHeader !== false
  const header = hasHeader ? rows[0] : rows[0].map((_, idx) => `col_${idx + 1}`)
  const body = hasHeader ? rows.slice(1) : rows
  const parsed = body.map(cells => {
    const row: Record<string, any> = {}
    header.forEach((key, idx) => {
      row[String(key || `col_${idx + 1}`)] = cells[idx] ?? ''
    })
    return row
  })
  applyImportedRows(parsed, { source: 'csv', mode: options?.mode || 'replace' })
  return parsed
}

const importFile = async (
  file: File,
  options?: {
    mode?: 'replace' | 'append'
    sheetName?: string
  }
) => {
  const mode = options?.mode || 'replace'
  const fileName = String(file?.name || '').toLowerCase()
  if (fileName.endsWith('.csv') || file.type.includes('csv')) {
    const text = await file.text()
    return importCsvText(text, { mode })
  }
  const { read, utils } = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = read(buffer, { type: 'array' })
  const targetSheet = options?.sheetName || workbook.SheetNames[0]
  const worksheet = workbook.Sheets[targetSheet]
  if (!worksheet) return []
  const parsed = utils.sheet_to_json(worksheet, { defval: '' }) as any[]
  applyImportedRows(parsed, { source: 'xlsx', mode })
  return parsed
}

const printTable = (title = 'CTable Print') => {
  if (typeof window === 'undefined') return
  const columns = (props.columns || []).filter(col => col.key !== '__checkbox__' && !col.hidden)
  const headerHtml = columns
    .map(col => `<th style="border:1px solid #d9d9d9;padding:8px;text-align:${col.headerAlign || props.headerAlign || 'center'};">${String(col.title ?? col.key)}</th>`)
    .join('')
  const bodyHtml = processedData.value
    .map(record => {
      const cells = columns
        .map(col => {
          const value = getRecordValue(record, col)
          const text = String(value ?? '')
          const align = col.align || props.defaultAlign || 'center'
          return `<td style="border:1px solid #d9d9d9;padding:8px;text-align:${align};">${text}</td>`
        })
        .join('')
      return `<tr>${cells}</tr>`
    })
    .join('')

  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>${title}</title></head><body><h3>${title}</h3><table style="border-collapse:collapse;width:100%;"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></body></html>`
  const printWin = window.open('', '_blank')
  if (!printWin) return
  printWin.document.open()
  printWin.document.write(html)
  printWin.document.close()
  printWin.focus()
  printWin.print()
}

const effectiveRowSelection = computed(() => {
  const explicit = props.rowSelection
  if (explicit) {
    return {
      ...explicit,
      selectedRowKeys: explicit.selectedRowKeys ?? internalSelectedKeys.value
    }
  }
  if (!props.selectable) {
    return undefined
  }
  return {
    type: props.selectableType === 'single' ? 'radio' : 'checkbox',
    selectedRowKeys: internalSelectedKeys.value
  }
})

const columnToggleOptions = computed(() =>
  (props.columns || []).filter(col => col.key !== '__checkbox__')
)
const contextMenuItems = computed<ContextMenuItem[]>(() => {
  const cfg = props.contextMenu
  if (!cfg) return []
  if (typeof cfg === 'object' && Array.isArray(cfg.items) && cfg.items.length > 0) {
    return cfg.items
  }
  return [{ key: 'copy-json', label: resolvedLocale.value.contextCopyJson }]
})
const contextMenuEnabled = computed(() => !!props.contextMenu && contextMenuItems.value.length > 0)

const getWrapperRect = () => {
  const wrapperEl = vtableRef.value?.closest('.ctable-wrapper') as HTMLElement | null
  if (!wrapperEl) return null
  return {
    wrapperEl,
    rect: wrapperEl.getBoundingClientRect()
  }
}

const handleContextMenuAction = async (item: ContextMenuItem) => {
  const row = contextMenuState.value.row
  const index = contextMenuState.value.index
  const disabled = typeof item.disabled === 'function'
    ? item.disabled({ row, index })
    : !!item.disabled
  if (disabled) return
  emit('context-menu-click', item, row, index)
  if (item.key === 'copy-json') {
    try {
      await navigator.clipboard?.writeText?.(JSON.stringify(row, null, 2))
    } catch {
      // ignore
    }
  }
  if (typeof props.contextMenu === 'object') {
    props.contextMenu.onClick?.(item, { row, index })
  }
  closeContextMenu()
}

const getPersistenceConfig = () => {
  const raw = props.columnStatePersistence
  if (!raw) return null
  if (raw === true) {
    const path = typeof window !== 'undefined' ? window.location.pathname || 'default' : 'default'
    return {
      key: `ctable:columns:${path}`,
      autoLoad: true,
      autoSave: true
    }
  }
  if (typeof raw === 'string') {
    return {
      key: raw,
      autoLoad: true,
      autoSave: true
    }
  }
  const path = typeof window !== 'undefined' ? window.location.pathname || 'default' : 'default'
  return {
    key: raw.key || `ctable:columns:${path}`,
    autoLoad: raw.autoLoad !== false,
    autoSave: raw.autoSave !== false
  }
}

const saveColumnState = (columns?: Column[]) => {
  if (typeof window === 'undefined') return
  const config = getPersistenceConfig()
  if (!config?.autoSave) return
  try {
    const stateColumns = columns || vtableAdapter?.getColumns?.() || props.columns || []
    window.localStorage.setItem(
      config.key,
      JSON.stringify({
        version: 1,
        updatedAt: Date.now(),
        columns: stateColumns
      })
    )
  } catch {
    // 忽略本地存储失败
  }
}

const loadColumnState = () => {
  if (typeof window === 'undefined') return false
  const config = getPersistenceConfig()
  if (!config?.autoLoad) return false
  try {
    const raw = window.localStorage.getItem(config.key)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { columns?: Column[] }
    if (!Array.isArray(parsed?.columns) || parsed.columns.length === 0) return false
    vtableAdapter?.setColumns?.(parsed.columns)
    emit('columns-change', parsed.columns)
    props.onColumnsChange?.(parsed.columns)
    return true
  } catch {
    return false
  }
}

const clearColumnState = () => {
  if (typeof window === 'undefined') return
  const config = getPersistenceConfig()
  if (!config?.key) return
  try {
    window.localStorage.removeItem(config.key)
  } catch {
    // 忽略本地存储失败
  }
}

/**
 * 初始化 VTable
 */
const initVTable = () => {
  if (!vtableRef.value) return

  vtableAdapter = createVTableAdapter({
    container: vtableRef.value,
    columns: props.columns || [],
    data: tableRenderData.value,
    width: vtableRef.value.clientWidth,
    height: vtableRef.value.clientHeight,
    theme: props.theme,
    size: props.size,
    stripe: props.stripe,
    stripeColor: props.stripeColor,
    bordered: props.bordered,
    headerAlign: props.headerAlign,
    defaultAlign: props.defaultAlign,
    rowStyle: props.rowStyle,
    selectionStyle: props.selectionStyle,
    rowKey: props.rowKey,
    rowSelection: effectiveRowSelection.value
      ? {
          ...effectiveRowSelection.value,
          selectedRowKeys: effectiveRowSelection.value?.selectedRowKeys || [],
          onChange: (selectedKeys: any[], selectedRows: any[]) => {
            if (!props.rowSelection?.selectedRowKeys) {
              internalSelectedKeys.value = selectedKeys
            }
            emit('selection-change', selectedRows, selectedKeys)
            effectiveRowSelection.value?.onChange?.(selectedKeys, selectedRows)
          }
        }
      : undefined,
    resizable: props.resizable,
    onRowClick: (row, index, event) => {
      if (isExpandMode.value && !row?.__ctable_expand_row__ && props.expandRowByClick) {
        const key = String(getRowKeyValue(row))
        const nextKeys = new Set((visibleExpandedKeys.value || []).map(k => String(k)))
        let expanded = false
        if (nextKeys.has(key)) {
          nextKeys.delete(key)
        } else {
          nextKeys.add(key)
          expanded = true
        }
        const payload = Array.from(nextKeys)
        if (!props.expandedRowKeys) {
          internalExpandedKeys.value = payload
        }
        emit('expand', expanded, row)
      }
      emit('row-click', row, index, event)
    },
    onRowContextMenu: (row, index, event) => {
      emit('row-contextmenu', row, index, event)
      if (!contextMenuEnabled.value) return
      const e = (event as any)?.nativeEvent as MouseEvent | undefined
      e?.preventDefault?.()
      const wrapper = getWrapperRect()
      if (!wrapper) return
      const px = Number((event as any)?.clientX ?? e?.clientX ?? 0)
      const py = Number((event as any)?.clientY ?? e?.clientY ?? 0)
      openContextMenu({
        clientX: px,
        clientY: py,
        row,
        index,
        wrapperRect: wrapper.rect,
        itemCount: contextMenuItems.value.length
      })
    },
    onCellClick: (cell, row, column, event) => {
      const mouseEvt = (event as MouseEvent | undefined)
      if (mouseEvt?.clientX != null && mouseEvt?.clientY != null) {
        lastPointer.value = { x: mouseEvt.clientX, y: mouseEvt.clientY }
      }
      if (!column) {
        emit('cell-click', cell, row, column, event)
        return
      }
      const field = getColumnField(column)
      const rowIndexFromEvent = Number((cell as any)?.recordIndex ?? -1)
      const rowIndex = rowIndexFromEvent >= 0
        ? rowIndexFromEvent
        : (paginatedData.value || []).findIndex(
            item => String(getRowKeyValue(item)) === String(getRowKeyValue(row))
          )
      setActiveCellByPayload({
        row,
        index: rowIndex >= 0 ? rowIndex : 0,
        field
      })
      emit('cell-click', cell, row, column, event)
    },
    onSortChange: sorter => {
      runSortTransition()
      internalSorter.value = sorter
      currentPage.value = 1
      const activeSorters = buildActiveSorters()
      if (effectiveSortMode.value === 'remote') {
        props.onSortRequest?.(sorter, activeSorters)
      }
      if (effectiveSortMode.value === 'remote' || effectiveFilterMode.value === 'remote' || effectivePaginationMode.value === 'remote') {
        emitRemoteQuery(sorter)
      }
      emit('sort-change', sorter.field, sorter.order)
      emit('change', effectivePagination.value, internalFilters.value, activeSorters.length <= 1 ? sorter : activeSorters)
    },
    onFilterChange: filters => {
      const nextFilters: Record<string, any[]> = {}
      filters.forEach((item: any) => {
        const field = String(item?.field ?? '')
        if (!field) return
        nextFilters[field] = Array.isArray(item?.values) ? item.values : []
      })
      internalFilters.value = nextFilters
      const nextKeywordMap: Record<string, string> = {}
      Object.entries(nextFilters).forEach(([field, values]) => {
        const token = values
          .map(v => String(v))
          .find(v => v.startsWith(keywordFilterTokenPrefix))
        if (token) {
          nextKeywordMap[field] = token.slice(keywordFilterTokenPrefix.length)
        }
      })
      keywordFilters.value = nextKeywordMap
      currentPage.value = 1
      if (effectiveFilterMode.value === 'remote') {
        props.onFilterRequest?.(nextFilters)
      }
      if (effectiveSortMode.value === 'remote' || effectiveFilterMode.value === 'remote' || effectivePaginationMode.value === 'remote') {
        emitRemoteQuery()
      }
      emit('filter-change', filters)
      emit('change', effectivePagination.value, nextFilters, internalSorter.value)
    },
    onFilterIconClick: payload => {
      const wrapper = getWrapperRect()
      if (!wrapper) return
      openAdvancedFilterPanel({
        field: payload.field,
        keyword: keywordFilters.value[payload.field] || '',
        clientX: payload.clientX,
        clientY: payload.clientY,
        wrapperRect: wrapper.rect
      })
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
    },
    columnDragConfig: props.columnDragConfig,
    onColumnDragStart: payload => {
      emit('column-drag-start', payload)
      props.onColumnDragStart?.(payload)
    },
    onColumnDragEnd: payload => {
      emit('column-drag-end', payload)
      props.onColumnDragEnd?.(payload)
    },
    onColumnsChange: columns => {
      emit('columns-change', columns)
      props.onColumnsChange?.(columns)
      saveColumnState(columns)
    },
    isTreeMode: isTreeMode.value || isExpandMode.value,
    treeChildrenField: isExpandMode.value ? expandChildrenField : treeChildrenField.value,
    treeIndentSize: props.indentSize,
    defaultExpandAllRows: props.defaultExpandAllRows,
    isExpandMode: isExpandMode.value,
    expandRenderField: getColumnField((props.columns || [])[0]),
    onTreeHierarchyStateChange: payload => {
      if (isExpandMode.value) {
        const keyValue = getRowKeyValue(payload.record)
        if (keyValue == null) {
          emit('expand', payload.expanded, payload.record)
          return
        }
        const key = String(keyValue)
        const set = new Set((visibleExpandedKeys.value || []).map(k => String(k)))
        if (payload.expanded) set.add(key)
        else set.delete(key)
        if (!props.expandedRowKeys) {
          internalExpandedKeys.value = Array.from(set)
        }
      }
      emit('expand', payload.expanded, payload.record)
    },
    mergeCells: resolvedMergeCells.value
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
    ...paginationConfig.value,
    current: currentPage.value,
    pageSize: pageSize.value,
    total: total.value
  }

  paginationConfig.value?.onChange?.(currentPage.value, pageSize.value)
  const activeSorters = buildActiveSorters()
  if (effectivePaginationMode.value === 'remote' || effectiveSortMode.value === 'remote' || effectiveFilterMode.value === 'remote') {
    emitRemoteQuery(activeSorters[0] ?? internalSorter.value)
  }
  emit('change', mergedPagination, internalFilters.value, activeSorters.length <= 1 ? activeSorters[0] ?? null : activeSorters)
}

/**
 * 每页数量改变
 */
const handlePageSizeChange = (current: number, size: number) => {
  currentPage.value = current
  pageSize.value = size

  const mergedPagination = {
    ...paginationConfig.value,
    current,
    pageSize: size,
    total: total.value
  }

  paginationConfig.value?.onShowSizeChange?.(current, size)
  paginationConfig.value?.onChange?.(current, size)
  const activeSorters = buildActiveSorters()
  if (effectivePaginationMode.value === 'remote' || effectiveSortMode.value === 'remote' || effectiveFilterMode.value === 'remote') {
    emitRemoteQuery(activeSorters[0] ?? internalSorter.value)
  }
  emit('change', mergedPagination, internalFilters.value, activeSorters.length <= 1 ? activeSorters[0] ?? null : activeSorters)
}

const applyAdvancedFilter = () => {
  const field = advancedFilterPanel.value.field
  if (!field) return
  const keyword = advancedFilterPanel.value.keyword.trim()
  const token = keyword ? `${keywordFilterTokenPrefix}${keyword}` : ''
  if (keyword) {
    keywordFilters.value = {
      ...keywordFilters.value,
      [field]: keyword
    }
  } else {
    const { [field]: _removed, ...rest } = keywordFilters.value
    keywordFilters.value = rest
  }
  vtableAdapter?.setFilterValues(field, token ? [token] : [])
}

const resetAdvancedFilter = () => {
  advancedFilterPanel.value.keyword = ''
  applyAdvancedFilter()
}

const toggleColumnVisibility = (columnKey: string, visible: boolean) => {
  emit('column-visibility-change', columnKey, visible)
}

const onColumnToggle = (columnKey: string, event: Event) => {
  const input = event.target as HTMLInputElement | null
  const checked = Boolean(input?.checked)
  toggleColumnVisibility(columnKey, checked)
}

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  const wrapper = getWrapperRect()
  const inWrapper = !!(wrapper?.wrapperEl && target && wrapper.wrapperEl.contains(target))
  if (advancedFilterPanel.value.visible && !target?.closest('.ctable-advanced-filter')) {
    closeAdvancedFilterPanel()
  }
  if (contextMenuState.value.visible && !target?.closest('.ctable-context-menu')) {
    if (shouldKeepByGuard(event)) return
    closeContextMenu()
  }
  if (!inWrapper && cellEditor.value.visible && !target?.closest('.ctable-inline-editor')) {
    // 避免“点击单元格打开编辑器”与全局点击关闭在同一事件周期互相冲突
    if (Date.now() - cellEditorOpenedAt.value < 120) return
    confirmCellEditor()
  }
}

const handleNativeContextMenu = (event: MouseEvent) => {
  if (!contextMenuEnabled.value) return
  if ((event.target as HTMLElement | null)?.closest('.ctable-context-menu')) return
  const wrapper = getWrapperRect()
  if (!wrapper) return
  const wrapperEl = wrapper.wrapperEl
  if (event.target && !wrapperEl.contains(event.target as Node)) return
  event.preventDefault()
  const px = Number(event.clientX ?? 0)
  const py = Number(event.clientY ?? 0)
  const hit = vtableAdapter?.getRowContextByClientPoint?.(px, py)
  openContextMenu({
    clientX: px,
    clientY: py,
    row: hit?.row,
    index: hit?.index,
    wrapperRect: wrapper.rect,
    itemCount: contextMenuItems.value.length
  })
}

const handleDocumentContextMenuCapture = (event: MouseEvent) => {
  handleNativeContextMenu(event)
}

const handleWrapperClick = (event: MouseEvent) => {
  lastPointer.value = { x: event.clientX, y: event.clientY }
  if (!props.editable) return
  if ((event.target as HTMLElement | null)?.closest('.ctable-inline-editor')) return
  const hit = vtableAdapter?.getCellContextByClientPoint?.(event.clientX, event.clientY)
  if (!hit?.field || hit.index < 0) return
  const hitRow = hit.row ?? (paginatedData.value?.[hit.index] || null)
  if (!hitRow) return
  setActiveCellByPayload({
    row: hitRow,
    index: hit.index,
    field: hit.field
  })
  if (!isEditTriggerEnabled('click')) return
  openEditorByMode(
    {
      rowKey: getRowKeyValue(hitRow),
      field: hit.field,
      index: hit.index,
      row: hitRow
    },
    { clientX: event.clientX, clientY: event.clientY }
  )
}

const handleWrapperMouseDown = (event: MouseEvent) => {
  if (event.button !== 0) return
  lastPointer.value = { x: event.clientX, y: event.clientY }
  if (!props.editable) return
  if ((event.target as HTMLElement | null)?.closest('.ctable-inline-editor')) return
  const hit = vtableAdapter?.getCellContextByClientPoint?.(event.clientX, event.clientY)
  if (!hit?.field || hit.index < 0) return
  const hitRow = hit.row ?? (paginatedData.value?.[hit.index] || null)
  if (!hitRow) return
  setActiveCellByPayload({
    row: hitRow,
    index: hit.index,
    field: hit.field
  })
}

const handleDocumentMouseUpCapture = (event: MouseEvent) => {
  if (event.button !== 2) return
  handleNativeContextMenu(event)
}

const handleDocumentKeydownCapture = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  if (contextMenuState.value.visible) {
    closeContextMenu()
  }
  if (advancedFilterPanel.value.visible) {
    closeAdvancedFilterPanel()
  }
  if (cellEditor.value.visible) {
    closeAllEditors()
    return
  }
  if (rowEditor.value.active) {
    cancelEditRow()
  }
}

const handleWrapperDblClick = (event: MouseEvent) => {
  if (!isEditTriggerEnabled('dblclick')) return
  lastPointer.value = { x: event.clientX, y: event.clientY }
  const hit = vtableAdapter?.getCellContextByClientPoint?.(event.clientX, event.clientY)
  if (!hit?.field || hit.index < 0) return
  const hitRow = hit.row ?? (paginatedData.value?.[hit.index] || null)
  if (!hitRow) return
  setActiveCellByPayload({
    row: hitRow,
    index: hit.index,
    field: hit.field
  })
  openEditorByMode(
    {
      rowKey: getRowKeyValue(hitRow),
      field: hit.field,
      index: hit.index,
      row: hitRow
    },
    { clientX: event.clientX, clientY: event.clientY }
  )
}

const handleWrapperKeydown = async (event: KeyboardEvent) => {
  if (mergedLoading.value) return
  if (cellEditor.value.visible) {
    if (event.key === 'Enter') {
      event.preventDefault()
      confirmCellEditor()
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      if (props.editMode === 'row' && rowEditor.value.active) {
        cancelEditRow()
      } else {
        cancelCellEditor()
      }
      return
    }
  }
  if (props.editMode === 'row' && rowEditor.value.active) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      saveEditRow()
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      cancelEditRow()
      return
    }
  }

  if (props.keyboardNavigation) {
    const pos = findActiveCellPosition()
    if (pos) {
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        focusCellByPosition(pos.rowIndex - 1, pos.colIndex, event.shiftKey)
        return
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        focusCellByPosition(pos.rowIndex + 1, pos.colIndex, event.shiftKey)
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        focusCellByPosition(pos.rowIndex, pos.colIndex - 1, event.shiftKey)
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        focusCellByPosition(pos.rowIndex, pos.colIndex + 1, event.shiftKey)
        return
      }
    }
  }

  if (event.key === 'Enter' && isEditTriggerEnabled('enter')) {
    event.preventDefault()
    if (props.editMode === 'row') {
      await startEditRow()
    } else {
      await startEditCell()
    }
    return
  }

  if (!props.clipboard) return

  if ((event.ctrlKey || event.metaKey) && (event.key === 'c' || event.key === 'C')) {
    event.preventDefault()
    const tsv = getRangeCellsAsTsv()
    if (!tsv) return
    try {
      await navigator.clipboard?.writeText?.(tsv)
    } catch {
      // ignore
    }
    return
  }

  if ((event.ctrlKey || event.metaKey) && (event.key === 'v' || event.key === 'V')) {
    event.preventDefault()
    try {
      const text = await navigator.clipboard?.readText?.()
      if (text) {
        pasteTsvToActiveCell(text)
      }
    } catch {
      // ignore
    }
  }
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

watch(
  () => [props.data, props.dataSource] as const,
  () => {
    if (!props.onImportData) {
      importedDataOverride.value = null
    }
  }
)

// 数据/分页变化后，更新表格内容
watch(
  () => tableRenderData.value,
  (newData, oldData) => {
    if (newData !== oldData) {
      vtableAdapter?.updateData(newData)
    }
  }
)

watch(
  () => currentData.value,
  rows => {
    if (!rowEditor.value.active) return
    const exists = (rows || []).some(row => String(getRowKeyValue(row)) === String(rowEditor.value.rowKey))
    if (!exists) {
      rowEditor.value = {
        active: false,
        rowKey: '',
        index: -1,
        originalRow: null,
        draftRow: null,
        editableFields: []
      }
      closeAllEditors()
    }
  }
)

// 数据变化后，修正当前页边界
watch(
  () => [processedData.value.length, pageSize.value] as const,
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
  () => props.editMode,
  nextMode => {
    if (nextMode !== 'row' && rowEditor.value.active) {
      cancelEditRow()
    }
  }
)

watch(
  () => props.editable,
  enabled => {
    if (!enabled && rowEditor.value.active) {
      cancelEditRow()
    }
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

watch(
  () => props.size,
  async size => {
    await runWithBusy(() => {
      vtableAdapter?.updateSize(size)
    })
  }
)

watch(
  () => props.columnDragConfig,
  async config => {
    await runWithBusy(() => {
      vtableAdapter?.updateColumnDragConfig(config)
    })
  },
  { deep: true }
)

watch(
  () => [isTreeMode.value, isExpandMode.value, treeChildrenField.value, props.defaultExpandAllRows, props.indentSize] as const,
  async () => {
    await runWithBusy(() => {
      vtableAdapter?.destroy()
      initVTable()
    })
  }
)

watch(
  () => resolvedMergeCells.value,
  next => {
    vtableAdapter?.updateMergeCells?.(next)
  },
  { deep: true }
)

watch(
  () => props.expandedRowKeys,
  next => {
    if (next) {
      internalExpandedKeys.value = next
    }
  }
)

watch(
  () => [isExpandMode.value, props.defaultExpandAllRows, currentData.value] as const,
  ([expandMode, defaultExpandAll, rows]) => {
    if (!expandMode || props.expandedRowKeys || !defaultExpandAll) return
    internalExpandedKeys.value = (rows || []).map(record => String(getRowKeyValue(record)))
  },
  { immediate: true }
)

// 监听行选择变化
watch(
  () => props.rowSelection?.selectedRowKeys,
  (newKeys, oldKeys) => {
    if (newKeys) {
      internalSelectedKeys.value = newKeys
    }
    if (newKeys && !shallowEqualKeys(newKeys, oldKeys)) {
      vtableAdapter?.setSelectedRows(newKeys)
    }
  }
)

watch(
  () => adapterLibrary.value,
  next => {
    void loadInlineEditorComponents(next)
  },
  { immediate: true }
)

// 生命周期
onMounted(() => {
  initVTable()
  nextTick(() => {
    loadColumnState()
    if (!activeCell.value) {
      focusCellByPosition(0, 0, false)
    }
  })
  document.addEventListener('click', handleDocumentClick, true)
  document.addEventListener('contextmenu', handleDocumentContextMenuCapture, true)
  document.addEventListener('mouseup', handleDocumentMouseUpCapture, true)
  document.addEventListener('keydown', handleDocumentKeydownCapture, true)
})

onBeforeUnmount(() => {
  if (sortTransitionTimer) {
    clearTimeout(sortTransitionTimer)
    sortTransitionTimer = null
  }
  sortGhost.value = {
    visible: false,
    src: ''
  }
  document.removeEventListener('click', handleDocumentClick, true)
  document.removeEventListener('contextmenu', handleDocumentContextMenuCapture, true)
  document.removeEventListener('mouseup', handleDocumentMouseUpCapture, true)
  document.removeEventListener('keydown', handleDocumentKeydownCapture, true)
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
    internalSelectedKeys.value = []
    vtableAdapter?.setSelectedRows([])
    vtableAdapter?.clearSelection?.()
  },
  /**
   * 反选当前数据页
   */
  invertSelection: () => {
    vtableAdapter?.invertSelection?.()
  },

  /**
   * 清除筛选
   */
  clearFilters: () => {
    internalFilters.value = {}
    keywordFilters.value = {}
    advancedFilterPanel.value.keyword = ''
    currentPage.value = 1
    vtableAdapter?.clearFilters?.()
  },

  /**
   * 刷新表格
   */
  refresh: () => {
    vtableAdapter?.updateData(currentData.value)
  },

  /**
   * 追加行数据（增量）
   */
  appendRows: (rows: any[]) => {
    if (!Array.isArray(rows) || rows.length === 0) return
    const next = [...(currentData.value || []), ...rows]
    commitDataChange(next, 'append-rows')
  },

  /**
   * 更新匹配行（增量）
   */
  updateRow: (
    matcher: ((row: any, index: number) => boolean) | any,
    patch: Partial<any> | ((row: any) => any)
  ) => {
    const source = currentData.value || []
    const next = source.map((row, index) => {
      const matched =
        typeof matcher === 'function'
          ? matcher(row, index)
          : row?.id === matcher || row?.key === matcher
      if (!matched) return row
      if (typeof patch === 'function') {
        return patch(row)
      }
      return { ...row, ...patch }
    })
    commitDataChange(next, 'update-row')
  },

  /**
   * 删除匹配行（增量）
   */
  removeRows: (matcher: ((row: any, index: number) => boolean) | any[] | any) => {
    const source = currentData.value || []
    let next: any[] = source
    if (typeof matcher === 'function') {
      next = source.filter((row, index) => !matcher(row, index))
    } else if (Array.isArray(matcher)) {
      const keySet = new Set(matcher)
      next = source.filter(row => !keySet.has(row?.id) && !keySet.has(row?.key))
    } else {
      next = source.filter(row => row?.id !== matcher && row?.key !== matcher)
    }
    commitDataChange(next, 'remove-rows')
  },

  /**
   * 开始编辑当前单元格（手动触发）
   */
  startEditCell: () => {
    return startEditCell()
  },

  /**
   * 开始编辑指定行（手动触发）
   */
  startEditRow: (rowIndex?: number) => {
    return startEditRow(rowIndex)
  },

  /**
   * 保存当前整行编辑
   */
  saveEditRow: () => {
    return saveEditRow()
  },

  /**
   * 取消当前整行编辑
   */
  cancelEditRow: () => {
    return cancelEditRow()
  },

  /**
   * 复制当前激活单元格/范围为 TSV
   */
  copySelection: async () => {
    const tsv = getRangeCellsAsTsv()
    if (!tsv) return ''
    try {
      await navigator.clipboard?.writeText?.(tsv)
    } catch {
      // ignore
    }
    return tsv
  },

  /**
   * 将 TSV 粘贴到当前激活单元格
   */
  pasteSelection: (text: string) => {
    pasteTsvToActiveCell(text)
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
  },

  /**
   * 导出 CSV（导出当前筛选/排序后的全量数据）
   */
  exportCsv: (fileName?: string) => exportCsv(fileName),
  /**
   * 导出 Excel（导出当前筛选/排序后的全量数据）
   */
  exportExcel: (fileName?: string, sheetName?: string) => exportExcel(fileName, sheetName),
  /**
   * 打印当前表格（当前筛选/排序后的数据）
   */
  printTable: (title?: string) => printTable(title),
  /**
   * 导入 CSV 文本，返回解析结果
   */
  importCsvText: (
    text: string,
    options?: { hasHeader?: boolean; mode?: 'replace' | 'append' }
  ) => importCsvText(text, options),
  /**
   * 导入文件（CSV/XLSX），返回解析结果
   */
  importFile: (
    file: File,
    options?: { mode?: 'replace' | 'append'; sheetName?: string }
  ) => importFile(file, options),
  /**
   * 获取当前列结构（含拖拽结果）
   */
  getColumns: () => {
    return vtableAdapter?.getColumns() || (props.columns || [])
  },

  /**
   * 重置列结构到最近一次外部 columns 输入
   */
  resetColumns: () => {
    vtableAdapter?.resetColumns()
  },

  /**
   * 直接设置列结构（受控更新）
   */
  setColumns: (columns: Column[]) => {
    vtableAdapter?.setColumns(columns)
    saveColumnState(columns)
  },

  /**
   * 保存列状态到本地存储
   */
  saveColumnState: () => {
    saveColumnState()
  },

  /**
   * 从本地存储恢复列状态
   */
  loadColumnState: () => {
    return loadColumnState()
  },

  /**
   * 清除本地存储的列状态
   */
  clearColumnState: () => {
    clearColumnState()
  },

  /**
   * 展开全部树节点（树形模式）
   */
  expandAllTree: () => {
    vtableAdapter?.expandAllTree?.()
  },

  /**
   * 折叠全部树节点（树形模式）
   */
  collapseAllTree: () => {
    vtableAdapter?.collapseAllTree?.()
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
  transition:
    opacity var(--ctable-sort-transition-duration, 220ms) ease,
    transform var(--ctable-sort-transition-duration, 220ms) cubic-bezier(0.2, 0.8, 0.2, 1),
    filter var(--ctable-sort-transition-duration, 220ms) ease;
}

.is-sorting .ctable-table {
  opacity: 0.85;
  transform: translateY(6px);
  filter: saturate(0.96);
}

.ctable-sort-ghost {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
  object-fit: fill;
  animation: ctable-sort-ghost-out var(--ctable-sort-transition-duration, 220ms) cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes ctable-sort-ghost-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-8px);
  }
}

.ctable-header,
.ctable-summary,
.ctable-footer {
  flex-shrink: 0;
}

.ctable-header {
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
}

.ctable-summary {
  border-top: 1px solid #f0f0f0;
  background: #fff;
}

.ctable-footer {
  border-top: 1px solid #f0f0f0;
  background: #fff;
}

.ctable-pagination {
  flex-shrink: 0;
}

.ctable-advanced-filter {
  position: absolute;
  width: 320px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
  z-index: 1200;
  overflow: hidden;
}

.ctable-advanced-filter-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.ctable-advanced-filter-tab {
  flex: 1;
  height: 48px;
  border: none;
  background: #fff;
  font-size: 16px;
  color: #344054;
  cursor: pointer;
}

.ctable-advanced-filter-tab.active {
  color: #1677ff;
  box-shadow: inset 0 -3px 0 #1677ff;
}

.ctable-advanced-filter-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ctable-advanced-filter-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #d0d5dd;
  font-size: 14px;
  outline: none;
}

.ctable-advanced-filter-input:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.14);
}

.ctable-advanced-filter-actions {
  display: flex;
  gap: 10px;
}

.ctable-advanced-filter-btn {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #d0d5dd;
  background: #fff;
  color: #1f2937;
  font-size: 14px;
  cursor: pointer;
}

.ctable-advanced-filter-btn.primary {
  background: #1677ff;
  border-color: #1677ff;
  color: #fff;
}

.ctable-advanced-filter-col-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 14px;
  color: #1f2937;
}

.ctable-context-menu {
  position: absolute;
  min-width: 220px;
  border: 1px solid #d9e2f2;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border-radius: 12px;
  box-shadow:
    0 20px 36px rgba(15, 23, 42, 0.16),
    0 2px 8px rgba(15, 23, 42, 0.08);
  padding: 8px;
  z-index: 1400;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transform-origin: top left;
  animation: ctable-menu-in 140ms ease-out;
}

.ctable-context-menu-item {
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  min-height: 36px;
  padding: 7px 10px;
  text-align: unset;
  cursor: pointer;
  font-size: 13px;
  color: #0f172a;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 120ms ease;
}

.ctable-context-menu-item.divided {
  margin-top: 4px;
  position: relative;
}

.ctable-context-menu-item.divided::before {
  content: '';
  position: absolute;
  left: 4px;
  right: 4px;
  top: -4px;
  height: 1px;
  background: #e5edf9;
}

.ctable-context-menu-main {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.ctable-context-menu-icon {
  font-size: 14px;
}

.ctable-context-menu-shortcut {
  color: #94a3b8;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}

.ctable-context-menu-item:hover:not(:disabled) {
  border-color: #d8e7ff;
  background: linear-gradient(180deg, #eef5ff 0%, #e8f1ff 100%);
  color: #0b56d9;
}

.ctable-context-menu-item.danger {
  color: #b42318;
}

.ctable-context-menu-item.danger:hover:not(:disabled) {
  border-color: #fecaca;
  background: linear-gradient(180deg, #fff3f2 0%, #ffe9e7 100%);
  color: #b42318;
}

.ctable-context-menu-item:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.ctable-inline-editor {
  position: fixed;
  border: 1px solid #1677ff;
  border-radius: 2px;
  background: #ffffff;
  box-shadow: none;
  padding: 0;
  z-index: 4000;
  display: flex;
  align-items: stretch;
}

.ctable-inline-editor-input {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0;
  padding: 0 10px;
  font-size: 13px;
  color: #0f172a;
  background: #fff;
  box-sizing: border-box;
}

.ctable-inline-editor-input:focus {
  outline: none;
  box-shadow: none;
}

.ctable-inline-editor-error {
  position: absolute;
  left: 0;
  top: 100%;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 2px 6px;
  color: #b42318;
  font-size: 12px;
  line-height: 1.2;
}

.ctable-inline-editor-control {
  width: 100%;
  height: 100%;
}

@keyframes ctable-menu-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
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

.ctable-pagination-ant-design {
  border-top: 1px solid #f0f0f0;
  background: #fff;
}

.ctable-pagination-element-plus {
  border-top: 1px solid #ebeef5;
  background: #fff;
}

.ctable-pagination-naive {
  border-top: 1px solid #e4e7ed;
  background: #fff;
}

/* 加载状态时表格区域有透明背景 */
.is-loading .ctable-table {
  opacity: 0.3;
}
</style>
