# 入门指南

欢迎使用 CatUI！本指南将帮助您快速上手。

## 📦 安装

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-org/catui.git
cd catui

# 安装依赖
pnpm install
```

## 🚀 快速开始

### 启动演示应用

```bash
pnpm dev:demo
```

访问 http://localhost:5173 查看演示。

演示应用展示了 CatUI 的所有核心功能：

- 📊 **数据量测试** - 支持 100条 到 100万条数据切换
- 🧱 **列数控制** - 动态生成 10-100 列
- 🎨 **主题切换** - Ant Design / Element Plus / Naive UI
- ⚙️ **功能配置** - 斑马纹、行选择、边框、分页开关
- 📄 **分页集成** - 完整的分页配置（快速跳转、页大小切换）

详细代码请查看：[apps/demo/src/views/CanvasTableDemo.vue](../../apps/demo/src/views/CanvasTableDemo.vue)

### 第一个表格

创建 `src/views/MyTable.vue`:

```vue
<template>
  <div class="table-container">
    <CTable
      :columns="columns"
      :data="data"
      :stripe="true"
      @row-click="handleRowClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CTable, { type Column } from '@catui/ctable'

const columns: Column[] = [
  { key: 'name', title: '姓名', dataIndex: 'name', width: 200 },
  { key: 'age', title: '年龄', dataIndex: 'age', width: 100, align: 'center' },
  { key: 'email', title: '邮箱', dataIndex: 'email', width: 300 }
]

const data = ref([
  { id: '1', name: '张三', age: 25, email: 'zhangsan@example.com' },
  { id: '2', name: '李四', age: 30, email: 'lisi@example.com' }
])

const handleRowClick = (row: any) => {
  console.log('点击行：', row)
}
</script>

<style scoped>
.table-container {
  padding: 20px;
  height: 600px;
}
</style>
```

## 🎨 主题定制

CatUI 提供 3 种预设主题：

- **ant-design** - Ant Design 风格（默认）
- **element-plus** - Element Plus 风格
- **naive** - Naive UI 风格

### 使用预设主题

```vue
<template>
  <CTable theme="element-plus" />
</template>
```

### 主题切换

演示应用中展示了完整的主题切换实现（参考 [CanvasTableDemo.vue](../../apps/demo/src/views/CanvasTableDemo.vue#L290-L319)）：

```typescript
// 1. 定义主题选项
const themes = [
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
  },
  {
    key: 'email',
    title: '邮箱',
    dataIndex: 'email',
    width: 300,
    resizable: true
  }
]
```

### 动态列生成

演示应用支持动态生成 10-100 列（参考 [CanvasTableDemo.vue](../../apps/demo/src/views/CanvasTableDemo.vue#L244-L271)）。

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

## 📚 下一步

- [用户指南](../02-user-guide/README.md) - 深入了解功能使用
- [组件文档](../../packages/ctable/README.md) - 完整 API 参考

## 🔗 相关链接

- [演示应用源码](../../apps/demo/src/views/CanvasTableDemo.vue)
- [贡献指南](../../CONTRIBUTING.md)
