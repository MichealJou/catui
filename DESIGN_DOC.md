# CTable 设计文档

## 项目概述

CTable 是一个基于 AntV S2 的高性能 Canvas 表格组件库，专为处理大量数据而设计。该组件库提供了丰富的功能和良好的用户体验，同时保持了出色的性能表现。

## 架构设计

### 核心架构

```
CTable 项目结构
├── apps/
│   └── demo/                 # 演示应用
│       ├── src/
│       │   ├── components/   # 组件
│       │   │   ├── S2Table.vue
│       │   │   └── ...
│       │   ├── utils/        # 工具类
│       │   │   ├── s2-data-transformer.ts
│       │   │   └── s2-theme-manager.ts
│       │   ├── types/        # 类型定义
│       │   │   └── s2-table.ts
│       │   └── App.vue
│       └── package.json
├── packages/
│   └── ctable/               # 核心组件库
│       ├── src/
│       │   ├── core/
│       │   │   ├── EventSystem.ts
│       │   │   ├── LifecycleManager.ts
│       │   │   └── PluginManager.ts
│       │   ├── renderer/
│       │   │   └── CanvasRenderer.ts
│       │   └── index.ts
│       └── package.json
└── README.md
```

### 核心模块

#### 1. EventSystem (事件系统)
- **职责**: 统一管理组件内部及组件间的事件通信
- **特性**: 
  - 支持事件优先级管理
  - 提供完整的生命周期事件
  - 支持事件取消订阅机制

#### 2. LifecycleManager (生命周期管理器)
- **职责**: 管理组件的完整生命周期
- **特性**:
  - 提供标准化的生命周期钩子
  - 支持异步初始化
  - 提供资源清理机制

#### 3. PluginManager (插件管理器)
- **职责**: 管理插件的注册、加载和卸载
- **特性**:
  - 支持插件依赖管理
  - 提供插件生命周期管理
  - 支持动态插件加载

#### 4. CanvasRenderer (Canvas 渲染引擎)
- **职责**: 基于 Canvas 的高性能渲染
- **特性**:
  - 支持虚拟滚动
  - 提供 GPU 加速渲染
  - 支持多种渲染模式

## 组件设计

### S2Table 组件

#### Props 接口

```typescript
interface TableProps {
  // 数据相关
  data: any[]
  columns: Column[]
  rowKey?: string
  
  // 尺寸相关
  width: number
  height: number
  maxHeight?: number
  minHeight?: number
  
  // 功能配置
  mode: 'grid' | 'tree' | 'compact'
  theme: 'default' | 'dark' | 'gray'
  showHeader?: boolean
  showFooter?: boolean
  bordered?: boolean
  loading?: boolean
  
  // 虚拟滚动
  virtual?: boolean
  
  // 分页
  pagination?: {
    current: number
    pageSize: number
    total: number
    showSizeChanger?: boolean
    showQuickJumper?: boolean
    showTotal?: boolean
    pageSizeOptions?: number[]
  }
  
  // 交互配置
  interactive: {
    hoverHighlight: boolean
    selectedCellHighlight: boolean
    rowSelection?: boolean
    columnSelection?: boolean
    cellEdit?: boolean
    dragDrop?: boolean
    multiSort?: boolean
  }
  
  // 工具栏配置
  toolbar?: {
    show: boolean
    tools: ('filter' | 'sort' | 'export' | 'setting' | 'fullScreen' | 'refresh')[]
    position?: 'top' | 'bottom' | 'right'
  }
  
  // 选择配置
  selection?: {
    type: 'single' | 'multiple'
    showSelectAll?: boolean
    selectedRowKeys?: string[]
    onChange?: (selectedKeys: string[]) => void
  }
  
  // 排序配置
  sort?: {
    field?: string
    direction?: 'asc' | 'desc'
    onChange?: (sortInfo: any) => void
  }
  
  // 筛选配置
  filter?: {
    showFilter?: boolean
    filters?: Record<string, any[]>
    onChange?: (filterInfo: any) => void
  }
  
  // 国际化
  locale?: string
  translations?: Record<string, string>
}
```

#### Events 接口

```typescript
interface TableEmits {
  'row-click': [row: any, index: number]
  'cell-click': [cell: any, row: any, column: Column]
  'selection-change': [selectedRows: any[], selectedKeys: string[]]
  'sort-change': [sortInfo: any]
  'filter-change': [filterInfo: any]
  'pagination-change': [pagination: any]
  'scroll': [scrollTop: number, scrollLeft: number]
  'tool-click': [tool: string, event: MouseEvent]
  'data-change': [data: any[]]
  'columns-change': [columns: Column[]]
}
```

#### Column 配置

```typescript
interface Column {
  key: string
  title: string
  dataIndex?: string
  width?: number
  minWidth?: number
  maxWidth?: number
  type?: 'data' | 'row' | 'column' | 'action'
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  sortable?: boolean
  filterable?: boolean
  editable?: boolean
  formatter?: (value: any) => string
  formatterParams?: any
  render?: (value: any, row: any, column: Column) => string | React.ReactNode
  children?: Column[]
  description?: string
}
```

## 主题系统

### Ant Design 风格主题

CTable 采用 Ant Design 的设计语言，提供一致的用户体验：

#### 颜色规范
- **主色调**: #1890FF (Ant Design 蓝)
- **辅助色**: #FAFAFA, #F0F0F0, #D9D9D9 (背景和边框)
- **文字色**: rgba(0, 0, 0, 0.88) (正文文字)
- **禁用色**: rgba(0, 0, 0, 0.25) (禁用状态)

#### 组件样式
- **边框圆角**: 4px-6px
- **阴影效果**: 0 1px 2px rgba(0, 0, 0, 0.03)
- **间距规范**: 遵循 Ant Design 间距设计原则

## 性能优化

### 虚拟滚动
- **原理**: 只渲染可见区域的数据
- **优势**: 大幅减少 DOM 节点，提升渲染性能
- **适用场景**: 百万级数据渲染

### 数据处理优化
- **数据转换**: 高效的数据格式转换算法
- **缓存机制**: 数据和渲染结果缓存
- **按需加载**: 分页和懒加载机制

### 渲染优化
- **Canvas 渲染**: 基于 Canvas 的高性能渲染
- **GPU 加速**: 利用硬件加速提升渲染性能
- **批量更新**: 批量处理数据变更

## 使用示例

### 基础用法

```vue
<template>
  <S2Table
    :data="tableData"
    :columns="columns"
    :width="800"
    :height="600"
    @row-click="handleRowClick"
    @cell-click="handleCellClick"
  />
</template>

<script setup>
import { ref } from 'vue'
import S2Table from 'ctable'

const tableData = ref([
  { id: 1, name: 'John', age: 25, address: 'New York' },
  { id: 2, name: 'Jane', age: 30, address: 'London' }
])

const columns = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '姓名', width: 120 },
  { key: 'age', title: '年龄', width: 80 },
  { key: 'address', title: '地址', width: 200 }
]

const handleRowClick = (row, index) => {
  console.log('Row clicked:', row, index)
}

const handleCellClick = (cell, row, column) => {
  console.log('Cell clicked:', cell, row, column)
}
</script>
```

### 高级用法

```vue
<template>
  <S2Table
    :data="largeData"
    :columns="columns"
    :width="1200"
    :height="600"
    :virtual="true"
    :pagination="pagination"
    :interactive="{ hoverHighlight: true, rowSelection: true }"
    :toolbar="{ show: true, tools: ['filter', 'sort', 'export'] }"
    @selection-change="handleSelectionChange"
    @pagination-change="handlePaginationChange"
  />
</template>
```

## 插件系统

### 插件接口

```typescript
interface S2Plugin {
  name: string
  version: string
  install: (instance: S2TableInstance) => void
  uninstall?: (instance: S2TableInstance) => void
}
```

### 内置插件

- **SortPlugin**: 排序功能
- **FilterPlugin**: 筛选功能
- **ExportPlugin**: 导出功能
- **ResizePlugin**: 列宽调整

## 开发指南

### 环境搭建

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 代码规范

- **TypeScript**: 使用 TypeScript 进行类型安全开发
- **ESLint**: 遵循 ESLint 代码规范
- **Prettier**: 保持代码风格一致性
- **Git Hooks**: 使用 husky 和 lint-staged 确保代码质量

## 测试策略

### 单元测试
- **Jest**: 使用 Jest 进行单元测试
- **Vue Test Utils**: Vue 组件测试工具

### 性能测试
- **渲染性能**: 测试大数据量下的渲染性能
- **内存使用**: 监控内存泄漏和内存使用情况
- **交互响应**: 测试用户交互的响应时间

## 部署策略

### 构建流程
1. 代码检查 (ESLint, TypeScript)
2. 单元测试执行
3. 性能测试验证
4. 生产构建打包

### 版本发布
- **Semantic Versioning**: 遵循语义化版本规范
- **Changelog**: 维护详细的更新日志
- **发布流程**: 自动化发布流程

## 未来规划

### 功能扩展
- **国际化**: 更多语言支持
- **无障碍**: 无障碍访问支持
- **移动端**: 移动端适配优化
- **主题定制**: 更多主题选项

### 性能优化
- **Web Workers**: 使用 Web Workers 处理大数据
- **增量渲染**: 增量更新渲染优化
- **GPU 加速**: 更多 GPU 加速特性

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

**版本**: 1.0.0  
**最后更新**: 2026年2月5日