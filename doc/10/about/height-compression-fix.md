# 虚拟滚动高度压缩问题修复报告

> **修复日期**: 2026-02-10
> **问题**: 向下滚动时，第一行滑出一半时，第二行会被慢慢压缩
> **状态**: ✅ 已修复

---

## 🐛 问题描述

### 症状表现

**向下滚动**：
- 第一行滑出一半时，第二行被压缩
- 第二行高度逐渐变短，而不是保持完整
- 给人感觉是高度变短了，而不是自然的消失

**向上滚动**：
- 最后一行进入时，倒数第二行也被压缩

### 预期行为

- ✅ 行应该保持完整高度
- ✅ 行应该自然地消失/出现
- ✅ 不应该有压缩变形效果

---

## 🔍 根本原因

### 错误的裁剪逻辑

**原代码** (错误):
```typescript
// 只有当单元格真正跨越表头边界时才需要裁剪
if (y < headerHeight && y + cellHeight > headerHeight) {
  // 单元格跨越表头边界，裁剪表头遮挡部分
  actualY = headerHeight
  actualHeight = y + cellHeight - headerHeight
}
```

**问题分析**：
- 虽然意图是处理表头遮挡
- 但这个逻辑被误用，对所有部分可见的行都进行了裁剪
- 导致行在滑入/滑出时被压缩变形

### 正确的虚拟滚动原理

**核心原则**：只渲染完全可见的行

虚拟滚动应该：
1. ✅ 只渲染完全在可视区域内的行（完整高度）
2. ✅ 缓冲区渲染一些可视区域外的行（但也是完整高度）
3. ✅ Canvas 自动裁剪可视区域外的不需要的内容

**不应该做的**：
- ❌ 对部分可见行进行裁剪
- ❌ 动态改变行的高度
- ❌ 复杂的边界处理逻辑

---

## ✅ 修复方案

### 移除所有高度裁剪逻辑

**新代码** (正确):
```typescript
// 跳过完全在表头上方的行
if (y + cellHeight <= headerHeight) {
  return
}

// 跳过完全超出底部的行
if (y >= this.height) {
  return
}

// 不进行裁剪，直接绘制完整的单元格
// Canvas 会自动裁剪可视区域外的内容
const actualY = y
const actualHeight = cellHeight  // 始终使用完整高度
```

### 关键改进

1. **移除条件判断** - 不再检查是否跨越边界
2. **保持完整高度** - `actualHeight = cellHeight` 恒定
3. **依赖 Canvas 裁剪** - 让 Canvas 自己处理可视区域外的内容

---

## 📁 修改的文件

### 1. G2TableRenderer.ts

**文件**: `packages/ctable/src/core/G2TableRenderer.ts`

**修改位置**: 第 727-749 行

**修改前**:
```typescript
// 复杂的裁剪逻辑
if (y < headerHeight && y + cellHeight > headerHeight) {
  actualY = headerHeight
  actualHeight = y + cellHeight - headerHeight
}
else if (y + cellHeight <= headerHeight) {
  return
}
```

**修改后**:
```typescript
// 简单的边界检查
if (y + cellHeight <= headerHeight) {
  return
}
// 使用完整高度，不裁剪
const actualHeight = cellHeight
```

### 2. G2TableRendererV2.ts

**文件**: `packages/ctable/src/core/G2TableRendererV2.ts`

**修改位置**: 第 315-330 行

**同样的修改** - 移除裁剪逻辑，保持完整高度

---

## 🎯 修复效果

### 修复前 ❌

```
向下滚动过程：
┌─────────────────┐
│  Row 1 (100%)   │  ← 正常显示
├─────────────────┤
│  Row 2 (80%)    │  ← 被压缩！❌
├─────────────────┤
│  Row 3 (100%)   │  ← 正常显示
└─────────────────┘
```

### 修复后 ✅

```
向下滚动过程：
┌─────────────────┐
│  Row 1 (100%)   │  ← 正常显示
├─────────────────┤
│  Row 2 (100%)   │  ← 保持完整高度！✅
├─────────┬───────┤
│  Row 3  │100%  │  ← 正常显示
└─────────┴───────┘

当 Row 1 完全消失后：
┌─────────────────┐
│  Row 2 (100%)   │  ← 仍然完整
├─────────────────┤
│  Row 3 (100%)   │  ← 仍然完整
└─────────────────┘
```

---

## 🔬 技术细节

### Canvas 自动裁剪

**原理**: Canvas 元素有固定的尺寸（width × height）

```html
<canvas width="800" height="600">
  <!-- 只有这个区域内的内容会被显示 -->
</canvas>
```

**自动裁剪**:
```typescript
// 绘制到可视区域外，不会被显示
this.ctx.fillRect(x, y, width, height)
// 如果 y < 0 或 y > canvasHeight，自动被裁剪
```

**优势**:
- ✅ 硬件加速的裁剪
- ✅ 性能优秀
- ✅ 代码简单
- ✅ 无需手动计算裁剪区域

### 虚拟滚动的渲染策略

**缓冲区策略**:
```typescript
// 上下各缓冲 10 行
const bufferSize = 10

const startIndex = Math.max(0, firstVisible - bufferSize)
const endIndex = Math.min(total, firstVisible + visibleCount + bufferSize)

// 渲染缓冲区内的所有行（完整高度）
for (let i = startIndex; i < endIndex; i++) {
  renderRow(i)  // 完整渲染，不裁剪
}
```

**为什么缓冲区行不会被裁剪**：
- 缓冲区的行虽然部分在可视区域外
- 但我们仍然渲染完整的行
- Canvas 会自动裁剪超出边界的部分
- 所以看起来是正常的

---

## 📊 性能影响

### 修复前 vs 修复后

| 指标 | 修复前 | 修复后 | 说明 |
|------|--------|--------|------|
| **视觉效果** | ❌ 压缩变形 | ✅ 自然流畅 | 用户体验 |
| **代码复杂度** | 高（裁剪逻辑） | 低（边界检查） | 可维护性 |
| **渲染性能** | 基准 | 相同 | 性能无影响 |
| **内存占用** | 基准 | 相同 | 无明显变化 |

---

## 🧪 测试场景

### 1. 缓慢滚动

**测试步骤**:
1. 慢慢向下滚动
2. 观察行的高度变化

**预期结果**:
- ✅ 所有行保持完整高度
- ✅ 行自然进入/离开可视区域
- ✅ 无压缩或变形

### 2. 快速滚动

**测试步骤**:
1. 快速滚动到底部
2. 快速滚动回顶部

**预期结果**:
- ✅ 滚动流畅
- ✅ 行始终保持完整高度
- ✅ 无闪烁或跳跃

### 3. 边界滚动

**测试步骤**:
1. 滚动到最顶部
2. 继续向上滚动
3. 滚动到最底部
4. 继续向下滑动

**预期结果**:
- ✅ 到达顶部后无法继续向上
- ✅ 到达底部后无法继续向下
- ✅ 无弹性滚动效果

---

## ✅ 修复总结

### 核心改进

1. **简化逻辑** - 移除复杂的裁剪计算
2. **保持完整** - 所有行都保持完整高度
3. **依赖 Canvas** - 利用 Canvas 的自动裁剪能力
4. **自然体验** - 行的自然消失/出现

### 相关修复

本次修复与之前的修复相配合：
- ✅ 边界滚动修复（到达顶部/底部无法继续滑动）
- ✅ 表头遮挡处理（只处理表头边界情况）
- ✅ 网格线对齐（滚动偏移计算）

---

## 🎓 经验总结

### 虚拟滚动的最佳实践

1. **KISS 原则** - Keep It Simple, Stupid
   - 简单的逻辑更可靠
   - 避免过度优化

2. **信任平台能力**
   - Canvas 的自动裁剪很高效
   - 不需要手动计算所有边界

3. **只渲染完全可见的内容**
   - 不要尝试渲染部分可见的内容
   - 要么完整，要么不渲染

### 避免的反模式

❌ **错误的裁剪逻辑**:
```typescript
// 复杂的边界计算
if (isPartiallyVisible) {
  const visibleHeight = calculateVisibleHeight()
  actualHeight = visibleHeight  // ❌ 导致压缩
}
```

✅ **正确的边界检查**:
```typescript
// 简单的完全可见检查
if (y + cellHeight <= headerHeight) {
  return  // 不渲染
}
actualHeight = cellHeight  // ✅ 保持完整
```

---

**修复完成时间**: 2026-02-10 22:35
**相关文件**:
- `packages/ctable/src/core/G2TableRenderer.ts`
- `packages/ctable/src/core/G2TableRendererV2.ts`
