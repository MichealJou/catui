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
    <!-- 图标层 -->
    <div class="ctable-icons" :style="iconsStyle">
      <div
        v-for="icon in headerIcons"
        :key="icon.key"
        class="ctable-icon"
        :style="{ left: `${icon.x}px`, top: `${icon.y}px` }"
        @click.stop="handleIconClick(icon)"
      >
        <Icon :icon="icon.name" :width="16" :height="16" />
      </div>
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
  type CSSProperties,
} from "vue";
import { Icon } from '@iconify/vue'
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
  "selection-change": [selection: any[]];
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

// 图标相关
interface HeaderIcon {
  key: string;
  name: string;
  x: number;
  y: number;
  column?: Column;
  type: 'sort' | 'filter';
}

const headerIcons = computed<HeaderIcon[]>(() => {
  const icons: HeaderIcon[] = [];
  const columns = props.columns || [];
  const theme = getTheme();

  let currentX = 0;
  columns.forEach((col, colIndex) => {
    const colWidth = col.width || 120;

    // 最后一列可能自动扩展
    let actualWidth = colWidth;
    if (colIndex === columns.length - 1) {
      const totalWidth = columns.reduce((sum, c) => sum + (c.width || 120), 0);
      if (totalWidth < props.width) {
        actualWidth = props.width - currentX;
      }
    }

    // 添加排序图标
    if (col.sortable) {
      const sortOrder = sortManager.getSortState(col.key);
      let iconName = 'mdi:sort';
      if (sortOrder === 'asc') iconName = 'mdi:sort-ascending';
      else if (sortOrder === 'desc') iconName = 'mdi:sort-descending';

      icons.push({
        key: `sort-${col.key}`,
        name: iconName,
        x: currentX + actualWidth - 36,
        y: theme.spacing.header / 2,
        column: col,
        type: 'sort'
      });
    }

    // 添加筛选图标
    if (col.filterable) {
      const offset = col.sortable ? 20 : 0;
      const hasFilter = filterManager.getActiveFilters(col.key).length > 0;
      const iconName = hasFilter ? 'mdi:filter' : 'mdi:filter-outline';

      icons.push({
        key: `filter-${col.key}`,
        name: iconName,
        x: currentX + actualWidth - 20 - offset,
        y: theme.spacing.header / 2,
        column: col,
        type: 'filter'
      });
    }

    currentX += colWidth;
  });

  return icons;
});

const iconsStyle = computed<CSSProperties>(() => ({
  position: 'absolute' as 'absolute',
  top: '0px',
  left: '0px',
  width: `${props.width}px`,
  height: `${getTheme().spacing.header}px`,
  pointerEvents: 'none' as 'none',
}));

const handleIconClick = (icon: HeaderIcon) => {
  if (!icon.column) return;

  if (icon.type === 'sort' && icon.column.sortable) {
    handleSort(icon.column);
  } else if (icon.type === 'filter' && icon.column.filterable) {
    // TODO: 打开筛选菜单
    console.log('Filter clicked:', icon.column.key);
  }
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
  const cellHeight = theme.spacing.cell || 55;
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

  // 处理表头点击（排序）
  if (cell && cell.type === "header" && cell.colIndex !== undefined) {
    const column = props.columns[cell.colIndex];
    if (column && column.sortable) {
      handleSort(column);
    }
    return;
  }

  if (cell && cell.row !== undefined && cell.type === "cell") {
    emit("cell-click", { cell, originalEvent: event });
    emit("row-click", { row: cell.row, data: sortedData.value[cell.row] });

    if (props.selectable) {
      if (props.selectableType === "single") {
        const rowData = sortedData.value[cell.row];
        selectedRows.value = [rowData];
      } else {
        const rowData = sortedData.value[cell.row];
        const index = selectedRows.value.findIndex(
          (row) => row[props.rowKey] === rowData[props.rowKey]
        );

        if (index !== -1) {
          selectedRows.value.splice(index, 1);
        } else {
          selectedRows.value.push(rowData);
        }
      }

      emit("selection-change", selectedRows.value);
    }
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (!renderer.value) return;

  const rect = canvasRef.value!.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const cell = hitTest(x, y);


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
  const newOrder = sortManager.toggleSort(column.key, column.sorter);

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
      const colWidth = columns[i].width || 120;

      // 最后一列可能自动扩展
      let actualWidth = colWidth;
      if (i === columns.length - 1) {
        const totalWidth = columns.reduce((sum, col) => sum + (col.width || 120), 0);
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
    const colWidth = columns[i].width || 120;

    // 最后一列可能自动扩展
    let actualWidth = colWidth;
    if (i === columns.length - 1) {
      const totalWidth = columns.reduce((sum, col) => sum + (col.width || 120), 0);
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
    emit("selection-change", []);
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

.ctable-icons {
  pointer-events: none;
}

.ctable-icon {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  pointer-events: auto;
  color: rgba(0, 0, 0, 0.45);
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ctable-icon:hover {
  color: rgba(0, 0, 0, 0.88);
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
