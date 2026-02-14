# Specify 文档管理工具指南

## 📋 什么是 Specify？

**Specify** 是一个文档管理和项目配置工具，用于：

- 📁 统一管理项目文档结构
- 🎯 保证文档质量和一致性
- 🔄 自动化文档工作流程
- 📊 生成文档导航

---

## 🚀 快速上手

### 1. 配置文件

配置文件位于：`.specify/config.yaml`

### 2. 创建新文档

```bash
# 使用模板创建新文档
# specify create --type guide --id "new-feature" --title "新功能说明"
```

### 3. 文档类型

| 类型 | 模板 | 说明 |
|------|--------|------|
| `guide` | guide-template.md | 使用指南、教程 |
| `api` | api-template.md | API 参考、方法签名 |
| `component` | component-template.md | 组件文档 |

---

## 📖 当前文档结构

```
doc/
└── 01-getting-started/
    └── table-guide.md        # 完整表格使用指南
```

**保留文件**：
- ✅ `doc/01-getting-started/table-guide.md` - 表格组件完整指南
- ✅ `packages/ctable/README.md` - 组件技术文档

---

## 🎯 文档规范

### 标题层级

```markdown
# 一级标题 - 文档或大章节
## 二级标题 - 主要章节
### 三级标题 - 子章节
```

### 代码块

所有代码块**必须**指定语言：

````markdown
\```typescript
// 代码内容
\```

### 链接规范

- **优先使用相对路径**：`(./other-doc.md)` 而非绝对路径
- **描述清晰**：链接文本应说明目的地

---

## 🔧 工作流程

### 创建新文档

1. **确定文档类型** - 选择 guide/api/component
2. **使用模板创建** - 基于模板快速开始
3. **填充内容** - 编写实际的文档内容
4. **添加到结构** - 更新 `config.yaml` 中的结构定义

### 清理旧文档

```bash
# 删除不再需要的文档
# specify cleanup --pattern "doc/old/**"
```

---

## 📝 质量检查清单

创建文档后确认：

- [ ] 标题层级正确
- [ ] 代码块有语言标识
- [ ] 链接使用相对路径
- [ ] 没有拼写错误
- [ ] 符合项目宪章要求

---

**最后更新**: 2025-02-13
