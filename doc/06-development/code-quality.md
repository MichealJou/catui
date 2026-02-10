# 代码质量保障体系

本文档介绍 CTable 项目的代码质量保障工具和使用方法。

**最后更新**: 2026-02-10

---

## 📋 目录

- [工具概览](#工具概览)
- [ESLint](#eslint)
- [Prettier](#prettier)
- [UnoCSS](#unocss)
- [Husky](#husky)
- [VS Code 配置](#vs-code-配置)
- [最佳实践](#最佳实践)

---

## 🔧 工具概览

| 工具 | 用途 | 配置文件 |
|------|------|----------|
| **ESLint** | 代码质量检查 | `.eslintrc.js` |
| **Prettier** | 代码格式化 | `.prettierrc.js` |
| **UnoCSS** | 原子化 CSS | `uno.config.ts` |
| **Husky** | Git Hooks | `.husky/` |
| **lint-staged** | 暂存文件检查 | `.lintstagedrc.js` |

---

## ✅ ESLint

### 安装

```bash
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-vue @vue/eslint-config-typescript @vue/eslint-config-prettier
```

### 配置文件

位置：`.eslintrc.js`

```javascript
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    '@vue/prettier'
  ],
  rules: {
    // 自定义规则
  }
}
```

### 使用方法

#### 命令行

```bash
# 检查所有文件
pnpm lint

# 检查并自动修复
pnpm lint:fix

# 检查指定文件
pnpm lint src/
```

#### VS Code

安装 ESLint 扩展后，编辑器会实时显示错误和警告：

```
❌ 错误：红色波浪线
⚠️ 警告：黄色波浪线
```

### 常见规则

| 规则 | 说明 | 配置 |
|------|------|------|
| `no-console` | 禁止 console | 生产环境警告 |
| `no-unused-vars` | 禁止未使用变量 | 错误 |
| `@typescript-eslint/no-explicit-any` | 禁止 any | 警告 |
| `vue/multi-word-component-names` | 组件名多单词 | 错误 |

---

## 🎨 Prettier

### 安装

```bash
pnpm add -D prettier
```

### 配置文件

位置：`.prettierrc.js`

```javascript
module.exports = {
  singleQuote: true,    // 单引号
  semi: false,          // 无分号
  printWidth: 100,      // 每行 100 字符
  tabWidth: 2,          // 缩进 2 空格
  trailingComma: 'none' // 无尾随逗号
}
```

### 使用方法

#### 命令行

```bash
# 检查格式
pnpm prettier --check .

# 格式化所有文件
pnpm prettier --write .

# 格式化指定文件
pnpm prettier --write src/
```

#### VS Code

保存时自动格式化（已配置）：
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### 格式化示例

```typescript
// Before
const data = {
  name: "CTable",
  version: "1.0.0",
};

function hello() {
  console.log("Hello World");
}

// After (Prettier 格式化后)
const data = {
  name: 'CTable',
  version: '1.0.0'
}

function hello() {
  console.log('Hello World')
}
```

---

## 🎨 UnoCSS

### 简介

UnoCSS 是一个原子化 CSS 引擎，类似 Tailwind CSS，但性能更好、体积更小。

### 安装

```bash
pnpm add -D unocss
```

### 配置文件

位置：`uno.config.ts`

```typescript
import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno()],
  shortcuts: {
    'flex-center': 'flex items-center justify-center'
  }
})
```

### 使用方法

#### 在 Vue 文件中

```vue
<template>
  <!-- 使用原子化类 -->
  <div class="flex items-center justify-between p-4 bg-white">
    <h1 class="text-xl font-bold text-gray-900">标题</h1>
    <button class="btn btn-primary">按钮</button>
  </div>
</template>
```

#### 使用快捷方式

```vue
<template>
  <!-- 使用 shortcuts 中定义的快捷类 -->
  <div class="flex-center">
    <button class="btn-primary">点击</button>
  </div>
</template>
```

#### 属性化模式

```vue
<template>
  <!-- 使用属性模式 -->
  <div flex="~ items-center justify-between" p="4" bg="white">
    <h1 text="xl font-bold text-gray-900">标题</h1>
  </div>
</template>
```

### 常用类名

#### 布局
```html
<!-- Flex -->
<div class="flex">                    <!-- flex 容器 -->
<div class="flex items-center">       <!-- 垂直居中 -->
<div class="flex justify-between">    <!-- 两端对齐 -->

<!-- Grid -->
<div class="grid grid-cols-3">        <!-- 3 列网格 -->
<div class="grid gap-4">              <!-- 间距 4 -->

<!-- 尺寸 -->
<div class="w-full">                  <!-- 100% 宽度 -->
<div class="h-screen">                <!-- 100vh 高度 -->
<div class="p-4">                     <!-- padding: 1rem -->
<div class="m-2">                     <!-- margin: 0.5rem -->
```

#### 颜色
```html
<div class="bg-white">                <!-- 背景白色 -->
<div class="bg-blue-500">             <!-- 背景蓝色 -->
<div class="text-gray-900">           <!-- 文字深灰 -->
<div class="border-gray-200">         <!-- 边框浅灰 -->
```

#### 文本
```html
<div class="text-sm">                 <!-- 小字 -->
<div class="text-lg">                 <!-- 大字 -->
<div class="font-bold">               <!-- 粗体 -->
<div class="text-center">             <!-- 居中 -->
```

#### 交互
```html
<button class="hover:bg-blue-600">    <!-- 悬停背景色 -->
<button class="active:scale-95">      <!-- 点击缩小 -->
<button class="disabled:opacity-50">  <!-- 禁用半透明 -->
```

### 自定义快捷方式

在 `uno.config.ts` 中添加：

```typescript
shortcuts: {
  // 按钮样式
  'btn': 'px-4 py-2 rounded cursor-pointer transition-all',
  'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600',

  // 卡片样式
  'card': 'bg-white rounded-lg shadow-md p-4'
}
```

使用：
```vue
<template>
  <button class="btn btn-primary">按钮</button>
  <div class="card">卡片内容</div>
</template>
```

---

## 🪝 Husky + lint-staged

### 安装

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

### 配置文件

**`.husky/pre-commit`**:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged
```

**`.lintstagedrc.js`**:
```javascript
module.exports = {
  '*.{js,jsx,ts,tsx,vue}': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.{json,md,yml,yaml}': [
    'prettier --write'
  ]
}
```

### 工作流程

```
git add .
    ↓
git commit
    ↓
Husky 触发 pre-commit hook
    ↓
lint-staged 运行
    ↓
ESLint 检查并修复
    ↓
Prettier 格式化
    ↓
git commit 完成
```

---

## 💻 VS Code 配置

### 推荐扩展

已包含在 `.vscode/extensions.json` 中：

1. **ESLint** - 代码检查
2. **Prettier** - 代码格式化
3. **Volar** - Vue 3 支持
4. **UnoCSS** - 原子化 CSS 智能
5. **TypeScript Vue Plugin** - Vue TypeScript 支持

### 工作区设置

已包含在 `.vscode/settings.json` 中：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

---

## ✨ 最佳实践

### 1. 提交前检查

```bash
# 运行所有检查
pnpm lint

# 运行类型检查
pnpm type-check

# 运行测试
pnpm test
```

### 2. 代码风格

**✅ 推荐**:
```typescript
// 使用单引号
const name = 'CTable'

// 不使用分号
const version = '1.0.0'

// 优先使用 const
const PI = 3.14

// 使用 ===
if (type === 'table') {
  // ...
}
```

**❌ 避免**:
```typescript
// 双引号
const name = "CTable"

// 使用分号
const version = "1.0.0";

// 使用 var
var PI = 3.14;

// 使用 ==
if (type == 'table') {
  // ...
}
```

### 3. Vue 组件风格

**文件命名**: PascalCase
```
✅ Good: CTable.vue, DataTable.vue
❌ Bad: ctable.vue, data-table.vue
```

**组件定义**: 使用 `<script setup>`
```vue
<script setup lang="ts">
// ✅ Good
import { ref } from 'vue'

const count = ref(0)
</script>

<script>
// ❌ Bad
export default {
  data() {
    return { count: 0 }
  }
}
</script>
```

### 4. CSS 使用

**优先使用 UnoCSS**:
```vue
<template>
  <!-- ✅ Good - 使用 UnoCSS -->
  <div class="flex items-center p-4 bg-white">

  <!-- ❌ Bad - 使用 style -->
  <div style="display: flex; padding: 1rem;">
</template>
```

**复杂样式使用 CSS**:
```vue
<template>
  <div class="custom-card">
    <!-- UnoCSS 处理不了时使用 CSS -->
  </div>
</template>

<style scoped>
.custom-card {
  /* 复杂的样式逻辑 */
  background: linear-gradient(45deg, #1890ff, #096dd9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
```

### 5. 导入顺序

```typescript
// 1. Node.js 内置模块
import path from 'path'

// 2. 第三方库
import { ref } from 'vue'
import { cloneDeep } from 'lodash-es'

// 3. 内部模块
import { CTable } from '@/components'
import type { User } from '@/types'

// 4. 相对路径导入
import { formatDate } from './utils/format'

// 5. 样式导入
import './styles.css'
```

---

## 🐛 常见问题

### 问题 1: ESLint 不工作

**解决方案**:
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
pnpm install

# 重启 VS Code
```

### 问题 2: Prettier 格式化不生效

**解决方案**:
```bash
# 检查 Prettier 是否安装
pnpm list prettier

# 手动运行
pnpm prettier --write src/
```

### 问题 3: UnoCSS 类名不提示

**解决方案**:
1. 确保 VS Code 安装了 UnoCSS 扩展
2. 重启 VS Code
3. 检查 `uno.config.ts` 是否正确配置

### 问题 4: Husky 不触发

**解决方案**:
```bash
# 重新初始化 Husky
pnpm exec husky init

# 检查 .husky 目录权限
chmod +x .husky/*
```

---

## 📚 相关文档

- [代码规范](./coding-standards.md)
- [开发工作流](./workflow.md) ⏳
- [ESLint 文档](https://eslint.org/)
- [Prettier 文档](https://prettier.io/)
- [UnoCSS 文档](https://unocss.dev/)

---

**维护者**: CTable 开发团队
**最后更新**: 2026-02-10
