# 项目记忆与计划管理规范

> 本文档定义了如何保存和管理项目的"记忆"（历史、决策、进展）和"计划"（任务、路线图）。

**核心理念**: 代码会过时，文档永存。所有重要的决策、计划和进展都应该文档化。

---

## 📁 目录组织

### 推荐结构

```
doc/
├── 10-about/                       # 关于项目
│   ├── README.md                   #   项目概述
│   ├── project-tasks.md            #   ✅ 任务跟踪（您已有）
│   ├── test-report.md              #   ✅ 测试报告（您已有）
│   ├── roadmap.md                  #   📋 项目路线图
│   │
│   ├── memory/                     #   🧠 项目记忆目录（新增）
│   │   ├── README.md               #     记忆索引
│   │   │
│   │   ├── decisions/              #     📝 技术决策记录（ADR）
│   │   │   ├── README.md           #       决策索引
│   │   │   ├── 001-choose-g2.md
│   │   │   ├── 002-use-vue3.md
│   │   │   └── template.md         #       ADR 模板
│   │   │
│   │   ├── meetings/               #     🗣️ 会议记录
│   │   │   ├── README.md           #       会议索引
│   │   │   ├── 2026-02-10-daily.md
│   │   │   ├── 2026-02-09-retrospective.md
│   │   │   └── meeting-template.md
│   │   │
│   │   ├── sprints/                #     🏃 迭代记录
│   │   │   ├── README.md           #       迭代索引
│   │   │   ├── sprint-1.md
│   │   │   ├── sprint-2.md
│   │   │   └── sprint-template.md
│   │   │
│   │   ├── issues/                 #     🐛 问题追踪
│   │   │   ├── README.md           #       问题索引
│   │   │   ├── perf-001-memory-leak.md
│   │   │   └── issue-template.md
│   │   │
│   │   └── timeline/               #     📅 时间线
│   │       ├── README.md
│   │       ├── 2026-02.md          #       按月归档
│   │       └── 2026-01.md
│   │
│   └── integration/                #   🔗 集成进度
│       ├── g2-integration.md       #     ✅ G2 集成进度（您已有）
│       └── phase-progress.md       #     阶段性进展
│
└── 06-development/                 # 开发指南
    └── adr/                        #   📓 ADR 技术决策（可选，与 memory/decisions 重复）
```

---

## 🧠 1. 技术决策记录（ADR）

> **ADR** = Architecture Decision Records（架构决策记录）
>
> 参考标准：[Michael Nygard's ADR Template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)

### 为什么需要 ADR？

```
❌ 没有 ADR 的对话：
   A: "为什么我们不用 S2 而用 G2？"
   B: "好像是 Joe 说的，但我忘了原因"

✅ 有 ADR 的对话：
   A: "为什么我们不用 S2 而用 G2？"
   B: "查看 doc/10-about/memory/decisions/001-choose-g2.md"
```

### ADR 命名规范

```
格式：{序号}-{简短标题}.md

示例：
001-choose-g2.md
002-use-vue3.md
003-virtual-scroll-architecture.md
004-adapter-system-design.md
```

### ADR 模板

创建 `doc/10-about/memory/decisions/template.md`：

```markdown
---
title: "决策标题"
status: accepted | rejected | superseded | deprecated
date: 2026-02-10
deciders: 团队成员
related: 002-use-vue3.md, 003-virtual-scroll.md
---

# ADR-001: 选择 G2 作为渲染引擎

## 状态
已接受 (Accepted)

## 上下文 (Context)
- 需要一个高性能的 Canvas 渲染引擎
- 考虑了 S2、G2、ECharts、Chart.js
- 目标是支持百万级数据渲染

## 决策 (Decision)
**选择 G2 5.x 作为 CTable 的渲染引擎**

### 理由
1. ✅ **声明式 API** - G2 5.x 提供声明式 Mark API
2. ✅ **自动 diff** - G2 自动处理增量更新
3. ✅ **性能优秀** - 基于 Canvas，支持大数据量
4. ✅ **生态完善** - AntV 团队维护
5. ✅ **TypeScript 支持** - 完整的类型定义

### 替代方案
| 方案 | 优点 | 缺点 | 评分 |
|------|------|------|------|
| **S2** | 表格专用 | 性能一般，API 复杂 | ⭐⭐⭐ |
| G2 | 性能好，API 简洁 | 需要自己实现表格逻辑 | ⭐⭐⭐⭐⭐ |
| ECharts | 功能强大 | 体积大，不适合表格 | ⭐⭐ |

## 后果 (Consequences)

### 积极影响
- ✅ 渲染性能提升 70%
- ✅ 代码量减少 40%
- ✅ 易于扩展和定制

### 消极影响
- ⚠️ 需要自己实现表格特定逻辑（排序、筛选）
- ⚠️ 学习曲线较陡

### 缓解措施
- 创建 TableRenderer 封装 G2 API
- 编写详细的开发文档

## 相关决策
- [ADR-002: 使用 Vue 3](./002-use-vue3.md)
- [ADR-003: 虚拟滚动架构](./003-virtual-scroll-architecture.md)

## 参考资源
- [G2 官方文档](https://g2.antv.antgroup.com/)
- [S2 vs G2 对比](内部链接)

---

**记录时间**: 2026-02-10
**记录人**: CTable Team
```

---

## 🗣️ 2. 会议记录

### 会议记录模板

`doc/10-about/memory/meetings/meeting-template.md`：

```markdown
---
title: "会议标题"
date: 2026-02-10
type: daily | weekly | retrospective | planning
attendees: @alice @bob @charlie
---

# 2026-02-10 每日站会

## 📋 基本信息
- **日期**: 2026-02-10
- **时间**: 10:00 - 10:15
- **类型**: 每日站会
- **参与人**: @alice @bob @charlie

## 🎯 今日进展

### @alice
- ✅ 修复虚拟滚动网格线问题
- ✅ 完成缓冲区渲染优化
- 🔄 正在：实现交互事件

### @bob
- ✅ 完成 API 文档初稿
- 🔄 正在：编写单元测试

### @charlie
- ✅ 修复分页加载 Bug
- ✅ 更新 CHANGELOG

## 🚀 明日计划

### @alice
- [ ] 完成交互事件处理
- [ ] 编写交互功能测试

### @bob
- [ ] 完成单元测试（目标覆盖率 80%）
- [ ] 代码审查

### @charlie
- [ ] 发布 v1.0.0-rc.1
- [ ] 更新 README

## 🚧 阻塞问题
- ❌ **@alice**: 等待设计稿确认
- ❌ **@bob**: CI 构建偶尔失败，正在排查

## 📝 决策记录
1. ✅ 同意使用 G2 5.x 新 API
2. ✅ 下周一开始 Code Review 流程

## 🔗 相关链接
- [PROJECT_TASKS.md](../../project-tasks.md)
- [G2_INTEGRATION_PROGRESS.md](../../integration/g2-integration.md)

---

**记录人**: @alice
**下次会议**: 2026-02-11 10:00
```

---

## 🏃 3. 迭代记录（Sprint）

### Sprint 模板

`doc/10-about/memory/sprints/sprint-template.md`：

```markdown
---
title: "Sprint 1 - 核心功能开发"
sprint: 1
startDate: 2026-02-01
endDate: 2026-02-14
status: in_progress | completed | cancelled
---

# Sprint 1: 核心功能开发

## 📊 Sprint 概览
- **时间**: 2026-02-01 ~ 2026-02-14 (2周)
- **目标**: 完成核心表格功能
- **状态**: 🔄 进行中

## 🎯 Sprint 目标

### 主要目标
1. ✅ 完成基础表格渲染
2. ✅ 实现虚拟滚动
3. ✅ 完成行选择功能
4. ✅ 实现分页功能

### 次要目标
- [ ] 主题系统重构
- [ ] 性能优化
- [ ] 单元测试

## 📋 任务清单

### 已完成 ✅
- [x] 创建 CTable 组件基础结构
- [x] 实现 G2 渲染器
- [x] 实现虚拟滚动机制
- [x] 完成行选择功能

### 进行中 🔄
- [ ] 分页功能开发 (@alice)
- [ ] 主题系统重构 (@bob)

### 待开始 ⏳
- [ ] 性能优化
- [ ] 单元测试编写
- [ ] API 文档编写

## 🐛 Bug 修复
- [x] 修复内存泄漏问题
- [x] 修复网格线不跟随滚动
- [ ] 修复表头遮挡问题

## 📈 进度追踪

| 指标 | 目标 | 当前 | 进度 |
|------|------|------|------|
| 任务完成率 | 100% | 75% | 🟢 |
| 测试覆盖率 | 80% | 45% | 🟡 |
| 性能基准 | <100ms | 120ms | 🔴 |

## 🚧 阻塞与风险
- ⚠️ **性能未达标**: 需要优化渲染逻辑
- ⚠️ **测试覆盖率低**: 需要补充单元测试

## 📝 复盘与总结

### 做得好的 ✅
- 团队协作顺畅
- 技术选型正确
- 文档及时更新

### 需要改进 ⚠️
- 测试应该更早开始
- 需要更严格的 Code Review

### 下次改进 💡
- 每个任务必须有测试
- 每天 Code Review 一次

## 🔗 相关资源
- [Sprint 1 任务板](链接)
- [测试报告](../test-report.md)

---

**Sprint Master**: @alice
**最后更新**: 2026-02-10
```

---

## 🐛 4. 问题追踪

### 问题记录模板

`doc/10-about/memory/issues/issue-template.md`：

```markdown
---
title: "问题标题"
id: PERF-001 | BUG-002 | FEAT-003
severity: critical | high | medium | low
status: open | investigating | in_progress | resolved | closed
date: 2026-02-10
assignee: @alice
---

# PERF-001: 内存泄漏导致性能下降

## 📋 基本信息
- **ID**: PERF-001
- **标题**: 内存泄漏导致性能下降
- **严重程度**: 🔴 High
- **状态**: 🔄 In Progress
- **负责人**: @alice
- **报告日期**: 2026-02-10

## 🐛 问题描述

### 症状
- 连续使用 30 分钟后，页面卡顿
- 内存占用持续增长
- DevTools Memory Profiling 显示未释放的事件监听器

### 复现步骤
1. 打开 Demo 页面
2. 连续切换分页 100 次
3. 观察内存占用从 50MB 增长到 200MB

### 预期行为
内存占用应保持在 50MB 左右

### 实际行为
内存占用持续增长到 200MB

## 🔍 根因分析

### 问题定位
```typescript
// CTable.vue 第 120 行
// ❌ 问题：组件销毁时未移除事件监听器
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

// ✅ 修复：
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
```

### 根本原因
组件卸载时，事件监听器未正确移除

## ✅ 解决方案

### 修复代码
[提交链接](commit-url)

### 验证方法
1. 修复后重复上述复现步骤
2. 内存占用稳定在 50MB
3. 通过单元测试

## 📊 影响范围
- 影响所有使用 CTable 的用户
- 长时间使用场景

## 🔗 相关问题
- 无

## 📝 经验教训
- ⚠️ **教训**: 所有事件监听器必须在组件销毁时清理
- ✅ **措施**: 添加 ESLint 规则检查事件监听器清理

---

**报告人**: @alice
**最后更新**: 2026-02-10
```

---

## 📅 5. 时间线

### 按月归档

`doc/10-about/memory/timeline/2026-02.md`：

```markdown
# 2026年2月 - 项目时间线

## 📅 2026-02-10
- ✅ 修复虚拟滚动核心渲染问题
- ✅ 完成网格线跟随滚动
- ✅ 完成缓冲区渲染优化
- 📝 创建代码规范文档
- 📝 创建文档组织规范

## 📅 2026-02-09
- ✅ 完成复选框功能测试
- ✅ 完成 5 种分页模式
- 🐛 修复内存泄漏问题

## 📅 2026-02-08
- 🚀 开始第一阶段重构
- ✅ 创建独立包结构
- ✅ 组件重命名（CanvasTable → CTable）

## 📊 月度总结

### 完成情况
- ✅ 核心功能完成度: 95%
- ✅ 测试覆盖率: 45% → 目标 80%
- ✅ 性能优化: 渲染时间减少 70%

### 关键里程碑
- 🎯 虚拟滚动功能上线
- 🎯 主题系统重构完成
- 🎯 文档体系建立

### 下月计划
- [ ] 补充单元测试
- [ ] 完善交互功能
- [ ] 发布 v1.0.0
```

---

## 🗂️ 6. 文件组织最佳实践

### 自动化索引

每个子目录的 `README.md` 应该自动生成索引：

`doc/10-about/memory/README.md`：

```markdown
# 项目记忆中心

这里记录了所有重要的项目决策、会议、问题和进展。

## 📝 快速导航

### 技术决策 (ADR)
- [ADR-001: 选择 G2 作为渲染引擎](./decisions/001-choose-g2.md)
- [ADR-002: 使用 Vue 3](./decisions/002-use-vue3.md)

### 会议记录
- [2026-02-10 每日站会](./meetings/2026-02-10-daily.md)
- [2026-02-09 周会](./meetings/2026-02-09-weekly.md)

### 迭代记录
- [Sprint 1: 核心功能开发](./sprints/sprint-1.md)

### 问题追踪
- [PERF-001: 内存泄漏](./issues/perf-001-memory-leak.md)
- [SCROLL-001: 网格线问题](./issues/scroll-001-grid-line.md)

### 时间线
- [2026年2月](./timeline/2026-02.md)
- [2026年1月](./timeline/2026-01.md)

---

**最后更新**: 自动生成
```

---

## 🔄 7. 工作流程建议

### 日常流程

```
每日开始 → 1. 打开 PROJECT_TASKS.md
         ↓
         2. 查看今日任务
         ↓
         3. 开始工作
         ↓
每日结束 → 4. 更新 PROJECT_TASKS.md（完成任务打勾）
         ↓
         5. 如果有重要决策 → 创建 ADR
         ↓
         6. 如果发现问题 → 记录到 issues/
         ↓
         7. 如果有会议 → 记录到 meetings/
         ↓
         8. 更新 timeline/
```

### AI 助手协作流程

```
开始任务 → AI: "让我先读取项目文档"
         ↓
         ↓ 读取: PROJECT_TASKS.md, CODING_STANDARDS.md
         ↓
         ↓ 读取: 相关的 ADR 和会议记录
         ↓
         开始工作 → 在工作中创建新的记录
         ↓
         ↓ - 重要决策 → ADR
         ↓ - 遇到问题 → Issue
         ↓ - 每日进展 → Timeline
         ↓
         任务完成 → 更新 PROJECT_TASKS.md
```

---

## 📋 8. 实施建议

### 立即开始（优先级：🔴 高）

1. **创建目录结构**
   ```bash
   mkdir -p doc/10-about/memory/{decisions,meetings,sprints,issues,timeline}
   ```

2. **创建模板文件**
   - `template.md` (ADR 模板)
   - `meeting-template.md`
   - `sprint-template.md`
   - `issue-template.md`

3. **迁移现有文档**
   - 移动 `PROJECT_TASKS.md` → `10-about/project-tasks.md`
   - 移动 `TEST_REPORT.md` → `10-about/test-report.md`
   - 移动 `G2_INTEGRATION_PROGRESS.md` → `10-about/integration/g2-integration.md`

### 后续优化（优先级：🟡 中）

4. **创建索引页**
   - `doc/10-about/memory/README.md`
   - `doc/10-about/memory/decisions/README.md`
   - `doc/10-about/memory/meetings/README.md`

5. **建立工作流**
   - 每日更新 timeline/
   - 重要决策创建 ADR
   - 每周创建会议记录

### 长期维护（优先级：🟢 低）

6. **自动化工具**
   - 脚本自动生成索引
   - Git hooks 自动更新时间线

---

## 🎯 总结

### 核心原则

1. **所有重要内容必须文档化**
2. **使用模板保持一致性**
3. **定期整理和归档**
4. **易于搜索和导航**

### 文档分类

| 类型 | 存放位置 | 更新频率 |
|------|----------|----------|
| 技术决策 | `memory/decisions/` | 永久 |
| 会议记录 | `memory/meetings/` | 每日/每周 |
| 迭代记录 | `memory/sprints/` | 每迭代 |
| 问题追踪 | `memory/issues/` | 按需 |
| 时间线 | `memory/timeline/` | 每日 |

---

**参考资源**:
- [Architecture Decision Records](https://adr.github.io/)
- [GitHub Project Management](https://docs.github.com/en/issues)
- [Running Effective Meetings](https://www.atlassian.com/agile/project-management/retrospectives)

---

**维护者**: CTable 开发团队
**最后更新**: 2026-02-10
