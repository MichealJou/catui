<template>
  <div
    ref="containerRef"
    class="ctable-container"
    :style="containerStyle"
  >
    <canvas
      ref="canvasRef"
      class="ctable-canvas"
      :width="width"
      :height="height"
    />
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
  type CSSProperties,
} from "vue";
import type { CTableProps, Column, SortOrder, FilterCondition, ThemePreset } from "../types";
import { G2TableRenderer } from "../core/G2TableRenderer";
import { useVirtualScroll } from "../core/VirtualScroll";
import { useThemeManager, DEFAULT_THEME } from "../core/ThemeManager";
import { SortManager } from "../core/SortManager";
import { FilterManager } from "../core/FilterManager";

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
});

const emit = defineEmits<{
  "cell-click": [event: any];
  "row-click": [event: any];
  "selection-change": [selectedRows: any[], selectedKeys: any[]];
  scroll: [event: any];
  "sort-change": [field: string, order: SortOrder];
  "filter-change": [filters: FilterCondition[]];
}>();

const containerRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();

// 主题管理器 - 支持预设或自定义主题
const initialTheme = props.theme || DEFAULT_THEME
const { themeManager, setTheme, getTheme } = useThemeManager(initialTheme);

// 如果 props.theme 是预设名称，应用它
if (typeof props.theme === 'string') {
  setTheme(props.theme as ThemePreset)
} else if (props.theme) {
  setTheme(props.theme)
}

const renderer = ref<G2TableRenderer>();
const virtualScroll = useVirtualScroll(getTheme().spacing.cell);
const sortManager = new SortManager();
const filterManager = new FilterManager();

const selectedRows = ref<any[]>([]);
const hoveredCell = ref<any>(null);

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

const containerStyle = computed<CSSProperties>(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  position: "relative" as "relative",
  overflow: "hidden" as "hidden",
  backgroundColor: getTheme().colors.background,
}));

// 是否显示滚动条
const showScrollbar = computed(() => {
  if (!props.virtualScroll || !tableData.value || !tableData.value.length) return false;
  const totalHeight = tableData.value.length * getTheme().spacing.cell;
  const containerHeight = props.height - getTheme().spacing.header;
  return totalHeight > containerHeight;
});

// 滚动条样式
const scrollbarStyle = computed<CSSProperties>(() => {
  // 表格已完全填充容器宽度（最后一列自动扩展）
  // 滚动条紧贴容器右边缘，与 ant-design-vue 表格样式一致
  return {
    position: "absolute" as "absolute",
    right: "0px",
    top: `${getTheme().spacing.header}px`,
    width: "10px",
    height: `${props.height - getTheme().spacing.header}px`,
    backgroundColor: "transparent",
    cursor: "pointer",
  };
});

// 滚动条滑块样式
const scrollbarThumbStyle = computed<CSSProperties>(() => {
  if (!tableData.value || !tableData.value.length) {
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

  const totalHeight = tableData.value.length * getTheme().spacing.cell;
  const containerHeight = props.height - getTheme().spacing.header;
  const maxScrollTop = Math.max(0, totalHeight - containerHeight);
  const scrollbarHeight = props.height - getTheme().spacing.header;
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
  return columns.reduce((sum, col) => sum + (col.width || 120), 0);
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

// 先筛选，再排序
const sortedData = computed(() => {
  const data = tableData.value || [];
  const filtered = filterManager.filterData(data);
  return sortManager.sortData(filtered);
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
  const data = tableData.value || [];
  const columns = props.columns || [];
  const dataLength = data.length;

  // 重要：先更新数据计数，再更新容器高度
  virtualScroll.virtualScroll.setDataCount(dataLength);
  virtualScroll.containerHeight.value = props.height - headerHeight;

  renderer.value = new G2TableRenderer(
    canvasRef.value,
    props.width,
    props.height,
    theme,
    props.selectable
  );

  renderer.value.setData(data, columns);

  bindEvents();

  // 等待 Vue 响应式更新完成后再渲染
  await nextTick();

  // 强制更新一次 visibleRange
  renderTable();
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
        emit("selection-change", selectedRows.value, []);
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
      // 切换该行的选择状态
      if (props.selectableType === "single") {
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
      emit("selection-change", selectedRows.value, keys);
      return;
    }

    emit("cell-click", { cell, originalEvent: event });
    emit("row-click", { row: cell.row, data: sortedData.value[cell.row] });

    if (props.selectable) {
      if (props.selectableType === "single") {
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
    renderer.value.highlightCell(cell);
  } else {
    hoveredCell.value = null;
    renderer.value?.clearHighlight();
  }
};

const handleMouseLeave = () => {
  hoveredCell.value = null;
  renderer.value?.clearHighlight();
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
    return;
  }

  // 纵向滚动
  if (!props.virtualScroll) return;

  // 计算 scrollTop 边界
  const dataLength = tableData.value?.length || 0;
  const totalHeight = dataLength * getTheme().spacing.cell;
  const maxScrollTop = Math.max(0, totalHeight - virtualScroll.containerHeight.value);
  const newScrollTop = Math.max(0, Math.min(virtualScroll.scrollTop.value + event.deltaY, maxScrollTop));

  virtualScroll.scrollTop.value = newScrollTop;

  emit("scroll", { scrollTop: newScrollTop, scrollLeft: scrollLeft.value });
  renderTable();
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

  const dataLength = tableData.value?.length || 0;
  const totalHeight = dataLength * getTheme().spacing.cell;
  const containerHeight = props.height - getTheme().spacing.header;
  const maxScrollTop = Math.max(0, totalHeight - containerHeight);
  const scrollbarHeight = props.height - getTheme().spacing.header;
  const thumbHeight = Math.max(30, (containerHeight / totalHeight) * scrollbarHeight);
  const maxThumbTop = scrollbarHeight - thumbHeight;

  const deltaY = event.clientY - scrollbarDragStartY.value;
  const deltaScrollTop = (deltaY / maxThumbTop) * maxScrollTop;
  const newScrollTop = Math.max(0, Math.min(scrollbarDragStartScrollTop.value + deltaScrollTop, maxScrollTop));

  virtualScroll.scrollTop.value = newScrollTop;
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
  if (!renderer.value) return;

  const { startIndex, endIndex } = virtualScroll.visibleRange.value;

  // 设置横向滚动位置
  renderer.value.setScrollLeft(scrollLeft.value);
  renderer.value.setVisibleData(startIndex, endIndex);
};

const handleScroll = (scrollTop: number) => {
  virtualScroll.scrollTop.value = scrollTop;
  renderTable();
};

watch(
  () => [props.data, props.dataSource] as const,
  () => {
    const data = tableData.value || [];
    const columns = props.columns || [];
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
    const data = tableData.value || [];
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

    // 先保存数据引用
    const data = tableData.value || [];
    const columns = props.columns || [];
    const dataLength = data.length;

    // 重要：先更新数据计数，再更新容器高度
    virtualScroll.virtualScroll.setDataCount(dataLength);
    virtualScroll.containerHeight.value = props.height - headerHeight;

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

    const data = tableData.value || [];
    const columns = props.columns || [];
    const dataLength = data.length;

    virtualScroll.virtualScroll.setDataCount(dataLength);
    virtualScroll.containerHeight.value = newHeight - headerHeight;

    renderer.value.resize(props.width, newHeight);
    renderer.value.setData(data, columns);

    await nextTick();
    renderTable();
  }
);

onMounted(() => {
  initTable();
});

onBeforeUnmount(() => {
  renderer.value?.destroy();
});

defineExpose({
  scrollTo: handleScroll,
  getSelectedRows: () => selectedRows.value,
  clearSelection: () => {
    selectedRows.value = [];
    renderer.value?.clearSelection();
    emit("selection-change", [], []);
  },
  clearFilters: () => {
    filterManager.clearAll();
    if (renderer.value) {
      renderer.value.clearAllFilterStates();
    }
    emit("filter-change", []);
    renderTable();
  },
  refresh: () => {
    renderTable();
  },
});
</script>

<style scoped>
.ctable-container {
  position: relative;
  overflow: hidden;
}

.ctable-canvas {
  display: block;
}

.ctable-scrollbar {
  transition: opacity 0.2s;
}

.custom-scrollbar:hover {
  opacity: 1 !important;
}

.scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3) !important;
}

.ctable-hscrollbar {
  transition: opacity 0.2s;
}

.ctable-hscrollbar-thumb {
  transition: background-color 0.2s;
}

.ctable-hscrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3) !important;
}
</style>
