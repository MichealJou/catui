# CatUI 项目 - Claude AI 工作流程规则

本文文件定义了 Claude Code 在 CatUI 项目中工作时应遵循的规则和流程。

## 🎯 核心原则

1. **优先使用项目 Skills** - 在处理相关任务时，优先调用已安装的 Skills
2. **遵循项目技术栈** - Vue 3 + TypeScript + Vite + Less
3. **保持代码风格一致** - 遵循项目现有代码风格
4. **渐进式改进** - 先理解现有代码，再进行修改

---

## 📋 工作流程

### 阶段 1: 理解上下文

在开始任何任务前，必须执行：

```
1. 读取相关文件了解项目结构
   - 查看相关组件/模块的现有实现
   - 查看类型定义（types 目录）
   - 查看现有测试文件

2. 确认技术栈和依赖
   - Vue 3.3+ (Composition API)
   - TypeScript 5.3
   - Vite 5.0
   - UnoCSS（原子化 CSS）
   - 普通 scoped CSS（组件样式）

3. 检查是否有相关 Skill 可用
   - vue: Vue 开发最佳实践
   - ant-design-vue / element-plus-vue3: UI 组件参考
   - ui-design-system: 设计系统相关
   - frontend-design: 前端设计决策
   - interaction-design: 交互设计优化
   - yuque-document-management: 语雀文档管理
```

### 阶段 2: 使用 Skills

根据任务类型调用相应的 Skill：

```
任务类型                          使用 Skill
─────────────────────────────────────────────────
创建/修改 Vue 组件          →   vue
设计 UI/组件                 →   ui-design-system + frontend-design
优化交互体验                 →   interaction-design
参考 UI 组件库实现           →   ant-design-vue 或 element-plus-vue3
设计系统/主题配置            →   ui-design-system
```

**调用方式示例：**
- "使用 vue skill 帮我创建一个表格组件"
- "使用 ui-design-system 和 frontend-design skill 设计这个组件的样式"
- "使用 yuque-document-management skill 将文档同步到语雀"

### 阶段 2.5: 文档管理（可选）

对于需要同步到语雀的文档：

```
1. 使用 yuque-document-management skill
   - 创建文档：在语雀知识库创建新文档
   - 搜索文档：查找现有文档
   - 更新文档：同步最新内容
   - 组织结构：管理文档目录

2. 配置要求
   - 语雀 Token（配置文件：.claude/yuque-mcp.json）
   - 知识库 ID 和访问权限

详细配置指南：.claude/YUQUE_MCP.md
```

### 阶段 3: 代码实现

遵循以下规则：

```
1. 代码风格
   - 使用 TypeScript 类型注解
   - 使用 Composition API（<script setup>）
   - 组件命名：PascalCase
   - 文件命名：PascalCase.vue 或 kebab-case.ts

2. Vue 组件结构
   <script setup lang="ts">
   // 1. 导入
   // 2. Props 定义（with TypeScript 类型）
   // 3. Emits 定义
   // 4. 响应式状态
   // 5. 计算属性
   // 6. 方法
   // 7. 生命周期
   </script>

   <template>
   <!-- 模板内容 -->
   </template>

   <style scoped>
   /* 组件样式（使用 scoped CSS） */
   </style>

3. 类型安全
   - 所有 props 必须有 TypeScript 类型定义
   - 避免使用 any，使用 unknown 或具体类型
   - 导出并复用类型定义

4. 性能优化
   - 合理使用 computed 和 watch
   - 大列表使用虚拟滚动
   - 避免不必要的响应式数据
```

### 阶段 4: 代码检查

在完成代码修改后，必须执行：

```bash
# 1. 类型检查
pnpm type-check

# 2. 代码检查
pnpm lint

# 3. 自动修复（如果有问题）
pnpm lint:fix
```

### 阶段 5: 测试验证

```
1. 如果是组件开发：
   - 在 demo 应用中测试组件
   - 验证所有功能正常
   - 检查控制台无错误

2. 如果是重构/修复：
   - 运行现有测试
   - 验证原有功能未受影响
```

---

## 🚫 禁止行为

```
✅ UnoCSS 是项目首选的原子化 CSS 解决方案
❌ 不要改用其他 UI 框架（保持 Ant Design Vue / Element Plus）
❌ 不要忽略 TypeScript 类型检查
❌ 不要跳过代码检查步骤
❌ 不要修改 node_modules 或构建产物
❌ 不要添加项目不需要的依赖
```

---

## 📁 项目结构理解

```
catui/
├── apps/demo/           # Demo 应用（用于测试组件）
├── packages/ctable/     # 核心表格组件库
│   ├── src/
│   │   ├── components/  # Vue 组件
│   │   ├── core/        # 核心逻辑
│   │   ├── renderers/   # 渲染器
│   │   ├── types/       # TypeScript 类型定义
│   │   └── utils/       # 工具函数
│   └── theme/           # 主题配置
└── .claude/             # Claude Code 配置
```

---

## 🎨 UI/UX 设计规范

当涉及 UI 设计时：

```
1. 使用 ui-ux-pro-max skill 获取设计建议
2. 参考 Ant Design Vue 和 Element Plus 的设计规范
3. 保持组件风格一致性
4. 考虑可访问性（a11y）
5. 响应式设计支持
```

---

## 🔄 迭代规则

```
1. 小步快跑
   - 每次改动保持小而聚焦
   - 频繁验证，及时反馈

2. 向后兼容
   - 避免破坏性变更
   - 如需 Breaking Change，先讨论方案

3. 文档同步
   - 更新相关注释
   - 更新类型定义
   - 如有 API 变更，更新文档
```

---

## ✅ 完成标准

任务完成需满足：

```
✓ 代码通过类型检查
✓ 代码通过 lint 检查
✓ 功能正常工作（在 demo 中验证）
✓ 无控制台错误或警告
✓ 代码风格与项目一致
✓ TypeScript 类型完整
```

---

## 💡 特殊场景处理

### 场景 1: 性能优化

```
1. 先使用 vue skill 分析性能问题
2. 使用 DevTools 分析渲染性能
3. 优化后再验证性能指标
```

### 场景 2: Bug 修复

```
1. 定位问题（使用 Grep/Read 工具）
2. 理解根因（不要头痛医头）
3. 编写测试用例复现问题
4. 修复并验证
```

### 场景 3: 新功能开发

```
1. 先使用 relevant skills 了解最佳实践
2. 设计 API 和类型定义
3. 实现核心功能
4. 在 demo 中测试
5. 完善错误处理和边界情况
```

---

**重要提示：**
- 本规则由项目维护者制定，确保 Claude AI 与团队协作一致
- Claude Code 在执行任务时会自动加载本规则
- 团队成员如需修改规则，请提交 PR 讨论
