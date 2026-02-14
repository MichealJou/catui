# CatUI

一个基于 Vue 3 + TypeScript 的高性能 Canvas 表格组件库。

## 🚀 技术栈

- **Vue 3.3** - 渐进式框架
- **TypeScript 5.3** - 类型安全
- **Vite 5.0** - 构建工具
- **Less** - CSS 预处理器
- **@visactor/vtable** - 高性能 Canvas 表格
- **pnpm** - 包管理器

## 📦 安装依赖

```bash
pnpm install
```

## 🛠️ 开发

```bash
# 启动开发服务器
pnpm dev

# 启动 demo
pnpm dev:demo

# 构建
pnpm build

# 代码检查
pnpm lint

# 代码修复
pnpm lint:fix
```

## 👥 团队开发 - Claude Skills 配置

本项目使用 Claude Skills 来提升 AI 辅助开发效率。

### 快速开始

克隆项目后，运行以下命令安装团队统一的 skills：

```bash
pnpm skills:setup
```

### 验证 Skills 安装

```bash
pnpm skills:check
```

### 更新 Skills

```bash
pnpm skills:update
```

### 📋 必需的 Skills 列表

| Skill    | 说明                | 用途           |
| --------- | ------------------- | -------------- |
| `vue`     | Vue 开发最佳实践  | 组件开发、架构设计 |
| `ant-design-vue` | Ant Design Vue   | UI 组件参考     |
| `element-plus-vue3` | Element Plus Vue 3 | UI 组件参考     |
| `ui-design-system` | UI 设计系统    | 设计系统构建    |
| `frontend-design` | 前端设计助手 | 前端设计决策   |
| `interaction-design` | 交互设计指南 | 交互设计优化   |

详细说明请查看 [.claude/SKILLS.md](.claude/SKILLS.md)

### 💡 提示词推荐

查看常用提示词和最佳实践：👉 **[.claude/PROMPTS.md](.claude/PROMPTS.md)**

包含：

- Vue 组件开发提示词
- 代码重构提示词
- 性能优化提示词
- Bug 修复提示词
- 测试编写提示词
- UI/UX 设计提示词

### 🤖 Agent Teams

了解如何使用多个 AI 代理协同工作：👉 **[.claude/TEAMS.md](.claude/TEAMS.md)**

Agent Teams 允许你创建专业化的 AI 团队：

- **Developer Agent** - 代码实现
- **Designer Agent** - UI/UX 设计
- **Reviewer Agent** - 代码审查
- **Tester Agent** - 测试验证

让多个专家协同工作，提高开发效率！

## 📚 文档导航

| 文档                       | 说明                   |
| ---------------------------- | ---------------------- |
| [入门指南](doc/01-getting-started/README.md) | 安装与快速开始 |
| [用户指南](doc/02-user-guide/README.md) | 功能使用说明 |
| [组件文档](packages/ctable/README.md) | 核心表格组件文档      |
| [CONTRIBUTING.md](CONTRIBUTING.md)              | 贡献指南              |
| [.claude/SKILLS.md](.claude/SKILLS.md)          | Skills 配置文档        |
| [.claude/TEAMS.md](.claude/TEAMS.md)          | Agent 团队协作指南      |

## 🎬 演示应用

CatUI 提供了完整的演示应用，展示所有核心功能。

### 快速预览

```bash
# 启动演示应用
pnpm dev:demo

# 访问 http://localhost:5173
```

### 演示功能

- 📊 **数据量测试** - 支持 100条 到 100万条数据切换
- 🧱 **列数控制** - 动态生成 10-100 列
- 🎨 **主题切换** - Ant Design / Element Plus / Naive UI
- ⚙️ **功能配置** - 斑马纹、行选择、边框、分页开关
- 📄 **分页集成** - 完整的分页配置（快速跳转、页大小切换）

详细代码请查看：[apps/demo/src/views/CanvasTableDemo.vue](apps/demo/src/views/CanvasTableDemo.vue)

### 演示截图

演示页面展示了完整的控制面板和表格预览：

- **控制面板**：数据量切换、列数控制、主题风格、功能开关
- **统计信息**：实时显示数据总量和已选中行数
- **表格预览**：高性能渲染、响应式布局

## 📁 项目结构

```text
catui/
├── apps/
│   └── demo/              # Demo 应用
├── packages/
│   └── ctable/            # 核心表格组件
├── .claude/
│   ├── SKILLS.md          # Skills 配置文档
│   └── settings.local.json # Claude Code 配置
├── package.json
└── README.md
```

## 🤝 贡献指南

感谢你有意向 CatUI 贡献！在提交 PR 前，请阅读：

👉 **[CONTRIBUTING.md](CONTRIBUTING.md)** - 完整的开发规范

快速概览：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

**提交前检查清单：**

- [ ] 代码通过 `pnpm type-check`
- [ ] 代码通过 `pnpm lint`
- [ ] 遵循[代码规范](CONTRIBUTING.md#代码规范)
- [ ] 遵循[提交规范](CONTRIBUTING.md#git-提交规范)

## 📄 许可证

MIT
