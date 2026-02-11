# CatUI 项目开发规范

本文档定义了 CatUI 项目的开发规范和协作流程。

## 📋 目录

- [代码规范](#代码规范)
- [Git 提交规范](#git-提交规范)
- [分支管理](#分支管理)
- [代码审查流程](#代码审查流程)
- [测试规范](#测试规范)
- [发布流程](#发布流程)

---

## 代码规范

### 命名规范

```typescript
// ✅ 组件命名：PascalCase
CanvasTable.vue
TableHeader.vue

// ❌ 错误示例
canvasTable.vue
table-header.vue

// ✅ 文件命名（非组件）：kebab-case
table-renderer.ts
event-manager.ts

// ❌ 错误示例
tableRenderer.ts
event_manager.ts

// ✅ 变量/函数：camelCase
const renderTable = () => {}
let rowCount = 0

// ❌ 错误示例
const Render_Table = () => {}
let row_count = 0

// ✅ 常量：UPPER_SNAKE_CASE
const MAX_ROWS = 1000
const DEFAULT_PAGE_SIZE = 20

// ✅ 类型/接口：PascalCase
interface TableRow {}
type TableConfig = {}

// ✅ 私有成员：前缀下划线
private _internalState = {}
const _helperFunction = () => {}
```

### Vue 组件规范

```vue
<script setup lang="ts">
// 1. 导入
import { ref, computed, onMounted } from 'vue'
import type { PropsType, EmitsType } from './types'

// 2. Props 定义（使用 TypeScript 类型）
interface Props {
  data: TableRow[]
  columns: Column[]
  pageSize?: number
}
const props = withDefaults(defineProps<Props>(), {
  pageSize: 20
})

// 3. Emits 定义
interface Emits {
  (e: 'row-click', row: TableRow): void
  (e: 'page-change', page: number): void
}
const emit = defineEmits<Emits>()

// 4. 响应式状态
const currentPage = ref(1)
const isLoading = ref(false)

// 5. 计算属性
const displayData = computed(() => {
  return props.data.slice(0, props.pageSize)
})

// 6. 方法
const handleRowClick = (row: TableRow) => {
  emit('row-click', row)
}

// 7. 生命周期
onMounted(() => {
  // 初始化逻辑
})
</script>

<template>
  <div class="canvas-table">
    <!-- 模板内容 -->
  </div>
</template>

<style lang="less" scoped>
.canvas-table {
  // 样式
}
</style>
```

### TypeScript 规范

```typescript
// ✅ 明确类型注解
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ✅ 使用类型别名
type TableRow = {
  id: string
  data: Record<string, unknown>
}

// ✅ 接口用于对象结构
interface TableConfig {
  columns: Column[]
  pageSize: number
}

// ❌ 避免使用 any
function processData(data: any) { }  // 错误

// ✅ 使用 unknown 或具体类型
function processData(data: unknown) {
  if (isTableRow(data)) {
    // ...
  }
}

// ✅ 导出类型以便复用
export type { TableRow, Column }
export interface TableProps { }
```

### 样式规范

```less
// ✅ 使用 BEM 命名规范
.canvas-table {                     // Block
  &__header {                       // Element
    &--sorted {                     // Modifier
      color: @primary-color;
    }
  }

  &__body {
    // ...
  }
}

// ✅ 使用 Less 变量
@primary-color: #1890ff;
@border-color: #d9d9d9;

.table {
  border: 1px solid @border-color;
  color: @primary-color;
}

// ✅ 使用嵌套（不超过 3 层）
.component {
  .header {
    .title {
      // ✅ 可以
    }
  }
}

// ❌ 避免过深嵌套
.component {
  .header {
    .title {
      .icon {
        // ❌ 太深了
      }
    }
  }
}
```

### 注释规范

```typescript
/**
 * 表格渲染器类
 * 负责处理表格的渲染逻辑和性能优化
 */
class TableRenderer {
  /**
   * 渲染表格数据
   * @param data - 要渲染的数据行
   * @param options - 渲染配置选项
   * @returns 渲染结果
   */
  render(data: TableRow[], options: RenderOptions): RenderResult {
    // 实现
  }

  // 单行注释用于解释复杂逻辑
  private _processData(data: unknown[]): TableRow[] {
    // 将未知类型的数据转换为表格行
    return data.map(this._normalizeRow)
  }
}
```

---

## Git 提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响功能）|
| `refactor` | 重构（不是新功能也不是修复）|
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建过程或工具变更 |
| `revert` | 回退提交 |

### 示例

```bash
# 简单提交
git commit -m "feat(table): add virtual scroll support"

# 带说明的提交
git commit -m "fix(renderer): fix memory leak in canvas renderer

- Refactored cleanup logic in dispose method
- Added proper event listener removal
- Fixed memory leak in resize observer

Closes #123"

# 文档更新
git commit -m "docs: update installation guide"

# 性能优化
git commit -m "perf(core): optimize render cycle with memoization"
```

### Commit 优势

使用 Commitize 或类似工具辅助：

```bash
# 安装 commitizen
pnpm install -D commitizen cz-conventional-changelog

# 配置 package.json
"config": {
  "commitizen": {
    "path": "cz-conventional-changelog"
  }
}

# 使用
git cz  # 交互式提交
```

---

## 分支管理

### 分支策略

```
main          ──────┬────────────────────┬─────  生产分支
                    \                    \
develop       ───────┴────────────────────┴─────  开发主分支
                       /         |         \
feature/table-render   │          │          \
bugfix/memory-leak     │          │          \
hotfix/critical-fix    │          │          \
                       ↓          ↓          ↓
```

### 分支命名规范

| 类型 | 格式 | 示例 |
|------|------|------|
| 功能开发 | `feature/功能名称` | `feature/virtual-scroll` |
| Bug 修复 | `bugfix/问题描述` | `bugfix/memory-leak` |
| 紧急修复 | `hotfix/问题描述` | `hotfix/crash-on-load` |
| 重构 | `refactor/模块名称` | `refactor/renderer` |
| 文档 | `docs/说明` | `docs/api-update` |

### 工作流程

```bash
# 1. 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/your-feature

# 2. 开发并提交
git add .
git commit -m "feat: add your feature"

# 3. 推送到远程
git push origin feature/your-feature

# 4. 创建 Pull Request 到 develop

# 5. 代码审查通过后合并

# 6. 删除本地分支
git branch -d feature/your-feature
```

---

## 代码审查流程

### PR 标题格式

```
[Type] 简短描述

例如：
[Feat] 添加虚拟滚动支持
[Fix] 修复内存泄漏问题
[Docs] 更新 API 文档
```

### PR 描述模板

```markdown
## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档更新
- [ ] 性能优化

## 变更说明
<!-- 描述本次变更的内容和目的 -->

## 相关 Issue
Closes #(issue number)

## 测试
- [ ] 已添加单元测试
- [ ] 已在 demo 中测试
- [ ] 所有测试通过

## 截图（如适用）
<!-- 添加截图说明 UI 变更 -->

## Checklist
- [ ] 代码遵循项目规范
- [ ] 通过 `pnpm type-check`
- [ ] 通过 `pnpm lint`
- [ ] 已更新相关文档
- [ ] 无控制台错误或警告
```

### 审查要点

审查者应检查：

1. **代码质量**
   - 是否遵循项目代码规范
   - 是否有清晰的类型定义
   - 是否有适当的注释

2. **功能正确性**
   - 是否实现了预期功能
   - 是否处理了边界情况
   - 是否有错误处理

3. **性能**
   - 是否引入性能问题
   - 是否有不必要的重渲染
   - 是否有内存泄漏

4. **测试**
   - 是否有足够的测试覆盖
   - 测试是否通过

### 审查流程

```
1. 作者提交 PR
   ↓
2. CI/CD 自动检查
   - 类型检查
   - Lint 检查
   - 单元测试
   ↓
3. 至少 1 位审查者审查
   ↓
4. 提出修改意见或批准
   ↓
5. 作者修改（如需要）
   ↓
6. 审查通过，合并到 develop
```

---

## 测试规范

### 测试文件命名

```
src/
├── components/
│   ├── Table.vue
│   └── Table.spec.ts          # 组件测试
├── core/
│   ├── renderer.ts
│   └── renderer.spec.ts       # 单元测试
└── __tests__/
    ├── Table.test.ts          # 集成测试
    └── e2e/
        └── table-scenario.ts  # E2E 测试
```

### 测试原则

```typescript
// ✅ 测试应该
// 1. 有清晰的描述
describe('TableRenderer', () => {
  // 2. 测试正常情况
  it('should render table rows correctly', () => {
    const renderer = new TableRenderer()
    const result = renderer.render(mockData)
    expect(result.rows.length).toBe(mockData.length)
  })

  // 3. 测试边界情况
  it('should handle empty data gracefully', () => {
    const renderer = new TableRenderer()
    const result = renderer.render([])
    expect(result.rows).toEqual([])
  })

  // 4. 测试错误情况
  it('should throw error with invalid data', () => {
    const renderer = new TableRenderer()
    expect(() => renderer.render(null)).toThrow()
  })
})
```

### 测试覆盖率要求

| 类型 | 覆盖率要求 |
|------|-----------|
| 核心逻辑 (core/) | ≥ 80% |
| 组件 (components/) | ≥ 60% |
| 工具函数 (utils/) | ≥ 90% |
| 整体 | ≥ 70% |

---

## 发布流程

### 版本号规范

遵循语义化版本 (Semantic Versioning): `MAJOR.MINOR.PATCH`

- **MAJOR**: 不兼容的 API 变更
- **MINOR**: 向后兼容的新功能
- **PATCH**: 向后兼容的 Bug 修复

```bash
# 示例
1.0.0  →  1.0.1  # Patch 修复
1.0.1  →  1.1.0  # Minor 新功能
1.1.0  →  2.0.0  # Major 重大变更
```

### 发布步骤

```bash
# 1. 更新版本号
pnpm version patch  # 或 minor / major

# 2. 更新 CHANGELOG
# 手动编辑 CHANGELOG.md

# 3. 构建
pnpm build

# 4. 测试
pnpm test

# 5. 提交
git add .
git commit -m "chore: release v1.0.0"

# 6. 打标签
git tag v1.0.0

# 7. 推送
git push origin main
git push origin v1.0.0

# 8. 发布到 npm
pnpm publish
```

### CHANGELOG 格式

```markdown
# Changelog

## [1.2.0] - 2024-01-15

### Added
- 虚拟滚动支持
- 自定义主题 API

### Changed
- 优化渲染性能
- 更新 TypeScript 到 5.3

### Fixed
- 修复内存泄漏问题
- 修复分页组件 Bug

### Deprecated
- `oldMethod()` 将在 2.0 中移除

## [1.1.0] - 2024-01-01
...
```

---

## 📋 开发检查清单

在提交代码前，确保：

```bash
□ 代码通过类型检查: pnpm type-check
□ 代码通过 lint 检查: pnpm lint
□ 所有测试通过: pnpm test
□ 在 demo 中验证功能
□ 更新了相关文档
□ 遵循了代码规范
□ Commit 信息格式正确
□ PR 描述完整
```

---

## 🔧 开发工具配置

### VS Code 推荐设置

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "volar.takeOverMode.enabled": true,
  "[vue]": {
    "editor.defaultFormatter": "Vue.volar"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 推荐插件

- **Vue - Official** (Vue.volar) - Vue 3 语言支持
- **TypeScript Vue Plugin** (Vue.volar) - TypeScript Vue 支持
- **Prettier** - 代码格式化
- **Error Lens** - 内联错误显示
- **GitLens** - Git 增强

---

## 📚 相关文档

- [WORKFLOW.md](.claude/WORKFLOW.md) - Claude AI 工作流程
- [SKILLS.md](.claude/SKILLS.md) - Skills 配置说明
- [README.md](README.md) - 项目说明

---

**遵守这些规范可以确保代码质量和团队协作效率。如有疑问，请提出 Issue 讨论。**
