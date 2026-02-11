# CTable 重构项目分析

> **创建时间**: 2026-02-11
> **项目状态**: 重构规划中
> **团队**: ctable-refactor

---

## 📋 项目背景

### 项目简介
**CatUI CTable** 是一个基于 Vue 3 + TypeScript 的高性能 Canvas 表格组件库，旨在提供类似 Ant Design Vue Table 的 API，但使用 Canvas 渲染以支持大数据量（10万+行）。

### 技术栈
- **框架**: Vue 3.3 (Composition API + `<script setup>`)
- **语言**: TypeScript 5.3
- **构建**: Vite 5.0
- **渲染**: G2 (Canvas 渲染库)
- **样式**: Less
- **测试**: Vitest

---

## ❌ 当前核心问题

### 1. 固定列对齐问题 🔴 严重
**现象**:
- HTML 表头和 Canvas 数据区的固定列无法对齐
- 左固定列（选择、ID）和右固定列（薪资、日期）位置不一致

**根本原因**:
- HTML 表头使用 `position: sticky` 定位
- Canvas 数据区使用绝对坐标计算
- 两个系统的定位基准不同，导致错位

**影响**: 核心功能不可用

### 2. 横向滚动失效 🔴 严重
**现象**:
- 表头可以横向滚动
- Canvas 数据区内容不跟随滚动

**根本原因**:
- `scrollLeft` 重复减法（G2TableRenderer 中）
- 表头和 Canvas 的滚动同步逻辑不完善

**影响**: 核心功能不可用

### 3. Hover 双重边框 🟡 中等
**现象**:
- 鼠标悬停时出现内外两道边框
- 视觉效果不佳

**根本原因**:
- Canvas hover 高亮绘制了 2px 边框
- HTML 表头单元格有 1px border-right
- 两者叠加产生双重边框

**影响**: 用户体验差

### 4. 性能瓶颈 🟡 中等
**现象**:
- 10万行数据时滚动不流畅
- FPS 低于 60

**根本原因**:
- 混合渲染（HTML + Canvas）开销大
- 虚拟滚动优化不足
- Canvas 渲染性能未充分利用

**影响**: 大数据场景体验差

---

## ✅ 功能需求

### 核心功能（必须有）
| 功能 | 优先级 | 说明 |
|------|--------|------|
| **左固定列** | P0 | 固定左侧列（如选择、ID） |
| **右固定列** | P0 | 固定右侧列（如操作、状态） |
| **虚拟滚动** | P0 | 支持 10万+行流畅滚动 |
| **排序** | P0 | 支持单列排序，带排序动画 |
| **筛选** | P1 | 支持常见筛选器 |
| **行选择** | P0 | 多选/单选，支持全选 |
| **分页** | P1 | 集成分页组件 |
| **主题切换** | P0 | 三大主题（Ant Design、Element Plus、Naive UI） |

### 高级功能（应该有）
| 功能 | 优先级 | 说明 |
|------|--------|------|
| **树形数据** | P2 | 支持展开/折叠树形结构 |
| **合并单元格** | P2 | 支持行/列合并 |
| **分组** | P2 | 支持数据分组 |
| **导出** | P2 | 导出 Excel、CSV |
| **复制粘贴** | P2 | 支持 Excel 风格复制粘贴 |

### 增强功能（可以有）
| 功能 | 优先级 | 说明 |
|------|--------|------|
| **自定义渲染** | P3 | 插槽支持 |
| **拖拽排序** | P3 | 列拖拽排序 |
| **列宽调整** | P3 | 拖拽调整列宽 |
| **键盘导航** | P3 | 方向键导航 |

---

## 🎨 UI/UX 需求

### 主题要求
必须完美支持三大 UI 框架的主题风格：

1. **Ant Design** 🐜️
   - 颜色：`#1677ff` (primary)
   - 表头背景：`#fafafa`
   - 边框颜色：`#f0f0f0`
   - 字体：-apple-system, BlinkMacSystemFont

2. **Element Plus** 🌲
   - 颜色：`#409eff` (primary)
   - 表头背景：`#f5f7fa`
   - 边框颜色：`#ebeef5`
   - 字体："Helvetica Neue", Helvetica, "PingFang SC"

3. **Naive UI** 🟦
   - 颜色：`#18a058` (primary)
   - 表头背景：`#ffffff`
   - 边框颜色：`rgb(239, 239, 245)`
   - 字体：v-sans, system-ui

### 交互需求
- **Hover 效果**: 背景色变化，无额外边框
- **选中效果**: 明显的背景色
- **固定列阴影**: 固定列与非固定列之间有阴影分隔
- **滚动动画**: 平滑的滚动动画
- **排序动画**: 升降序切换时有动画

---

## 📊 性能需求

| 指标 | 目标值 | 当前值 | 状态 |
|------|--------|--------|------|
| **数据量** | 100,000 行 | 10,000 行 | ❌ |
| **FPS** | 60 FPS | ~30 FPS | ❌ |
| **初始渲染** | <1s | ~2s | ⚠️ |
| **滚动延迟** | <16ms | ~50ms | ❌ |
| **内存占用** | <100MB | ~150MB | ⚠️ |

---

## 🔧 API 兼容性需求

### 兼容 Ant Design Vue Table API

必须支持的 Props：
```typescript
interface CTableProps {
  // 基础属性
  dataSource?: any[]
  columns?: Column[]
  rowKey?: string | ((row: any) => string)

  // 尺寸
  width?: number
  height?: number
  scroll?: { x?: number | string; y?: number | string }

  // 固定列
  // columns[].fixed?: 'left' | 'right'

  // 排序/筛选
  // columns[].sorter?: boolean | Function | SorterConfig
  // columns[].filters?: FilterOption[]

  // 行选择
  rowSelection?: RowSelectionConfig

  // 分页
  pagination?: PaginationConfig | false

  // 主题
  theme?: ThemePreset | ThemeConfig

  // 虚拟滚动
  virtualScroll?: boolean
}
```

必须支持的事件：
```typescript
interface CTableEvents {
  'row-click': [row: any, index: number, event: MouseEvent]
  'cell-click': [cell: any, row: any, column: Column]
  'selection-change': [selectedRows: any[], selectedKeys: any[]]
  'sort-change': [sorter: any]
  'filter-change': [filters: any]
  'scroll': [event: { scrollTop: number; scrollLeft: number }]
  'change': [pagination: any, filters: any, sorter: any]
}
```

---

## 💡 当前架构分析

### 渲染架构
```
┌─────────────────────────────────────────┐
│  CTable.vue (Vue 组件)                    │
│  ├── HTML 表头 (position: sticky)        │
│  └── Canvas 数据区 (G2 渲染)             │
└─────────────────────────────────────────┘
```

**问题**:
- HTML 和 Canvas 两套渲染系统
- 坐标计算不一致
- 同步复杂度高

### 核心模块

| 模块 | 文件 | 职责 | 状态 |
|------|------|------|------|
| **主组件** | `CTable.vue` | 组件入口、事件处理 | ⚠️ 有问题 |
| **Canvas 渲染器** | `G2TableRenderer.ts` | Canvas 绘制逻辑 | ⚠️ 有问题 |
| **固定列管理** | `FixedColumnManager.ts` | 固定列计算 | ⚠️ 有问题 |
| **主题管理** | `ThemeManager.ts` | 主题配置 | ✅ 正常 |
| **虚拟滚动** | `VirtualScroll.ts` | 滚动优化 | ⚠️ 待优化 |

---

## 🎯 重构目标

1. **解决固定列对齐问题** ✅
2. **解决横向滚动问题** ✅
3. **优化 hover 效果** ✅
4. **提升性能到 60 FPS** ✅
5. **完美支持三大主题** ✅
6. **保持 API 兼容性** ✅
7. **支持 10 万行数据** ✅

---

## 📦 技术方案候选

### 方案 A: 集成 VTable
**优势**:
- ✅ 成熟方案，固定列完美支持
- ✅ 性能优秀（纯 Canvas）
- ✅ 专业团队维护（VisActor）
- ✅ 快速上线

**劣势**:
- ⚠️ 需要适配 API
- ⚠️ 学习新框架
- ⚠️ 依赖第三方库

### 方案 B: 继续优化当前实现
**优势**:
- ✅ 完全控制代码
- ✅ API 完全兼容
- ✅ 无额外依赖

**劣势**:
- ❌ 技术难度高
- ❌ 开发周期长
- ❌ 维护成本高
- ❌ 可能还有未知问题

---

## 📅 实施计划

### 阶段 1: 方案确定 (当前)
- [x] 创建团队
- [x] 分析问题
- [ ] 技术评估
- [ ] 方案决策

### 阶段 2: 设计阶段
- [ ] 需求文档
- [ ] 设计规范
- [ ] 架构设计

### 阶段 3: 实施阶段
- [ ] 编码实现
- [ ] 测试验证
- [ ] 性能优化

### 阶段 4: 发布阶段
- [ ] 文档更新
- [ ] 版本发布
- [ ] 用户反馈

---

## 📚 参考文档

- [Ant Design Vue Table](https://antdv.com/components/table-cn)
- [VTable 官方文档](https://visactor.io/vtable)
- [TanStack Table](https://tanstack.com/table)
- [AG Grid](https://www.ag-grid.com)

---

**维护者**: CTable 重构团队
**最后更新**: 2026-02-11
