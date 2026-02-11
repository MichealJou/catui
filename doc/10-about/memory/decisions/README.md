# 技术决策记录 (ADR)

> ADR = Architecture Decision Records（架构决策记录）
>
> 本目录记录 CTable 项目的重要技术决策，帮助团队理解设计决策的背景、理由和后果。

## 📋 决策列表

| ID | 标题 | 状态 | 日期 | 描述 |
|----|------|------|------|------|
| [ADR-001](./001-vtable-migration.md) | 从 G2/Canvas 迁移到 VTable | ✅ 已接受 | 2026-02-11 | 将 CTable 从 G2/Canvas 渲染引擎完全迁移到 VTable |

---

## 📖 什么是 ADR？

ADR (Architecture Decision Records) 是一种记录重要架构决策的方法论。每个 ADR 记录：

1. **上下文** - 为什么需要做这个决策
2. **决策内容** - 具体做了什么决策
3. **理由** - 为什么做出这个选择
4. **后果** - 这个决策带来的影响（积极和消极）

### ADR 的价值

```
❌ 没有 ADR 的对话：
   A: "为什么我们不用 S2 而用 VTable？"
   B: "好像是之前决定的，但我忘了原因"

✅ 有 ADR 的对话：
   A: "为什么我们不用 S2 而用 VTable？"
   B: "查看 ADR-001，里面有详细的对比分析"
```

---

## 🏷️ 状态标签

| 状态 | 图标 | 说明 |
|------|------|------|
| 已接受 | ✅ | 决策已通过并正在实施 |
| 已拒绝 | ❌ | 决策被否决 |
| 已废弃 | 🗑️ | 决策不再适用 |
| 被取代 | 🔄 | 有新的决策替代了本决策 |

---

## 📝 ADR 模板

创建新的 ADR 时，请使用 [template.md](./template.md) 模板。

```bash
# 创建新的 ADR
cp template.md 004-new-decision.md
```

---

## 🔗 相关文档

- [项目任务跟踪](../../project-tasks.md)
- [路线图](../../roadmap.md)
- [设计文档](../../05-architecture/design-doc.md)
- [项目记忆索引](../README.md)

---

**维护者**: CTable 开发团队
**最后更新**: 2026-02-11
