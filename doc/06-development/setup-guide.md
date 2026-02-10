# 开发环境配置总结

本文档总结了 CTable 项目的所有配置文件和设置。

**最后更新**: 2026-02-10
**配置状态**: ✅ 已完成

---

## 📋 配置文件清单

### 代码质量 ✅

| 文件 | 用途 | 状态 |
|------|------|------|
| `.eslintrc.js` | ESLint 代码检查规则 | ✅ 已创建 |
| `.eslintignore` | ESLint 忽略文件 | ✅ 已创建 |
| `.prettierrc.js` | Prettier 格式化规则 | ✅ 已创建 |
| `.prettierignore` | Prettier 忽略文件 | ✅ 已创建 |
| `.lintstagedrc.js` | Lint-staged 配置 | ✅ 已创建 |

### 样式配置 ✅

| 文件 | 用途 | 状态 |
|------|------|------|
| `uno.config.ts` | UnoCSS 原子化 CSS | ✅ 已创建 |
| `vite.config.ts` | Vite 构建配置 | ✅ 已更新 |

### Git Hooks ✅

| 文件 | 用途 | 状态 |
|------|------|------|
| `.husky/pre-commit` | 提交前检查 | ✅ 已创建 |

### VS Code 配置 ✅

| 文件 | 用途 | 状态 |
|------|------|------|
| `.vscode/settings.json` | 编辑器设置 | ✅ 已创建 |
| `.vscode/extensions.json` | 推荐扩展 | ✅ 已创建 |

---

## 🔧 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖（包括开发依赖）
pnpm install

# 需要安装的包：
# - ESLint 相关
# - Prettier
# - UnoCSS
# - Husky
# - lint-staged
```

### 2. 安装所需依赖包

```bash
# ESLint 和 TypeScript
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-vue @vue/eslint-config-typescript @vue/eslint-config-prettier

# Prettier
pnpm add -D prettier

# UnoCSS
pnpm add -D unocss

# Husky 和 lint-staged
pnpm add -D husky lint-staged
pnpm exec husky init
```

### 3. 验证配置

```bash
# 检查 ESLint
pnpm lint

# 检查 Prettier
pnpm prettier --check .

# 运行类型检查
pnpm type-check

# 测试 Git Hooks
git commit -m "test: verify husky"
```

---

## 📁 项目结构

```
catui/
├── .eslintrc.js              # ESLint 配置
├── .eslintignore             # ESLint 忽略
├── .prettierrc.js            # Prettier 配置
├── .prettierignore           # Prettier 忽略
├── .lintstagedrc.js          # Lint-staged 配置
├── uno.config.ts             # UnoCSS 配置
├── vite.config.ts            # Vite 配置（已更新）
│
├── .husky/                   # Git Hooks
│   └── pre-commit            # 提交前检查
│
├── .vscode/                  # VS Code 配置
│   ├── settings.json         # 编辑器设置
│   └── extensions.json       # 推荐扩展
│
└── doc/                      # 文档
    └── 06-development/
        ├── README.md                 # 开发指南索引
        ├── coding-standards.md       # 代码规范
        └── code-quality.md           # 代码质量文档
```

---

## ⚙️ 配置说明

### ESLint 配置

**文件**: `.eslintrc.js`

**关键规则**:
- ✅ Vue 3 推荐
- ✅ TypeScript 严格模式
- ✅ Prettier 兼容
- ✅ 禁止 `any` 类型（警告）
- ✅ 多单词组件名（必须）

**使用**:
```bash
pnpm lint          # 检查
pnpm lint:fix      # 修复
```

### Prettier 配置

**文件**: `.prettierrc.js`

**关键设置**:
- ✅ 单引号
- ✅ 无分号
- ✅ 每行 100 字符
- ✅ 2 空格缩进
- ✅ 无尾随逗号

**使用**:
```bash
pnpm prettier --check .   # 检查
pnpm prettier --write .   # 格式化
```

### UnoCSS 配置

**文件**: `uno.config.ts`

**特性**:
- ✅ 默认预设（类似 Tailwind）
- ✅ 属性化模式
- ✅ 图标支持
- ✅ 自定义快捷方式

**快捷方式**:
- `flex-center` - flex 居中
- `btn-primary` - 主要按钮
- `card` - 卡片样式

### Husky + lint-staged

**文件**: `.husky/pre-commit`, `.lintstagedrc.js`

**工作流程**:
```
git commit
    ↓
pre-commit hook 触发
    ↓
lint-staged 运行
    ↓
ESLint 检查 + Prettier 格式化
    ↓
通过后提交完成
```

---

## 🎯 代码风格

### JavaScript / TypeScript

```typescript
// ✅ Good
const name = 'CTable'
const version = '1.0.0'

function getData(): Data {
  return { name, version }
}

// ❌ Bad
const name = "CTable";  // 双引号 + 分号
let version = "1.0.0";  // 使用 var
```

### Vue 组件

```vue
<!-- ✅ Good - PascalCase 文件名 -->
<!-- DataTable.vue -->

<script setup lang="ts">
// ✅ 使用 <script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="card">
    <h1 class="text-xl">Title</h1>
  </div>
</template>
```

### CSS 样式

```vue
<template>
  <!-- ✅ Good - 使用 UnoCSS -->
  <div class="flex items-center p-4 bg-white">

  <!-- ✅ Good - 复杂样式使用 CSS -->
  <div class="custom-card">
</template>

<style scoped>
.custom-card {
  background: linear-gradient(45deg, #1890ff, #096dd9);
}
</style>
```

---

## 📝 package.json 脚本

需要在 `package.json` 中添加以下脚本：

```json
{
  "scripts": {
    "lint": "eslint . --ext .vue,.js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .vue,.js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "vue-tsc --noEmit",
    "prepare": "husky install"
  }
}
```

---

## ✨ VS Code 集成

### 自动安装推荐扩展

打开项目后，VS Code 会提示安装推荐扩展：

1. **ESLint** - 代码检查
2. **Prettier** - 代码格式化
3. **Volar** - Vue 3 支持
4. **UnoCSS** - 原子化 CSS

### 自动格式化

保存文件时自动：
- ✅ Prettier 格式化
- ✅ ESLint 修复

### 配置文件

`.vscode/settings.json`:
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

## 🧪 测试配置

### 运行测试

```bash
# 单元测试
pnpm test

# 测试覆盖率
pnpm test:coverage

# 目标：>= 80%
```

---

## 🚨 常见问题

### Q1: ESLint 不工作

```bash
# 重新安装
rm -rf node_modules
pnpm install

# 重启 VS Code
```

### Q2: Prettier 格式化不生效

```bash
# 检查配置
cat .prettierrc.js

# 手动运行
pnpm format
```

### Q3: Husky 不触发

```bash
# 重新初始化
pnpm exec husky init

# 检查权限
chmod +x .husky/pre-commit
```

### Q4: UnoCSS 提示不工作

1. 安装 VS Code 扩展：`antfu.unocss`
2. 重启 VS Code
3. 检查 `uno.config.ts` 配置

---

## 📚 相关文档

- [代码质量保障](./code-quality.md)
- [代码规范](./coding-standards.md)
- [开发指南](./README.md)

---

## 🎉 配置完成！

恭喜！您的开发环境已配置完成。

### 下一步

1. ✅ 安装 VS Code 推荐扩展
2. ✅ 运行 `pnpm lint` 验证配置
3. ✅ 开始开发！

### 需要帮助？

- 查看[代码质量文档](./code-quality.md)
- 查看[代码规范](./coding-standards.md)
- 提交 Issue

---

**配置完成时间**: 2026-02-10
**维护者**: CTable 开发团队
