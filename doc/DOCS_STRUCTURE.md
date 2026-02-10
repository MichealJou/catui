# CTable 文档组织规范

> 本文档定义了 CTable 项目的文档组织结构，遵循行业最佳实践。

**参考标准**:
- [Google Documentation Style Guide](https://developers.google.com/tech-writing)
- [Microsoft Docs Style Guide](https://learn.microsoft.com/en-us/style-guide/)
- [Diátaxis Framework](https://diataxis.fr/)
- [Writing Good Documentation](https://documentation.divio.com/)

---

## 文档分类原则

根据 **Diátaxis Framework**，文档分为四大类：

| 类别 | 目标 | 内容特点 | 示例 |
|------|------|----------|------|
| **教程** (Tutorials) | 学习 | 手把手教学，注重步骤 | 快速开始、入门教程 |
| **操作指南** (How-to Guides) | 完成任务 | 问题导向，具体场景 | 如何实现分页、如何自定义主题 |
| **说明** (Explanation) | 理解 | 概念解释，背景知识 | 架构设计、为什么选择 G2 |
| **参考** (Reference) | 信息查询 | 结构化、描述性 | API 文档、配置选项 |

---

## 推荐目录结构

```
catui/
├── README.md                           # 项目入口（必选）
├── CONTRIBUTING.md                     # 贡献指南
├── CHANGELOG.md                        # 变更日志
├── LICENSE                             # 许可证
│
├── doc/                                # 📁 文档目录
│   ├── README.md                       # 文档导航（索引页）
│   │
│   │
│   ├── 01-getting-started/             # 📘 1. 快速开始（教程类）
│   │   ├── README.md                   #   入口：5分钟快速上手
│   │   ├── installation.md             #   安装指南
│   │   ├── quick-start.md              #   快速开始示例
│   │   └── browser-support.md          #   浏览器支持
│   │
│   ├── 02-user-guide/                  # 📗 2. 用户指南（操作指南类）
│   │   ├── README.md                   #   入口：功能概览
│   │   ├── basic-usage.md              #   基础用法
│   │   ├── pagination.md               #   分页功能
│   │   ├── sorting-filtering.md        #   排序与筛选
│   │   ├── selection.md                #   行选择
│   │   ├── virtual-scroll.md           #   虚拟滚动
│   │   ├── theming.md                  #   主题定制
│   │   ├── adapters.md                 #   组件适配器
│   │   └── on-demand-loading.md        #   按需加载
│   │
│   ├── 03-api-reference/               # 📕 3. API 参考（参考类）
│   │   ├── README.md                   #   入口：API 总览
│   │   ├── component-props.md          #   组件 Props
│   │   ├── component-events.md         #   组件 Events
│   │   ├── component-slots.md          #   组件 Slots
│   │   ├── types.md                    #   TypeScript 类型定义
│   │   ├── interfaces.md               #   接口定义
│   │   └── configuration.md            #   配置选项
│   │
│   ├── 04-advanced/                    # 📙 4. 高级用法（操作指南类）
│   │   ├── README.md                   #   入口：高级功能概览
│   │   ├── custom-renderer.md          #   自定义渲染器
│   │   ├── plugin-development.md       #   插件开发
│   │   ├── performance-optimization.md #   性能优化
│   │   ├── server-side-rendering.md    #   SSR 支持
│   │   └── accessibility.md            #   无障碍支持
│   │
│   ├── 05-architecture/                # 📓 5. 架构设计（说明类）
│   │   ├── README.md                   #   入口：架构概览
│   │   ├── design-doc.md               #   设计文档
│   │   ├── g2-integration.md           #   G2 集成方案
│   │   ├── renderer-system.md          #   渲染系统设计
│   │   ├── virtual-scroll-design.md    #   虚拟滚动设计
│   │   └── decision-records.md         #   技术决策记录（ADR）
│   │
│   ├── 06-development/                 # 📔 6. 开发指南（操作指南类）
│   │   ├── README.md                   #   入口：开发环境搭建
│   │   ├── coding-standards.md         #   代码规范
│   │   ├── project-structure.md        #   项目结构说明
│   │   ├── workflow.md                 #   开发工作流
│   │   ├── testing-guide.md            #   测试指南
│   │   ├── debugging.md                #   调试指南
│   │   └── releasing.md                #   发布流程
│   │
│   ├── 07-examples/                    # 📜 7. 示例代码（教程类）
│   │   ├── README.md                   #   入口：示例索引
│   │   ├── basic-table.md              #   基础表格
│   │   ├── large-data.md               #   大数据量表格
│   │   ├── tree-table.md               #   树形表格
│   │   ├── editable-table.md           #   可编辑表格
│   │   └── real-world-cases.md         #   真实案例
│   │
│   ├── 08-migration/                   # 📋 8. 迁移指南（操作指南类）
│   │   ├── README.md                   #   入口：版本迁移
│   │   ├── migration-guide.md          #   从其他表格迁移
│   │   ├── breaking-changes.md         #   破坏性变更
│   │   └── changelog.md                #   变更日志（链接到根目录）
│   │
│   ├── 09-faq/                         # ❓ 9. 常见问题（操作指南类）
│   │   ├── README.md                   #   入口：常见问题
│   │   ├── troubleshooting.md          #   故障排查
│   │   ├── performance-issues.md       #   性能问题
│   │   └── error-codes.md              #   错误代码
│   │
│   └── 10-about/                       # ℹ️ 10. 关于项目（说明类）
│       ├── README.md                   #   入口：关于我们
│       ├── project-tasks.md            #   项目任务跟踪
│       ├── test-report.md              #   测试报告
│       ├── roadmap.md                  #   路线图
│       ├── team.md                     #   团队成员
│       └── license.md                  #   许可证说明
│
└── docs/                               # 🌐 自动生成的 API 文档（可选）
    └── api/                            #   TypeDoc/VitePress 自动生成
```

---

## 文档命名规范

### 文件命名

```
✅ 推荐：
- quick-start.md         # kebab-case（小写+连字符）
- api-reference.md
- custom-renderer.md

❌ 不推荐：
- QuickStart.md         # PascalCase
- quick_start.md        # snake_case
- QUICK START.md        # 空格和大写
```

### 目录命名

```
✅ 推荐：
- 01-getting-started/   # 数字前缀 + kebab-case
- 02-user-guide/
- 03-api-reference/

数字前缀的作用：
1. 明确文档阅读顺序
2. 保持目录结构稳定
3. 方便用户理解学习路径
```

---

## 根目录文件（必选）

### 1. README.md

**位置**: `/README.md`

**目的**: 项目入口，第一印象

**内容结构**:
```markdown
# CTable

> 一句话描述项目

## ✨ 特性
- 特性 1
- 特性 2

## 📦 安装
安装命令

## 🎯 快速开始
最简单的使用示例

## 📚 文档
[完整文档](./doc/README.md)

## 🔗 相关链接
- 官网
- GitHub
- NPM

## 📄 License
MIT
```

### 2. CONTRIBUTING.md

**位置**: `/CONTRIBUTING.md`

**目的**: 贡献者指南

**内容结构**:
```markdown
# 贡献指南

感谢你有兴趣贡献 CTable！

## 如何贡献
1. Fork 项目
2. 创建分支
3. 提交代码
4. 发起 PR

## 开发规范
- 代码规范：[查看](./doc/06-development/coding-standards.md)
- 提交规范：Conventional Commits
- 测试要求：覆盖率 ≥ 80%

## 报告 Bug
[提交 Issue](链接)

```

### 3. CHANGELOG.md

**位置**: `/CHANGELOG.md`

**目的**: 版本变更记录

**格式** (遵循 [Keep a Changelog](https://keepachangelog.com/)):
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 新功能

### Changed
- 功能变更

### Deprecated
- 即将废弃的功能

### Removed
- 已删除的功能

### Fixed
- 修复的 Bug

### Security
- 安全修复
```

---

## 文档模板

### 通用模板

```markdown
---
title: 文档标题
category: user-guide  # getting-started | user-guide | api-reference | advanced | architecture | development | examples | migration | faq | about
order: 1              # 当前分类内的排序
---

# 文档标题

> 简短描述（一句话说明本文档内容）

## 概述

简要介绍文档内容，帮助读者决定是否继续阅读。

## 前置条件

- 条件 1
- 条件 2

## 内容主体

### 小节 1

内容...

### 小节 2

内容...

## 代码示例

\`\`\`typescript
// 示例代码
\`\`\`

## 注意事项

> ⚠️ 重要提示

## 相关文档

- [相关文档 1](./xxx.md)
- [相关文档 2](./yyy.md)

## 更新历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-02-10 | 初始版本 |
```

---

## 文档元数据

### Front Matter（YAML）

每个文档应包含元数据：

```yaml
---
title: 分页功能使用指南
category: user-guide
order: 3
difficulty: beginner  # beginner | intermediate | advanced
tags:
  - pagination
  - features
lastUpdated: 2026-02-10
authors:
  - CTable Team
status: stable  # draft | stable | deprecated
---
```

### 状态标识

```markdown
# 文档标题

> **状态**: ✅ 稳定 | 🚧 草稿 | ⚠️ 已废弃
> **难度**: 🟢 初级 | 🟡 中级 | 🔴 高级
```

---

## 文档写作规范

### 1. 标题层级

```markdown
# H1 - 文档标题（每个文档只有一个 H1）
## H2 - 主要章节
### H3 - 次级章节
#### H4 - 细节说明
##### H5 - 极少使用
###### H6 - 基本不用
```

### 2. 代码块

```markdown
\`\`\`typescript
// 指定语言，启用语法高亮
const data: User[] = []
\`\`\`

\`\`\`typescript {1,3-5} // 高亮指定行
const name = 'CTable'
const version = '1.0.0'
const author = 'Team'
\`\`\`

\`\`\`bash
# 命令行示例
npm install @catui/ctable
\`\`\`
```

### 3. 提示框

```markdown
> 💡 **提示**
> 有用的提示信息

> ⚠️ **警告**
> 需要注意的事项

> ❌ **错误**
> 常见错误和解决方案

> ✅ **最佳实践**
> 推荐的做法
```

### 4. 链接

```markdown
<!-- 内部链接 -->
[快速开始](./01-getting-started/quick-start.md)
[API 文档](./03-api-reference/component-props.md)

<!-- 外部链接 -->
[Vue 3 文档](https://vuejs.org/)
[G2 官网](https://g2.antv.antgroup.com/)

<!-- 锚点链接 -->
[跳转到配置章节](#配置选项)
```

---

## 文档工具推荐

### 文档生成工具

| 工具 | 用途 | 推荐场景 |
|------|------|----------|
| **VitePress** | 静态文档站点 | Vue 项目，快速搭建 |
| **Docusaurus** | 静态文档站点 | React 项目，功能强大 |
| **TypeDoc** | API 文档生成 | TypeScript 项目必备 |
| **VuePress** | 静态文档站点 | Vue 2 项目 |

### 文档质量工具

| 工具 | 用途 |
|------|------|
| **Markdownlint** | Markdown 规范检查 |
| **Vale** | 文档风格检查 |
| **Textlint** | 文本检查工具 |

---

## 搜索引擎优化（SEO）

### 文档关键词

```markdown
---
title: CTable 分页功能使用指南
description: 学习如何在 CTable 中使用分页功能，支持前端分页和后端分页
keywords:
  - CTable
  - Vue 表格
  - 分页
  - Pagination
  - Vue 3
---
```

### 结构化数据

在文档底部添加：

```markdown
---
**相关搜索**:
- Vue 表格组件
- 高性能表格
- 虚拟滚动表格
---
```

---

## 文档版本控制

### 文档与代码同步

```markdown
## 版本要求

- CTable: >= 1.0.0
- Vue: >= 3.0.0
- TypeScript: >= 5.0.0

## 兼容性

本文档适用于 CTable 1.x 版本。如果您使用的是 0.x 版本，请查看[旧版文档](链接)。
```

### 文档更新标记

```markdown
> 📝 **最后更新**: 2026-02-10
> ✅ **适用于版本**: 1.0.0+
```

---

## 文档审查清单

### 发布前检查

- [ ] 标题层级正确（只有一个 H1）
- [ ] 代码示例可以运行
- [ ] 所有链接有效
- [ ] 图片加载正常
- [ ] 语法和拼写正确
- [ ] 元数据完整（title, category, order）
- [ ] 添加了相关文档链接
- [ ] 更新了最后修改时间

---

## 示例：文档索引页 (doc/README.md)

```markdown
# CTable 文档中心

欢迎来到 CTable 文档！选择您的入门路径。

## 🚀 快速开始

1. [安装指南](./01-getting-started/installation.md)
2. [快速开始（5分钟）](./01-getting-started/quick-start.md)

## 📚 文档分类

### 📘 入门教程
适合新用户，手把手教学
- [安装指南](./01-getting-started/installation.md)
- [快速开始](./01-getting-started/quick-start.md)
- [浏览器支持](./01-getting-started/browser-support.md)

### 📗 用户指南
常用功能的使用说明
- [基础用法](./02-user-guide/basic-usage.md)
- [分页功能](./02-user-guide/pagination.md)
- [主题定制](./02-user-guide/theming.md)

### 📕 API 参考
完整的 API 文档
- [组件 Props](./03-api-reference/component-props.md)
- [组件 Events](./03-api-reference/component-events.md)
- [类型定义](./03-api-reference/types.md)

### 📙 高级用法
深入使用 CTable
- [自定义渲染器](./04-advanced/custom-renderer.md)
- [插件开发](./04-advanced/plugin-development.md)
- [性能优化](./04-advanced/performance-optimization.md)

### 📓 架构设计
了解内部实现
- [设计文档](./05-architecture/design-doc.md)
- [G2 集成](./05-architecture/g2-integration.md)
- [技术决策](./05-architecture/decision-records.md)

### 📔 开发指南
贡献代码的指南
- [代码规范](./06-development/coding-standards.md)
- [开发工作流](./06-development/workflow.md)
- [测试指南](./06-development/testing-guide.md)

## 🔍 快速搜索

无法找到想要的内容？[搜索文档](链接)

## 🆘 需要帮助？

- [常见问题](./09-faq/)
- [GitHub Issues](链接)
- [ Discussions](链接)

## 📊 项目状态

- 当前版本: 1.0.0
- 最后更新: 2026-02-10
- 文档状态: ✅ 完整
```

---

## 参考资源

### 文档风格指南

- [Google Developer Documentation Style Guide](https://developers.google.com/tech-writing/one-pagers)
- [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/)
- [Vue.js Documentation Style Guide](https://vuejs.org/style-guide/)
- [Diátaxis - Documentation Framework](https://diataxis.fr/)

### 文档工具

- [VitePress](https://vitepress.dev/)
- [Docusaurus](https://docusaurus.io/)
- [TypeDoc](https://typedoc.org/)
- [Markdownlint](https://github.com/DavidAnson/markdownlint)

---

**维护者**: CTable 开发团队
**最后更新**: 2026-02-10
