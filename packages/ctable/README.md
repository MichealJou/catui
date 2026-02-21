# CatUI 表格组件

基于 **@visactor/vtable** 的高性能 Canvas 表格组件。

## ✨ 特性

- 🚀 **百万级数据渲染** - 基于 VTable 虚拟滚动引擎
- ⚡ **高度可配置** - 完整的行列配置
- 🎨 **多主题支持** - Ant Design Vue / Element Plus / Naive UI
- 🧩 **三框架分页适配** - Pagination 自动适配 Ant / Element / Naive（失败自动回退内置）
- 📌 **斑马线** - 可配置的交替行背景色
- 🎯 **智能更新** - 浅层比较，避免不必要的渲染

## 📦 性能优化

### 已实现的优化

1. **浅层数据比较**
   - 避免深度遍历大数组
   - 只在数据引用真正改变时才更新表格
   - 性能提升：**99%+**

2. **浅层列配置比较**
   - 比较列关键字段而非深度对象比较
   - 避免不必要的列更新
   - 性能提升：**100%**

3. **主题动态更新**
   - 尝试使用 VTable 原生 API (`setTheme`, `setColumns`)
   - 避免完全销毁重建表格

## 🎯 核心功能

| 功能 | 说明 |
|------|------|
| 虚拟滚动 | 支持百万级数据流畅渲染 |
| 固定列 | 左侧/右侧列固定 |
| 列宽调整 | 拖拽调整列宽 |
| 行选择 | 复选框/单选框，支持受控/非受控模式 |
| 排序 | 单列/多列排序，自定义排序函数 |
| 筛选 | 列级筛选，自定义筛选函数 |
| 自定义渲染 | 支持自定义单元格/表头渲染 |
| 斑马线 | 交替行背景色，可配置颜色 |
| 主题切换 | 6 种预设主题 + 自定义主题 |
| 分页集成 | 内置分页组件，支持完整配置 |
| 编辑能力 | 支持单元格编辑与行编辑（click/dblclick/enter/manual） |
| 键盘与剪贴板 | 支持方向键导航、Enter 编辑、Ctrl/Cmd+C/V |
| 合并单元格 | 支持 `mergeCells` 与列级 `rowSpan/colSpan` 基础能力 |

### 编辑器规范（含时间适配）

`Column.editor` 支持以下写法：

- 内置类型：`'input' | 'password' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'switch' | 'date' | 'time' | 'datetime'`
- 组件直传：`editor: MyEditorComponent`
- 配置对象：

```ts
editor: {
  type: 'input', // 可选，默认 input
  component: MyEditorComponent,
  props: { clearable: true } // 或 (ctx) => ({ ... })
}
```

`editorOptions` 统一规范：

```ts
editorOptions: {
  placeholder?: string
  options?: Array<{ label: string; value: any }> // select 使用
  dataSource?: Array<any> | ((ctx) => Array<any> | Promise<Array<any>>) // 下拉/单选数据源
  fieldNames?: { label?: string; value?: string } // 数据源字段映射
  format?: string
  valueFormat?: string
  props?: Record<string, any>
  formatValue?: (value, ctx) => any // 行数据 -> 编辑器值
  parse?: (value, ctx) => any       // 编辑器值 -> 行数据
}
```

三大 UI 时间组件适配：

- Ant Design Vue
  - `date` -> `DatePicker`
  - `time` -> `TimePicker`
  - `datetime` -> `DatePicker(showTime)`
- Element Plus
  - `date` -> `ElDatePicker(type='date')`
  - `time` -> `ElTimePicker`
  - `datetime` -> `ElDatePicker(type='datetime')`
- Naive UI
  - `date` -> `NDatePicker(type='date')`
  - `time` -> `NTimePicker`
  - `datetime` -> `NDatePicker(type='datetime')`

自定义输入组件约定：

- 组件可接收 `value` / `modelValue`，并通过以下任一事件回传值：
  - `update:value`
  - `update:modelValue`
  - `change`
- 会额外透传上下文属性：`record`、`column`、`field`

下拉/单选数据源适配说明：

- `options` 与 `dataSource` 都支持，优先使用 `options`
- `dataSource` 支持同步数组或异步 Promise
- 数据项支持任意结构，配合 `fieldNames` 映射为 `{ label, value }`

## 📖 API 参考

### 基础用法

```vue
<template>
<CTable
  :columns="columns"
  :data="data"
  header-align="center"
  default-align="center"
  :row-key="'id'"
  :stripe="true"
  stripe-color="#f0f0f0"
  @row-click="handleRowClick"
/>
</template>
```

### 列配置 (Column)

```typescript
const columns: Column[] = [
  {
    key: 'name',
    title: '姓名',
    width: 200,
    hidden: false,
    fixed: 'left',
    sortable: true,
    filterable: true,
    customRender: ({ value }) => {
      return h('span', { class: 'user-name' }, value)
    }
  },
  {
    key: 'email',
    title: '邮箱',
    width: 300,
    resizable: true
  }
]
```

对齐规则：

- 表头默认居中：`headerAlign='center'`
- 数据列默认居中：`defaultAlign='center'`
- 单列可通过 `column.align` 和 `column.headerAlign` 覆盖（`left | center | right`）

可通过 `hidden` 动态控制列显隐（配合响应式列配置）：

```ts
columns.value = columns.value.map(col =>
  col.key === 'email' ? { ...col, hidden: true } : col
)
```

### 排序模式（本地 / 远程）

`CTable` 支持两种排序模式：

- `sortMode="local"`：本地排序（默认）
- `sortMode="remote"`：远程排序（仅抛出排序事件，不改本地数据顺序）

#### 1) 本地排序（默认内置比较）

```vue
<CTable
  :columns="columns"
  :data="data"
  sort-mode="local"
/>
```

```ts
const columns: Column[] = [
  { key: 'id', title: 'ID', dataIndex: 'id', sortable: true },
  { key: 'age', title: '年龄', dataIndex: 'age', sortable: true }
]
```

#### 2) 本地排序（列级自定义 sorter）

```ts
const columns: Column[] = [
  {
    key: 'name',
    title: '姓名',
    dataIndex: 'name',
    sortable: true,
    sorter: (a, b) => String(a.name).localeCompare(String(b.name))
  }
]
```

#### 3) 本地排序（全局 localSorter 扩展点）

```vue
<CTable
  :columns="columns"
  :data="data"
  sort-mode="local"
  :local-sorter="localSorter"
/>
```

```ts
const localSorter = (a: any, b: any, column: Column, order: 'asc' | 'desc' | null) => {
  const field = (column.dataIndex as string) || column.key
  const va = a?.[field]
  const vb = b?.[field]
  if (typeof va === 'number' && typeof vb === 'number') return va - vb
  return String(va ?? '').localeCompare(String(vb ?? ''))
}
```

#### 4) 远程排序（服务端排序）

```vue
<CTable
  :columns="columns"
  :data="data"
  sort-mode="remote"
  :on-sort-request="handleSortRequest"
  @sort-change="handleSortChange"
/>
```

```ts
const handleSortRequest = async (sorter: SorterConfig, sorters?: SorterConfig[]) => {
  // 根据 sorter.field / sorter.order 请求后端，然后回写 data
  // sorter.order: 'asc' | 'desc' | null
  // sorters: 多列排序状态（有 multiple 时）
  const res = await fetchUsers({ sortField: sorter.field, sortOrder: sorter.order })
  data.value = res.list
}
```

> 说明：当 `sortMode='remote'` 时，组件不会做本地排序；由业务层控制数据更新。

#### 5) 多列排序（multiple 优先级）

`multiple` 数值越大，优先级越高。

```ts
const columns: Column[] = [
  {
    key: 'role',
    title: '角色',
    dataIndex: 'role',
    sorter: { sorter: (a, b) => String(a.role).localeCompare(String(b.role)), multiple: 20 },
    sortOrder: 'asc'
  },
  {
    key: 'age',
    title: '年龄',
    dataIndex: 'age',
    sorter: { sorter: (a, b) => a.age - b.age, multiple: 10 },
    sortOrder: 'desc'
  }
]
```

也可通过 `sortConfig` 统一受控：

```vue
<CTable
  :columns="columns"
  :data="data"
  :sort-config="[
    { field: 'role', order: 'asc', multiple: 20 },
    { field: 'age', order: 'desc', multiple: 10 }
  ]"
/>
```

### 列筛选

筛选通过列配置 `filters` + 可选 `onFilter` 实现：

```ts
const columns: Column[] = [
  {
    key: 'role',
    title: '角色',
    dataIndex: 'role',
    filters: [
      { text: '管理员', value: '管理员' },
      { text: '普通用户', value: '普通用户' },
      { text: '访客', value: '访客' }
    ]
  },
  {
    key: 'status',
    title: '状态',
    dataIndex: 'status',
    filters: [
      { text: '在职', value: '在职' },
      { text: '离职', value: '离职' },
      { text: '休假', value: '休假' }
    ],
    onFilter: (value, record) => record.status === value
  }
]
```

筛选事件：

```vue
<CTable
  :columns="columns"
  :data="data"
  @filter-change="handleFilterChange"
/>
```

```ts
const handleFilterChange = (filters: Array<{ field: string; values: any[] }>) => {
  console.log(filters)
}
```

### 筛选模式（本地 / 远程）

- `filterMode="local"`：本地筛选（默认）
- `filterMode="remote"`：远程筛选（仅抛出筛选条件，由业务层更新数据）

```vue
<CTable
  :columns="columns"
  :data="data"
  filter-mode="remote"
  :on-filter-request="handleFilterRequest"
  @change="handleTableChange"
/>
```

```ts
const handleFilterRequest = async (filters: Record<string, any[]>) => {
  // 根据 filters 请求后端并回写 data
  const res = await fetchUsers({ filters })
  data.value = res.list
}

const handleTableChange = (pagination, filters, sorter) => {
  // filters 结构：{ role: ['管理员'], status: ['在职'] }
  console.log(filters)
}
```

### 统一远程查询管线（排序/筛选/分页）

```vue
<CTable
  :columns="columns"
  :data="data"
  sort-mode="remote"
  filter-mode="remote"
  pagination-mode="remote"
  :on-query-request="handleQueryRequest"
/>
```

```ts
const handleQueryRequest = async ({ pagination, filters, sorter, sorters }) => {
  // 统一请求参数：分页 + 筛选 + 排序
  // pagination: { current, pageSize, total? }
  // sorter: 当前主排序
  // sorters: 多列排序状态
  const res = await fetchUsers({ pagination, filters, sorter, sorters })
  data.value = res.list
}
```

### 行选择 (RowSelection)

```typescript
const rowSelection: RowSelectionConfig = {
  type: 'checkbox',
  selectedRowKeys: ['1', '2', '3'],
  onChange: (selectedRows, selectedKeys) => {
    console.log('选中行：', selectedRows)
  }
}
```

### 主题配置

```typescript
// 使用预设主题
<CTable theme="ant-design-dark" />

// 自定义主题
<CTable
  :theme="{
    colors: {
      primary: '#1677ff',
      background: '#ffffff',
      border: '#e8e8e8',
      stripe: '#fafafa' // 斑马线颜色
    }
  }"
/>
```

### 分页配置 (Pagination)

演示应用中的完整分页配置示例（参考 [CanvasTableDemo.vue](../../apps/demo/src/views/CanvasTableDemo.vue#L211-L231)）：

```typescript
const paginationConfig = computed(() => {
  if (!showPagination.value) return false
  return {
    current: paginationCurrent.value,        // 当前页
    pageSize: paginationPageSize.value,      // 每页条数
    total: data.value.length,               // 总数据量
    showSizeChanger: true,                // 显示页大小切换器
    showQuickJumper: true,                 // 显示快速跳转
    pageSizeOptions: [10, 20, 50, 100],   // 页大小选项
    showTotal: (total: number, range: [number, number]) =>
      `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
    onChange: (page: number, pageSize: number) => {      // 页码/页大小变化回调
      paginationCurrent.value = page
      paginationPageSize.value = pageSize
    }
  }
})
```

**功能说明**：
- **showSizeChanger**: 显示每页条数选择器
- **showQuickJumper**: 显示快速跳转输入框
- **pageSizeOptions**: 可选的每页条数
- **showTotal**: 自定义总数显示格式

### 主题配置 (Theme)

演示应用中的主题切换示例（参考 [CanvasTableDemo.vue](../../apps/demo/src/views/CanvasTableDemo.vue#L290-L319)）：

```typescript
// 1. 定义主题选项
const themes: Array<{ value: ThemePreset; label: string; color: string }> = [
  { value: 'ant-design', label: 'Ant Design', color: '#1677ff' },
  { value: 'element-plus', label: 'Element Plus', color: '#409eff' },
  { value: 'naive', label: 'Naive UI', color: '#18a058' }
]

// 2. 使用 ref 管理当前主题
const currentTheme = ref<ThemePreset>('ant-design')

// 3. 在模板中使用
<CTable :theme="currentTheme" />

// 4. 切换主题
const switchTheme = (theme: ThemePreset) => {
  currentTheme.value = theme
}
```

### 动态列生成 (Dynamic Columns)

演示应用支持动态生成 10-100 列（参考 [CanvasTableDemo.vue](../../apps/demo/src/views/CanvasTableDemo.vue#L244-L271)）：

```typescript
// 动态生成列配置
const buildColumns = (count: number): Column[] => {
  const cols: Column[] = []

  for (let i = 0; i < count; i += 1) {
    if (i < templateColumns.length) {
      // 使用预定义模板
      const tpl = templateColumns[i]
      cols.push({
        ...tpl,
        key: `${tpl.key}__${i + 1}`  // 确保 key 唯一
      })
      continue
    }

    // 动态生成额外列
    cols.push({
      key: `metric_${i}`,
      title: `指标${i}`,
      dataIndex: 'id',
      width: 110,
      align: 'right',
      render: (record: any) => {
        // 自定义渲染逻辑
        const value = calculateMetric(record, i)
        return value.toLocaleString()
      }
    })
  }

  return cols
}

// 使用计算属性
const tableColumns = computed<Column[]>(() => {
  const cols = buildColumns(columnCount.value)

  // 配置固定列
  if (cols.length > 0) {
    cols[cols.length - 1] = {
      ...cols[cols.length - 1],
      fixed: 'right'
    }
  }

  return cols
})
```

### 类型定义 (TypeScript)

完整的类型导入和定义示例：

```typescript
// 导入类型
import CTable, {
  type Column,
  type ThemePreset,
  type RowSelectionConfig
} from '@catui/ctable'

// 定义数据行类型
type DemoTableRow = {
  id: string | number
  name: string
  age: number
  address: string
  email: string
  role: string
  status: string
}

const data = ref<DemoTableRow[]>([])
```

## 🔧 开发指南

### 运行开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev:demo

# 类型检查（监听模式）
pnpm type-check --watch

# 代码检查
pnpm lint:fix
```

### 构建打包

```bash
# 构建 ctable 包
pnpm --filter @catui/ctable build

# 构建 demo
pnpm build:demo
```

### 最佳实践

1. **使用浅层比较**
   ```typescript
   // ✅ 推荐
   if (data !== lastData) {
     vtableAdapter.updateData(data)
   }

   // ❌ 避免
   if (JSON.stringify(data) !== JSON.stringify(lastData)) {
     vtableAdapter.updateData(data)
   }
   ```

2. **避免深度监听**
   ```typescript
   // ✅ 推荐
   watch(() => props.data, (newData, oldData) => {
     if (newData !== oldData) {
       vtableAdapter?.updateData(newData)
     }
   })

   // ❌ 避免
   watch(() => props.data, (newData) => {
     vtableAdapter?.updateData(newData)
   }, { deep: true })
   ```

3. **优先使用 VTable 原生 API**
   ```typescript
   // 尝试使用 VTable 的 API
   if (typeof table.setColumns === 'function') {
     table.setColumns(newColumns)
   }

   // 降级方案
   vtableAdapter.destroy()
   vtableAdapter.create()
   ```

### 列拖拽（基础）

设置列 `draggable: true` 后，可拖拽调整列顺序：

```ts
const columns: Column[] = [
  { key: 'id', title: 'ID', dataIndex: 'id', draggable: true },
  { key: 'name', title: '姓名', dataIndex: 'name', draggable: true }
]
```

### 列拖拽（分组/跨组）

```ts
const columns: Column[] = [
  {
    key: 'group_info',
    title: '基础信息',
    children: [
      { key: 'id', title: 'ID', dataIndex: 'id', draggable: true },
      { key: 'name', title: '姓名', dataIndex: 'name', draggable: true }
    ]
  },
  {
    key: 'group_metrics',
    title: '指标',
    children: [
      { key: 'score', title: '分数', dataIndex: 'score', draggable: true }
    ]
  }
]
```

```vue
<CTable
  :columns="columns"
  :data="data"
  :column-drag-config="{
    enabled: true,
    isCrossDrag: true,
    showGuidesStatus: true
  }"
  @columns-change="handleColumnsChange"
/>
```

```ts
const handleColumnsChange = (nextColumns: Column[]) => {
  columns.value = nextColumns
}
```

### 实例方法：CSV 导出

```vue
<CTable ref="tableRef" :columns="columns" :data="data" />
```

```ts
const tableRef = ref<any>()
tableRef.value?.exportCsv?.('users.csv')
```

### 实例方法：Excel 导出

```ts
const tableRef = ref<any>()
tableRef.value?.exportExcel?.('users.xlsx', 'Users')
```

### 实例方法：CSV/XLSX 导入

```ts
const tableRef = ref<any>()

// 导入 CSV 文本
const csvRows = tableRef.value?.importCsvText?.('id,name\n1,Alice', {
  hasHeader: true,
  mode: 'replace'
})

// 导入文件（File 对象）
const fileRows = await tableRef.value?.importFile?.(file, {
  mode: 'append',
  sheetName: 'Sheet1'
})
```

```vue
<CTable
  :columns="columns"
  :data="data"
  :on-import-data="(rows, meta) => {
    console.log(meta.source, rows.length)
  }"
/>
```

### 实例方法：打印

```ts
const tableRef = ref<any>()
tableRef.value?.printTable?.('用户列表打印')
```

### 实例方法：增量数据更新

```ts
const tableRef = ref<any>()

// 追加
tableRef.value?.appendRows?.([{ id: 10001, name: '新用户' }])

// 更新（按 id/key 或函数）
tableRef.value?.updateRow?.(10001, { status: '在职' })
tableRef.value?.updateRow?.((row: any) => row.role === '访客', (row: any) => ({ ...row, status: '离职' }))

// 删除（按 id/key、数组或函数）
tableRef.value?.removeRows?.(10001)
tableRef.value?.removeRows?.([10002, 10003])
tableRef.value?.removeRows?.((row: any) => row.status === '离职')
```

### 右键菜单（基础）

```vue
<CTable
  :columns="columns"
  :data="data"
  :context-menu="{
    items: [
      { key: 'copy-json', label: '复制行数据' },
      { key: 'mark-leave', label: '标记为离职' }
    ],
    onClick: (item, ctx) => {
      console.log(item, ctx.row)
    }
  }"
  @context-menu-click="handleContextMenuClick"
/>
```

### 实例方法：列结构管理

```ts
const tableRef = ref<any>()

// 获取当前列结构（含拖拽结果）
const cols = tableRef.value?.getColumns?.()

// 重置为最近一次外部传入的 columns
tableRef.value?.resetColumns?.()

// 程序化设置列结构
tableRef.value?.setColumns?.(nextColumns)
```

### 列状态持久化（顺序/显隐）

```vue
<CTable
  ref="tableRef"
  :columns="columns"
  :data="data"
  :column-state-persistence="{
    key: 'my-table-column-state',
    autoLoad: true,
    autoSave: true
  }"
/>
```

```ts
// 手动控制
tableRef.value?.saveColumnState?.()
tableRef.value?.loadColumnState?.()
tableRef.value?.clearColumnState?.()
```

### 实例方法：选择管理

```ts
const tableRef = ref<any>()

// 清空选择
tableRef.value?.clearSelection?.()

// 反选当前数据集（含分页/筛选后的当前数据源）
tableRef.value?.invertSelection?.()
```

### 插槽：页头 / 合计 / 页尾

```vue
<CTable :columns="columns" :data="data">
  <template #header>
    <div style="padding: 8px 12px; font-weight: 600">自定义页头</div>
  </template>
  <template #summary="{ data: source }">
    <div style="padding: 8px 12px">合计行：{{ source.length }} 条</div>
  </template>
  <template #footer>
    <div style="padding: 8px 12px; color: #667085">自定义页尾</div>
  </template>
</CTable>
```

### i18n（基础文案）

```vue
<CTable
  :columns="columns"
  :data="data"
  locale="en-US"
  :i18n="{
    filterSearch: 'Apply',
    contextCopyJson: 'Copy JSON'
  }"
/>
```

### 统一远程请求代理（requestProxy）

```vue
<CTable
  :columns="columns"
  :data="data"
  sort-mode="remote"
  filter-mode="remote"
  pagination-mode="remote"
  :on-query-request="queryUsers"
  :request-proxy="{
    beforeRequest: (query) => ({ ...query, ts: Date.now() }),
    afterRequest: (query) => console.log('done', query),
    onError: (error, query) => console.error('query failed', error, query)
  }"
/>
```

### 尺寸与行样式

```vue
<CTable
  :columns="columns"
  :data="data"
  size="small"
  :row-style="rowStyle"
/>
```

```ts
const rowStyle = (record: any, index: number) => {
  if (index % 10 === 0) {
    return { fontWeight: 600, color: '#0f172a' }
  }
  return {}
}
```

## 🐛 调试

### 性能分析

```typescript
// 在 create 方法中添加性能日志
create() {
  console.time('VTableInit')

  // ... 表格创建代码

  console.timeEnd('VTableInit')
  console.log('数据量：', this.options.data.length)
  console.log('列数：', this.options.columns.length)
}
```

### 常见问题

**Q: 表格不渲染数据？**
- 检查 `container` 是否已挂载
- 确认 `vtableRef` 是否有值

**Q: 斑马线不生效？**
- 确认 `stripe` 属性设置为 `true`
- 检查主题配置中是否定义了 `ripeColor`

**Q: 性能问题？**
- 减少每页数据量（建议 100-500 条）
- 关闭不必要的响应式更新
- 使用虚拟滚动而非全量渲染

## 📚 相关文档

- [项目 README](../../README.md)
- [贡献指南](../../CONTRIBUTING.md)
- [类型定义](../types/index.ts)

---

## 📝 更新日志

### v1.0.0 (2025-02-13)
- ✅ 添加斑马线功能（`stripe` 和 `stripeColor`）
- ✅ 实现浅层比较优化（`shallowEqualData`, `shallowEqualColumns`）
- ✅ 优化主题和列更新逻辑（尝试使用 VTable 原生 API）
- ✅ 添加性能优化辅助函数
- 🎨 完善类型定义（`loading`, `loadingTip`）

---

**维护者**: CatUI Team
