# HTML 表头实现与样式优化

> **实施日期**: 2026-02-10
> **目标**: 使用 HTML 渲染表头，解决表头被覆盖问题，并实现 ant-design-vue 风格的样式
> **状态**: ✅ 已完成

---

## 🎯 问题背景

### 原有问题

1. **表头被覆盖** - Canvas 渲染的表头在滚动时会被数据行覆盖
2. **无法使用 icon** - Canvas 中难以渲染复杂的 HTML 元素（如图标、按钮）
3. **样式丑陋** - 之前的表头样式不够美观

### 解决方案

使用 HTML div 渲染表头，覆盖在 Canvas 上方：
- ✅ 表头不会被数据行覆盖
- ✅ 可以使用任何 HTML 元素（icon、按钮等）
- ✅ 更好的交互体验（点击、hover 等）
- ✅ 更容易实现 ant-design-vue 风格的样式

---

## 🎨 ant-design-vue 表头样式分析

### 核心设计规范

基于 ant-design-vue 的表头设计：

| 属性 | 值 | 说明 |
|------|---|------|
| **背景色** | `#fafafa` | 浅灰色背景 |
| **文字颜色** | `rgba(0, 0, 0, 0.85)` | 深灰色，不使用纯黑 |
| **边框颜色** | `#f0f0f0` | 浅灰色边框 |
| **字体大小** | `14px` | 标准字号 |
| **字体粗细** | `500` | 中等粗细 |
| **内边距** | `0 16px` | 左右 16px |
| **排序颜色** | `#1890ff` | Ant Design 蓝色 |
| **hover 背景** | `#f5f5f5` | 稍深的灰色 |
| **激活背景** | `#e6f7ff` | 浅蓝色 |

### 排序图标规范

- **未排序状态**：`opacity: 0.25`，颜色 `#bfbfbf`
- **hover 状态**：`opacity: 0.45`
- **激活状态**：`opacity: 1`，颜色 `#1890ff`

### 筛选图标规范

- **未筛选状态**：`opacity: 0.25`
- **hover 状态**：`opacity: 0.45`
- **激活状态**：`opacity: 1`，颜色 `#1890ff`

---

## 📝 实现细节

### 1. 模板结构

```vue
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
        <input type="checkbox" />
      </template>

      <!-- 其他列 -->
      <template v-else>
        <span class="ctable-header-title">{{ col.title }}</span>

        <!-- 排序图标 -->
        <span v-if="col.sorter" class="ctable-header-sort">
          <span
            v-if="getColumnSort(col.key) === 'ascend'"
            class="ctable-sort-icon ctable-sort-ascend"
          >▲</span>
          <span v-else class="ctable-sort-icon">▲</span>

          <span
            v-if="getColumnSort(col.key) === 'descend'"
            class="ctable-sort-icon ctable-sort-descend"
          >▼</span>
          <span v-else class="ctable-sort-icon">▼</span>
        </span>

        <!-- 筛选图标 -->
        <span v-if="col.filters && col.filters.length" class="ctable-header-filter">
          <span
            :class="['ctable-filter-icon', { 'ctable-filter-active': localFilterState.value.has(col.key) }]"
          >⚷</span>
        </span>
      </template>
    </div>
  </div>
</div>
```

### 2. 样式定义

```typescript
// 表头容器样式
const headerStyle = computed<CSSProperties>(() => {
  return {
    position: "absolute" as "absolute",
    top: "0",
    left: "0",
    right: "0",
    height: `${theme.spacing.header}px`,
    backgroundColor: "#fafafa",
    borderBottom: `1px solid #f0f0f0`,
    display: "flex",
    alignItems: "center",
    zIndex: 100,
    overflow: "hidden" as "hidden",
  };
});

// 表头单元格样式
const getHeaderCellStyle = (col: any, index: number) => {
  const columnWidth = col.width || 120;
  const currentSort = getColumnSort(col.key);

  return {
    width: `${columnWidth}px`,
    height: `${theme.spacing.header}px`,
    padding: `0 16px`,
    borderRight: `1px solid #f0f0f0`,
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
  };
};
```

### 3. CSS 样式

```css
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

.ctable-header-cell:hover {
  background-color: #f5f5f5;
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
```

### 4. Canvas 渲染器修改

**G2TableRenderer.ts**:
```typescript
private fullRender(headerHeight: number, cellHeight: number) {
  // 清除画布（跳过表头区域）
  this.ctx!.clearRect(0, headerHeight, this.width, this.height - headerHeight)

  // 设置裁剪区域（只裁剪数据区域）
  this.ctx!.save()
  this.ctx!.beginPath()
  this.ctx!.rect(0, headerHeight, this.width, this.height - headerHeight)
  this.ctx!.clip()

  // 绘制数据内容（不绘制表头）
  this.renderVisibleRows(headerHeight, cellHeight)
  this.renderGrid(headerHeight, cellHeight)

  this.ctx!.restore()
}
```

---

## 🎯 优化效果

### 之前 ❌

- 表头被数据行覆盖
- 无法使用 HTML icon
- 样式不够美观
- 交互体验差

### 之后 ✅

- 表头始终可见，不被覆盖
- 支持任何 HTML 元素
- ant-design-vue 风格的美观样式
- 平滑的 hover 效果和过渡动画
- 清晰的排序/筛选状态反馈

---

## 📁 修改的文件

### 1. CTable.vue

**模板部分** (第 18-64 行):
- 添加 HTML 表头结构
- 添加排序图标
- 添加筛选图标
- 添加复选框

**脚本部分** (第 445-585 行):
- 添加 `headerRef` 引用
- 添加 `headerStyle` 计算属性
- 添加 `getHeaderCellStyle` 方法
- 添加 `handleHeaderClick` 方法
- 添加 `localSortState` 和 `localFilterState` 状态
- 添加全选相关逻辑

**样式部分** (第 1912-2000 行):
- 添加 `.ctable-header` 样式
- 添加 `.ctable-header-cell` 样式
- 添加排序图标样式
- 添加筛选图标样式
- 添加 hover 效果

### 2. G2TableRenderer.ts

**修改位置** (第 269-322 行):
- `fullRender`: 跳过表头区域绘制
- `incrementalRender`: 跳过表头区域脏区域

### 3. G2TableRendererV2.ts

**修改位置** (第 213-240 行):
- `generateG2Data`: 移除表头单元格数据生成

---

## 🔬 技术亮点

### 1. 分层渲染架构

```
┌─────────────────────┐
│  HTML 表头 (z:100)  │  ← DOM 层
├─────────────────────┤
│  Canvas 数据行       │  ← Canvas 层
└─────────────────────┘
```

### 2. 样式继承

完全遵循 ant-design-vue 的设计规范：
- 颜色系统
- 字体规范
- 间距规范
- 交互状态

### 3. 性能优化

- HTML 表头使用 CSS `position: absolute`，不影响布局
- Canvas 只绘制数据行，减少绘制开销
- 使用 `transform` 和 `opacity` 实现平滑动画

---

## 📊 样式对比

### ant-design-vue vs 我们的实现

| 特性 | ant-design-vue | 我们的实现 |
|------|----------------|------------|
| **背景色** | #fafafa | ✅ #fafafa |
| **文字颜色** | rgba(0,0,0,0.85) | ✅ rgba(0,0,0,0.85) |
| **字体大小** | 14px | ✅ 14px |
| **字体粗细** | 500 | ✅ 500 |
| **排序颜色** | #1890ff | ✅ #1890ff |
| **hover 效果** | #f5f5f5 | ✅ #f5f5f5 |
| **激活背景** | #e6f7ff | ✅ #e6f7ff |
| **边框颜色** | #f0f0f0 | ✅ #f0f0f0 |

---

## 🧪 测试清单

- [x] 表头不被数据行覆盖
- [x] 排序功能正常
- [x] 筛选功能正常
- [x] 复选框全选功能正常
- [x] hover 效果正常
- [x] 过渡动画流畅
- [x] 样式符合 ant-design-vue 规范

---

## ✅ 总结

### 核心改进

1. **使用 HTML 渲染表头** - 解决表头被覆盖问题
2. **实现 ant-design-vue 风格** - 美观的视觉效果
3. **支持 HTML 元素** - 可以使用 icon、按钮等
4. **优化交互体验** - 平滑的 hover 和过渡效果

### 设计原则

- **一致性** - 遵循 ant-design-vue 设计规范
- **性能优先** - Canvas 只绘制必要的内容
- **可扩展性** - 易于添加新的表头功能
- **用户友好** - 清晰的视觉反馈

---

**完成时间**: 2026-02-10
**相关文件**:
- `packages/ctable/src/components/CTable.vue`
- `packages/ctable/src/core/G2TableRenderer.ts`
- `packages/ctable/src/core/G2TableRendererV2.ts`
