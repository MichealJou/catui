# Excel 风格单元格选中功能

> **实施日期**: 2026-02-10
> **目标**: 实现 Excel 风格的单元格拖动选择功能
> **状态**: ✅ 已完成

---

## 🎯 功能描述

实现类似 Excel 的单元格选中功能：
- ✅ 鼠标点击选中单个单元格
- ✅ 鼠标拖动选中矩形区域
- ✅ 蓝色边框高亮显示
- ✅ 半透明蓝色背景
- ✅ 支持横向滚动
- ✅ 支持虚拟滚动

---

## 🎨 视觉效果

### 选中框样式

```css
.ctable-cell-selection {
  position: absolute;
  border: 2px solid #1890ff;
  background-color: rgba(24, 144, 255, 0.05);
  pointer-events: none;
  transition: all 0.1s ease;
  box-shadow: 0 0 4px rgba(24, 144, 255, 0.3);
}
```

**视觉效果**：
- 蓝色边框（#1890ff）
- 浅蓝色背景（5% 透明度）
- 平滑过渡动画
- 柔和阴影效果

---

## 🔧 实现细节

### 1. 数据结构

```typescript
const cellSelection = ref({
  visible: false,      // 是否显示选中框
  startRow: 0,        // 起始行索引
  startCol: 0,        // 起始列索引
  endRow: 0,          // 结束行索引
  endCol: 0,          // 结束列索引
});

const cellSelecting = ref(false);  // 是否正在拖动选择
```

### 2. 鼠标事件处理

#### mousedown - 开始选择

```typescript
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
```

#### mousemove - 更新选中区域

```typescript
const handleCellMouseMove = (event: MouseEvent) => {
  if (!cellSelecting.value) return;

  const rect = canvasRef.value!.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const cell = getCellFromPosition(x, y);
  if (!cell) return;

  // 限制在可见数据范围内
  const maxRow = (paginatedData.value?.length || 0) - 1;
  const maxCol = props.columns.length - 1;

  cellSelection.value.endRow = Math.max(0, Math.min(cell.rowIndex, maxRow));
  cellSelection.value.endCol = Math.max(0, Math.min(cell.colIndex, maxCol));
};
```

#### mouseup - 结束选择

```typescript
const handleCellMouseUp = () => {
  cellSelecting.value = false;
};
```

### 3. 单元格坐标计算

```typescript
const getCellFromPosition = (x: number, y: number) => {
  const theme = getTheme();
  const headerHeight = theme.spacing.header;
  const cellHeight = theme.spacing.cell;

  // 检查是否在表头区域
  if (y < headerHeight) {
    return null;
  }

  // 计算行索引
  const absoluteRowIndex = Math.floor((y - headerHeight) / cellHeight);

  // 处理虚拟滚动
  if (props.virtualScroll && renderer.value) {
    const startIndex = renderer.value.startIndex;
    const rowIndex = absoluteRowIndex - startIndex;

    if (rowIndex < 0 || rowIndex >= paginatedData.value.length) {
      return null;
    }

    // 计算列索引（考虑横向滚动）
    let colIndex = 0;
    let currentX = -scrollLeft.value;
    for (let i = 0; i < props.columns.length; i++) {
      const colWidth = props.columns[i]?.width || 120;
      if (x >= currentX && x < currentX + colWidth) {
        colIndex = i;
        break;
      }
      currentX += colWidth;
    }

    return { rowIndex: absoluteRowIndex, colIndex };
  }

  // ... 非虚拟滚动模式
};
```

### 4. 选中框位置计算

```typescript
const cellSelectionStyle = computed<CSSProperties>(() => {
  const { startRow, startCol, endRow, endCol } = cellSelection.value;

  // 确保 startRow/Col <= endRow/Col
  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);
  const minCol = Math.min(startCol, endCol);
  const maxCol = Math.max(startCol, endCol);

  // 计算选中框位置
  let startX = -scrollLeft.value;
  for (let i = 0; i < minCol; i++) {
    startX += props.columns[i]?.width || 120;
  }

  let endX = startX;
  for (let i = minCol; i <= maxCol; i++) {
    endX += props.columns[i]?.width || 120;
  }

  const width = endX - startX;
  const height = (maxRow - minRow + 1) * cellHeight;

  // 考虑虚拟滚动的偏移
  let topY = headerHeight + (minRow * cellHeight);
  if (props.virtualScroll) {
    const scrollOffset = virtualScroll.scrollTop.value % cellHeight;
    topY -= scrollOffset;
  }

  return {
    position: "absolute",
    left: `${startX}px`,
    top: `${topY}px`,
    width: `${width}px`,
    height: `${height}px`,
    border: "2px solid #1890ff",
    backgroundColor: "rgba(24, 144, 255, 0.05)",
    pointerEvents: "none",
    zIndex: 50,
  };
});
```

---

## 📝 模板结构

```vue
<template>
  <div class="ctable-container">
    <!-- HTML 表头 -->
    <div class="ctable-header">...</div>

    <!-- 单元格选中框 -->
    <div
      v-if="cellSelection.visible"
      class="ctable-cell-selection"
      :style="cellSelectionStyle"
    ></div>

    <!-- Canvas -->
    <canvas
      ref="canvasRef"
      class="ctable-canvas"
      @mousedown="handleCellMouseDown"
      @mousemove="handleCellMouseMove"
      @mouseup="handleCellMouseUp"
    />
  </div>
</template>
```

---

## 🎯 使用示例

### 单元格选择

1. **单击选择单个单元格**
   - 鼠标点击任意单元格
   - 显示蓝色边框选中该单元格

2. **拖动选择区域**
   - 鼠标按下并拖动
   - 实时更新选中区域
   - 松开鼠标完成选择

3. **滚动时保持选中**
   - 选中框随滚动移动
   - 横向滚动时正确调整位置
   - 纵向滚动时正确调整位置

---

## 🔬 技术亮点

### 1. 坐标系统

- **绝对坐标**：基于整个数据集的行索引
- **相对坐标**：相对于可视区域的列索引
- **滚动偏移**：考虑横向和纵向滚动偏移

### 2. 性能优化

- **pointerEvents: none**：选中框不干扰鼠标事件
- **计算属性**：自动响应滚动变化
- **边界检查**：限制在可见数据范围内

### 3. 兼容性

- ✅ 虚拟滚动模式
- ✅ 非虚拟滚动模式
- ✅ 横向滚动
- ✅ 动态列宽

---

## 📁 修改的文件

### CTable.vue

**模板部分**：
- 添加 `.ctable-cell-selection` 选中框 div
- Canvas 添加鼠标事件监听

**脚本部分**：
- 添加 `cellSelection` 状态
- 添加 `cellSelecting` 状态
- 添加 `cellSelectionStyle` 计算属性
- 添加 `getCellFromPosition` 方法
- 添加 `handleCellMouseDown` 方法
- 添加 `handleCellMouseMove` 方法
- 添加 `handleCellMouseUp` 方法

**样式部分**：
- 添加 `.ctable-cell-selection` 样式
- Canvas 添加 `cursor: cell` 样式

---

## 🧪 测试场景

### 1. 基本选择

**测试步骤**：
1. 点击单元格
2. 拖动选择多个单元格
3. 松开鼠标

**预期结果**：
- ✅ 显示蓝色选中框
- ✅ 正确覆盖选中的单元格
- ✅ 平滑的视觉效果

### 2. 滚动场景

**测试步骤**：
1. 选中一些单元格
2. 横向滚动
3. 纵向滚动

**预期结果**：
- ✅ 选中框随滚动移动
- ✅ 位置始终正确

### 3. 边界情况

**测试步骤**：
1. 拖动到表头区域
2. 拖动超出数据范围
3. 快速拖动

**预期结果**：
- ✅ 不会超出有效范围
- ✅ 表头区域不会被选中

---

## 🎨 视觉规范

### 选中框颜色

| 状态 | 颜色 | 说明 |
|------|------|------|
| **边框** | #1890ff | Ant Design 蓝 |
| **背景** | rgba(24,144,255,0.05) | 5% 透明度 |
| **阴影** | rgba(24,144,255,0.3) | 柔和阴影 |

### 交互反馈

| 操作 | 反馈 |
|------|------|
| **点击** | 立即显示选中框 |
| **拖动** | 实时更新选中区域 |
| **hover** | cursor: cell |

---

## ✅ 功能总结

### 核心特性

1. **Excel 风格选择** - 与 Excel 类似的交互体验
2. **蓝色高亮** - 清晰的视觉反馈
3. **实时更新** - 拖动时平滑更新
4. **滚动兼容** - 支持横向和纵向滚动
5. **性能优化** - 不影响原有功能

### 后续扩展

可以在此基础上添加：
- 显示选中单元格数量（如 "10行 × 3列"）
- 支持键盘操作（Shift + 方向键）
- 复制/粘贴功能
- 单元格编辑功能

---

**完成时间**: 2026-02-10
**相关文件**:
- `packages/ctable/src/components/CTable.vue`
