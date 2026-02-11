# CatUI 项目说明

CatUI 是一个基于 Vue 3 + TypeScript 的高性能 Canvas 表格组件库。

## 项目技术栈

- Vue 3.3 (Composition API + `<script setup>`)
- TypeScript 5.3
- Vite 5.0
- Less（CSS 预处理器）
- @antv/s2-vue（表格组件）

## 重要规则

**在执行任何任务前，请务必阅读并遵循：** [.claude/WORKFLOW.md](.claude/WORKFLOW.md)

该文件定义了：
- ✅ 工作流程和阶段
- ✅ 如何使用项目 Skills
- ✅ 代码风格要求
- ✅ 禁止行为
- ✅ 完成标准

## 可用的 Skills

本项目已配置以下 Claude Skills：

| Skill | 用途 |
|-------|------|
| `vue` | Vue 开发最佳实践 |
| `ant-design-vue` | Ant Design Vue 组件参考 |
| `element-plus-vue3` | Element Plus 组件参考 |
| `ui-design-system` | UI 设计系统 |
| `frontend-design` | 前端设计助手 |
| `interaction-design` | 交互设计指南 |
| `ui-ux-pro-max` | UI/UX 智能助手（内置） |

## 项目结构

```
catui/
├── apps/demo/           # Demo 应用
├── packages/ctable/     # 核心表格组件库
├── .claude/             # Claude Code 配置
│   ├── WORKFLOW.md      # ⚠️ 工作流程规则（必读）
│   ├── SKILLS.md        # Skills 配置说明
│   └── settings.local.json
└── package.json
```

## 快速命令

```bash
# 开发
pnpm dev:demo

# 构建
pnpm build

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 自动修复
pnpm lint:fix
```

## 注意事项

- ❌ **不要** 建议使用 Tailwind CSS（项目使用 Less）
- ❌ **不要** 跳过 TypeScript 类型检查
- ✅ **务必** 在代码完成后运行 `pnpm type-check` 和 `pnpm lint`
- ✅ **务必** 遵循 WORKFLOW.md 中定义的流程
