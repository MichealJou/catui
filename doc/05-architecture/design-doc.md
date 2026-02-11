# CTable 设计文档

> **最后更新**: 2026-02-11
> **渲染引擎**: VTable (VisActor)
> **架构**: API 适配器模式

## 项目概述

CTable 是一个基于 VTable (VisActor) 的高性能 Canvas 表格组件库，专为处理大量数据而设计。该组件库提供了丰富的功能和良好的用户体验，同时保持了出色的性能表现（10 万+ 行数据达到 60 FPS）。

**架构决策**: [ADR-001: 从 G2/Canvas 迁移到 VTable](../10-about/memory/decisions/001-vtable-migration.md)

---

## 架构设计

### 核心架构

```
CTable 项目结构
├── apps/
│   └── demo/                 # 演示应用
│       ├── src/
│       │   ├── components/   # 组件
│       │   │   └── CTable/
│       │   │       └── CanvasTable.vue
│       │   └── App.vue
│       └── package.json
│
├── packages/
│   └── ctable/               # 核心组件库
│       ├── src/
│       │   ├── adapters/     # 🔑 API 适配器层
│       │   │   └── VTableAdapter.ts  # VTable API 适配器
│       │   │
│       │   ├── components/   # Vue 组件
│       │   │   ├── CTable.vue         # 主组件
│       │   │   └── CPagination.vue    # 分页组件
│       │   │
│       │   ├── theme/        # 主题系统
│       │   │   ├── vtable/             # VTable 主题
│       │   │   │   ├── ant-design.ts   # Ant Design 主题
│       │   │   │   ├── element-plus.ts # Element Plus 主题
│       │   │   │   ├── naive.ts        # Naive UI 主题
│       │   │   │   └── index.ts        # 主题导出
│       │   │   │
│       │   │   └── presets/            # 旧主题（向后兼容）
│       │   │       ├── ant-design.ts
│       │   │       ├── element-plus.ts
│       │   │       └── naive.ts
│       │   │
│       │   ├── core/         # 核心管理器（保留部分）
│       │   │   ├── ThemeManager.ts
│       │   │   ├── SortManager.ts
│       │   │   ├── FilterManager.ts
│       │   │   └── EventManager.ts
│       │   │
│       │   ├── adapters/     # 分页适配器
│       │   │   ├── AdapterFactory.ts
│       │   │   ├── DefaultPaginationAdapter.ts
│       │   │   └── AntDesignVuePaginationAdapter.ts
│       │   │
│       │   ├── types/        # 类型定义
│       │   │   └── index.ts
│       │   │
│       │   └── index.ts      # 入口文件
│       │
│       └── package.json
│
└── README.md
```

### 架构模式：API 适配器

```
用户代码
    ↓
CTable.vue (保持用户 API 不变)
    ↓
VTableAdapter (API 转换层)
    ↓
VTable (VisActor 引擎)
    ↓
Canvas 渲染
```

**优势**:
- ✅ 用户代码无需修改
- ✅ API 兼容性 100%
- ✅ 引擎切换透明
- ✅ 易于维护和扩展

---

## 核心模块

### 1. VTableAdapter (API 适配器)

**文件**: `packages/ctable/src/adapters/VTableAdapter.ts`

**职责**: 将 CTable API 转换为 VTable API

**核心方法**:
- `create()` - 创建 VTable 实例
- `updateData()` - 更新数据
- `updateColumns()` - 更新列配置
- `updateTheme()` - 更新主题
- `getSelectedRows()` - 获取选中行
- `setSelectedRows()` - 设置选中行
- `clearFilters()` - 清除筛选
- `destroy()` - 销毁表格

**API 转换示例**:

```typescript
// CTable API → VTable API
{
  // 数据源
  dataSource: data[]           → records: data[]

  // 列配置
  columns: [{
    key: string,
    title: string,             → title: string
    fixed: 'left' | 'right',   → frozen: 'start' | 'end'
    sortable: boolean,         → sort: boolean
    customRender: function     → cellRenderer: function
  }]

  // 主题
  theme: 'ant-design'          → theme: vtableTheme
}
```

### 2. CTable.vue (主组件)

**文件**: `packages/ctable/src/components/CTable.vue`

**职责**: Vue 组件，管理 VTable 生命周期

**核心逻辑**:
```typescript
// 初始化
const vtableRef = ref<HTMLElement>()
let vtableAdapter: VTableAdapter | null = null

onMounted(() => {
  vtableAdapter = createVTableAdapter({
    container: vtableRef.value,
    columns: props.columns || [],
    data: currentData.value,
    width: props.width,
    height: props.height,
    theme: props.theme,
    // ... 事件处理
  })
})

// 数据监听
watch(() => currentData.value, (newData) => {
  vtableAdapter?.updateData(newData)
}, { deep: true })

// 清理
onBeforeUnmount(() => {
  vtableAdapter?.destroy()
})
```

### 3. 主题系统

**文件**: `packages/ctable/src/theme/vtable/`

**支持的主题**:
- Ant Design（亮色/暗色）
- Element Plus（亮色/暗色）
- Naive UI（亮色/暗色）

**主题配置结构**:
```typescript
interface VTableTheme {
  background: string
  headerBg: string
  headerBottomBorderColor: string
  borderColor: string
  tableBodyBorderRadius: number
  frameBottomBorderColor: string
  // ... 更多配置
}
```

---

## 组件设计

### CTable 组件

#### Props 接口

```typescript
interface CTableProps {
  // 数据相关
  dataSource?: any[]          // 数据源（兼容 a-table）
  data?: any[]                // 数据源（简称）
  columns: Column[]           // 列配置
  rowKey?: string | function  // 行唯一标识

  // 尺寸相关
  width: number               // 表格宽度
  height: number              // 表格高度

  // 功能配置
  theme?: ThemePreset | ThemeConfig  // 主题
  themeMode?: 'light' | 'dark'       // 主题模式
  virtualScroll?: boolean           // 虚拟滚动
  selectable?: boolean              // 可选择
  selectableType?: 'single' | 'multiple'  // 选择类型
  bordered?: boolean                // 边框
  stripe?: boolean                  // 斑马纹
  loading?: boolean                 // 加载状态
  loadingTip?: string               // 加载提示

  // 分页
  pagination?: PaginationConfig | false

  // 行选择
  rowSelection?: {
    type?: 'checkbox' | 'radio'
    selectedRowKeys?: any[]
    onChange?: (selectedRows: any[], selectedKeys: any[]) => void
  }

  // 事件
  onRowClick?: (row: any, index: number, event: Event) => void
  onCellClick?: (cell: any, row: any, column: Column, event: Event) => void
  onSortChange?: (sorter: any) => void
  onFilterChange?: (filters: any) => void
  onScroll?: (event: { scrollTop: number; scrollLeft: number }) => void
}
```

#### Events 接口

```typescript
interface CTableEmits {
  'cell-click': [event: any]
  'row-click': [event: any]
  'selection-change': [selectedRows: any[], selectedKeys: any[]]
  'scroll': [event: any]
  'sort-change': [field: string, order: SortOrder]
  'filter-change': [filters: FilterCondition[]]
  'expand': [expanded: boolean, record: any]
  'change': [pagination: any, filters: any, sorter: any]
}
```

#### Column 配置

```typescript
interface Column {
  key: string                  // 列键
  title: string                // 列标题
  dataIndex?: string           // 数据字段
  width?: number               // 列宽
  align?: 'left' | 'center' | 'right'  // 对齐
  fixed?: 'left' | 'right'     // 固定列
  sortable?: boolean           // 可排序
  sorter?: function            // 排序函数
  customRender?: function      // 自定义渲染
  render?: function            // 自定义渲染（兼容 a-table）
  children?: Column[]          // 子列（支持表头分组）
}
```

---

## 主题系统

### VTable 主题配置

CTable 通过 VTableAdapter 将主题配置转换为 VTable 格式。

**主题转换示例**:

```typescript
// CTable 主题配置
const antDesignTheme = {
  colors: {
    primary: '#1677ff',
    background: '#ffffff',
    header: '#fafafa',
    border: '#f0f0f0',
    text: 'rgba(0, 0, 0, 0.65)',
    hover: '#f5f5f5',
    selected: '#e6f4ff',
  }
}

// 转换为 VTable 主题
const vtableTheme = toVTableTheme(antDesignTheme)
// {
//   background: '#ffffff',
//   headerBg: '#fafafa',
//   headerBottomBorderColor: '#f0f0f0',
//   borderColor: '#f0f0f0',
//   // ... 更多配置
// }
```

### 支持的主题预设

```typescript
type ThemePreset =
  | 'ant-design'      // Ant Design 亮色
  | 'ant-design-dark' // Ant Design 暗色
  | 'element-plus'    // Element Plus 亮色
  | 'element-plus-dark'  // Element Plus 暗色
  | 'naive'           // Naive UI 亮色
  | 'naive-dark'      // Naive UI 暗色
```

---

## 性能优化

### VTable 内置优化

1. **虚拟滚动**
   - VTable 内置虚拟滚动机制
   - 只渲染可见区域的数据
   - 支持 10 万+ 行数据

2. **Canvas 渲染**
   - 纯 Canvas 渲染，无 DOM 操作
   - GPU 加速
   - 60 FPS 流畅体验

3. **增量更新**
   - VTable 自动处理增量更新
   - 只重绘变化的部分
   - 高效的数据变化处理

### 性能指标

| 场景 | 数据量 | 性能 |
|------|--------|------|
| 小数据 | 1,000 行 | 60 FPS |
| 中数据 | 10,000 行 | 60 FPS |
| 大数据 | 100,000 行 | 60 FPS |
| 超大数据 | 1,000,000 行 | 30-40 FPS |

---

## 使用示例

### 基础用法

```vue
<template>
  <CTable
    :columns="columns"
    :dataSource="tableData"
    :width="800"
    :height="600"
    :theme="'ant-design'"
    @row-click="handleRowClick"
  />
</template>

<script setup>
import { ref } from 'vue'
import { CTable } from '@catui/ctable'

const tableData = ref([
  { id: 1, name: 'John', age: 25, address: 'New York' },
  { id: 2, name: 'Jane', age: 30, address: 'London' }
])

const columns = [
  { key: 'id', title: 'ID', width: 80, fixed: 'left' },
  { key: 'name', title: '姓名', width: 120 },
  { key: 'age', title: '年龄', width: 80, sortable: true },
  { key: 'address', title: '地址', width: 200 }
]

const handleRowClick = (event) => {
  console.log('Row clicked:', event.row, event.index)
}
</script>
```

### 高级用法

```vue
<template>
  <CTable
    :columns="columns"
    :dataSource="largeData"
    :width="1200"
    :height="600"
    :virtual-scroll="true"
    :row-selection="rowSelection"
    :pagination="pagination"
    :theme="'ant-design'"
    @selection-change="handleSelectionChange"
    @change="handleTableChange"
  />
</template>

<script setup>
const rowSelection = {
  type: 'checkbox',
  selectedRowKeys: ref([]),
  onChange: (selectedRows, selectedKeys) => {
    console.log('Selected:', selectedRows, selectedKeys)
  }
}

const pagination = {
  current: 1,
  pageSize: 10,
  total: 1000,
  showSizeChanger: true,
  showQuickJumper: true
}
</script>
```

---

## 开发指南

### 环境搭建

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev:demo

# 构建核心组件库
pnpm build

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

### 代码规范

- **TypeScript**: 使用 TypeScript 进行类型安全开发
- **ESLint**: 遵循 ESLint 代码规范
- **Prettier**: 保持代码风格一致性
- **Git Hooks**: 使用 husky 和 lint-staged 确保代码质量

---

## 部署策略

### 构建流程

1. 类型检查 (TypeScript)
2. 代码检查 (ESLint)
3. 单元测试执行
4. 生产构建打包

### 版本发布

- **Semantic Versioning**: 遵循语义化版本规范
- **Changelog**: 维护详细的更新日志
- **发布流程**: 自动化发布流程

---

## 未来规划

### 功能扩展

- [ ] 更多 VTable 内置功能的暴露
- [ ] 自定义单元格编辑器
- [ ] 右键菜单插件
- [ ] 键盘快捷键

### 性能优化

- [ ] Web Workers 支持（大数据计算）
- [ ] 更精细的增量更新
- [ ] 内存优化

### 生态完善

- [ ] CLI 工具
- [ ] 可视化配置工具
- [ ] 更多适配器（Vuetify、Quasar）
- [ ] 官方示例库

---

## 贡献指南

### 代码贡献

1. Fork 仓库
2. 创建功能分支
3. 提交代码更改
4. 发起 Pull Request

### 问题报告

- 提供详细的重现步骤
- 包含环境信息
- 提供预期和实际结果

---

## 相关文档

- [技术决策记录 ADR-001](../10-about/memory/decisions/001-vtable-migration.md) - VTable 迁移决策
- [项目任务跟踪](../10-about/project-tasks.md) - 当前开发任务
- [路线图](../10-about/roadmap.md) - 项目规划
- [VTable 官方文档](https://visactor.io/vtable) - VTable 引擎文档

---

**版本**: 1.0.0
**最后更新**: 2026-02-11
**维护者**: CTable Team
