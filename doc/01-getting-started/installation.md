# 安装指南

本指南将帮助您在项目中安装和配置 CTable。

---

## 📦 环境要求

### 必需条件

- **Node.js**: >= 16.0.0
- **Vue**: >= 3.0.0
- **TypeScript**: >= 5.0.0（推荐）

### 支持的构建工具

- ✅ Vite >= 4.0
- ✅ Vue CLI >= 5.0
- ✅ Webpack >= 5.0

---

## 🔧 安装方式

### 方式一：NPM 安装（推荐）

```bash
# 使用 npm
npm install @catui/ctable

# 使用 yarn
yarn add @catui/ctable

# 使用 pnpm
pnpm add @catui/ctable
```

### 方式二：CDN 引入

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CTable Demo</title>
</head>
<body>
  <div id="app"></div>

  <!-- 引入 Vue 3 -->
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

  <!-- 引入 CTable -->
  <script src="https://unpkg.com/@catui/ctable/dist/ctable.umd.js"></script>

  <script>
    const { createApp } = Vue
    const { CTable } = Catui

    createApp({
      components: {
        CTable
      },
      template: `
        <CTable
          :columns="columns"
          :dataSource="data"
          :width="800"
          :height="600"
        />
      `,
      setup() {
        const columns = [
          { key: 'name', title: '姓名', width: 120 },
          { key: 'age', title: '年龄', width: 80 }
        ]

        const data = [
          { id: 1, name: '张三', age: 25 },
          { id: 2, name: '李四', age: 30 }
        ]

        return { columns, data }
      }
    }).mount('#app')
  </script>
</body>
</html>
```

---

## ⚙️ 配置

### Vite 项目配置

如果使用 Vite，无需额外配置，直接使用即可：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()]
})
```

### Vue CLI 项目配置

如果使用 Vue CLI，确保正确配置了 TypeScript：

```javascript
// vue.config.js
module.exports = {
  transpileDependencies: ['@catui/ctable'],
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => ({
        ...options,
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('c-')
        }
      }))
  }
}
```

### TypeScript 配置

确保 `tsconfig.json` 包含以下配置：

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["vite/client"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ]
}
```

---

## 🎯 完整示例

### 项目结构

```
my-project/
├── src/
│   ├── components/
│   │   └── MyTable.vue
│   ├── App.vue
│   └── main.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### main.ts

```typescript
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

### App.vue

```vue
<template>
  <div class="app">
    <h1>CTable 示例</h1>
    <MyTable />
  </div>
</template>

<script setup lang="ts">
import MyTable from './components/MyTable.vue'
</script>

<style>
.app {
  padding: 20px;
}
</style>
```

### MyTable.vue

```vue
<template>
  <CTable
    :columns="columns"
    :dataSource="data"
    :width="1200"
    :height="600"
    :pagination="paginationConfig"
    theme="ant-design"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CTable from '@catui/ctable'

const columns = ref([
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '姓名', width: 120 },
  { key: 'age', title: '年龄', width: 80 },
  { key: 'email', title: '邮箱', width: 200 },
  { key: 'address', title: '地址', width: 300 }
])

const data = ref([
  { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com', address: '北京市朝阳区' },
  { id: 2, name: '李四', age: 30, email: 'lisi@example.com', address: '上海市浦东新区' },
  { id: 3, name: '王五', age: 28, email: 'wangwu@example.com', address: '广州市天河区' }
])

const paginationConfig = ref({
  current: 1,
  pageSize: 10,
  total: 3,
  showSizeChanger: true,
  showQuickJumper: true
})
</script>
```

---

## 🔌 可选依赖

### 使用 ant-design-vue 组件

如果需要使用 Ant Design Vue 的分页组件：

```bash
npm install ant-design-vue
```

```vue
<template>
  <CTable
    :adapter="{ library: 'ant-design-vue' }"
    :pagination="paginationConfig"
  />
</template>
```

详细说明：[按需加载指南](../02-user-guide/on-demand-loading.md)

### 使用 element-plus 组件

```bash
npm install element-plus
```

```vue
<template>
  <CTable
    :adapter="{ library: 'element-plus' }"
    :pagination="paginationConfig"
  />
</template>
```

### 使用 naive-ui 组件

```bash
npm install naive-ui
```

```vue
<template>
  <CTable
    :adapter="{ library: 'naive-ui' }"
    :pagination="paginationConfig"
  />
</template>
```

---

## ✅ 验证安装

运行开发服务器：

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173`，您应该看到一个正常渲染的表格。

---

## 🐛 常见问题

### 问题 1: 找不到模块 '@catui/ctable'

**解决方案**:
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

### 问题 2: TypeScript 类型错误

**解决方案**: 确保 `tsconfig.json` 中正确配置了 `moduleResolution: "node"`

### 问题 3: 样式不生效

**解决方案**: 检查是否正确引入了样式文件（如果使用第三方 UI 库）

### 问题 4: Vue 版本不兼容

**解决方案**: 确保使用 Vue 3.x，CTable 不支持 Vue 2

---

## 📦 版本管理

### 查看已安装版本

```bash
npm list @catui/ctable
```

### 更新到最新版本

```bash
npm update @catui/ctable
```

### 安装特定版本

```bash
npm install @catui/ctable@1.0.0
```

---

## 🎉 下一步

安装完成后，查看[快速开始](./quick-start.md)创建您的第一个表格！

---

**需要帮助？**
- 查看[常见问题](../09-faq/) ⏳
- [提交 Issue](链接)
