# CatUI 固定列设计规范

> 基于 Ant Design Vue Table 固定列设计，适配 Canvas 渲染
>
> 设计师：designer (fixed-columns 团队)
>
> 版本：v1.0
>
> 最后更新：2025-02-11

## 目录

- [1. 设计原则](#1-设计原则)
- [2. 视觉效果](#2-视觉效果)
- [3. 阴影效果规范](#3-阴影效果规范)
- [4. 视觉分隔规范](#4-视觉分隔规范)
- [5. 交互反馈设计](#5-交互反馈设计)
- [6. Canvas 渲染参数](#6-canvas-渲染参数)
- [7. 主题适配](#7-主题适配)

---

## 1. 设计原则

### 1.1 核心原则

- **渐进式揭示**：阴影仅在滚动时显示，表明后面还有内容
- **视觉层次**：固定列与滚动列之间有明确的层级关系
- **一致性**：遵循 Ant Design 设计语言，保持与原生 Table 组件一致的视觉体验
- **性能优先**：Canvas 渲染需要考虑性能，避免过度绘制

### 1.2 设计目标

1. 提供清晰的视觉提示，帮助用户理解固定列与滚动列的关系
2. 保持与 Ant Design Vue Table 的一致性
3. 适配 Canvas 渲染的特殊性
4. 支持不同主题（亮色/暗色）

---

## 2. 视觉效果

### 2.1 阴影效果

固定列在**有内容被遮挡时**显示阴影效果，阴影位于固定列的边缘。

**左侧固定列阴影**：显示在固定列的右边缘
**右侧固定列阴影**：显示在固定列的左边缘

### 2.2 阴影触发条件

- 当表格**向右滚动**时，**左侧固定列**显示阴影
- 当表格**向左滚动**时，**右侧固定列**显示阴影
- 当表格**无滚动**或**已滚动到边界**时，阴影消失

---

## 3. 阴影效果规范

### 3.1 阴影颜色

根据主题系统，使用 `fixedShadow` 颜色配置：

```typescript
// Ant Design 亮色主题
fixedShadow: 'rgba(0, 0, 0, 0.1)'

// Ant Design 暗色主题
fixedShadow: 'rgba(0, 0, 0, 0.3)'
```

### 3.2 Canvas 渲染阴影参数

在 Canvas 中使用 `createLinearGradient` 创建渐变阴影效果：

```typescript
// 左侧固定列阴影（向右渐变）
const gradient = ctx.createLinearGradient(x + width - 6, y, x + width, y)
gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
gradient.addColorStop(1, theme.colors.fixedShadow)

// 右侧固定列阴影（向左渐变）
const gradient = ctx.createLinearGradient(x, y, x + 6, y)
gradient.addColorStop(0, theme.colors.fixedShadow)
gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
```

### 3.3 阴影尺寸

- **宽度**：6px
- **方向**：
  - 左侧固定列：从右边缘向左渐变
  - 右侧固定列：从左边缘向右渐变
- **渐变类型**：线性渐变
- **渐变点**：
  - 0%：完全透明
  - 100%：主题固定阴影颜色

---

## 4. 视觉分隔规范

### 4.1 边框样式

固定列与滚动列之间需要**明确的分隔线**：

```typescript
// 边框颜色
borderColor: theme.colors.border

// 边框宽度
borderWidth: 1px

// 边框样式
borderStyle: 'solid'
```

### 4.2 分隔线位置

- **左侧固定列**：在固定列的右边缘绘制分隔线
- **右侧固定列**：在固定列的左边缘绘制分隔线

### 4.3 Canvas 渲染分隔线

```typescript
// 左侧固定列分隔线
ctx.strokeStyle = theme.colors.border
ctx.lineWidth = 1
ctx.beginPath()
ctx.moveTo(x + width, y)
ctx.lineTo(x + width, y + height)
ctx.stroke()

// 右侧固定列分隔线
ctx.strokeStyle = theme.colors.border
ctx.lineWidth = 1
ctx.beginPath()
ctx.moveTo(x, y)
ctx.lineTo(x, y + height)
ctx.stroke()
```

---

## 5. 交互反馈设计

### 5.1 阴影显示逻辑

阴影根据**滚动位置**动态显示/隐藏：

```typescript
interface FixedColumnShadowState {
  leftShadowVisible: boolean  // 左侧固定列是否显示阴影
  rightShadowVisible: boolean // 右侧固定列是否显示阴影
}
```

**判断逻辑**：

- `leftShadowVisible = scrollLeft > 0`
- `rightShadowVisible = scrollLeft < maxScrollLeft`

### 5.2 鼠标悬停反馈

当鼠标悬停在固定列**边界区域**（6px 宽度内）时：

- 显示**可拖拽调整宽度**的光标（未来功能）
- 边界线高亮（可选）

```typescript
// 高亮颜色
highlightColor: theme.colors.primary

// 高亮宽度
highlightWidth: 2px
```

### 5.3 过渡动画

**Canvas 渲染不建议使用动画**，因为：
1. 阴影显示/隐藏应该即时响应滚动
2. 动画会增加渲染复杂度
3. 用户期望快速反馈

**建议**：直接切换阴影的显示/隐藏状态。

---

## 6. Canvas 渲染参数

### 6.1 完整的阴影渲染函数

```typescript
/**
 * 渲染固定列阴影
 * @param ctx Canvas 上下文
 * @param x 阴影起始 X 坐标
 * @param y 阴影起始 Y 坐标
 * @param height 阴影高度
 * @param shadowColor 阴影颜色
 * @param position 阴影位置 ('left' | 'right')
 */
function renderFixedColumnShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  shadowColor: string,
  position: 'left' | 'right'
): void {
  const SHADOW_WIDTH = 6

  // 创建线性渐变
  let gradient: CanvasGradient

  if (position === 'left') {
    // 左侧固定列：从右边缘向左渐变
    gradient = ctx.createLinearGradient(x, y, x + SHADOW_WIDTH, y)
    gradient.addColorStop(0, shadowColor)
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  } else {
    // 右侧固定列：从左边缘向右渐变
    gradient = ctx.createLinearGradient(x - SHADOW_WIDTH, y, x, y)
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    gradient.addColorStop(1, shadowColor)
  }

  // 填充渐变
  ctx.fillStyle = gradient

  if (position === 'left') {
    ctx.fillRect(x, y, SHADOW_WIDTH, height)
  } else {
    ctx.fillRect(x - SHADOW_WIDTH, y, SHADOW_WIDTH, height)
  }
}
```

### 6.2 完整的分隔线渲染函数

```typescript
/**
 * 渲染固定列分隔线
 * @param ctx Canvas 上下文
 * @param x 分隔线 X 坐标
 * @param y 分隔线起始 Y 坐标
 * @param height 分隔线高度
 * @param borderColor 边框颜色
 */
function renderFixedColumnBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  borderColor: string
): void {
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, y + height)
  ctx.stroke()
}
```

### 6.3 渲染顺序

```
1. 绘制表头背景
2. 绘制单元格背景
3. 绘制固定列分隔线
4. 绘制表头文字
5. 绘制单元格文字
6. 绘制网格线
7. 绘制固定列阴影（最上层）
```

---

## 7. 主题适配

### 7.1 Ant Design 主题

```typescript
// 亮色主题
colors: {
  fixedShadow: 'rgba(0, 0, 0, 0.1)'
}

// 暗色主题
colors: {
  fixedShadow: 'rgba(0, 0, 0, 0.3)'
}
```

### 7.2 Element Plus 主题

```typescript
// 亮色主题
colors: {
  fixedShadow: 'rgba(0, 0, 0, 0.1)'
}

// 暗色主题
colors: {
  fixedShadow: 'rgba(0, 0, 0, 0.3)'
}
```

### 7.3 主题颜色计算公式

```typescript
/**
 * 根据背景色计算固定列阴影颜色
 * @param backgroundColor 背景颜色
 * @param isDark 是否为暗色主题
 * @returns 固定列阴影颜色
 */
function calculateFixedShadowColor(
  backgroundColor: string,
  isDark: boolean
): string {
  if (isDark) {
    return 'rgba(0, 0, 0, 0.3)'
  }
  return 'rgba(0, 0, 0, 0.1)'
}
```

---

## 8. 实现检查清单

- [ ] 阴影颜色使用 `theme.colors.fixedShadow`
- [ ] 阴影宽度为 6px
- [ ] 阴影使用线性渐变（透明 -> 阴影色）
- [ ] 分隔线使用 `theme.colors.border`
- [ ] 分隔线宽度为 1px
- [ ] 阴影根据滚动位置显示/隐藏
- [ ] 渲染顺序正确（阴影在最上层）
- [ ] 支持亮色/暗色主题
- [ ] 性能优化（避免不必要的重绘）

---

## 9. 参考资源

- [Ant Design Table - Fixed Columns](https://ant.design/components/table#components-table-demo-fixed-columns)
- [Ant Design Vue Table - Fixed Columns](https://antdv.com/components/table-cn#components-table-demo-fixed-columns)
- [Canvas API - CanvasRenderingContext2D.createLinearGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient)

---

**设计规范版本**：v1.0
**最后更新**：2025-02-11
**设计师**：designer (fixed-columns 团队)
