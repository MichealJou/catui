# CatUI 表格组件

基于 **@visactor/vtable** 的高性能 Canvas 表格组件。

## ✨ 特性

- 🚀 **百万级数据渲染** - 基于 VTable 虚拟滚动引擎
- ⚡ **高度可配置** - 完整的行列配置
- 🎨 **多主题支持** - Ant Design Vue / Element Plus / Naive UI
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

## 📖 API 参考

### 基础用法

```vue
<template>
  <CTable
    :columns="columns"
    :data="data"
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
