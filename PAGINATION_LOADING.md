# CTable 分页加载状态功能

## 功能说明

CTable 现已支持在分页切换时显示加载状态。当用户点击分页按钮或改变每页条数时，会显示一个加载遮罩层，等数据渲染完成后再自动隐藏。

## 默认行为

- **加载延迟**：300ms（用于显示加载状态给用户反馈）
- **自动隐藏**：数据渲染完成后自动隐藏加载状态
- **默认组件**：使用内置的 CSS 加载动画

## 使用示例

### 基础使用（使用内置加载组件）

```vue
<template>
  <CTable
    :columns="columns"
    :data-source="data"
    :pagination="{
      current: currentPage,
      pageSize: 10,
      total: data.length
    }"
    @change="handlePageChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CTable from '@catui/ctable'

const currentPage = ref(1)
const columns = [...]
const data = [...]

const handlePageChange = (pagination) => {
  currentPage.value = pagination.current
  // 如果需要从服务器加载数据，可以在这里发起请求
}
</script>
```

### 使用 ant-design-vue 的加载组件

```vue
<template>
  <CTable
    :columns="columns"
    :data-source="data"
    :pagination="paginationConfig"
    :adapter="{ library: 'ant-design-vue' }"
  />
</template>

<script setup lang="ts">
// 安装 ant-design-vue: npm install ant-design-vue
import CTable from '@catui/ctable'
</script>
```

### 使用 element-plus 的加载组件

```vue
<template>
  <CTable
    :columns="columns"
    :data-source="data"
    :pagination="paginationConfig"
    :adapter="{ library: 'element-plus' }"
  />
</template>

<script setup lang="ts">
// 安装 element-plus: npm install element-plus
import CTable from '@catui/ctable'
</script>
```

### 使用 naive-ui 的加载组件

```vue
<template>
  <CTable
    :columns="columns"
    :data-source="data"
    :pagination="paginationConfig"
    :adapter="{ library: 'naive-ui' }"
  />
</template>

<script setup lang="ts">
// 安装 naive-ui: npm install naive-ui
import CTable from '@catui/ctable'
</script>
```

## 自定义加载适配器

如果需要使用其他 UI 库的加载组件，可以创建自定义适配器：

```typescript
import type { LoadingAdapter } from '@catui/ctable'
import { defineComponent, h } from 'vue'

export const MyLoadingAdapter: LoadingAdapter = {
  name: 'MyLoadingAdapter',
  source: 'custom',

  isAvailable() {
    return true
  },

  createComponent(config, slots) {
    return defineComponent({
      setup(_, { slots }) {
        return () => h('div', {
          class: 'my-loading',
          style: {
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: config.spinning ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }, [
          h('div', { class: 'my-spinner' }),
          config.tip ? h('div', { class: 'my-tip' }, config.tip) : null
        ])
      }
    })
  }
}
```

## 工作原理

### 分页切换流程

1. **用户点击分页** → `handlePageChange` 被触发
2. **显示加载状态** → `isLoading.value = true`
3. **更新分页参数** → `currentPage.value = page`
4. **等待 Vue 更新** → `await nextTick()`
5. **模拟异步加载** → `await new Promise(...)` (300ms)
6. **渲染新数据** → `renderTable()`
7. **等待渲染完成** → `await nextTick()`
8. **隐藏加载状态** → `isLoading.value = false`

### 异步数据加载场景

如果你的数据需要从服务器异步加载，可以这样实现：

```vue
<script setup lang="ts">
const isLoading = ref(false)
const tableData = ref([])

const handlePageChange = async (pagination) => {
  isLoading.value = true

  try {
    // 从服务器加载数据
    const response = await fetch(`/api/data?page=${pagination.current}&size=${pagination.pageSize}`)
    const data = await response.json()
    tableData.value = data.items
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
```

## 可用的适配器

| 适配器 | 库名 | 安装命令 | 状态 |
|--------|------|----------|------|
| DefaultLoadingAdapter | 内置 | - | ✅ 可用 |
| AntDesignVueLoadingAdapter | ant-design-vue | `npm install ant-design-vue` | ✅ 可用 |
| ElementPlusLoadingAdapter | element-plus | `npm install element-plus` | ✅ 可用 |
| NaiveUiLoadingAdapter | naive-ui | `npm install naive-ui` | ✅ 可用 |

## 按需加载

所有第三方 UI 库都是 **peerDependency**，不会自动打包到 CTable 中。你只需要安装你实际使用的库：

```bash
# 只安装 ant-design-vue
npm install ant-design-vue

# 或只安装 element-plus
npm install element-plus

# 或只安装 naive-ui
npm install naive-ui
```

## 样式定制

加载组件使用以下 CSS 变量和类名，可以通过全局样式进行定制：

```css
/* 加载遮罩层 */
.ctable-loading-overlay {
  /* 自定义背景色 */
  background-color: rgba(255, 255, 255, 0.9);
}

/* 加载旋转器 */
.ctable-loading-spinner {
  /* 自定义大小和颜色 */
  width: 40px;
  height: 40px;
  border-top-color: #f00;
}
```

## 注意事项

1. **加载延迟**：默认的 300ms 延迟是为了让用户能感知到加载状态。如果你的数据是同步的，可以去掉这个延迟。
2. **Canvas 渲染**：CTable 使用 Canvas 渲染，`renderTable()` 是同步的，所以使用 `nextTick()` 确保渲染完成。
3. **异步数据**：如果从服务器加载数据，应该在 `handlePageChange` 中发起异步请求，而不是使用默认的延迟。
4. **按需加载**：记得只安装你使用的 UI 库，避免打包体积过大。

## 相关文档

- [按需加载指南](./ON_DEMAND_LOADING.md)
- [适配器开发指南](./README_ADAPTER.md)
- [分页配置](./PAGINATION.md)
