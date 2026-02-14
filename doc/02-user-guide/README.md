# 用户指南

本指南详细说明 CatUI 的各项功能使用方法。

## 📋 目录

- [数据加载](#数据加载)
- [分页配置](#分页配置)
- [主题切换](#主题切换)
- [行选择](#行选择)
- [列配置](#列配置)
- [功能开关](#功能开关)
- [性能优化](#性能优化)

## 📊 数据加载

### 基础数据加载

```typescript
import { ref, onMounted } from 'vue'

const data = ref<UserData[]>([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const result = await fetchUserData()
    data.value = result
  } finally {
    loading.value = false
  }
}

// 初始化加载数据
onMounted(() => {
  loadData()
})
```

### 大数据量加载

演示应用支持 **100 条 到 100 万条** 数据切换（参考 [CanvasTableDemo.vue](../../apps/demo/src/views/CanvasTableDemo.vue#L300-L314)）：

```typescript
const dataOptions = [
  { label: '100条', value: 100 },
  { label: '1千', value: 1000 },
  { label: '1万', value: 10000 },
  { label: '10万', value: 100000 },
  { label: '100万', value: 1000000 }
]

const loadData = async (count: number) => {
  loading.value = true
  try {
    const result = await getTableData(count)
    data.value = result.map((item, index) => ({
      ...item,
      __index__: index + 1
    }))
  } finally {
    loading.value = false
  }
}
```

### 数据更新优化

CatUI 内部已实现浅层比较优化：

```typescript
// ✅ 推荐：只比较数据引用
watch(() => props.data, (newData, oldData) => {
  if (newData !== oldData) {
    vtableAdapter?.updateData(newData)
  }
})

// ❌ 避免：深度比较
watch(() => props.data, (newData) => {
  vtableAdapter?.updateData(newData)
}, { deep: true })
```

## 📄 分页配置

### 基础分页

```typescript
const paginationConfig = {
  current: 1,
  pageSize: 20,
  total: 1000,
  onChange: (page: number, pageSize: number) => {
    console.log(`切换到第 ${page} 页`)
  }
}
```

### 高级分页配置

演示应用中的完整配置（参考 [CanvasTableDemo.vue](../../apps/demo/src/views/CanvasTableDemo.vue#L211-L231)）：

```typescript
const paginationConfig = computed(() => {
  if (!showPagination.value) return false
  return {
    current: paginationCurrent.value,
    pageSize: paginationPageSize.value,
    total: data.value.length,
    showSizeChanger: true,              // 显示页大小切换器
    showQuickJumper: true,               // 显示快速跳转输入框
    pageSizeOptions: [10, 20, 50, 100], // 页大小选项
    showTotal: (total, range) =>
      `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
    onChange: (page, pageSize) => {
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

## 🎨 主题切换

### 预设主题

CatUI 提供 3 种预设主题：

- **ant-design** - Ant Design 风格（默认）
- **element-plus** - Element Plus 风格
- **naive** - Naive UI 风格

### 主题切换实现

演示应用中的完整实现（参考 [CanvasTableDemo.vue](../../apps/demo/src/views/CanvasTableDemo.vue#L290-L319)）：

```typescript
// 1. 定义主题选项
const themes: Array<{ value: ThemePreset; label: string; color: string }> = [
  { value: 'ant-design', label: 'Ant Design', color: '#1677ff' },
  { value: 'element-plus', label: 'Element Plus', color: '#409eff' },
  { value: 'naive', label: 'Naive UI', color: '#18a058' }
]

// 2. 使用 ref 管理当前主题
const currentTheme = ref<ThemePreset>('ant-design')

// 3. 切换主题
const switchTheme = (theme: ThemePreset) => {
  currentTheme.value = theme
}

// 4. 在模板中使用
<CTable :theme="currentTheme" />
```

### 自定义主题

```typescript
<CTable
  :theme="{
    colors: {
      primary: '#1677ff',
      background: '#ffffff',
      border: '#e8e8e8',
      stripe: '#fafafa'
    }
  }"
/>
```

## ☑️ 行选择

### 复选框选择

```typescript
const selectedRowKeys = ref<any[]>([])
const selectedRows = ref<any[]>([])

const rowSelectionConfig = computed(() => {
  return {
    type: 'checkbox' as const,
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: any[], rows: any[]) => {
      selectedRowKeys.value = keys
      selectedRows.value = rows
    }
  }
})

// 使用
<CTable
  :selectable="true"
  :row-selection="rowSelectionConfig"
/>
```

演示应用中的实现（参考 [CanvasTableDemo.vue](../../apps/demo/src/views/CanvasTableDemo.vue#L199-L209)）。

### 单选框选择

```typescript
const rowSelectionConfig = {
  type: 'radio',
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys, rows) => {
    console.log('选中行：', rows[0])
  }
}
```

### 行选择事件

```typescript
const handleSelectionChange = (rows: any[], keys: any[]) => {
  selectedRows.value = rows
  selectedRowKeys.value = keys
  console.log('选择变化：', rows, keys)
}

<CTable @selection-change="handleSelectionChange" />
```

## 🧱 列配置

### 基础列配置

```typescript
import { type Column } from '@catui/ctable'

const columns: Column[] = [
  {
    key: 'name',
    title: '姓名',
    dataIndex: 'name',
    width: 200,
    align: 'left'
  },
  {
    key: 'age',
    title: '年龄',
    dataIndex: 'age',
    width: 100,
    align: 'center',
    sortable: true
  }
]
```

### 动态列生成

演示应用支持动态生成 10-100 列（参考 [CanvasTableDemo.vue](../../apps/demo/src/views/CanvasTableDemo.vue#L244-L271)）：

```typescript
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
```

### 固定列

```typescript
// 左侧固定
{
  key: 'id',
  title: 'ID',
  dataIndex: 'id',
  fixed: 'left',
  width: 80
}

// 右侧固定
{
  key: 'action',
  title: '操作',
  fixed: 'right',
  width: 200
}
```

演示应用中的实现（参考 [CanvasTableDemo.vue](../../apps/demo/src/views/CanvasTableDemo.vue#L276-L281)）。

### 自定义渲染

```typescript
{
  key: 'status',
  title: '状态',
  render: (record: any) => {
    const status = record.status
    const color = status === 'active' ? 'green' : 'red'
    return h('span', { style: { color } }, status)
  }
}
```

## ⚙️ 功能开关

演示应用展示了如何动态控制表格功能（参考 [CanvasTableDemo.vue](../../apps/demo/src/views/CanvasTableDemo.vue#L100-L120)）：

```vue
<template>
  <div class="controls">
    <label>
      <input type="checkbox" v-model="stripe" />
      <span>斑马纹</span>
    </label>
    <label>
      <input type="checkbox" v-model="selectable" />
      <span>可选择</span>
    </label>
    <label>
      <input type="checkbox" v-model="bordered" />
      <span>边框</span>
    </label>
    <label>
      <input type="checkbox" v-model="showPagination" />
      <span>分页</span>
    </label>
  </div>

  <CTable
    :stripe="stripe"
    :selectable="selectable"
    :selectable-type="selectable ? 'multiple' : undefined"
    :bordered="bordered"
    :pagination="paginationConfig"
  />
</template>

<script setup lang="ts">
const stripe = ref(true)
const selectable = ref(true)
const bordered = ref(true)
const showPagination = ref(true)
</script>
```

## 🎯 事件处理

### 行点击事件

```typescript
const handleRowClick = (row: any, index: number) => {
  console.log('点击行：', row, '索引：', index)
}

<CTable @row-click="handleRowClick" />
```

### 单元格点击事件

```typescript
const handleCellClick = (cell: any, row: any, column: any) => {
  console.log('点击单元格：', cell, '行：', row, '列：', column)
}

<CTable @cell-click="handleCellClick" />
```

演示应用中的事件处理（参考 [CanvasTableDemo.vue](../../apps/demo/src/views/CanvasTableDemo.vue#L326-L338)）。

## ⚡ 性能优化

### 大数据量建议

- **分页加载**: 建议每页 100-500 条
- **虚拟滚动**: 已内置，无需额外配置
- **避免频繁更新**: 使用防抖/节流
- **浅层比较**: 内部已实现，避免深度监听

### 性能监控

```typescript
console.time('VTableInit')
// ... 表格创建代码
console.timeEnd('VTableInit')
console.log('数据量：', data.value.length)
console.log('列数：', columns.value.length)
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
   // ✅ 推荐
   if (typeof table.setColumns === 'function') {
     table.setColumns(newColumns)
   }

   // ⚠️ 降级方案
   vtableAdapter.destroy()
   vtableAdapter.create()
   ```

## 🔗 相关链接

- [演示应用源码](../../apps/demo/src/views/CanvasTableDemo.vue)
- [组件文档](../../packages/ctable/README.md)
- [入门指南](../01-getting-started/README.md)
