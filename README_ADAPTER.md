# CTable - 高性能表格组件

基于 G2 的高性能表格组件，支持百万级数据渲染和丰富的交互功能。

## ✨ 特性

- 🚀 **高性能** - 基于 Canvas 和 G2 渲染，支持百万级数据流畅滚动
- 🎨 **主题支持** - 内置 Ant Design Vue、Element Plus、NaiveUI 主题
- 📦 **按需加载** - 第三方组件库完全按需，不增加打包体积
- 🔌 **组件适配器** - 支持适配任何 UI 组件库（ant-design-vue、element-plus、naive-ui）
- 🎯 **插槽系统** - 丰富的插槽支持，完全自定义组件外观
- 🌳 **虚拟滚动** - 内置虚拟滚动，只渲染可见区域
- 🔍 **排序筛选** - 内置排序和筛选功能
- ☑️ **行选择** - 支持单选和多选
- 📱 **响应式** - 自适应容器大小

## 📦 安装

```bash
npm install @catui/ctable
```

## 🎯 快速开始

### 基础使用（使用内置组件）

```vue
<template>
  <CTable
    :columns="columns"
    :dataSource="data"
    :width="800"
    :height="600"
    :pagination="paginationConfig"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CTable from '@catui/ctable'

const columns = ref([
  { key: 'name', title: '姓名', width: 120 },
  { key: 'age', title: '年龄', width: 80 },
  { key: 'address', title: '地址', width: 200 }
])

const data = ref([
  { id: 1, name: '张三', age: 25, address: '北京' },
  { id: 2, name: '李四', age: 30, address: '上海' }
])

const paginationConfig = ref({
  current: 1,
  pageSize: 10,
  total: 2
})
</script>
```

### 使用 ant-design-vue 分页

```bash
# 安装 ant-design-vue（可选）
npm install ant-design-vue
```

```vue
<template>
  <CTable
    :adapter="{ library: 'ant-design-vue' }"
    :columns="columns"
    :dataSource="data"
    :pagination="paginationConfig"
  >
    <!-- 自定义分页插槽 -->
    <template #pagination-total="{ total, range }">
      共 {{ total }} 条，显示 {{ range[0] }}-{{ range[1] }} 条
    </template>
  </CTable>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CTable from '@catui/ctable'

// 按需导入样式（如果使用自动导入工具，可以省略）
import 'ant-design-vue/es/pagination/style/css'

const paginationConfig = ref({
  current: 1,
  pageSize: 10,
  total: 100,
  showSizeChanger: true,
  showQuickJumper: true
})
</script>
```

## ⚡ 按需加载

**重要**：CTable 的所有第三方组件依赖都是**可选的**，不会自动打包！

### 自动按需导入（推荐）

使用 `unplugin-vue-components` 自动导入组件和样式：

```bash
npm install -D unplugin-vue-components
```

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        AntDesignVueResolver()
      ]
    })
  ]
})
```

详细说明请查看：[按需加载指南](./ON_DEMAND_LOADING.md)

## 🔌 组件适配器

CTable 支持适配任何 UI 组件库：

```typescript
// 1. 默认使用内置组件（无额外依赖）
<CTable :adapter="{ library: 'default' }" />

// 2. 使用 ant-design-vue
<CTable :adapter="{ library: 'ant-design-vue' }" />

// 3. 使用 element-plus
<CTable :adapter="{ library: 'element-plus' }" />

// 4. 使用 naive-ui
<CTable :adapter="{ library: 'naive-ui' }" />
```

## 🎨 插槽系统

CTable 提供丰富的插槽支持，允许您完全自定义组件：

```vue
<CTable :pagination="paginationConfig">
  <!-- 分页总数显示 -->
  <template #pagination-total="{ total, range }">
    自定义总数显示
  </template>

  <!-- 上一页按钮 -->
  <template #pagination-prev="{ disabled }">
    自定义上一页
  </template>

  <!-- 下一页按钮 -->
  <template #pagination-next="{ disabled }">
    自定义下一页
  </template>

  <!-- 上一页文字 -->
  <template #pagination-prev-text>
    < 自定义上一页文字 />
  </template>

  <!-- 下一页文字 -->
  <template #pagination-next-text>
    < 自定义下一页文字 />
  </template>

  <!-- 页码项 -->
  <template #pagination-page-item="{ page, active, disabled }">
    自定义页码
  </template>
</CTable>
```

## 📚 API 文档

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| columns | `Column[]` | `[]` | 列配置 |
| dataSource | `any[]` | `[]` | 数据源 |
| width | `number` | `1200` | 表格宽度 |
| height | `number` | `600` | 表格高度 |
| theme | `ThemePreset \| ThemeConfig` | `'ant-design'` | 主题配置 |
| virtualScroll | `boolean` | `true` | 是否启用虚拟滚动 |
| pagination | `PaginationConfig \| false` | - | 分页配置 |
| rowSelection | `RowSelectionConfig` | - | 行选择配置 |
| adapter | `AdapterConfig` | - | 组件适配器配置 |

### 适配器配置

```typescript
interface AdapterConfig {
  library?: 'ant-design-vue' | 'element-plus' | 'naive-ui' | 'default'
  forceCustom?: boolean
  customAdapters?: {
    pagination?: PaginationAdapter
  }
}
```

### 分页配置

```typescript
interface PaginationConfig {
  current?: number
  pageSize?: number
  total?: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: (total: number, range: [number, number]) => string
  pageSizeOptions?: number[]
  // ... 更多属性
}
```

## 🌳 主题支持

CTable 内置了多个主题预设：

```typescript
// Ant Design Vue
<CTable theme="ant-design" />

// Ant Design Vue (暗黑)
<CTable theme="ant-design-dark" />

// Element Plus
<CTable theme="element-plus" />

// Element Plus (暗黑)
<CTable theme="element-plus-dark" />

// NaiveUI
<CTable theme="naive" />

// NaiveUI (暗黑)
<CTable theme="naive-dark" />

// 自定义主题
<CTable :theme="{
  colors: {
    primary: '#1677ff',
    text: '#000000',
    // ...
  }
}" />
```

## 🚀 性能

- ✅ 支持 100 万+ 数据流畅滚动
- ✅ 虚拟滚动只渲染可见区域
- ✅ Canvas 渲染，不占用 DOM 节点
- ✅ G2 自动 diff 机制，增量更新
- ✅ 按需加载第三方组件，最小化打包体积

## 🔗 相关链接

- [G2 官方文档](https://g2.antv.antgroup.com/)
- [按需加载指南](./ON_DEMAND_LOADING.md)
- [G2 集成进度](./G2_INTEGRATION_PROGRESS.md)
- [项目任务](./PROJECT_TASKS.md)

## 📄 License

MIT

---

**CatUI Team** - 高性能 Vue 3 组件库
