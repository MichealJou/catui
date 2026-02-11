# CTable UI/UX 设计规范

> CTable 高性能 Canvas 表格组件库 - 完整视觉与交互设计规范
>
> 版本：1.0.0
> 最后更新：2026-02-11

---

## 目录

1. [设计原则](#设计原则)
2. [颜色系统](#颜色系统)
3. [字体系统](#字体系统)
4. [间距系统](#间距系统)
5. [交互状态](#交互状态)
6. [固定列视觉规范](#固定列视觉规范)
7. [动画与过渡](#动画与过渡)
8. [常见问题修复](#常见问题修复)

---

## 设计原则

### 核心原则

| 原则 | 说明 |
|------|------|
| **一致性** | 与原 UI 框架（Ant Design Vue / Element Plus / NaiveUI）保持 100% 一致 |
| **性能优先** | 视觉效果不能影响 Canvas 渲染性能 |
| **渐进增强** | 从基础功能开始，逐步增强视觉效果 |
| **可访问性** | 确保足够的颜色对比度（WCAG 2.1 AA 标准） |

### 质量标准

- ✅ 颜色对比度 ≥ 4.5:1（正常文字）
- ✅ 触摸目标 ≥ 44×44px
- ✅ 无双重边框、无闪烁
- ✅ 动画帧率 ≥ 60fps

---

## 颜色系统

### Ant Design Vue 主题

#### 亮色主题

```typescript
const antDesignColors = {
  // === 主色系 ===
  primary: '#1677ff',           // 主色（品牌蓝）
  primaryHover: '#4096ff',       // 主色悬停
  primaryActive: '#0958d9',      // 主色激活
  primaryBg: '#e6f4ff',          // 主色背景（浅色背景）

  // === 辅助色 ===
  secondary: '#8c8ce6',
  secondaryHover: '#a0a0eb',
  secondaryActive: '#7070d6',

  // === 功能色 ===
  success: '#52c41a',            // 成功色
  warning: '#faad14',            // 警告色
  error: '#ff4d4f',              // 错误色
  info: '#1677ff',               // 信息色

  // === 中性色 ===
  background: '#ffffff',         // 背景色
  header: '#fafafa',             // 表头背景
  border: '#f0f0f0',             // 边框色
  borderLight: '#f5f5f5',        // 浅边框
  borderDark: '#d9d9d9',         // 深边框（hover）

  // === 文字色 ===
  text: 'rgba(0, 0, 0, 0.88)',   // 主要文字（85% 不透明度）
  textSecondary: 'rgba(0, 0, 0, 0.65)', // 次要文字（65%）
  textTertiary: 'rgba(0, 0, 0, 0.45)',   // 辅助文字（45%）
  textDisabled: 'rgba(0, 0, 0, 0.25)',   // 禁用文字（25%）

  // === 交互状态 ===
  hover: 'rgba(0, 0, 0, 0.04)',  // 悬停背景色（4% 黑色）
  selected: '#e6f4ff',           // 选中背景色（浅蓝）
  selectedHover: '#bae0ff',      // 选中悬停背景色
  selectedBorder: '#1677ff',     // 选中边框色

  // === 其他 ===
  footer: '#fafafa',             // 表尾背景
  stripe: '#fafafa',             // 斑马纹颜色
  stripeOdd: '#ffffff',          // 奇数行背景
  stripeEven: '#fafafa',         // 偶数行背景

  // === 固定列 ===
  fixedShadow: 'rgba(0, 0, 0, 0.1)', // 固定列阴影
  fixedDivider: '#e8e8e8',       // 固定列分隔线
}
```

#### 暗色主题

```typescript
const antDesignDarkColors = {
  // === 主色系 ===
  primary: '#1677ff',
  primaryHover: '#4096ff',
  primaryActive: '#0958d9',
  primaryBg: '#111d2c',

  // === 辅助色 ===
  secondary: '#6d6ee3',

  // === 功能色 ===
  success: '#49aa19',
  warning: '#d89614',
  error: '#a8071a',
  info: '#1677ff',

  // === 中性色 ===
  background: '#141414',
  header: '#1d1d1d',
  border: '#303030',
  borderLight: '#262626',
  borderDark: '#424242',

  // === 文字色 ===
  text: 'rgba(255, 255, 255, 0.85)',
  textSecondary: 'rgba(255, 255, 255, 0.65)',
  textTertiary: 'rgba(255, 255, 255, 0.45)',
  textDisabled: 'rgba(255, 255, 255, 0.25)',

  // === 交互状态 ===
  hover: 'rgba(255, 255, 255, 0.08)',
  selected: '#111d2c',
  selectedHover: '#1a2a3a',
  selectedBorder: '#1677ff',

  // === 其他 ===
  footer: '#1d1d1d',
  stripe: '#1f1f1f',
  stripeOdd: '#141414',
  stripeEven: '#1f1f1f',

  // === 固定列 ===
  fixedShadow: 'rgba(0, 0, 0, 0.45)',
  fixedDivider: '#3a3a3a',
}
```

### Element Plus 主题

#### 亮色主题

```typescript
const elementPlusColors = {
  // === 主色系 ===
  primary: '#409eff',           // 品牌蓝
  primaryHover: '#66b1ff',
  primaryActive: '#3a8ee6',
  primaryBg: '#ecf5ff',

  // === 辅助色 ===
  secondary: '#79bbff',

  // === 功能色 ===
  success: '#67c23a',
  warning: '#e6a23c',
  error: '#f56c6c',
  info: '#909399',

  // === 中性色 ===
  background: '#ffffff',
  header: '#f5f7fa',
  border: '#ebeef5',
  borderLight: '#f2f6fc',
  borderDark: '#dcdfe6',

  // === 文字色 ===
  text: '#606266',              // 主要文字
  textSecondary: '#909399',     // 次要文字
  textTertiary: '#c0c4cc',      // 辅助文字
  textDisabled: '#c0c4cc',      // 禁用文字

  // === 交互状态 ===
  hover: '#f5f7fa',             // hover 与 header 相同
  selected: '#ecf5ff',          // 浅蓝背景
  selectedHover: '#d9ecff',
  selectedBorder: '#409eff',

  // === 其他 ===
  footer: '#f5f7fa',
  stripe: '#fafafa',
  stripeOdd: '#ffffff',
  stripeEven: '#fafafa',

  // === 固定列 ===
  fixedShadow: 'rgba(0, 0, 0, 0.12)',
  fixedDivider: '#e4e7ed',
}
```

#### 暗色主题

```typescript
const elementPlusDarkColors = {
  // === 主色系 ===
  primary: '#409eff',
  primaryHover: '#66b1ff',
  primaryActive: '#3a8ee6',
  primaryBg: '#1a2a3a',

  // === 辅助色 ===
  secondary: '#66b1ff',

  // === 功能色 ===
  success: '#529b2e',
  warning: '#cf8e25',
  error: '#c23838',
  info: '#7a7a7a',

  // === 中性色 ===
  background: '#1d1e1f',
  header: '#252526',
  border: '#4c4d4f',
  borderLight: '#363637',
  borderDark: '#606266',

  // === 文字色 ===
  text: '#e5eaf3',
  textSecondary: '#cfd3dc',
  textTertiary: '#a8abb2',
  textDisabled: '#6c6e72',

  // === 交互状态 ===
  hover: '#2a2a2a',
  selected: '#1a2a3a',
  selectedHover: '#243445',
  selectedBorder: '#409eff',

  // === 其他 ===
  footer: '#252526',
  stripe: '#262727',
  stripeOdd: '#1d1e1f',
  stripeEven: '#262727',

  // === 固定列 ===
  fixedShadow: 'rgba(0, 0, 0, 0.5)',
  fixedDivider: '#4a4b4d',
}
```

### NaiveUI 主题

#### 亮色主题

```typescript
const naiveColors = {
  // === 主色系 ===
  primary: '#18a058',           // 品牌绿
  primaryHover: '#36ad6a',
  primaryActive: '#0c7a43',
  primaryBg: '#e2f8e8',

  // === 辅助色 ===
  secondary: '#36ad6a',

  // === 功能色 ===
  success: '#18a058',
  warning: '#f0a020',
  error: '#d03050',
  info: '#2080f0',

  // === 中性色 ===
  background: '#ffffff',
  header: '#f1f3f5',            // 更深的灰色
  border: '#e4e7ed',
  borderLight: '#eef0f2',
  borderDark: '#cdd0d6',

  // === 文字色 ===
  text: '#1f2329',              // 主要文字（深灰）
  textSecondary: '#5e6166',     // 次要文字
  textTertiary: '#8a8e99',      // 辅助文字
  textDisabled: '#cdd0d6',      // 禁用文字

  // === 交互状态 ===
  hover: '#f8f9fa',             // 极浅的灰色
  selected: '#e2f8e8',          // 浅绿背景
  selectedHover: '#c8efd2',
  selectedBorder: '#18a058',

  // === 其他 ===
  footer: '#f1f3f5',
  stripe: '#fafafa',
  stripeOdd: '#ffffff',
  stripeEven: '#fafafa',

  // === 固定列 ===
  fixedShadow: 'rgba(0, 0, 0, 0.08)',
  fixedDivider: '#e0e4ea',
}
```

#### 暗色主题

```typescript
const naiveDarkColors = {
  // === 主色系 ===
  primary: '#18a058',
  primaryHover: '#36ad6a',
  primaryActive: '#0c7a43',
  primaryBg: '#12291a',

  // === 辅助色 ===
  secondary: '#4cb272',

  // === 功能色 ===
  success: '#168045',
  warning: '#c68b14',
  error: '#b82535',
  info: '#1869c9',

  // === 中性色 ===
  background: '#18181c',
  header: '#1f1f23',
  border: '#3e3e42',
  borderLight: '#2e2e32',
  borderDark: '#5a5a60',

  // === 文字色 ===
  text: '#e2e7ee',
  textSecondary: '#b8bcc2',
  textTertiary: '#8f9297',
  textDisabled: '#5a5a60',

  // === 交互状态 ===
  hover: '#252529',
  selected: '#0f2818',
  selectedHover: '#183a24',
  selectedBorder: '#18a058',

  // === 其他 ===
  footer: '#1f1f23',
  stripe: '#212124',
  stripeOdd: '#18181c',
  stripeEven: '#212124',

  // === 固定列 ===
  fixedShadow: 'rgba(0, 0, 0, 0.4)',
  fixedDivider: '#3e3e42',
}
```

### 颜色对比度标准

| 文字类型 | 最小对比度 | 亮色主题示例 | 暗色主题示例 |
|---------|-----------|-------------|-------------|
| 主要文字 | 4.5:1 | `#606266` on `#ffffff` | `#e5eaf3` on `#1d1e1f` |
| 大号文字 | 3:1 | `#909399` on `#ffffff` | `#cfd3dc` on `#1d1e1f` |
| 图标 | 3:1 | `#606266` on `#ffffff` | `#e5eaf3` on `#1d1e1f` |

---

## 字体系统

### 字体族

```typescript
const fontStack = {
  // 系统字体栈（优先使用系统默认字体）
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

  // 等宽字体（用于代码、数字）
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',

  // 数字字体（优化数字显示）
  number: '"SF Mono", "Roboto Mono", Consolas, monospace',
}
```

### 字号规范

| 元素 | 字号 | 行高 | 使用场景 |
|------|------|------|---------|
| 表头 | 14px | 22px | 表头文字 |
| 单元格 | 14px | 22px | 数据单元格 |
| 表尾 | 14px | 22px | 汇总行 |
| 小号文字 | 12px | 20px | 辅助信息、备注 |
| 大号文字 | 16px | 24px | 特殊强调场景 |

### 字重规范

| 字重 | 数值 | 使用场景 |
|------|------|---------|
| Regular | 400 | 普通文字 |
| Medium | 500 | 中等强调 |
| Semibold | 600 | 表头、重要文字 |
| Bold | 700 | 特殊强调 |

### 主题字体配置

```typescript
// Ant Design Vue
const antDesignFonts = {
  header: { size: '14px', weight: '600', lineHeight: '22px' },
  cell: { size: '14px', weight: '400', lineHeight: '22px' },
  footer: { size: '14px', weight: '400', lineHeight: '22px' },
}

// Element Plus
const elementPlusFonts = {
  header: { size: '14px', weight: '700', lineHeight: '22px' },
  cell: { size: '14px', weight: '400', lineHeight: '22px' },
  footer: { size: '14px', weight: '400', lineHeight: '22px' },
}

// NaiveUI
const naiveFonts = {
  header: { size: '14px', weight: '600', lineHeight: '22px' },
  cell: { size: '14px', weight: '400', lineHeight: '22px' },
  footer: { size: '14px', weight: '400', lineHeight: '22px' },
}
```

---

## 间距系统

### 尺寸规范

| 元素 | Ant Design | Element Plus | NaiveUI | 说明 |
|------|-----------|--------------|---------|------|
| 表头高度 | 55px | 48px | 44px | header |
| 单元格高度 | 55px | 48px | 47px | cell |
| 边框宽度 | 1px | 1px | 1px | border |
| 横向内边距 | 16px | 12px | 12px | padding |
| 纵向内边距 | 16px | 12px | 12px | padding |
| 列最小宽度 | 80px | 80px | 80px | minWidth |

### Size 变体

```typescript
const sizeVariants = {
  // Large（大号）
  large: {
    header: 64,
    cell: 64,
    padding: 20,
  },

  // Default（默认）
  default: {
    header: 55,  // Ant Design
    cell: 55,
    padding: 16,
  },

  // Small（小号）
  small: {
    header: 40,
    cell: 40,
    padding: 8,
  },
}
```

### 边框规范

```typescript
const borderStyles = {
  // 实线边框（默认）
  solid: {
    width: 1,
    style: 'solid',
  },

  // 虚线边框（辅助线）
  dashed: {
    width: 1,
    style: 'dashed',
  },

  // 无边框
  none: {
    width: 0,
  },
}
```

---

## 交互状态

### 状态定义

| 状态 | 说明 | 视觉特征 |
|------|------|---------|
| **Default** | 默认状态 | 白色背景，正常边框 |
| **Hover** | 鼠标悬停 | 浅色背景，边框保持 |
| **Selected** | 已选中 | 主色背景（浅色），主色边框 |
| **Disabled** | 禁用状态 | 降低透明度，禁止交互 |
| **Focus** | 键盘聚焦 | 外发光环，主色边框 |

### 1. Default（默认状态）

```typescript
const defaultState = {
  background: colors.background,      // 白色背景
  border: {
    color: colors.border,              // 默认边框色
    width: 1,
  },
  text: colors.text,                   // 主要文字
  cursor: 'default',
}
```

**视觉特征：**
- 背景色：纯白（亮色）/ 深灰（暗色）
- 边框：1px 固体边框
- 文字：正常对比度
- 无特殊效果

### 2. Hover（悬停状态）

```typescript
const hoverState = {
  background: colors.hover,            // 浅色背景（4% 黑色）
  border: {
    color: colors.borderDark,          // 稍深的边框色
    width: 1,
  },
  text: colors.text,                   // 文字颜色不变
  cursor: 'pointer',
  transition: 'background-color 150ms ease',
}
```

**视觉特征：**
- 背景色：极浅的灰色/主色
- 边框：保持原边框，不加粗
- 文字：不变
- 过渡：150ms 快速过渡

**实现要点：**
- ✅ **不要绘制双重边框**
- ✅ 仅改变背景色，边框保持原样
- ✅ 使用 CSS 的 `transition` 实现平滑过渡

### 3. Selected（选中状态）

```typescript
const selectedState = {
  background: colors.selected,         // 主色浅背景
  border: {
    color: colors.selectedBorder,      // 主色边框
    width: 1,
  },
  text: colors.text,
  cursor: 'default',
}
```

**视觉特征：**
- 背景色：主色的浅色变体（10-15% 不透明度）
- 边框：主色
- 文字：保持原色
- 可选：添加左侧色条（2-3px 宽）

**特殊样式：**
```typescript
// 左侧选中色条（可选）
const selectedIndicator = {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: 3,
  background: colors.primary,
}
```

### 4. Disabled（禁用状态）

```typescript
const disabledState = {
  background: colors.background,
  border: {
    color: colors.borderLight,
    width: 1,
  },
  text: colors.textDisabled,           // 25% 不透明度
  cursor: 'not-allowed',
  opacity: 0.6,                        // 整体透明度
}
```

**视觉特征：**
- 背景色：保持不变
- 边框：变浅
- 文字：降低对比度至 25%
- 整体：60% 透明度
- 鼠标：禁止图标

### 5. Focus（聚焦状态）

```typescript
const focusState = {
  background: colors.background,
  border: {
    color: colors.primary,
    width: 1,
  },
  outline: {
    color: colors.primary,
    width: 2,
    offset: 2,
    style: 'solid',
  },
  cursor: 'default',
}
```

**视觉特征：**
- 外发光环：2px 主色光环，偏移 2px
- 边框：主色
- 满足 WCAG 2.1 AAA 标准（对比度 ≥ 3:1）

---

## 固定列视觉规范

### 阴影样式

#### 左侧固定列

```typescript
const leftFixedShadow = {
  // 阴影方向：向右
  direction: 'right',

  // 阴影渐变
  gradient: {
    start: 'rgba(0, 0, 0, 0)',
    end: colors.fixedShadow,           // 主题特定阴影色
  },

  // 渐变宽度
  width: 8,

  // 位置：固定列右边缘
  position: {
    x: fixedColumnWidth,
    y: 0,
    width: 8,
    height: tableHeight,
  },

  // Canvas 渐变实现
  canvasGradient: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    const gradient = ctx.createLinearGradient(x, y, x + w, y)
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    gradient.addColorStop(1, colors.fixedShadow)
    return gradient
  },
}
```

#### 右侧固定列

```typescript
const rightFixedShadow = {
  direction: 'left',
  width: 8,
  canvasGradient: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    const gradient = ctx.createLinearGradient(x, y, x - w, y)
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    gradient.addColorStop(1, colors.fixedShadow)
    return gradient
  },
}
```

### 阴影强度

| 场景 | 亮色主题 | 暗色主题 |
|------|---------|---------|
| 普通滚动 | `rgba(0, 0, 0, 0.1)` | `rgba(0, 0, 0, 0.3)` |
| 快速滚动 | `rgba(0, 0, 0, 0.15)` | `rgba(0, 0, 0, 0.45)` |
| 静止状态 | `rgba(0, 0, 0, 0.08)` | `rgba(0, 0, 0, 0.25)` |

### 分隔线处理

```typescript
const fixedDivider = {
  // 分隔线颜色
  color: colors.fixedDivider,

  // 分隔线宽度
  width: 1,

  // 分隔线位置（紧贴固定列）
  position: {
    leftFixed: 'right',               // 左侧固定列的右边缘
    rightFixed: 'left',               // 右侧固定列的左边缘
  },

  // 样式
  style: 'solid',

  // 与阴影的关系
  renderOrder: 'after-shadow',        // 先画阴影，再画分隔线
}
```

**渲染顺序：**
1. 绘制固定列内容
2. 绘制阴影渐变（8px 宽）
3. 绘制分隔线（1px 实线）

### Z-index 层级

```typescript
const zIndexLayers = {
  // 表格容器
  container: 0,

  // 普通列
  normalColumn: 1,

  // 固定列
  fixedColumn: 10,

  // 固定列阴影
  fixedShadow: 11,

  // 固定列分隔线
  fixedDivider: 12,

  // 浮动元素（如排序筛选下拉菜单）
  dropdown: 1000,

  // 弹窗/抽屉
  modal: 1050,
  drawer: 1060,
}
```

---

## 动画与过渡

### 动画时长标准

| 动画类型 | 时长 | 缓动函数 |
|---------|------|---------|
| hover 过渡 | 150ms | `ease-out` |
| 选中/取消 | 200ms | `ease-in-out` |
| 主题切换 | 250ms | `ease-in-out` |
| 展开行 | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| 排序动画 | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` |

### 过渡效果

#### Hover 过渡

```typescript
const hoverTransition = {
  property: 'background-color',
  duration: '150ms',
  timing: 'ease-out',
  delay: '0ms',
}
```

**Canvas 实现：**
```typescript
// 使用 requestAnimationFrame 实现平滑过渡
interface HoverAnimation {
  targetCell: Cell
  currentOpacity: number
  targetOpacity: number
  startTime: number
  duration: number
}

function animateHover(ctx: CanvasRenderingContext2D, animation: HoverAnimation) {
  const elapsed = performance.now() - animation.startTime
  const progress = Math.min(elapsed / animation.duration, 1)

  // 缓动函数
  const easedProgress = 1 - Math.pow(1 - progress, 3) // ease-out-cubic

  const currentOpacity = animation.currentOpacity +
    (animation.targetOpacity - animation.currentOpacity) * easedProgress

  // 绘制
  ctx.fillStyle = `rgba(0, 0, 0, ${currentOpacity})`
  ctx.fillRect(animation.targetCell.x, animation.targetCell.y,
              animation.targetCell.width, animation.targetCell.height)

  if (progress < 1) {
    requestAnimationFrame(() => animateHover(ctx, animation))
  }
}
```

#### 选中过渡

```typescript
const selectedTransition = {
  property: ['background-color', 'border-color'],
  duration: '200ms',
  timing: 'ease-in-out',
}
```

#### 主题切换

```typescript
const themeTransition = {
  duration: 250,
  timing: 'ease-in-out',
  stagger: 0, // 同时切换所有元素
}

// CSS 变量过渡（推荐）
const transitionStyle = {
  transition: 'all 250ms ease-in-out',
}

// Canvas 主题切换实现
function switchTheme(
  ctx: CanvasRenderingContext2D,
  oldTheme: ThemeConfig,
  newTheme: ThemeConfig,
  duration: number
) {
  const startTime = performance.now()

  function interpolate() {
    const elapsed = performance.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeInOutQuad(progress)

    // 插值计算所有颜色
    const interpolatedColors = {
      background: lerpColor(oldTheme.colors.background, newTheme.colors.background, eased),
      border: lerpColor(oldTheme.colors.border, newTheme.colors.border, eased),
      // ... 其他颜色
    }

    // 重新渲染
    render(interpolatedColors)

    if (progress < 1) {
      requestAnimationFrame(interpolate)
    }
  }

  interpolate()
}

// 缓动函数
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

// 颜色插值
function lerpColor(color1: string, color2: string, t: number): string {
  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)

  const r = Math.round(c1.r + (c2.r - c1.r) * t)
  const g = Math.round(c1.g + (c2.g - c1.g) * t)
  const b = Math.round(c1.b + (c2.b - c1.b) * t)

  return `rgb(${r}, ${g}, ${b})`
}
```

### 性能优化

```typescript
// 动画节流
const animationThrottle = {
  hover: 16, // 60fps
  scroll: 8, // 120fps
  theme: 16,
}

// 减少 motion 支持
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (prefersReducedMotion) {
  // 禁用所有动画
  transitionDuration = 0
}
```

---

## 常见问题修复

### 1. 双重边框问题

#### 问题分析

当前实现：
```typescript
highlightCell(cell: Cell) {
  const { colors } = this.theme
  this.ctx.fillStyle = colors.hover
  this.ctx.fillRect(cell.x, cell.y, cell.width, cell.height)
  this.renderCell(cell)  // ❌ 这里会重新绘制边框，导致双重边框
}
```

**问题：**
- `fillRect` 绘制 hover 背景
- `renderCell` 再次调用 `strokeRect` 绘制边框
- 结果：背景层 + 边框层 = 双重边框

#### 修复方案

**方案 1：只绘制背景，不重绘边框**

```typescript
highlightCell(cell: Cell) {
  const { colors, spacing } = this.theme

  // ✅ 只绘制 hover 背景，不重绘边框
  this.ctx.fillStyle = colors.hover
  this.ctx.fillRect(
    cell.x,
    cell.y,
    cell.width,
    cell.height
  )

  // ✅ 重新绘制文字内容（但不绘制边框）
  this.renderCellContent(cell)
}

// 新增方法：只绘制内容，不绘制边框
private renderCellContent(cell: Cell) {
  const { fonts, spacing } = this.theme
  const { column, data } = cell

  // 绘制文字
  this.ctx.font = `${fonts.cell.weight} ${fonts.cell.size} ${fontStack.system}`
  this.ctx.fillStyle = this.theme.colors.text
  this.ctx.textAlign = column.align || 'left'
  this.ctx.textBaseline = 'middle'

  const dataValue = data[column.dataIndex || column.key]
  const text = column.render
    ? column.render(data, cell.row, column)
    : String(dataValue ?? '')

  const fittedText = fitText(
    text,
    cell.width - spacing.padding * 2,
    this.ctx.font,
    this.ctx
  )

  const textX = this.getTextX(
    cell.x,
    cell.width,
    column.align || 'left',
    spacing.padding
  )
  this.ctx.fillText(fittedText, textX, cell.y + cell.height / 2)
}
```

**方案 2：清除高亮后重新渲染整个区域**

```typescript
// 在 EventManager 中
private handleMouseMove = (event: MouseEvent) => {
  const point = this.getEventPosition(event)
  const cell = this.renderer.hitTest(point)

  if (cell !== this.hoverCell) {
    // ✅ 清除所有高亮，重新渲染当前视口
    this.renderer.clearHighlight()
    this.hoverCell = cell

    if (cell) {
      // ✅ 只更新需要高亮的单元格
      this.renderer.highlightCell(cell)
      this.emit('hover', { cell })
    } else {
      this.emit('mouseleave', {})
    }
  }
}

// 在 CanvasRenderer 中
highlightCell(cell: Cell) {
  const { colors } = this.theme

  // ✅ 保存原始状态
  this.ctx.save()

  // ✅ 绘制 hover 背景
  this.ctx.fillStyle = colors.hover
  this.ctx.fillRect(cell.x, cell.y, cell.width, cell.height)

  // ✅ 恢复状态
  this.ctx.restore()

  // ✅ 重新绘制单元格内容
  this.renderCellContent(cell)
}
```

### 2. 固定列阴影不明显

#### 问题分析

当前阴影颜色：
```typescript
fixedShadow: 'rgba(0, 0, 0, 0.1)'  // ❌ 太淡了
```

#### 修复方案

```typescript
// 优化后的阴影
const fixedShadowConfig = {
  // 亮色主题
  light: {
    normal: 'rgba(0, 0, 0, 0.15)',   // 提升到 15%
    scroll: 'rgba(0, 0, 0, 0.2)',    // 滚动时 20%
  },

  // 暗色主题
  dark: {
    normal: 'rgba(0, 0, 0, 0.4)',    // 暗黑模式需要更深
    scroll: 'rgba(0, 0, 0, 0.5)',
  },

  // 阴影宽度
  width: 12,  // 从 8px 增加到 12px

  // 渐变实现
  render: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, isDark: boolean) => {
    const gradient = ctx.createLinearGradient(x, y, x + w, y)
    const baseAlpha = isDark ? 0.4 : 0.15

    gradient.addColorStop(0, `rgba(0, 0, 0, 0)`)
    gradient.addColorStop(0.5, `rgba(0, 0, 0, ${baseAlpha * 0.5})`)
    gradient.addColorStop(1, `rgba(0, 0, 0, ${baseAlpha})`)

    ctx.fillStyle = gradient
    ctx.fillRect(x, y, w, h)
  }
}
```

### 3. 主题切换不流畅

#### 修复方案

```typescript
class ThemeManager {
  private transitionDuration = 250

  setTheme(
    theme: ThemeConfig | ThemePreset,
    animated: boolean = true
  ) {
    const oldTheme = this.currentTheme
    const newTheme = typeof theme === 'string'
      ? THEME_PRESETS[theme]
      : theme

    if (!animated) {
      // 立即切换（无动画）
      this.currentTheme = newTheme
      this.applyTheme(newTheme)
      this.notifyListeners(newTheme)
      return
    }

    // ✅ 带动画的主题切换
    this.animateThemeTransition(oldTheme, newTheme)
  }

  private animateThemeTransition(
    oldTheme: ThemeConfig,
    newTheme: ThemeConfig
  ) {
    const startTime = performance.now()
    const duration = this.transitionDuration

    const animate = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeInOutQuad(progress)

      // 插值计算
      const interpolated = this.interpolateTheme(oldTheme, newTheme, eased)

      // 应用临时主题
      this.currentTheme = interpolated
      this.applyTheme(interpolated)
      this.notifyListeners(interpolated)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // 动画完成，应用最终主题
        this.currentTheme = newTheme
        this.applyTheme(newTheme)
        this.notifyListeners(newTheme)
      }
    }

    animate()
  }

  private interpolateTheme(
    theme1: ThemeConfig,
    theme2: ThemeConfig,
    t: number
  ): ThemeConfig {
    return {
      colors: {
        primary: lerpColor(theme1.colors.primary, theme2.colors.primary, t),
        background: lerpColor(theme1.colors.background, theme2.colors.background, t),
        // ... 其他颜色
      },
      fonts: theme2.fonts, // 字体不插值，直接切换
      spacing: theme2.spacing, // 间距不插值，直接切换
    }
  }
}
```

---

## 附录

### 颜色工具函数

```typescript
/**
 * 颜色插值
 */
function lerpColor(color1: string, color2: string, t: number): string {
  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)

  const r = Math.round(c1.r + (c2.r - c1.r) * t)
  const g = Math.round(c1.g + (c2.g - c1.g) * t)
  const b = Math.round(c1.b + (c2.b - c1.b) * t)

  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Hex 转 RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

/**
 * 计算颜色对比度
 */
function getContrastRatio(color1: string, color2: string): number {
  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)

  const l1 = getLuminance(c1.r, c1.g, c1.b)
  const l2 = getLuminance(c2.r, c2.g, c2.b)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 计算亮度
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}
```

### 缓动函数

```typescript
/**
 * 线性
 */
function linear(t: number): number {
  return t
}

/**
 * ease-in-out
 */
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

/**
 * ease-out
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * ease-in-out-cubic
 */
function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}
```

---

## 参考资源

- [Ant Design Vue - 设计规范](https://antdv.com/docs/spec/introduce)
- [Element Plus - 设计规范](https://element-plus.org/zh-CN/guide/design.html)
- [NaiveUI - 设计规范](https://www.naiveui.com/zh-CN/os-theme/docs/design-requirements)
- [WCAG 2.1 对比度标准](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Material Design - 颜色系统](https://material.io/design/color/)

---

**文档维护：**
- 版本：1.0.0
- 最后更新：2026-02-11
- 维护者：CTable UI/UX 设计团队
