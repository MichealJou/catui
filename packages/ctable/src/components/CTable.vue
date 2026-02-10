<template>
  <div
    ref="containerRef"
    class="ctable-container"
    :style="containerStyle"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <!-- 加载遮罩 -->
    <component
      :is="loadingComponent"
      v-if="isLoading"
      :spinning="true"
      :tip="loadingTip"
      :size="'default'"
    />

    <!-- HTML 表头 -->
    <div v-if="columns.length" ref="headerRef" class="ctable-header" :style="headerStyle">
      <div
        v-for="(col, index) in columns"
        :key="col.key || index"
        class="ctable-header-cell"
        :style="getHeaderCellStyle(col, index)"
        @click="handleHeaderClick(col, index)"
      >
        <div class="ctable-header-cell-content">
          <!-- 复选框列 -->
          <template v-if="col.key === '__checkbox__'">
            <input
              type="checkbox"
              :checked="isAllSelected"
              :indeterminate="isSomeSelected"
              @change="handleSelectAll"
              @click.stop
            />
          </template>
          <!-- 其他列 -->
          <template v-else>
            <span class="ctable-header-title">{{ col.title }}</span>
            <!-- 排序图标 -->
            <span v-if="col.sorter" class="ctable-header-sort">
              <span
                v-if="getColumnSort(col.key) === 'ascend'"
                class="ctable-sort-icon ctable-sort-ascend"
              >
                ▲
              </span>
              <span
                v-else
                class="ctable-sort-icon"
              >
                ▲
              </span>
              <span
                v-if="getColumnSort(col.key) === 'descend'"
                class="ctable-sort-icon ctable-sort-descend"
              >
                ▼
              </span>
              <span
                v-else
                class="ctable-sort-icon"
              >
                ▼
              </span>
            </span>
            <!-- 筛选图标 -->
            <span v-if="col.filters && col.filters.length" class="ctable-header-filter">
              <span
                :class="['ctable-filter-icon', { 'ctable-filter-active': localFilterState.value.has(col.key) }]"
              >
                ⚷
              </span>
            </span>
          </template>
        </div>
      </div>
    </div>

    <!-- 单元格 hover 高亮（四条边框） -->
    <template v-if="cellHover.visible && !cellSelection.visible">
      <!-- 上边框 -->
      <div
        class="ctable-hover-border-top"
        :style="cellHoverBorders.top"
      ></div>

      <!-- 下边框 -->
      <div
        class="ctable-hover-border-bottom"
        :style="cellHoverBorders.bottom"
      ></div>

      <!-- 左边框 -->
      <div
        class="ctable-hover-border-left"
        :style="cellHoverBorders.left"
      ></div>

      <!-- 右边框 -->
      <div
        class="ctable-hover-border-right"
        :style="cellHoverBorders.right"
      ></div>
    </template>

    <!-- 单元格选中区域（四条边） -->
    <template v-if="cellSelection.visible">
      <!-- 上边框 -->
      <div
        class="ctable-selection-border-top"
        :style="cellSelectionBorders.top"
      ></div>

      <!-- 下边框 -->
      <div
        class="ctable-selection-border-bottom"
        :style="cellSelectionBorders.bottom"
      ></div>

      <!-- 左边框 -->
      <div
        class="ctable-selection-border-left"
        :style="cellSelectionBorders.left"
      ></div>

      <!-- 右边框 -->
      <div
        class="ctable-selection-border-right"
        :style="cellSelectionBorders.right"
      ></div>
    </template>

    <canvas
      ref="canvasRef"
      class="ctable-canvas"
      :width="width"
      :height="height"
      @mousedown="handleCellMouseDown"
      @mousemove="handleCellMouseMove"
      @mouseup="handleCellMouseUp"
      @mouseleave="handleCellMouseLeave"
    />
    <!-- 分页器容器 -->
    <div v-if="effectivePagination" ref="paginationRef" class="ctable-pagination-wrapper">
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
        <template v-if="$slots['pagination-prev-text']" #prevText>
          <slot name="pagination-prev-text"></slot>
        </template>
        <template v-if="$slots['pagination-next-text']" #nextText>
          <slot name="pagination-next-text"></slot>
        </template>
      </CPagination>
    </div>
    <!-- 纵向滚动条 -->
    <div
      v-if="showScrollbar"
      class="ctable-scrollbar"
      :style="scrollbarStyle"
    >
      <div
        class="ctable-scrollbar-thumb"
        :style="scrollbarThumbStyle"
        @mousedown="handleScrollbarDragStart"
      />
    </div>
    <!-- 横向滚动条 -->
    <div
      v-if="showHScrollbar"
      class="ctable-hscrollbar"
      :style="hScrollbarStyle"
    >
      <div
        class="ctable-hscrollbar-thumb"
        :style="hScrollbarThumbStyle"
        @mousedown="handleHScrollbarDragStart"
      />
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
  type CSSProperties,
} from "vue";
import type { CTableProps, Column, SortOrder, FilterCondition, ThemePreset, PaginationConfig } from "../types";
import { G2TableRenderer } from "../core/G2TableRenderer";
import { G2TableRendererV2 } from "../core/G2TableRendererV2";
import { useVirtualScroll } from "../core/VirtualScroll";
import { useThemeManager, DEFAULT_THEME } from "../core/ThemeManager";
import { SortManager } from "../core/SortManager";
import { FilterManager } from "../core/FilterManager";
import { PaginationManager } from "../core/PaginationManager";
// 导入内置 CPagination
import CPagination from "./CPagination.vue";
// 导入加载适配器
import { createLoadingComponent } from "../adapters/AdapterFactory";

defineOptions({
  name: "CTable",
});

const props = withDefaults(defineProps<CTableProps>(), {
  width: 1200,
  height: 600,
  rowKey: "id",
  virtualScroll: true,
  selectable: false,
  selectableType: "single",
  rowSelection: undefined,
});

const emit = defineEmits<{
  "cell-click": [event: any];
  "row-click": [event: any];
  "selection-change": [selectedRows: any[], selectedKeys: any[]];
  scroll: [event: any];
  "sort-change": [field: string, order: SortOrder];
  "filter-change": [filters: FilterCondition[]];
  expand: [expanded: boolean, record: any];
  change: [pagination: any, filters: any, sorter: any];
}>();

const containerRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();
const paginationRef = ref<HTMLDivElement>();

// 主题管理器 - 支持预设或自定义主题
const initialTheme = props.theme || DEFAULT_THEME
const { themeManager, setTheme, getTheme } = useThemeManager(initialTheme);

// 如果 props.theme 是预设名称，应用它
if (typeof props.theme === 'string') {
  setTheme(props.theme as ThemePreset)
} else if (props.theme) {
  setTheme(props.theme)
}

// 渲染器实例（支持旧版 G2TableRenderer 和新版 G2TableRendererV2）
const renderer = ref<G2TableRenderer | G2TableRendererV2>();
const virtualScroll = useVirtualScroll(getTheme().spacing.cell);
const sortManager = new SortManager();
const filterManager = new FilterManager();

// ========== 分页功能 ==========
const paginationManager = ref<PaginationManager | null>(null);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// ========== 加载状态 ==========
const isLoading = ref(false);
const loadingTip = ref('加载中...');

// 鼠标悬停状态（用于控制滚动条显示）
const isHovering = ref(false);

// 创建加载组件（使用适配器）- 延迟创建，在 onMounted 中初始化
const loadingComponent = ref<any>(null);

const effectivePagination = computed(() => {
  if (props.pagination === false) return false;

  const defaultConfig = {
    current: 1,
    pageSize: 10,
    total: total.value,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: [10, 20, 50, 100],
    simple: false,
    size: '',
    hideOnSinglePage: false,
    showLessItems: false,
    prevText: undefined,
    nextText: undefined
  } as PaginationConfig;

  return { ...defaultConfig, ...props.pagination };
});

// ========== 分页功能 ==========


const selectedRows = ref<any[]>([]);
const hoveredCell = ref<any>(null);

// 单元格选中状态（Excel 风格）
const cellSelection = ref({
  visible: false,
  startRow: 0,
  startCol: 0,
  endRow: 0,
  endCol: 0,
});

const cellSelecting = ref(false);

// 单元格 hover 状态
const cellHover = ref({
  visible: false,
  row: 0,
  col: 0,
});

// 滚动条相关状态
const scrollbarDragging = ref(false);
const scrollbarDragStartY = ref(0);
const scrollbarDragStartScrollTop = ref(0);

// 横向滚动相关状态
const scrollLeft = ref(0);
const hScrollbarDragging = ref(false);
const hScrollbarDragStartX = ref(0);
const hScrollbarDragStartScrollLeft = ref(0);

// 兼容 dataSource 和 data 两种属性名
const tableData = computed(() => props.data || props.dataSource || []);

// 计算分页后的数据
const paginatedData = computed(() => {
  // 如果启用虚拟滚动，禁用分页，返回全部数据
  if (props.virtualScroll) {
    console.log('📊 虚拟滚动已启用，禁用分页，返回全部数据:', tableData.value.length);
    return tableData.value;
  }

  // 如果禁用分页，返回全部数据
  if (props.pagination === false || !effectivePagination.value) {
    console.log('📊 分页禁用或未配置，返回全部数据:', tableData.value.length);
    return tableData.value;
  }

  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  const slicedData = tableData.value.slice(start, end);
  console.log('📊 分页数据计算:', {
    total: tableData.value.length,
    start,
    end,
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    slicedLength: slicedData.length
  });
  return slicedData;
});

// 辅助函数：获取列宽（转为数字）
const getColumnWidth = (col: Column): number => {
  const width = col.width || 120;
  return typeof width === 'number' ? width : parseInt(width) || 120;
};

// 辅助函数：获取行键值
const getRowKey = (row: any): string => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row);
  }
  return String(row[props.rowKey || 'id']);
};

// 计算实际的选择类型（单选/多选）
const effectiveSelectableType = computed<'single' | 'multiple'>(() => {
  if (props.rowSelection) {
    return props.rowSelection.type === 'checkbox' ? 'multiple' : 'single';
  }
  return props.selectableType;
});

// ========== 展开行功能 ==========
// 展开的行键集合
const expandedKeys = ref<Set<string>>(new Set(props.expandedRowKeys || []));

// 切换行的展开状态
const toggleExpand = (rowKey: string) => {
  const isExpanding = !expandedKeys.value.has(rowKey)

  if (expandedKeys.value.has(rowKey)) {
    expandedKeys.value.delete(rowKey);
  } else {
    expandedKeys.value.add(rowKey);
  }

  // 触发 expand 事件
  const row = tableData.value.find(r => getRowKey(r) === rowKey);
  emit("expand", isExpanding, row);

  // 如果是树形数据，更新扁平化数据
  const childrenColumnName = props.childrenColumnName || 'children'
  if (row && row[childrenColumnName]) {
    updateFlatData()
  }

  // 更新渲染器的展开行配置
  if (renderer.value && props.expandedRowRender) {
    (renderer.value as any).updateExpandedKeys(getExpandedKeys());
  }

  // 触发 change 事件（兼容 a-table）
  if (props.onChange) {
    props.onChange({}, {}, {});
  }

  // 重新渲染表格
  renderTable();
};

// 检查行是否展开
const isRowExpanded = (rowKey: string): boolean => {
  return expandedKeys.value.has(rowKey);
};

// 获取所有展开的行键
const getExpandedKeys = (): string[] => {
  return Array.from(expandedKeys.value);
};

// ========== 树形数据支持 ==========
// 扁平化树形数据，添加层级信息
interface FlatNode {
  data: any
  key: string
  level: number
  parentKey: string | null
  hasChildren: boolean
  index: number
}

const flatData = ref<FlatNode[]>([])
const dataKeyMap = ref<Map<string, FlatNode>>(new Map())

// 扁平化树形数据
const flattenTreeData = (
  data: any[],
  parentKey: string | null = null,
  level: number = 0,
  startIndex: number = 0
): { flat: FlatNode[], count: number } => {
  const flat: FlatNode[] = []
  let count = 0

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const key = getRowKey(row)
    const childrenColumnName = props.childrenColumnName || 'children'
    const children = row[childrenColumnName] as any[]

    const node: FlatNode = {
      data: row,
      key,
      level,
      parentKey,
      hasChildren: children && children.length > 0,
      index: startIndex + count
    }

    flat.push(node)
    count++

    // 如果有子节点且父节点是展开的，递归处理
    if (children && children.length > 0 && expandedKeys.value.has(key)) {
      const childResult = flattenTreeData(
        children,
        key,
        level + 1,
        startIndex + count
      )
      flat.push(...childResult.flat)
      count += childResult.count
    }
  }

  return { flat, count }
}

// 更新扁平化数据
const updateFlatData = () => {
  const data = tableData.value || []
  const result = flattenTreeData(data)
  flatData.value = result.flat

  // 构建键值映射
  const map = new Map<string, FlatNode>()
  result.flat.forEach(node => {
    map.set(node.key, node)
  })
  dataKeyMap.value = map
}

const containerStyle = computed<CSSProperties>(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  position: "relative" as "relative",
  overflow: "hidden" as "hidden",
  backgroundColor: getTheme().colors.background,
}));

// 表头相关
const headerRef = ref<HTMLElement | null>(null);

// 排序和筛选状态
const localSortState = ref<Map<string, "ascend" | "descend">>(new Map());
const localFilterState = ref<Map<string, any[]>>(new Map());

const headerStyle = computed<CSSProperties>(() => {
  const theme = getTheme();
  return {
    position: "absolute" as "absolute",
    top: "0",
    left: "0",
    right: "0",
    height: `${theme.spacing.header}px`,
    backgroundColor: "#fafafa",
    // 表头外边框，颜色与 ant-design-vue table 一致
    borderTop: `1px solid #f0f0f0`,
    borderLeft: `1px solid #f0f0f0`,
    borderRight: `1px solid #f0f0f0`,
    borderBottom: `1px solid #f0f0f0`,
    display: "flex",
    alignItems: "center",
    zIndex: 100,
    overflow: "hidden" as "hidden",
  };
});

const getHeaderCellStyle = (col: any, index: number) => {
  const theme = getTheme();
  const columnWidth = getColumnWidth(col);
  const currentSort = getColumnSort(col.key);

  // 最后一列不需要右边框
  const isLastColumn = props.columns && index === props.columns.length - 1;

  return {
    width: `${columnWidth}px`,
    height: `${theme.spacing.header}px`,
    // 使用 border-right 显示列分隔线（最后一列除外）
    borderRight: isLastColumn ? 'none' : `1px solid #f0f0f0`,
    display: "flex",
    alignItems: "center",
    justifyContent: col.align || "left",
    cursor: col.sorter ? "pointer" : "default",
    userSelect: "none" as "none",
    fontSize: "14px",
    fontWeight: "500",
    color: "rgba(0, 0, 0, 0.85)",
    backgroundColor: currentSort ? "#e6f7ff" : "transparent",
    transition: "background-color 0.2s",
    // 使用 border-box，边框占据内部空间，与 Canvas strokeRect 对齐
    boxSizing: "border-box" as "border-box",
  };
};

const handleHeaderClick = (col: any, index: number) => {
  if (!col.sorter) return;

  const currentSort = getColumnSort(col.key);
  let newSort: "ascend" | "descend" | null = null;

  if (!currentSort) {
    newSort = "ascend";
  } else if (currentSort === "ascend") {
    newSort = "descend";
  }

  // 更新排序状态
  const newState = new Map(localSortState.value);
  newState.clear();
  if (newSort) {
    newState.set(col.key, newSort);
  }
  localSortState.value = newState;

  // 触发排序事件
  emit("change", {
    pagination: effectivePagination.value
      ? {
          current: currentPage.value,
          pageSize: pageSize.value,
        }
      : undefined,
    filters: {},
    sorter: newSort
      ? {
          field: col.key,
          order: newSort,
        }
      : null,
  }, null, null);

  renderTable();
};

const getColumnSort = (key: string): "ascend" | "descend" | null => {
  return localSortState.value.get(key) || null;
};

// 全选相关
const isAllSelected = computed(() => {
  if (!props.rowSelection || !paginatedData.value) return false;
  const { selectedRowKeys } = props.rowSelection;
  return (
    selectedRowKeys &&
    selectedRowKeys.length > 0 &&
    selectedRowKeys.length === paginatedData.value.length
  );
});

const isSomeSelected = computed(() => {
  if (!props.rowSelection || !paginatedData.value) return false;
  const { selectedRowKeys } = props.rowSelection;
  return (
    selectedRowKeys &&
    selectedRowKeys.length > 0 &&
    selectedRowKeys.length < paginatedData.value.length
  );
});

const handleSelectAll = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const checked = target.checked;

  if (!props.rowSelection || !paginatedData.value) return;

  const { onChange } = props.rowSelection;
  const rowKey = props.rowKey || "key";

  const newSelectedKeys = checked
    ? paginatedData.value.map((row) => {
        const key = typeof rowKey === "function" ? rowKey(row) : row[rowKey];
        return key;
      })
    : [];

  if (onChange) {
    onChange(newSelectedKeys, checked ? paginatedData.value : []);
  }
};

// 单元格选中框样式（仅背景）
// 单元格 hover 样式（四条边框）
const cellHoverBorders = computed(() => {
  const theme = getTheme();
  const { visible, row, col } = cellHover.value;

  if (!visible || !props.columns) {
    return {
      top: { display: "none" as "none" },
      bottom: { display: "none" as "none" },
      left: { display: "none" as "none" },
      right: { display: "none" as "none" },
    };
  }

  const headerHeight = theme.spacing.header;
  const cellHeight = theme.spacing.cell;

  // 计算单元格的 X 坐标
  let cellX = -scrollLeft.value;
  if (props.columns) {
    for (let i = 0; i < col; i++) {
      if (props.columns[i]) {
        cellX += getColumnWidth(props.columns[i]);
      }
    }
  }

  // 获取列宽
  const cellWidth = props.columns && props.columns[col]
    ? getColumnWidth(props.columns[col])
    : 120;

  // 计算单元格的 Y 坐标
  let cellY: number;
  if (props.virtualScroll && renderer.value) {
    const scrollTop = virtualScroll.scrollTop.value;
    cellY = headerHeight + (row * cellHeight) - scrollTop;
  } else {
    cellY = headerHeight + row * cellHeight;
  }

  return {
    // 上边框
    top: {
      position: "absolute" as "absolute",
      left: `${cellX}px`,
      top: `${cellY}px`,
      width: `${cellWidth}px`,
      height: "1px",
      backgroundColor: "#d9d9d9",
      pointerEvents: "none" as "none",
      zIndex: 49,
    },
    // 下边框
    bottom: {
      position: "absolute" as "absolute",
      left: `${cellX}px`,
      top: `${cellY + cellHeight}px`,
      width: `${cellWidth}px`,
      height: "1px",
      backgroundColor: "#d9d9d9",
      pointerEvents: "none" as "none",
      zIndex: 49,
    },
    // 左边框
    left: {
      position: "absolute" as "absolute",
      left: `${cellX}px`,
      top: `${cellY}px`,
      width: "1px",
      height: `${cellHeight}px`,
      backgroundColor: "#d9d9d9",
      pointerEvents: "none" as "none",
      zIndex: 49,
    },
    // 右边框
    right: {
      position: "absolute" as "absolute",
      left: `${cellX + cellWidth}px`,
      top: `${cellY}px`,
      width: "1px",
      height: `${cellHeight}px`,
      backgroundColor: "#d9d9d9",
      pointerEvents: "none" as "none",
      zIndex: 49,
    },
  };
});

// 单元格选中框四条边样式
const cellSelectionBorders = computed(() => {
  const theme = getTheme();
  const { startRow, startCol, endRow, endCol, visible } = cellSelection.value;

  if (!visible) {
    return {
      top: { display: "none" as "none" },
      bottom: { display: "none" as "none" },
      left: { display: "none" as "none" },
      right: { display: "none" as "none" },
    };
  }

  // 确保 startRow/Col <= endRow/Col
  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);
  const minCol = Math.min(startCol, endCol);
  const maxCol = Math.max(startCol, endCol);

  // 计算选中框的位置和大小
  const headerHeight = theme.spacing.header;
  const cellHeight = theme.spacing.cell;

  // 计算起始列的 X 坐标（考虑横向滚动）
  let startX = -scrollLeft.value;
  if (props.columns) {
    for (let i = 0; i < minCol; i++) {
      if (props.columns[i]) {
        startX += getColumnWidth(props.columns[i]);
      }
    }
  }

  // 计算结束列的 X 坐标
  let endX = startX;
  if (props.columns) {
    for (let i = minCol; i <= maxCol; i++) {
      if (props.columns[i]) {
        endX += getColumnWidth(props.columns[i]);
      }
    }
  }

  const width = endX - startX;

  // 计算行位置（考虑虚拟滚动）
  let topY: number;
  if (props.virtualScroll && renderer.value) {
    const scrollTop = virtualScroll.scrollTop.value;
    topY = headerHeight + (minRow * cellHeight) - scrollTop;
  } else {
    topY = headerHeight + minRow * cellHeight;
  }

  const height = (maxRow - minRow + 1) * cellHeight;

  // 四条边的样式
  return {
    // 上边框
    top: {
      position: "absolute" as "absolute",
      left: `${startX}px`,
      top: `${topY}px`,
      width: `${width}px`,
      height: "1px",
      backgroundColor: "#108ee9",
      pointerEvents: "none" as "none",
      zIndex: 53,
    },
    // 下边框
    bottom: {
      position: "absolute" as "absolute",
      left: `${startX}px`,
      top: `${topY + height}px`,
      width: `${width}px`,
      height: "1px",
      backgroundColor: "#108ee9",
      pointerEvents: "none" as "none",
      zIndex: 53,
    },
    // 左边框
    left: {
      position: "absolute" as "absolute",
      left: `${startX}px`,
      top: `${topY}px`,
      width: "1px",
      height: `${height}px`,
      backgroundColor: "#108ee9",
      pointerEvents: "none" as "none",
      zIndex: 53,
    },
    // 右边框
    right: {
      position: "absolute" as "absolute",
      left: `${endX}px`,
      top: `${topY}px`,
      width: "1px",
      height: `${height}px`,
      backgroundColor: "#108ee9",
      pointerEvents: "none" as "none",
      zIndex: 53,
    },
  };
});

// 获取鼠标位置对应的单元格坐标
const getCellFromPosition = (x: number, y: number) => {
  const theme = getTheme();
  const headerHeight = theme.spacing.header;
  const cellHeight = theme.spacing.cell;

  // 检查是否在表头区域
  if (y < headerHeight) {
    return null;
  }

  // 计算行索引
  let rowIndex: number;
  if (props.virtualScroll && renderer.value) {
    // 虚拟滚动模式：需要加上 scrollTop 才能得到绝对行索引
    const scrollTop = virtualScroll.scrollTop.value;
    rowIndex = Math.floor((y - headerHeight + scrollTop) / cellHeight);

    // 检查是否在数据范围内
    const maxRow = (paginatedData.value?.length || 0) - 1;
    if (rowIndex < 0 || rowIndex > maxRow) {
      return null;
    }
  } else {
    // 非虚拟滚动模式
    rowIndex = Math.floor((y - headerHeight) / cellHeight);
    const maxRow = (paginatedData.value?.length || 0) - 1;

    if (rowIndex < 0 || rowIndex > maxRow) {
      return null;
    }
  }

  // 计算列索引（考虑横向滚动）
  let colIndex = 0;
  let currentX = -scrollLeft.value;
  for (let i = 0; i < props.columns.length; i++) {
    const colWidth = typeof props.columns[i]?.width === 'number'
      ? props.columns[i]?.width as number
      : 120;
    if (x >= currentX && x < currentX + colWidth) {
      colIndex = i;
      break;
    }
    currentX += colWidth;
  }

  return { rowIndex, colIndex };
};

// 单元格鼠标事件处理
const handleCellMouseDown = (event: MouseEvent) => {
  const rect = canvasRef.value!.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const cell = getCellFromPosition(x, y);
  if (!cell) return;

  cellSelecting.value = true;
  cellSelection.value = {
    visible: true,
    startRow: cell.rowIndex,
    startCol: cell.colIndex,
    endRow: cell.rowIndex,
    endCol: cell.colIndex,
  };
};

let cellMouseMoveTimer: number | null = null;

const handleCellMouseMove = (event: MouseEvent) => {
  // 如果正在选择，更新选择范围
  if (cellSelecting.value) {
    // 使用节流优化性能
    if (cellMouseMoveTimer) return;

    cellMouseMoveTimer = window.setTimeout(() => {
      cellMouseMoveTimer = null;

      const rect = canvasRef.value!.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const cell = getCellFromPosition(x, y);
      if (!cell) return;

      // 限制在可见数据范围内
      const maxRow = (paginatedData.value?.length || 0) - 1;
      const maxCol = (props.columns?.length || 0) - 1;

      cellSelection.value.endRow = Math.max(0, Math.min(cell.rowIndex, maxRow));
      cellSelection.value.endCol = Math.max(0, Math.min(cell.colIndex, maxCol));
    }, 16); // 约 60fps
  } else {
    // 否则更新 hover 状态
    const rect = canvasRef.value!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const cell = getCellFromPosition(x, y);
    if (cell) {
      cellHover.value = {
        visible: true,
        row: cell.rowIndex,
        col: cell.colIndex,
      };
    } else {
      cellHover.value.visible = false;
    }
  }
};

const handleCellMouseUp = () => {
  cellSelecting.value = false;

  // 清除节流定时器
  if (cellMouseMoveTimer) {
    clearTimeout(cellMouseMoveTimer);
    cellMouseMoveTimer = null;
  }
};

const handleCellMouseLeave = () => {
  // 清除 hover 状态
  cellHover.value.visible = false;
};

// 是否显示滚动条
const showScrollbar = computed(() => {
  if (!props.virtualScroll || !paginatedData.value || !paginatedData.value.length) return false;

  let paginationHeight = 0;
  if (!props.virtualScroll) {
    paginationHeight = paginationRef.value?.offsetHeight || (effectivePagination ? 60 : 0);
  }

  const totalHeight = paginatedData.value.length * getTheme().spacing.cell;
  const containerHeight = props.height - getTheme().spacing.header - paginationHeight;
  return totalHeight > containerHeight;
});

// 滚动条样式
const scrollbarStyle = computed<CSSProperties>(() => {
  // 表格已完全填充容器宽度（最后一列自动扩展）
  // 滚动条紧贴容器右边缘，与 ant-design-vue 表格样式一致
  const headerHeight = getTheme().spacing.header;
  let paginationHeight = 0;
  if (!props.virtualScroll) {
    paginationHeight = paginationRef.value?.offsetHeight || (effectivePagination ? 60 : 0);
  }
  const scrollbarHeight = props.height - headerHeight - paginationHeight;

  return {
    position: "absolute" as "absolute",
    right: "0px",
    top: `${headerHeight}px`,
    width: "10px",
    height: `${scrollbarHeight}px`,
    backgroundColor: "transparent",
    cursor: "pointer",
  };
});

// 滚动条滑块样式
const scrollbarThumbStyle = computed<CSSProperties>(() => {
  if (!paginatedData.value || !paginatedData.value.length) {
    return {
      position: "absolute" as "absolute",
      top: "0px",
      right: "2px",
      width: "6px",
      height: "30px",
      backgroundColor: "transparent",
      borderRadius: "3px",
    };
  }

  const headerHeight = getTheme().spacing.header;
  let paginationHeight = 0;
  if (!props.virtualScroll) {
    paginationHeight = paginationRef.value?.offsetHeight || (effectivePagination ? 60 : 0);
  }

  const totalHeight = paginatedData.value.length * getTheme().spacing.cell;
  const containerHeight = props.height - headerHeight - paginationHeight;
  const maxScrollTop = Math.max(0, totalHeight - containerHeight);
  const scrollbarHeight = props.height - headerHeight - paginationHeight;
  const thumbHeight = Math.max(30, (containerHeight / totalHeight) * scrollbarHeight);
  const thumbTop = (virtualScroll.scrollTop.value / maxScrollTop) * (scrollbarHeight - thumbHeight);

  return {
    position: "absolute" as "absolute",
    top: `${thumbTop}px`,
    right: "2px",
    width: "6px",
    height: `${thumbHeight}px`,
    backgroundColor: scrollbarDragging.value ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.2)",
    borderRadius: "3px",
    transition: scrollbarDragging.value ? "none" : "background-color 0.2s",
  };
});

// ============================================================================
// 横向滚动
// ============================================================================

// 计算所有列的总宽度
const columnsTotalWidth = computed(() => {
  const columns = props.columns || [];
  return columns.reduce((sum, col) => {
    const width = col.width || 120;
    return sum + (typeof width === 'number' ? width : parseInt(width) || 120);
  }, 0);
});

// 是否显示横向滚动条
const showHScrollbar = computed(() => {
  return columnsTotalWidth.value > props.width;
});

// 横向滚动条样式
const hScrollbarStyle = computed<CSSProperties>(() => {
  return {
    position: "absolute" as "absolute",
    left: "0px",
    bottom: "0px",
    width: `${props.width}px`,
    height: "10px",
    backgroundColor: "transparent",
    cursor: "pointer",
  };
});

// 横向滚动条滑块样式
const hScrollbarThumbStyle = computed<CSSProperties>(() => {
  if (!showHScrollbar.value) {
    return {
      position: "absolute" as "absolute",
      left: "0px",
      bottom: "2px",
      width: "30px",
      height: "6px",
      backgroundColor: "transparent",
      borderRadius: "3px",
    };
  }

  const containerWidth = props.width;
  const contentWidth = columnsTotalWidth.value;
  const maxScrollLeft = contentWidth - containerWidth;
  const scrollbarWidth = containerWidth;
  const thumbWidth = Math.max(30, (containerWidth / contentWidth) * scrollbarWidth);
  const thumbLeft = (scrollLeft.value / maxScrollLeft) * (scrollbarWidth - thumbWidth);

  return {
    position: "absolute" as "absolute",
    left: `${thumbLeft}px`,
    bottom: "2px",
    width: `${thumbWidth}px`,
    height: "6px",
    backgroundColor: hScrollbarDragging.value ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.2)",
    borderRadius: "3px",
    transition: hScrollbarDragging.value ? "none" : "background-color 0.2s",
  };
});

// 先筛选，再排序（全部数据）
const sortedAndFilteredData = computed(() => {
  const data = tableData.value || [];

  // 检查是否是树形数据
  const childrenColumnName = props.childrenColumnName || 'children'
  const hasTreeData = data.some(row => row[childrenColumnName] && Array.isArray(row[childrenColumnName]))

  if (hasTreeData) {
    // 树形数据：使用扁平化数据
    updateFlatData()
    return flatData.value.map(node => node.data)
  } else {
    // 普通数据
    const filtered = filterManager.filterData(data);
    return sortManager.sortData(filtered);
  }
});

// 分页后的数据
const sortedData = computed(() => {
  const allData = sortedAndFilteredData.value;

  // 如果禁用分页，返回全部数据
  if (props.pagination === false || !effectivePagination.value) {
    return allData;
  }

  // 应用分页
  const { current, pageSize } = effectivePagination.value;
  const start = (current - 1) * pageSize;
  const end = start + pageSize;

  // 更新 total
  total.value = allData.length;

  return allData.slice(start, end);
});

const visibleData = computed(() => {
  if (!props.virtualScroll) {
    return sortedData.value;
  }
  const { startIndex, endIndex } = virtualScroll.visibleRange.value;
  return sortedData.value.slice(startIndex, endIndex);
});

const initTable = async () => {
  if (!canvasRef.value || !containerRef.value) {
    return;
  }

  const theme = getTheme();
  const headerHeight = theme.spacing.header || 55;

  // 先保存数据引用
  const data = paginatedData.value || [];
  const fullData = tableData.value || []; // 完整数据（用于展开行等功能）
  const columns = props.columns || [];
  const dataLength = data.length;

  // 处理 rowSelection 配置
  let effectiveSelectable = props.selectable;

  // 如果有 rowSelection 配置，优先使用
  if (props.rowSelection) {
    effectiveSelectable = true;

    // 初始化选中状态
    if (props.rowSelection.selectedRowKeys && props.rowSelection.selectedRowKeys.length > 0) {
      const keys = props.rowSelection.selectedRowKeys;
      selectedRows.value = fullData.filter(row => keys.includes(getRowKey(row)));
    }
  } else {
    // 检测是否有 __checkbox__ 列，如果有则自动启用 selectable
    const hasCheckboxColumn = columns.some(col => col.key === '__checkbox__');
    effectiveSelectable = hasCheckboxColumn || props.selectable;
  }

  // 重要：先更新数据计数，再更新容器高度
  // 如果启用虚拟滚动，不考虑分页器高度
  let paginationHeight = 0;
  if (!props.virtualScroll) {
    // 动态获取分页器高度
    const getPaginationHeight = () => {
      if (!effectivePagination || !paginationRef.value) {
        return 0;
      }
      return paginationRef.value.offsetHeight;
    };
    paginationHeight = getPaginationHeight() || (effectivePagination ? 60 : 0);
  }

  const containerHeight = props.height - headerHeight - paginationHeight;

  console.log('📏 初始化虚拟滚动:', {
    dataLength,
    tableDataLength: tableData.value.length,
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    containerHeight,
    headerHeight,
    paginationHeight,
    paginationRefOffsetHeight: paginationRef.value?.offsetHeight,
    fullHeight: props.height,
    hasPagination: !!effectivePagination,
    virtualScroll: props.virtualScroll
  });
  virtualScroll.virtualScroll.setDataCount(dataLength);
  virtualScroll.containerHeight.value = containerHeight;

  // 初始化展开行状态
  if (props.expandedRowKeys && props.expandedRowKeys.length > 0) {
    expandedKeys.value = new Set(props.expandedRowKeys);
  } else if (props.defaultExpandAllRows) {
    // 默认展开所有行（使用完整数据）
    expandedKeys.value = new Set(fullData.map(row => getRowKey(row)));
  }

  // 根据配置选择渲染器
  const rendererType = props.renderer || 'g2';  // 默认使用 'g2' (旧版渲染器)

  if (rendererType === 'g2') {
    // 使用旧版 G2TableRenderer (原生 Canvas)
    console.log('🎨 使用 G2TableRenderer (原生 Canvas)');
    renderer.value = new G2TableRenderer(
      canvasRef.value!,
      props.width,
      props.height,
      theme,
      effectiveSelectable
    );
  } else {
    // 使用新版 G2TableRendererV2 (G2 Mark API)
    console.log('🎨 使用 G2TableRendererV2 (G2 Mark API)');
    renderer.value = new G2TableRendererV2(
      containerRef.value!,
      props.width,
      props.height,
      theme,
      effectiveSelectable
    );
  }

  renderer.value.setData(data, columns);

  // 设置展开行配置
  if (props.expandedRowRender) {
    (renderer.value as any).setExpandConfig({
      expandedKeys: getExpandedKeys(),
      expandedRowRender: props.expandedRowRender,
      expandRowByClick: props.expandRowByClick || false
    });
  }

  // 配置树形数据
  const childrenColumnName = props.childrenColumnName || 'children'
  const hasTreeData = data.some(row => row[childrenColumnName])
  if (hasTreeData) {
    const indentSize = typeof props.indentSize === 'number' ? props.indentSize : 20
    ;(renderer.value as any).setTreeConfig(true, indentSize)

    // 设置每行的层级
    flatData.value.forEach(node => {
      ;(renderer.value as any).setRowLevel(node.index, node.level)
    })
  }

  // ========== 初始化分页管理器 ==========
  if (effectivePagination.value) {
    const paginationConfig = {
      current: effectivePagination.value.current || 1,
      pageSize: effectivePagination.value.pageSize || 10,
      total: data.length,
      pageSizeOptions: effectivePagination.value.pageSizeOptions || [10, 20, 50, 100],
      onChange: handlePageChange,
      onShowSizeChange: handlePageSizeChange
    };

    paginationManager.value = new PaginationManager(paginationConfig, data);
    currentPage.value = paginationConfig.current;
    pageSize.value = paginationConfig.pageSize;
    total.value = data.length;

    console.log('✅ 分页管理器已初始化:', paginationConfig);
    console.log('✅ 分页数据:', { current: currentPage.value, pageSize: pageSize.value, total: total.value });
  } else {
    console.log('⚠️ 分页未启用: effectivePagination =', effectivePagination.value);
  }

  bindEvents();

  // 等待 Vue 响应式更新完成后再渲染
  await nextTick();

  // 强制更新一次 visibleRange
  renderTable();

  // 如果有分页器，等待分页器渲染完成后重新计算容器高度
  if (effectivePagination) {
    await nextTick();

    // 重新获取分页器实际高度
    const actualPaginationHeight = paginationRef.value?.offsetHeight || 60;
    const actualContainerHeight = props.height - headerHeight - actualPaginationHeight;

    console.log('📏 分页器渲染后重新计算:', {
      paginationHeight: actualPaginationHeight,
      containerHeight: actualContainerHeight,
      oldContainerHeight: containerHeight
    });

    // 更新容器高度
    virtualScroll.containerHeight.value = actualContainerHeight;

    // 重新渲染表格
    renderTable();
  }
};

const bindEvents = () => {
  if (!canvasRef.value) return;

  canvasRef.value.addEventListener("click", handleClick);
  canvasRef.value.addEventListener("mousemove", handleMouseMove);
  canvasRef.value.addEventListener("mouseleave", handleMouseLeave);
  canvasRef.value.addEventListener("wheel", handleWheel, { passive: false });
};

const handleClick = (event: MouseEvent) => {
  if (!renderer.value) return;

  const rect = canvasRef.value!.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const cell = hitTest(x, y);

  // 处理表头点击（排序/筛选/复选框）
  if (cell && cell.type === "header" && cell.colIndex !== undefined) {
    const column = props.columns[cell.colIndex];
    if (column) {
      const theme = getTheme();

      // 检查是否是复选框列
      if (column.key === '__checkbox__') {
        // 处理全选/取消全选
        const data = sortedData.value || [];
        if (selectedRows.value.length === data.length && data.length > 0) {
          // 全部选中 -> 取消全选
          selectedRows.value = [];
        } else {
          // 全选
          selectedRows.value = [...data];
        }

        // 同步到渲染器
        const keys = selectedRows.value.map(row => getRowKey(row));
        if (renderer.value) {
          (renderer.value as any).setSelectedRows(keys, getRowKey);
        }

        emit("selection-change", selectedRows.value, keys);
        return;
      }

      const hasSort = column.sortable || (typeof column.sorter === 'boolean' && column.sorter);
      const hasFilter = column.filterable;

      // 检测点击的是哪个图标
      if (hasSort || hasFilter) {
        const iconPadding = 8;
        const iconGap = 4;
        const sortIconWidth = hasSort ? 12 : 0;
        const filterIconWidth = hasFilter ? 14 : 0;

        // 计算当前列的 x 位置
        let colX = 0;
        for (let i = 0; i < cell.colIndex; i++) {
          const w = props.columns[i].width || 120;
          colX += typeof w === 'number' ? w : parseInt(w) || 120;
        }

        // 最后一列可能自动扩展
        let colWidth = column.width || 120;
        colWidth = typeof colWidth === 'number' ? colWidth : parseInt(colWidth) || 120;

        const totalWidth = props.columns.reduce((sum, c) => {
          const w = c.width || 120;
          return sum + (typeof w === 'number' ? w : parseInt(w) || 120);
        }, 0);

        if (cell.colIndex === props.columns.length - 1 && totalWidth < props.width) {
          colWidth = props.width - colX;
        }

        // 图标区域（从右向左）
        const headerHeight = theme.spacing.header;
        let currentIconX = colX + colWidth - iconPadding;

        // 检查筛选图标点击
        if (hasFilter) {
          const iconLeft = currentIconX - filterIconWidth;
          const iconRight = currentIconX;
          if (x >= iconLeft && x <= iconRight &&
              y >= headerHeight / 2 - filterIconWidth / 2 &&
              y <= headerHeight / 2 + filterIconWidth / 2) {
            handleFilter(column);
            return;
          }
          currentIconX -= filterIconWidth + iconGap;
        }

        // 检查排序图标点击
        if (hasSort) {
          const iconLeft = currentIconX - sortIconWidth;
          const iconRight = currentIconX;
          if (x >= iconLeft && x <= iconRight &&
              y >= headerHeight / 2 - sortIconWidth / 2 &&
              y <= headerHeight / 2 + sortIconWidth / 2) {
            handleSort(column);
            return;
          }
        }
      }
    }
    return;
  }

  if (cell && cell.row !== undefined && cell.type === "cell") {
    // 检查是否点击了复选框列
    if (cell.column && cell.column.key === '__checkbox__') {
      console.log('🎯 点击了复选框列!', { row: cell.row, column: cell.column });

      // 切换该行的选择状态
      if (effectiveSelectableType.value === "single") {
        const rowData = sortedData.value[cell.row];
        if (selectedRows.value.length === 1 && selectedRows.value[0] === rowData) {
          selectedRows.value = [];
        } else {
          selectedRows.value = [rowData];
        }
      } else {
        const rowData = sortedData.value[cell.row];
        const index = selectedRows.value.findIndex(
          (row) => getRowKey(row) === getRowKey(rowData)
        );

        if (index !== -1) {
          selectedRows.value.splice(index, 1);
        } else {
          selectedRows.value.push(rowData);
        }
      }

      // 手动触发 selection-change 事件
      const keys = selectedRows.value.map(row => getRowKey(row));

      // 同步到渲染器
      if (renderer.value) {
        console.log('🔄 同步选中状态到渲染器:', keys);
        (renderer.value as any).setSelectedRows(keys, getRowKey);
      }

      console.log('✅ 触发 selection-change 事件:', { count: selectedRows.value.length, keys });
      emit("selection-change", selectedRows.value, keys);
      return;
    }

    emit("cell-click", { cell, originalEvent: event });
    emit("row-click", { row: cell.row, data: sortedData.value[cell.row] });

    // ========== 展开行处理 ==========
    // 展开图标在第一列的左侧
    if (props.expandedRowRender && cell.colIndex === 0) {
      const rowData = sortedData.value[cell.row];
      const rowKey = getRowKey(rowData);

      // 检查是否点击了展开图标区域（左侧28像素）
      if (event.offsetX <= 28) {
        toggleExpand(rowKey);
        return;
      }
    }

    // 如果配置了 expandRowByClick，点击整行都可以展开
    if (props.expandRowByClick && props.expandedRowRender) {
      const rowData = sortedData.value[cell.row];
      const rowKey = getRowKey(rowData);
      toggleExpand(rowKey);
      return;
    }

    if (props.selectable) {
      if (effectiveSelectableType.value === "single") {
        const rowData = sortedData.value[cell.row];
        selectedRows.value = [rowData];
      } else {
        const rowData = sortedData.value[cell.row];
        const index = selectedRows.value.findIndex(
          (row) => getRowKey(row) === getRowKey(rowData)
        );

        if (index !== -1) {
          selectedRows.value.splice(index, 1);
        } else {
          selectedRows.value.push(rowData);
        }
      }

      const keys = selectedRows.value.map(row => getRowKey(row));
      emit("selection-change", selectedRows.value, keys);
    }
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (!renderer.value) return;

  const rect = canvasRef.value!.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const cell = hitTest(x, y);

  // 检测是否悬停在表头图标上
  let hoveringIcon = false;
  if (cell && cell.type === "header" && cell.colIndex !== undefined) {
    const column = props.columns[cell.colIndex];
    if (column) {
      const theme = getTheme();
      const hasSort = column.sortable || (typeof column.sorter === 'boolean' && column.sorter);
      const hasFilter = column.filterable;

      // 图标区域检测
      if (hasSort || hasFilter) {
        const iconPadding = 8;
        const iconGap = 4;
        const sortIconWidth = hasSort ? 12 : 0;
        const filterIconWidth = hasFilter ? 14 : 0;

        // 计算当前列的 x 位置
        let colX = 0;
        for (let i = 0; i < cell.colIndex; i++) {
          const w = props.columns[i].width || 120;
          colX += typeof w === 'number' ? w : parseInt(w) || 120;
        }

        // 最后一列可能自动扩展
        let colWidth = column.width || 120;
        colWidth = typeof colWidth === 'number' ? colWidth : parseInt(colWidth) || 120;

        const totalWidth = props.columns.reduce((sum, c) => {
          const w = c.width || 120;
          return sum + (typeof w === 'number' ? w : parseInt(w) || 120);
        }, 0);

        if (cell.colIndex === props.columns.length - 1 && totalWidth < props.width) {
          colWidth = props.width - colX;
        }

        // 图标区域（从右向左）
        const headerHeight = theme.spacing.header;
        let currentIconX = colX + colWidth - iconPadding;

        // 检查筛选图标
        if (hasFilter) {
          const iconLeft = currentIconX - filterIconWidth;
          const iconRight = currentIconX;
          if (x >= iconLeft && x <= iconRight &&
              y >= headerHeight / 2 - filterIconWidth / 2 &&
              y <= headerHeight / 2 + filterIconWidth / 2) {
            hoveringIcon = true;
          }
          currentIconX -= filterIconWidth + iconGap;
        }

        // 检查排序图标
        if (!hoveringIcon && hasSort) {
          const iconLeft = currentIconX - sortIconWidth;
          const iconRight = currentIconX;
          if (x >= iconLeft && x <= iconRight &&
              y >= headerHeight / 2 - sortIconWidth / 2 &&
              y <= headerHeight / 2 + sortIconWidth / 2) {
            hoveringIcon = true;
          }
        }
      }
    }
  }

  // 设置鼠标样式
  if (canvasRef.value) {
    canvasRef.value.style.cursor = hoveringIcon ? 'pointer' : 'default';
  }

  if (cell && cell.row !== undefined && cell.col !== undefined) {
    hoveredCell.value = cell;
    // 禁用Canvas的hover高亮背景
    // renderer.value.highlightCell(cell);
  } else {
    hoveredCell.value = null;
    // renderer.value?.clearHighlight();
  }
};

const handleMouseLeave = () => {
  hoveredCell.value = null;
  // 禁用Canvas的hover高亮清除
  // renderer.value?.clearHighlight();
};

const handleSort = (column: Column) => {
  // 处理 sorter 类型
  let sorterFn: ((a: any, b: any) => number) | undefined;
  if (typeof column.sorter === 'function') {
    sorterFn = column.sorter;
  } else if (column.sorter && typeof column.sorter === 'object' && 'compare' in column.sorter) {
    sorterFn = column.sorter.compare;
  }

  const newOrder = sortManager.toggleSort(column.key, sorterFn);

  // 更新渲染器的排序状态（用于显示排序图标）
  if (renderer.value) {
    renderer.value.setSortState(column.key, newOrder);
  }

  // 触发排序变化事件
  emit("sort-change", column.key, newOrder);

  // 重新渲染表格
  renderTable();
};

const handleFilter = (column: Column) => {
  // 检查当前是否有筛选条件
  const currentFilter = filterManager.getFilter(column.key);

  if (currentFilter) {
    // 如果有筛选，清除它
    filterManager.clearFilter(column.key);
  } else {
    // 如果没有筛选，设置一个默认的"包含"筛选
    // 这里简化处理，实际应用中可能需要弹出筛选对话框
    filterManager.setFilter({
      field: column.key,
      type: 'contains',
      value: ''  // 空值会清除筛选
    });
  }

  // 更新渲染器的筛选状态（用于显示筛选图标）
  if (renderer.value) {
    const isActive = filterManager.getFilter(column.key) !== undefined;
    (renderer.value as any).setFilterState(column.key, isActive);
  }

  // 触发筛选变化事件
  emit("filter-change", filterManager.getAllFilters());

  // 重新渲染表格
  renderTable();
};

// ========== 分页事件处理 ==========
const handlePageChange = async (page: number, pageSize: number) => {
  console.log('📄 分页变化:', { page, pageSize });

  // 显示加载状态
  isLoading.value = true;

  if (paginationManager.value) {
    paginationManager.value.goToPage(page);
  }

  // 更新当前页
  currentPage.value = page;

  // 触发 change 事件（兼容 a-table）
  if (props.onChange) {
    const pagination = { current: page, pageSize, total: total.value };
    props.onChange(pagination, {}, {});
  }

  // 等待 Vue 响应式更新完成后再渲染
  await nextTick();

  // 等待一小段时间模拟异步加载，让用户看到加载状态
  // 如果数据是从服务器异步获取的，这里应该等待数据加载完成
  await new Promise(resolve => setTimeout(resolve, 300));

  // 重新渲染表格数据
  renderTable();

  // 再等待一帧确保 Canvas 渲染完成
  await nextTick();

  // 隐藏加载状态
  isLoading.value = false;
};

const handlePageSizeChange = async (current: number, size: number) => {
  console.log('📄 每页条数变化:', { current, size });

  // 显示加载状态
  isLoading.value = true;

  if (paginationManager.value) {
    paginationManager.value.changePageSize(size);
  }

  // 更新每页条数
  pageSize.value = size;

  // 触发 change 事件（兼容 a-table）
  if (props.onChange) {
    const pagination = { current, pageSize: size, total: total.value };
    props.onChange(pagination, {}, {});
  }

  // 等待 Vue 响应式更新完成后再渲染
  await nextTick();

  // 等待一小段时间模拟异步加载，让用户看到加载状态
  await new Promise(resolve => setTimeout(resolve, 300));

  // 重新渲染表格数据
  renderTable();

  // 再等待一帧确保 Canvas 渲染完成
  await nextTick();

  // 隐藏加载状态
  isLoading.value = false;
};

// 辅助函数：处理 select change 事件
const handleSelectChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newSize = Number(target.value);
  handlePageSizeChange(currentPage.value, newSize);
};

// 辅助函数：获取分页器高度
const getPaginationHeight = () => {
  if (!effectivePagination || !paginationRef.value) {
    return 0;
  }
  return paginationRef.value.offsetHeight;
};

// 辅助函数：获取可视区域高度
const getVisibleHeight = () => {
  const headerHeight = getTheme().spacing.header;

  // 如果启用虚拟滚动，不考虑分页器高度（因为虚拟滚动模式下分页器会被禁用）
  if (props.virtualScroll) {
    return props.height - headerHeight;
  }

  const paginationHeight = getPaginationHeight();
  return props.height - headerHeight - paginationHeight;
};

const handleWheel = (event: WheelEvent) => {
  event.preventDefault();

  // 检查是否是横向滚动（Shift + 滚轮 或触控板横向滚动）
  if (event.deltaX !== 0 && showHScrollbar.value) {
    const containerWidth = props.width;
    const contentWidth = columnsTotalWidth.value;
    const maxScrollLeft = contentWidth - containerWidth;
    const newScrollLeft = Math.max(0, Math.min(scrollLeft.value + event.deltaX, maxScrollLeft));

    scrollLeft.value = newScrollLeft;
    emit("scroll", { scrollTop: virtualScroll.scrollTop.value, scrollLeft: newScrollLeft });
    renderTable();

    // 横向滚动时隐藏选中框
    if (cellSelection.value.visible) {
      cellSelection.value.visible = false;
    }
    return;
  }

  // 纵向滚动
  if (!props.virtualScroll) return;

  // 动态获取可视区域高度
  const visibleHeight = getVisibleHeight();
  virtualScroll.containerHeight.value = visibleHeight;

  // 计算 scrollTop 边界 - 使用分页后的数据
  const data = paginatedData.value || tableData.value || [];
  const dataLength = data.length;
  const totalHeight = dataLength * getTheme().spacing.cell;
  const maxScrollTop = Math.max(0, totalHeight - visibleHeight);
  const currentScrollTop = virtualScroll.scrollTop.value;

  // 边界检查：如果已经在顶部且继续向上滚动，或在底部且继续向下滚动，阻止事件
  if (currentScrollTop <= 0 && event.deltaY < 0) {
    // 已经在顶部，且继续向上滚动
    return;
  }
  if (currentScrollTop >= maxScrollTop && event.deltaY > 0) {
    // 已经在底部，且继续向下滚动
    return;
  }

  const newScrollTop = Math.max(0, Math.min(currentScrollTop + event.deltaY, maxScrollTop));

  console.log('🖱️ 滚动事件:', {
    deltaY: event.deltaY,
    currentScrollTop,
    newScrollTop,
    maxScrollTop,
    dataLength,
    totalHeight,
    visibleHeight,
    containerHeight: virtualScroll.containerHeight.value,
    cellHeight: getTheme().spacing.cell,
    paginationHeight: getPaginationHeight()
  });

  virtualScroll.virtualScroll.setScrollTop(newScrollTop);

  emit("scroll", { scrollTop: newScrollTop, scrollLeft: scrollLeft.value });
  renderTable();

  // 滚动时隐藏选中框
  if (cellSelection.value.visible) {
    cellSelection.value.visible = false;
  }
};

// 滚动条拖动处理
const handleScrollbarDragStart = (event: MouseEvent) => {
  event.preventDefault();
  scrollbarDragging.value = true;
  scrollbarDragStartY.value = event.clientY;
  scrollbarDragStartScrollTop.value = virtualScroll.scrollTop.value;

  document.addEventListener("mousemove", handleScrollbarDragMove);
  document.addEventListener("mouseup", handleScrollbarDragEnd);
};

const handleScrollbarDragMove = (event: MouseEvent) => {
  if (!scrollbarDragging.value) return;

  // 使用分页后的数据
  const data = paginatedData.value || tableData.value || [];
  const dataLength = data.length;
  const totalHeight = dataLength * getTheme().spacing.cell;

  // 动态获取可视区域高度
  const headerHeight = getTheme().spacing.header;
  let paginationHeight = 0;
  if (!props.virtualScroll) {
    paginationHeight = getPaginationHeight();
  }
  const containerHeight = props.height - headerHeight - paginationHeight;

  const maxScrollTop = Math.max(0, totalHeight - containerHeight);
  const scrollbarHeight = props.height - headerHeight - paginationHeight;
  const thumbHeight = Math.max(30, (containerHeight / totalHeight) * scrollbarHeight);
  const maxThumbTop = scrollbarHeight - thumbHeight;

  const deltaY = event.clientY - scrollbarDragStartY.value;
  const deltaScrollTop = (deltaY / maxThumbTop) * maxScrollTop;
  const newScrollTop = Math.max(0, Math.min(scrollbarDragStartScrollTop.value + deltaScrollTop, maxScrollTop));

  virtualScroll.virtualScroll.setScrollTop(newScrollTop);
  emit("scroll", { scrollTop: newScrollTop, scrollLeft: 0 });
  renderTable();
};

const handleScrollbarDragEnd = () => {
  scrollbarDragging.value = false;
  document.removeEventListener("mousemove", handleScrollbarDragMove);
  document.removeEventListener("mouseup", handleScrollbarDragEnd);
};

// 横向滚动条拖动处理
const handleHScrollbarDragStart = (event: MouseEvent) => {
  event.preventDefault();
  hScrollbarDragging.value = true;
  hScrollbarDragStartX.value = event.clientX;
  hScrollbarDragStartScrollLeft.value = scrollLeft.value;

  document.addEventListener("mousemove", handleHScrollbarDragMove);
  document.addEventListener("mouseup", handleHScrollbarDragEnd);
};

const handleHScrollbarDragMove = (event: MouseEvent) => {
  if (!hScrollbarDragging.value || !showHScrollbar.value) return;

  const containerWidth = props.width;
  const contentWidth = columnsTotalWidth.value;
  const maxScrollLeft = contentWidth - containerWidth;
  const scrollbarWidth = containerWidth;
  const thumbWidth = Math.max(30, (containerWidth / contentWidth) * scrollbarWidth);
  const maxThumbLeft = scrollbarWidth - thumbWidth;

  const deltaX = event.clientX - hScrollbarDragStartX.value;
  const deltaScrollLeft = (deltaX / maxThumbLeft) * maxScrollLeft;
  const newScrollLeft = Math.max(0, Math.min(hScrollbarDragStartScrollLeft.value + deltaScrollLeft, maxScrollLeft));

  scrollLeft.value = newScrollLeft;
  emit("scroll", { scrollTop: virtualScroll.scrollTop.value, scrollLeft: newScrollLeft });
  renderTable();
};

const handleHScrollbarDragEnd = () => {
  hScrollbarDragging.value = false;
  document.removeEventListener("mousemove", handleHScrollbarDragMove);
  document.removeEventListener("mouseup", handleHScrollbarDragEnd);
};

const hitTest = (x: number, y: number) => {
  const columns = props.columns || [];
  const data = sortedData.value || [];
  const { startIndex } = virtualScroll.visibleRange.value;
  const headerHeight = getTheme().spacing.header;
  const cellHeight = getTheme().spacing.cell;

  // 表头点击检测
  if (y < headerHeight) {
    let currentX = 0;
    for (let i = 0; i < columns.length; i++) {
      const colWidth = getColumnWidth(columns[i]);

      // 最后一列可能自动扩展
      let actualWidth = colWidth;
      if (i === columns.length - 1) {
        const totalWidth = columns.reduce((sum, col) => sum + getColumnWidth(col), 0);
        if (totalWidth < props.width) {
          actualWidth = props.width - currentX;
        }
      }

      if (x >= currentX && x < currentX + actualWidth) {
        return {
          type: "header",
          colIndex: i,
          column: columns[i],
          y
        };
      }

      currentX += colWidth;
    }
    return { type: "header", y };
  }

  const rowIndex = Math.floor((y - headerHeight) / cellHeight) + startIndex;

  if (rowIndex < 0 || rowIndex >= data.length) {
    return null;
  }

  let currentX = 0;
  for (let i = 0; i < columns.length; i++) {
    const colWidth = getColumnWidth(columns[i]);

    // 最后一列可能自动扩展
    let actualWidth = colWidth;
    if (i === columns.length - 1) {
      const totalWidth = columns.reduce((sum, col) => sum + getColumnWidth(col), 0);
      if (totalWidth < props.width) {
        actualWidth = props.width - currentX;
      }
    }

    if (x >= currentX && x < currentX + actualWidth) {
      return {
        type: "cell",
        row: rowIndex,
        col: i,
        x: currentX,
        y: headerHeight + (rowIndex - startIndex) * cellHeight,
        width: actualWidth,
        height: cellHeight,
        data: sortedData.value[rowIndex],
        column: columns[i],
      };
    }

    currentX += colWidth;
  }

  return null;
};

const renderTable = () => {
  if (!renderer.value) {
    console.warn('⚠️ renderTable: renderer 未初始化');
    return;
  }

  const { startIndex, endIndex } = virtualScroll.visibleRange.value;

  console.log('🎨 renderTable 调用:', {
    startIndex,
    endIndex,
    scrollTop: virtualScroll.scrollTop.value
  });

  // 设置滚动位置
  renderer.value.setScrollTop(virtualScroll.scrollTop.value);
  renderer.value.setScrollLeft(scrollLeft.value);
  renderer.value.setVisibleData(startIndex, endIndex);
};

const handleScroll = (scrollTop: number) => {
  virtualScroll.virtualScroll.setScrollTop(scrollTop);
  renderTable();
};

watch(
  () => [props.data, props.dataSource, currentPage, pageSize] as const,
  () => {
    const data = paginatedData.value || [];
    const columns = props.columns || [];
    console.log('🔄 数据变化，更新虚拟滚动:', {
      dataLength: data.length,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      columnsLength: columns.length
    });
    virtualScroll.virtualScroll.setDataCount(data.length);
    if (renderer.value) {
      renderer.value.setData(data, columns);
    }
    renderTable();
  },
  { deep: true }
);

watch(
  () => props.columns,
  () => {
    const data = paginatedData.value || [];
    const columns = props.columns || [];
    if (renderer.value) {
      renderer.value.setData(data, columns);
    }
    renderTable();
  },
  { deep: true }
);

watch(
  () => props.theme,
  () => {
    // 更新主题管理器
    if (typeof props.theme === 'string') {
      setTheme(props.theme as ThemePreset);
    } else if (props.theme) {
      setTheme(props.theme);
    }
    if (renderer.value) {
      renderer.value.setTheme(getTheme());
      renderTable();
    }
  },
  { deep: true }
);

// 监听宽度变化，动态调整表格大小
watch(
  () => props.width,
  async (newWidth, oldWidth) => {
    // 只在宽度真正改变时才处理（避免频繁触发）
    if (newWidth === oldWidth || !renderer.value || newWidth <= 0) {
      return;
    }

    const theme = getTheme();
    const headerHeight = theme.spacing.header;

    // 先保存数据引用 - 使用分页后的数据
    const data = paginatedData.value || [];
    const columns = props.columns || [];
    const dataLength = data.length;

    // 如果启用虚拟滚动，不考虑分页器高度
    let paginationHeight = 0;
    if (!props.virtualScroll) {
      paginationHeight = getPaginationHeight();
    }

    // 重要：先更新数据计数，再更新容器高度
    virtualScroll.virtualScroll.setDataCount(dataLength);
    virtualScroll.containerHeight.value = props.height - headerHeight - paginationHeight;

    renderer.value.resize(newWidth, props.height);
    renderer.value.setData(data, columns);

    // 等待 Vue 响应式更新完成后再渲染
    await nextTick();
    renderTable();
  }
);

// 监听高度变化，动态调整表格大小
watch(
  () => props.height,
  async (newHeight, oldHeight) => {
    // 只在高度真正改变时才处理
    if (newHeight === oldHeight || !renderer.value || newHeight <= 0) {
      return;
    }

    const theme = getTheme();
    const headerHeight = theme.spacing.header;

    // 使用分页后的数据
    const data = paginatedData.value || [];
    const columns = props.columns || [];
    const dataLength = data.length;

    // 如果启用虚拟滚动，不考虑分页器高度
    let paginationHeight = 0;
    if (!props.virtualScroll) {
      paginationHeight = getPaginationHeight();
    }

    virtualScroll.virtualScroll.setDataCount(dataLength);
    virtualScroll.containerHeight.value = newHeight - headerHeight - paginationHeight;

    renderer.value.resize(props.width, newHeight);
    renderer.value.setData(data, columns);

    await nextTick();
    renderTable();
  }
);

// 监听 selectedRows 变化，同步到渲染器
watch(
  () => selectedRows.value,
  (newSelectedRows) => {
    if (renderer.value) {
      const keys = newSelectedRows.map(row => getRowKey(row));
      (renderer.value as any).setSelectedRows(keys, getRowKey);
    }
  },
  { deep: true }
);

// 监听分页状态变化（调试用）
watch(
  () => [total.value, currentPage.value, pageSize.value, effectivePagination.value],
  ([newTotal, newCurrent, newPageSize, effectivePagination]) => {
    const totalNum = newTotal as number;
    const pageSizeNum = newPageSize as number;
    const totalPages = (pageSizeNum && totalNum) ? Math.ceil(totalNum / pageSizeNum) : 0;
    console.log('🔄 分页状态变化:', {
      total: totalNum,
      current: newCurrent,
      pageSize: pageSizeNum,
      effectivePagination,
      totalPages
    });
  },
  { deep: true }
);

// 监听虚拟滚动变化，滚动时隐藏选中框
// 注释掉：现在选中框位置是根据滚动实时计算的，不需要自动隐藏
// 监听虚拟滚动变化，滚动时清除选中框和hover状态
watch(
  () => virtualScroll.scrollTop.value,
  () => {
    // 滚动时清除选中框，避免位置错乱
    if (cellSelection.value.visible && !cellSelecting.value) {
      cellSelection.value.visible = false;
    }
    // 滚动时清除hover状态
    cellHover.value.visible = false;
  }
);

// 监听横向滚动变化
watch(
  () => scrollLeft.value,
  () => {
    // 横向滚动时清除选中框，避免位置错乱
    if (cellSelection.value.visible && !cellSelecting.value) {
      cellSelection.value.visible = false;
    }
    // 横向滚动时清除hover状态
    cellHover.value.visible = false;
  }
);

// 监听单元格选中状态变化，同步到 Canvas 渲染器
watch(
  () => cellSelection.value,
  (newSelection) => {
    if (renderer.value) {
      const selection = newSelection.visible
        ? {
            visible: true,
            startRow: newSelection.startRow,
            startCol: newSelection.startCol,
            endRow: newSelection.endRow,
            endCol: newSelection.endCol,
          }
        : null;

      (renderer.value as any).setCellSelection(selection);
    }
  },
  { deep: true }
);

onMounted(() => {
  console.log('🎯 CTable 已挂载');

  // 初始化加载组件
  loadingComponent.value = createLoadingComponent(
    {
      spinning: isLoading,
      tip: loadingTip,
      size: 'default'
    }
  );

  initTable();
});

onBeforeUnmount(() => {
  // 清理事件监听器，防止内存泄漏
  if (canvasRef.value) {
    canvasRef.value.removeEventListener("click", handleClick);
    canvasRef.value.removeEventListener("mousemove", handleMouseMove);
    canvasRef.value.removeEventListener("mouseleave", handleMouseLeave);
    canvasRef.value.removeEventListener("wheel", handleWheel);
  }

  // 销毁渲染器
  renderer.value?.destroy();
});

defineExpose({
  scrollTo: handleScroll,

  // ========== 选择相关 ==========
  getSelectedRows: () => selectedRows.value,

  clearSelection: () => {
    selectedRows.value = [];
    if (renderer.value) {
      renderer.value?.clearSelection();
    }
    emit("selection-change", [], []);
  },

  toggleRowSelection: (rowKey: string) => {
    const row = sortedData.value.find(r => getRowKey(r) === rowKey);
    if (!row) return;

    const index = selectedRows.value.findIndex(r => getRowKey(r) === rowKey);
    if (index !== -1) {
      selectedRows.value.splice(index, 1);
    } else {
      if (effectiveSelectableType.value === "single") {
        selectedRows.value = [row];
      } else {
        selectedRows.value.push(row);
      }
    }

    const keys = selectedRows.value.map(r => getRowKey(r));
    emit("selection-change", selectedRows.value, keys);
    renderTable();
  },

  selectAll: () => {
    if (effectiveSelectableType.value === "single") {
      return; // 单选模式不支持全选
    }

    const data = sortedData.value;
    selectedRows.value = [...data];

    const keys = data.map(r => getRowKey(r));
    emit("selection-change", selectedRows.value, keys);
    renderTable();
  },

  deselectAll: () => {
    selectedRows.value = [];
    emit("selection-change", [], []);
    renderTable();
  },

  // ========== 筛选相关 ==========
  clearFilters: () => {
    filterManager.clearAll();
    if (renderer.value) {
      renderer.value.clearAllFilterStates();
    }
    emit("filter-change", []);
    renderTable();
  },

  // ========== 表格操作 ==========
  refresh: () => {
    renderTable();
  },

  // ========== 展开相关 ==========
  getExpandedKeys: () => getExpandedKeys(),

  setExpandedKeys: (keys: string[]) => {
    expandedKeys.value = new Set(keys);
    if (props.expandedRowRender && renderer.value) {
      (renderer.value as any).updateExpandedKeys(keys);
    }
    renderTable();
  },

  expandAll: () => {
    const allKeys = tableData.value.map(row => getRowKey(row));
    expandedKeys.value = new Set(allKeys);
    if (props.expandedRowRender && renderer.value) {
      (renderer.value as any).updateExpandedKeys(allKeys);
    }
    renderTable();
  },

  collapseAll: () => {
    expandedKeys.value.clear();
    if (props.expandedRowRender && renderer.value) {
      (renderer.value as any).updateExpandedKeys([]);
    }
    renderTable();
  }
});
</script>

<style scoped>
.ctable-container {
  position: relative;
  overflow: hidden;
  overscroll-behavior: none;
  touch-action: none;
}

.ctable-canvas {
  display: block;
  cursor: cell;
}

/* 单元格 hover - 四条边框 */
.ctable-hover-border-top,
.ctable-hover-border-bottom,
.ctable-hover-border-left,
.ctable-hover-border-right {
  position: absolute;
  pointer-events: none;
}

/* 单元格选中框 - 四条边 */
.ctable-selection-border-top,
.ctable-selection-border-bottom,
.ctable-selection-border-left,
.ctable-selection-border-right {
  position: absolute;
  pointer-events: none;
}

/* HTML 表头 */
.ctable-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  overflow: hidden;
  z-index: 100;
  background-color: #fafafa;
}

.ctable-header-cell {
  flex-shrink: 0;
  box-sizing: border-box;
  position: relative;
  transition: background-color 0.2s;
}


.ctable-header-cell-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0 16px;
}

.ctable-header-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.ctable-header-sort {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  margin-left: 4px;
}

.ctable-sort-icon {
  font-size: 10px;
  line-height: 1;
  opacity: 0.25;
  color: #bfbfbf;
  transition: all 0.2s;
}

.ctable-header-cell:hover .ctable-sort-icon {
  opacity: 0.45;
  color: #bfbfbf;
}

.ctable-sort-ascend,
.ctable-sort-descend {
  opacity: 1 !important;
  color: #1890ff !important;
}

.ctable-header-filter {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.ctable-filter-icon {
  font-size: 12px;
  opacity: 0.25;
  color: #bfbfbf;
  cursor: pointer;
  transition: all 0.2s;
}

.ctable-filter-icon:hover {
  opacity: 0.65;
  color: #8c8c8c;
}

.ctable-header-cell:hover .ctable-filter-icon {
  opacity: 0.45;
}

.ctable-filter-active {
  opacity: 1 !important;
  color: #1890ff !important;
}

/* 复选框样式 */
.ctable-header-cell input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #1890ff;
}

.ctable-scrollbar {
  transition: opacity 0.2s;
  opacity: 0;
}

.ctable-container:hover .ctable-scrollbar {
  opacity: 1;
}

.scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3) !important;
}

.ctable-hscrollbar {
  transition: opacity 0.2s;
  opacity: 0;
}

.ctable-container:hover .ctable-hscrollbar {
  opacity: 1;
}

.ctable-hscrollbar-thumb {
  transition: background-color 0.2s;
}

.ctable-hscrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3) !important;
}

/* 分页器容器 */
.ctable-pagination-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #ffffff;
  border-top: 1px solid #f0f0f0;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* CPagination 组件样式已内置在 CPagination.vue 中 */

/* 加载动画 */
@keyframes ctable-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.ctable-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.ctable-loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: ctable-spin 1s linear infinite;
}
</style>
