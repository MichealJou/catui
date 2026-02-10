# 第三方组件按需加载指南

## 📦 概述

CTable 支持多种第三方组件库（ant-design-vue、element-plus、naive-ui），所有组件库都是**可选的 peerDependency**，**不会自动打包**到 CTable 中。

## 🎯 按需加载最佳实践

### 1. ant-design-vue 按需加载

#### 安装
```bash
npm install ant-design-vue
```

#### 方式一：自动按需导入（推荐）

使用 `unplugin-vue-components` 自动导入样式：

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

**使用**:
```vue
<script setup lang="ts">
import CTable from '@catui/ctable'

// 不需要手动导入 Pagination，unplugin 会自动处理
</script>

<template>
  <CTable
    :adapter="{ library: 'ant-design-vue' }"
    :pagination="paginationConfig"
  />
</template>
```

#### 方式二：手动按需导入

如果你只需要 Pagination 组件：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import CTable from '@catui/ctable'
// 只导入需要的组件
import { Pagination } from 'ant-design-vue'
import 'ant-design-vue/es/pagination/style/css'

// 注册全局组件（可选）
app.component('APagination', Pagination)
</script>

<template>
  <CTable
    :adapter="{ library: 'ant-design-vue' }"
    :pagination="paginationConfig"
  />
</template>
```

### 2. element-plus 按需加载

#### 安装
```bash
npm install element-plus
```

#### 自动按需导入

```bash
npm install -D unplugin-vue-components unplugin-auto-import
```

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        ElementPlusResolver()
      ]
    })
  ]
})
```

#### 手动按需导入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import CTable from '@catui/ctable'
import { ElPagination } from 'element-plus'
import 'element-plus/es/components/pagination/style/css'

app.component('ElPagination', ElPagination)
</script>

<template>
  <CTable
    :adapter="{ library: 'element-plus' }"
    :pagination="paginationConfig"
  />
</template>
```

### 3. naive-ui 按需加载

#### 安装
```bash
npm install naive-ui
```

#### 自动按需导入

```bash
npm install -D unplugin-vue-components
```

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        NaiveUiResolver()
      ]
    })
  ]
})
```

#### 手动按需导入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import CTable from '@catui/ctable'
import { NPagination } from 'naive-ui'

app.component('NPagination', NPagination)
</script>

<template>
  <CTable
    :adapter="{ library: 'naive-ui' }"
    :pagination="paginationConfig"
  />
</template>
```

## 📊 打包体积对比

### 不使用任何组件库（内置）
```bash
npm run build
# dist size: ~50KB (gzip)
```

### 使用 ant-design-vue (按需)
```bash
npm run build
# dist size: ~65KB (gzip) + Pagination (~15KB)
```

### 完整导入 ant-design-vue (不推荐)
```bash
npm run build
# dist size: ~500KB+ (gzip) ⚠️
```

**结论**：按需加载可以节省 **80%+** 的打包体积！

## 🔧 自定义适配器按需加载

如果你想使用其他组件库，可以创建自定义适配器：

```typescript
// my-adapters.ts
import type { PaginationAdapter } from '@catui/ctable'
import { MyPagination } from 'my-ui-library'

export const MyPaginationAdapter: PaginationAdapter = {
  name: 'MyPaginationAdapter',
  source: 'custom',

  isAvailable() {
    // 检查组件是否可用
    return true
  },

  createComponent(config, emits) {
    // 创建并返回你的分页组件
    return defineComponent({
      setup() {
        return () => h(MyPagination, {
          current: config.current,
          pageSize: config.pageSize,
          total: config.total,
          onChange: emits.change
        })
      }
    })
  }
}
```

使用自定义适配器：

```vue
<script setup lang="ts">
import CTable from '@catui/ctable'
import { MyPaginationAdapter } from './my-adapters'

const adapterConfig = {
  forceCustom: true,
  customAdapters: {
    pagination: MyPaginationAdapter
  }
}
</script>

<template>
  <CTable
    :adapter="adapterConfig"
    :pagination="paginationConfig"
  />
</template>
```

## ⚡ 性能优化建议

1. **优先使用内置组件** - 如果不需要特殊功能，内置组件已经足够好
2. **使用自动按需导入** - 配置 `unplugin-vue-components` 自动处理
3. **只安装需要的组件库** - 不要同时安装多个组件库
4. **Tree Shaking** - 确保构建工具正确配置了 Tree Shaking
5. **代码分割** - 使用动态导入分割组件库代码

## 🐛 常见问题

### Q: 提示找不到组件？
**A**: 检查是否正确安装了组件库，并且使用了按需导入的配置。

### Q: 样式丢失？
**A**: 确保导入了组件的样式文件：
```typescript
import 'ant-design-vue/es/pagination/style/css'
```

### Q: 如何确认是按需加载？
**A**: 运行 `npm run build`，查看打包报告：
```bash
npm run build -- --report
```

## 📚 相关资源

- [unplugin-vue-components 文档](https://github.com/antfu/unplugin-vue-components)
- [ant-design-vue 按需加载](https://antdv.com/docs/vue/getting-started-cn)
- [element-plus 按需加载](https://element-plus.org/zh-CN/guide/quickstart.html)
- [naive-ui 按需加载](https://www.naiveui.com/zh-CN/os-theme/docs/start)
