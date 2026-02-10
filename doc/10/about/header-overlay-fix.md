# 表头覆盖问题修复报告

> **修复日期**: 2026-02-10
> **问题**: 向下滚动时，数据行会覆盖表头
> **状态**: ✅ 已修复

---

## 🐛 问题描述

### 症状表现

当向下滚动时：
- 数据行会绘制到表头区域
- 表头被数据行覆盖，无法正常显示
- 跨越表头边界的行从表头内开始绘制

### 预期行为

- ✅ 表头始终保持在顶部（y = 0 到 y = headerHeight）
- ✅ 数据行从表头下方开始绘制（y >= headerHeight）
- ✅ 跨越表头边界的行应该被裁剪，只绘制表头下方的部分

---

## 🔍 根本原因

### 错误的渲染逻辑

**原代码** (错误):
```typescript
// 跳过完全在表头上方的行
if (y + cellHeight <= headerHeight) {
  return
}

// 不进行裁剪，直接绘制完整的单元格
const actualY = y  // ❌ 可能小于 headerHeight
const actualHeight = cellHeight
```

**问题分析**：
- 只跳过了**完全**在表头上方的行
- 对于**跨越表头边界**的行（部分在表头内，部分在表头外），仍然绘制完整行
- 当 `y < headerHeight` 时，行从表头内开始绘制，覆盖表头

### 正确的渲染逻辑

**核心原则**：表头区域是神圣不可侵犯的

1. ✅ 表头始终在固定位置（0 到 headerHeight）
2. ✅ 数据行从 headerHeight 下方开始计算 Y 坐标
3. ✅ 跨越表头边界的行必须被裁剪
4. ✅ 完全在表头内的行必须被跳过

---

## ✅ 修复方案

### 添加表头边界裁剪逻辑

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

// 处理跨越表头边界的行
let actualY = y
let actualHeight = cellHeight

if (y < headerHeight && y + cellHeight > headerHeight) {
  // 行跨越表头边界，从表头下方开始绘制，裁剪掉表头遮挡的部分
  actualY = headerHeight
  actualHeight = y + cellHeight - headerHeight
}
```

### 关键改进

1. **检测跨越边界** - 检查行是否跨越表头边界
2. **调整起始位置** - 将绘制起始位置调整到 `headerHeight`
3. **裁剪高度** - 减去表头遮挡的高度
4. **保持表头完整** - 确保表头永远不会被覆盖

### 逻辑说明

| 行的位置 | 原代码 | 新代码 | 结果 |
|---------|--------|--------|------|
| 完全在表头内 | 跳过 ✅ | 跳过 ✅ | 不渲染 |
| 跨越表头边界 | 完整绘制 ❌ | 裁剪绘制 ✅ | 只绘制表头下方部分 |
| 完全在表头下方 | 完整绘制 ✅ | 完整绘制 ✅ | 完整渲染 |

---

## 📁 修改的文件

### 1. G2TableRenderer.ts

**文件**: `packages/ctable/src/core/G2TableRenderer.ts`

**修改位置**: 第 727-747 行

**修改前**:
```typescript
// 跳过完全在表头上方的行
if (y + cellHeight <= headerHeight) {
  return
}

// 不进行裁剪，直接绘制完整的单元格
const actualY = y
const actualHeight = cellHeight
```

**修改后**:
```typescript
// 跳过完全在表头上方的行
if (y + cellHeight <= headerHeight) {
  return
}

// 处理跨越表头边界的行
let actualY = y
let actualHeight = cellHeight

if (y < headerHeight && y + cellHeight > headerHeight) {
  actualY = headerHeight
  actualHeight = y + cellHeight - headerHeight
}
```

### 2. G2TableRendererV2.ts

**文件**: `packages/ctable/src/core/G2TableRendererV2.ts`

**修改位置**: 第 315-328 行

**同样的修改** - 添加表头边界裁剪逻辑

---

## 🎯 修复效果

### 修复前 ❌

```
向下滚动时：
┌─────────────────┐
│  表头 (被覆盖)   │  ← 数据行覆盖表头！❌
├─┬───────────────┤
│ │数据行 (部分)  │
│ ├───────────────┤
│ │数据行 (完整)  │
└─┴───────────────┘
```

### 修复后 ✅

```
向下滚动时：
┌─────────────────┐
│  表头 (完整)     │  ← 表头保持完整！✅
├─────────────────┤
│数据行 (裁剪)    │  ← 只绘制表头下方部分
├─────────────────┤
│数据行 (完整)    │  ← 完整渲染
└─────────────────┘
```

---

## 🔬 技术细节

### 裁剪计算

**场景**: 行跨越表头边界

```typescript
// 行的原始位置
y = 30  // 从 y=30 开始（表头高度是 50）
cellHeight = 40  // 行高是 40

// 行的范围：30 到 70
// 表头的范围：0 到 50
// 重叠区域：30 到 50（20px 被表头遮挡）

// 裁剪后的参数
actualY = 50  // 从表头下方开始
actualHeight = 30 + 40 - 50 = 20  // 只绘制 20px
```

### 边界条件

| 条件 | 动作 | 说明 |
|------|------|------|
| `y + cellHeight <= headerHeight` | 跳过 | 完全在表头内 |
| `y >= this.height` | 跳过 | 完全超出底部 |
| `y < headerHeight && y + cellHeight > headerHeight` | 裁剪 | 跨越表头边界 |
| 其他 | 完整绘制 | 完全在可视区域内 |

---

## 📊 性能影响

### 修复前 vs 修复后

| 指标 | 修复前 | 修复后 | 说明 |
|------|--------|--------|------|
| **表头显示** | ❌ 被覆盖 | ✅ 始终可见 | 用户体验 |
| **代码复杂度** | 低 | 中 | 增加边界处理 |
| **渲染性能** | 基准 | 相同 | 性能无影响 |
| **内存占用** | 基准 | 相同 | 无明显变化 |

---

## ✅ 修复总结

### 核心改进

1. **保护表头区域** - 表头永远不会被数据行覆盖
2. **智能裁剪** - 自动处理跨越表头边界的行
3. **保持性能** - 裁剪计算开销极小
4. **完整显示** - 表头和数据行都正确显示

### 相关修复

本次修复与之前的修复相配合：
- ✅ 高度压缩修复（行保持完整高度）
- ✅ 边界滚动修复（到达顶部/底部无法继续滑动）
- ✅ 表头遮挡处理（保护表头区域）

---

## 🎓 经验总结

### 表头渲染的最佳实践

1. **表头区域神圣不可侵犯**
   - 表头始终在固定位置
   - 数据行永远不能覆盖表头

2. **边界处理必须完整**
   - 考虑所有可能的边界情况
   - 完全在内、完全在外、跨越边界

3. **裁剪计算要准确**
   - 起始位置调整
   - 高度裁剪计算

### 避免的反模式

❌ **错误的边界处理**:
```typescript
// 只检查完全在内的情况
if (isFullyInside) {
  return
}
// ❌ 忽略了跨越边界的情况
renderFullRow()  // 会覆盖表头
```

✅ **正确的边界处理**:
```typescript
// 检查完全在内
if (isFullyInside) {
  return
}
// 处理跨越边界
if (isCrossingBoundary) {
  renderClippedRow()  // ✅ 裁剪后绘制
} else {
  renderFullRow()
}
```

---

**修复完成时间**: 2026-02-10
**相关文件**:
- `packages/ctable/src/core/G2TableRenderer.ts`
- `packages/ctable/src/core/G2TableRendererV2.ts`
