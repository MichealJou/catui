# CTable 命名规范

本文档定义了 CTable 项目中使用的命名规范，确保代码风格的一致性和可维护性。

## 文件和目录命名

### 组件文件
- **规则**：使用 PascalCase
- **示例**：
  - `CTable.vue`
  - `CPagination.vue`
  - `CanvasTable.vue`

### 工具/辅助函数文件
- **规则**：使用 camelCase
- **示例**：
  - `geometry.ts`
  - `helpers.ts`
  - `adapters.ts`

### 类型定义文件
- **规则**：使用 camelCase
- **示例**：
  - `types.ts`
  - `interfaces.ts`

### 常量文件
- **规则**：使用 camelCase
- **示例**：
  - `constants/index.ts`

### 目录
- **规则**：使用 camelCase
- **示例**：
  - `components/`
  - `adapters/`
  - `renderers/`
  - `utils/`

## 代码元素命名

### 类（Class）
- **规则**：使用 PascalCase
- **示例**：
  ```typescript
  class FilterManager {}
  class PaginationManager {}
  class RendererState {}
  ```

### 接口（Interface）
- **规则**：使用 PascalCase，不以 `I` 开头
- **示例**：
  ```typescript
  interface PaginationConfig {}
  interface FilterCondition {}
  interface Column {}
  ```

### 类型别名（Type）
- **规则**：使用 PascalCase
- **示例**：
  ```typescript
  type SortOrder = 'asc' | 'desc' | null
  type FilterType = 'equals' | 'contains' | 'startsWith'
  ```

### 函数和方法
- **规则**：使用 camelCase
- **示例**：
  ```typescript
  function renderCell() {}
  function setSortState() {}
  function handleRowClick() {}
  ```

### 事件处理器
- **规则**：使用 camelCase，以 `handle` 开头
- **示例**：
  ```typescript
  const handleClick = () => {}
  const handleSubmit = () => {}
  const handleRowClick = () => {}
  ```

### 变量和属性
- **规则**：使用 camelCase
- **示例**：
  ```typescript
  const sortState = new Map()
  const filterState = new Set()
  const selectedRows = new Set()
  ```

### 常量
- **规则**：使用 UPPER_SNAKE_CASE
- **示例**：
  ```typescript
  const DEFAULT_COLUMN_WIDTH = 120
  const DEFAULT_FONT_SIZE = 14
  const MAX_VISIBLE_PAGES = 7
  ```

### 私有属性
- **规则**：使用 camelCase，不以 `_` 开头（使用 TypeScript 的 `private` 修饰符）
- **示例**：
  ```typescript
  class MyClass {
    private chart: Chart | null = null
    private data: any[] = []
    private selectedIndex: number = 0
  }
  ```

### 布尔值
- **规则**：使用 camelCase，以 `is`、`has`、`should`、`can` 等前缀开头
- **示例**：
  ```typescript
  const isVisible = true
  const hasSelection = false
  const shouldUpdate = true
  const canEdit = false
  const isEnabled = true
  ```

## Vue 组件命名

### 组件注册名
- **规则**：使用 PascalCase
- **示例**：
  ```typescript
  export default defineComponent({
    name: 'CTable'
  })
  ```

### Props
- **规则**：使用 camelCase 在定义中，kebab-case 在模板中
- **示例**：
  ```typescript
  // 定义
  props: {
    showHeader: Boolean,
    rowSelection: Object
  }

  // 模板中使用
  <CTable :show-header="true" :row-selection="selection" />
  ```

### Emits
- **规则**：使用 kebab-case
- **示例**：
  ```typescript
  emits: ['row-click', 'sort-change', 'selection-change']
  ```

## CSS 类名

### 组件类名
- **规则**：使用 kebab-case，以组件名前缀开头
- **示例**：
  ```css
  .cpagination {}
  .cpagination-item {}
  .cpagination-list {}
  ```

### 修饰符类名
- **规则**：使用 kebab-case，使用连字符 `-` 连接
- **示例**：
  ```css
  .cpagination-mini {}
  .cpagination-disabled {}
  .cpagination-item-active {}
  ```

### 状态类名
- **规则**：使用 `is-` 或 `has-` 前缀
- **示例**：
  ```css
  .is-active {}
  .is-selected {}
  .is-disabled {}
  .has-selection {}
  ```

## 文件导出

### 默认导出
- **规则**：用于主要组件或功能
- **示例**：
  ```typescript
  // CTable.vue
  export default defineComponent({ ... })

  // 使用
  import CTable from './CTable.vue'
  ```

### 命名导出
- **规则**：用于工具函数、常量、类型等
- **示例**：
  ```typescript
  // utils/index.ts
  export function formatNumber() {}
  export function formatDate() {}
  export const CONSTANT_VALUE = 123

  // 使用
  import { formatNumber, formatDate, CONSTANT_VALUE } from './utils'
  ```

### 类型导出
- **规则**：使用 `export type` 明确标识类型导出
- **示例**：
  ```typescript
  export type { PaginationConfig, FilterCondition }
  export interface Column {}
  ```

## 测试文件命名

### 单元测试
- **规则**：与源文件同名，添加 `.test` 或 `.spec` 后缀
- **示例**：
  ```
  CTable.test.ts
  FilterManager.spec.ts
  paginationLogic.test.ts
  ```

### 测试描述
- **规则**：使用清晰、描述性的语言
- **示例**：
  ```typescript
  describe('FilterManager', () => {
    it('should set filter condition correctly', () => {})
    it('should clear all filters when requested', () => {})
    it('should return filtered data based on active filters', () => {})
  })
  ```

## 总结

| 类型 | 规则 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `CTable.vue` |
| 工具文件 | camelCase | `geometry.ts` |
| 类 | PascalCase | `class FilterManager` |
| 接口 | PascalCase | `interface Column` |
| 函数 | camelCase | `renderCell()` |
| 变量 | camelCase | `sortState` |
| 常量 | UPPER_SNAKE_CASE | `DEFAULT_WIDTH` |
| CSS 类 | kebab-case | `.cpagination-item` |
| 事件 | kebab-case | `@row-click` |

遵循这些命名规范将使代码更易读、更易维护。
