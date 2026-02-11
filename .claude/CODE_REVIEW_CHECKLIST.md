# CTable 代码审查检查清单

本文档定义了 CTable 项目的代码审查标准和检查项。

## 目录

- [TypeScript 类型检查](#typescript-类型检查)
- [Vue 3 组件规范](#vue-3-组件规范)
- [Canvas 渲染最佳实践](#canvas-渲染最佳实践)
- [性能优化检查点](#性能优化检查点)
- [测试覆盖率要求](#测试覆盖率要求)
- [代码风格和命名规范](#代码风格和命名规范)
- [可访问性 (a11y)](#可访问性-a11y)
- [安全性检查](#安全性检查)
- [文档完整性](#文档完整性)

---

## TypeScript 类型检查

### ✅ 必须通过的类型检查

```bash
# 在提交代码前必须执行
pnpm type-check
```

### 类型完整性检查项

- [ ] **所有 props 必须有明确的类型定义**
  - 使用 TypeScript 类型接口
  - 避免使用 `any`，使用 `unknown` 或具体类型
  - 导出并复用类型定义（从 `../types` 导入）

- [ ] **函数参数和返回值必须类型化**
  ```typescript
  // ✅ 正确
  function renderCell(data: any, row: number, column: Column): string { }

  // ❌ 错误
  function renderCell(data, row, column) { }
  ```

- [ ] **事件处理器类型必须完整**
  ```typescript
  // ✅ 正确
  const emit = defineEmits<{
    'row-click': [row: any, index: number, event: MouseEvent]
    'selection-change': [selectedRows: any[], selectedKeys: any[]]
  }>()

  // ❌ 错误
  const emit = defineEmits(['row-click', 'selection-change'])
  ```

- [ ] **泛型使用正确**
  - 类和函数应使用泛型提高类型安全性
  - 示例：`FilterManager.filterData<T extends Record<string, any>>(data: T[]): T[]`

- [ ] **类型导出规范**
  ```typescript
  // ✅ 正确
  export type { PaginationConfig, FilterCondition }
  export interface Column { }

  // ❌ 错误
  export { type PaginationConfig } // 不推荐
  ```

### 类型安全性检查

- [ ] **避免类型断言 (`as`)**
  - 优先使用类型守卫
  - 只在必要时使用 `as`，并添加注释说明原因

- [ ] **处理 null 和 undefined**
  ```typescript
  // ✅ 正确
  const data = tableData.value || []
  const height = props.height ?? 600

  // ❌ 错误（可能运行时错误）
  tableData.value.length // 未检查 null
  ```

- [ ] **枚举 vs 字面量类型**
  - 优先使用字面量类型（如 `'asc' | 'desc' | null`）
  - 只在需要运行时值时使用枚举

---

## Vue 3 组件规范

### Composition API 和 `<script setup>`

- [ ] **必须使用 `<script setup lang="ts">`**
  ```vue
  <script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  </script>
  ```

- [ ] **组件结构顺序**
  ```typescript
  <script setup lang="ts">
  // 1. 导入
  // 2. Props 定义
  // 3. Emits 定义
  // 4. 响应式状态（ref, reactive）
  // 5. 计算属性（computed）
  // 6. 方法
  // 7. 生命周期（onMounted, onBeforeUnmount）
  // 8. 监听器（watch）
  // 9. 暴露方法（defineExpose）
  </script>
  ```

- [ ] **Props 定义规范**
  ```typescript
  // ✅ 正确
  const props = withDefaults(defineProps<CTableProps>(), {
    width: 1200,
    height: 600,
    virtualScroll: true
  })

  // ❌ 错误
  const props = defineProps({
    width: Number,
    height: Number
  })
  ```

### 响应式数据使用

- [ ] **合理使用 ref 和 reactive**
  ```typescript
  // ✅ 正确 - 基本类型使用 ref
  const scrollTop = ref(0)
  const isLoading = ref(false)

  // ✅ 正确 - 对象数组使用 ref（推荐）
  const selectedRows = ref<any[]>([])

  // ✅ 正确 - 深层对象使用 reactive
  const cellSelection = reactive({
    visible: false,
    startRow: 0,
    startCol: 0
  })
  ```

- [ ] **避免不必要的响应式**
  - 仅在需要响应式更新时使用 `ref`/`reactive`
  - 配置对象、常量应使用普通变量

- [ ] **计算属性 vs 方法**
  ```typescript
  // ✅ 使用 computed - 有缓存
  const effectivePagination = computed(() => {
    if (props.pagination === false) return false
    return { ...defaultConfig, ...props.pagination }
  })

  // ❌ 使用方法 - 无缓存，每次调用都计算
  function getEffectivePagination() {
    if (props.pagination === false) return false
    return { ...defaultConfig, ...props.pagination }
  }
  ```

### 生命周期和清理

- [ ] **正确使用 onBeforeUnmount 清理资源**
  ```typescript
  onBeforeUnmount(() => {
    // 1. 清理事件监听器
    if (canvasRef.value) {
      canvasRef.value.removeEventListener('click', handleClick)
    }

    // 2. 清理定时器
    if (timer) {
      clearTimeout(timer)
    }

    // 3. 销毁渲染器
    renderer.value?.destroy()
  })
  ```

- [ ] **避免内存泄漏**
  - 所有 `addEventListener` 必须有对应的 `removeEventListener`
  - Canvas 渲染器必须实现 `destroy()` 方法
  - 避免在组件外部持有对组件内部状态的引用

### 事件处理

- [ ] **事件命名使用 kebab-case**
  ```typescript
  emits: ['row-click', 'sort-change', 'selection-change']
  ```

- [ ] **事件参数类型明确**
  ```typescript
  // ✅ 正确
  emit('row-click', { row: cell.row, data: rowData })

  // ❌ 错误
  emit('row-click', rowData) // 类型不明确
  ```

---

## Canvas 渲染最佳实践

### 渲染性能

- [ ] **使用虚拟滚动**
  - 数据量超过 100 行时必须启用
  - 缓冲区大小合理（默认 10 行）
  - 可见范围计算正确

- [ ] **减少重绘次数**
  ```typescript
  // ✅ 正确 - 使用 requestAnimationFrame
  const scheduleRender = () => {
    if (animationFrameId) return
    animationFrameId = requestAnimationFrame(() => {
      renderTable()
      animationFrameId = null
    })
  }

  // ❌ 错误 - 每次滚动都重绘
  function handleScroll() {
    renderTable() // 过于频繁
  }
  ```

- [ ] **增量渲染和脏区域标记**
  ```typescript
  // ✅ 只重绘变化的部分
  private dirtyRegions: Array<{x, y, width, height}>
  private isHeaderDirty: boolean
  private isGridDirty: boolean

  renderTable() {
    if (!this.isGridDirty && !this.isHeaderDirty) return
    // 只渲染脏区域...
  }
  ```

### Canvas 状态管理

- [ ] **Canvas 上下文正确获取和释放**
  ```typescript
  // ✅ 正确
  const ctx = canvasRef.value?.getContext('2d')
  if (!ctx) return

  // ❌ 错误 - 未检查 null
  const ctx = canvasRef.value.getContext('2d')
  ctx.fillStyle = 'red' // 可能抛出错误
  ```

- [ ] **避免 Canvas 状态污染**
  ```typescript
  // ✅ 正确 - 保存和恢复状态
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  // 绘制...
  ctx.restore()

  // ❌ 错误 - 状态污染
  ctx.translate(x, y)
  // 后续绘制受影响
  ```

### G2 渲染器规范

- [ ] **使用 G2 5.x Mark/View API**
  ```typescript
  // ✅ 正确 - 声明式渲染
  chart.cellView().data(data).encode('x', 'col').encode('y', 'row')

  // ❌ 错误 - 旧版命令式 API（如适用）
  chart.interval().data(data)
  ```

- [ ] **Chart 实例正确销毁**
  ```typescript
  destroy() {
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  }
  ```

### 高 DPI 支持

- [ ] **处理 Retina/高 DPI 屏幕**
  ```typescript
  // ✅ 正确
  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  ctx.scale(dpr, dpr)
  ```

---

## 性能优化检查点

### 计算属性优化

- [ ] **计算属性不应有副作用**
  ```typescript
  // ✅ 正确 - 纯计算
  const columnsTotalWidth = computed(() => {
    return columns.reduce((sum, col) => sum + (col.width || 120), 0)
  })

  // ❌ 错误 - 有副作用
  const totalWidth = computed(() => {
    console.log('计算总宽度') // 副作用
    renderer.value?.setWidth(sum) // 副作用
    return sum
  })
  ```

- [ ] **避免在计算属性中进行昂贵操作**
  - 大数据排序应使用方法，而非计算属性
  - 深度遍历应使用方法

### Watch 优化

- [ ] **合理使用 watch 选项**
  ```typescript
  // ✅ 正确 - 只在必要时深度监听
  watch(() => props.data, () => {
    updateTable()
  }, { deep: true }) // 仅对象数组需要

  // ✅ 正确 - 使用 getter 函数避免深度监听
  watch(() => [props.data, props.columns] as const, () => {
    updateTable()
  }) // 数组比较，更高效
  ```

- [ ] **避免无限循环**
  ```typescript
  // ❌ 错误 - 可能无限循环
  watch(() => selectedRows.value, (newRows) => {
    selectedRows.value = newRows.map(row => ({...row})) // 修改了自己
  })

  // ✅ 正确
  watch(() => selectedRows.value, (newRows) => {
    processedRows.value = newRows.map(row => ({...row})) // 使用其他变量
  })
  ```

### 大数据优化

- [ ] **大数据列表必须使用虚拟滚动**
  - 超过 100 行数据必须启用 `virtualScroll: true`
  - 虚拟滚动配置正确：
    ```typescript
    virtualScroll.virtualScroll.setDataCount(dataLength)
    virtualScroll.containerHeight.value = containerHeight
    ```

- [ ] **避免在模板中直接遍历大数据**
  ```vue
  <!-- ❌ 错误 - 直接渲染大数据 -->
  <div v-for="row in hugeData" :key="row.id">{{ row.name }}</div>

  <!-- ✅ 正确 - 只渲染可见数据 -->
  <div v-for="row in visibleData" :key="row.id">{{ row.name }}</div>
  ```

### 事件节流和防抖

- [ ] **高频事件必须节流**
  ```typescript
  // ✅ 正确 - 滚动事件节流
  let scrollTimer: number | null = null
  const handleScroll = (event: WheelEvent) => {
    if (scrollTimer) return
    scrollTimer = window.setTimeout(() => {
      scrollTimer = null
      // 处理滚动...
    }, 16) // 约 60fps
  }
  ```

- [ ] **鼠标移动事件优化**
  ```typescript
  // ✅ 正确 - 使用节流
  let mouseMoveTimer: number | null = null
  const handleMouseMove = (event: MouseEvent) => {
    if (mouseMoveTimer) return
    mouseMoveTimer = window.setTimeout(() => {
      mouseMoveTimer = null
      // 处理鼠标移动...
    }, 16)
  }
  ```

---

## 测试覆盖率要求

### 单元测试

- [ ] **核心管理类必须有单元测试**
  - `SortManager` - 测试排序逻辑
  - `FilterManager` - 测试筛选逻辑
  - `PaginationManager` - 测试分页逻辑
  - `VirtualScroll` - 测试虚拟滚动计算

- [ ] **测试文件命名规范**
  ```
  SortManager.test.ts
  FilterManager.spec.ts
  paginationLogic.test.ts
  ```

- [ ] **测试覆盖率目标**
  - 核心逻辑（Manager 类）：≥ 80%
  - 工具函数：≥ 90%
  - 组件交互：≥ 60%

### 测试质量

- [ ] **边界情况必须测试**
  ```typescript
  describe('FilterManager', () => {
    it('should handle empty data', () => {})
    it('should handle null/undefined values', () => {})
    it('should handle empty filter value', () => {})
    it('should handle multiple filters on same field', () => {})
  })
  ```

- [ ] **使用 mock 数据生成器**
  ```typescript
  // ✅ 正确
  import { generateTestData } from './mocks/dataGenerator'
  const testData = generateTestData(1000)
  ```

---

## 代码风格和命名规范

### 命名规范（遵循 NAMING.md）

- [ ] **文件命名**
  - 组件文件：`PascalCase.vue`（如 `CTable.vue`, `CPagination.vue`）
  - 工具文件：`camelCase.ts`（如 `geometry.ts`, `adapters.ts`）
  - 类型文件：`camelCase.ts`（如 `types.ts`）

- [ ] **变量和函数命名**
  ```typescript
  // ✅ 正确
  const sortOrder = ref<SortOrder>(null)
  const handleSort = () => {}
  const isAllSelected = computed(() => {})

  // ❌ 错误
  const sort_order = ref(null) // 下划线
  const doSort = () => {} // 不够描述性
  const all = computed(() => {}) // 太模糊
  ```

- [ ] **类和接口命名**
  ```typescript
  // ✅ 正确 - PascalCase，不以 I 开头
  class SortManager {}
  interface PaginationConfig {}
  type SortOrder = 'asc' | 'desc' | null

  // ❌ 错误
  class sortManager {} // 小写开头
  interface IPaginationConfig {} // 不以 I 开头
  ```

- [ ] **常量命名**
  ```typescript
  // ✅ 正确 - UPPER_SNAKE_CASE
  const DEFAULT_COLUMN_WIDTH = 120
  const DEFAULT_FONT_SIZE = 14
  const MAX_VISIBLE_PAGES = 7

  // ❌ 错误
  const defaultColumnWidth = 120
  ```

### 代码格式化

- [ ] **通过 lint 检查**
  ```bash
  # 必须执行
  pnpm lint
  pnpm lint:fix
  ```

- [ ] **使用 Less 而非 Tailwind CSS**
  - 项目使用 Less 作为 CSS 预处理器
  - 不要引入 Tailwind CSS 依赖

### 注释规范

- [ ] **公共 API 必须有 JSDoc 注释**
  ```typescript
  /**
   * 对数据进行排序
   * @param data - 要排序的数据数组
   * @returns 排序后的新数组（不修改原数组）
   */
  sortData<T extends Record<string, any>>(data: T[]): T[] {
    // ...
  }
  ```

- [ ] **复杂逻辑必须有解释性注释**
  ```typescript
  // 计算带缓冲区的起始和结束索引
  // 向上扩展缓冲区，向下扩展更多缓冲区（因为用户通常向下滚动）
  let startIndex = Math.max(0, startRowIndex - this.bufferSize)
  let endIndex = Math.min(this.totalItems, startRowIndex + visibleCount + this.bufferSize)
  ```

---

## 可访问性 (a11y)

### 键盘导航

- [ ] **支持键盘导航**
  - Tab 键切换焦点
  - 方向键选择行/单元格
  - Enter/Space 激活

- [ ] **焦点管理**
  ```typescript
  // ✅ 正确 - 管理焦点
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        selectNextRow()
        event.preventDefault()
        break
      case 'ArrowUp':
        selectPreviousRow()
        event.preventDefault()
        break
    }
  }
  ```

### ARIA 属性

- [ ] **表格有正确的 ARIA 属性**
  ```vue
  <div
    role="table"
    aria-label="数据表格"
    aria-rowcount="{{ totalRows }}"
    aria-colcount="{{ columns.length }}"
  >
  ```

- [ ] **排序状态可被屏幕阅读器识别**
  ```vue
  <div
    aria-sort="{{ sortOrder === 'asc' ? 'ascending' : 'descending' }}"
  >
  ```

### 颜色对比度

- [ ] **文本和背景对比度符合 WCAG AA 标准**
  - 普通文本：≥ 4.5:1
  - 大文本（≥ 18pt）：≥ 3:1

---

## 安全性检查

### XSS 防护

- [ ] **避免渲染未转义的 HTML**
  ```typescript
  // ❌ 危险
  div.innerHTML = userInput

  // ✅ 安全
  div.textContent = userInput
  ```

- [ ] **Canvas 渲染用户数据时注意**
  - 文本渲染使用 `fillText` 而非 `innerHTML`
  - 验证数据类型和范围

### 输入验证

- [ ] **Props 默认值安全**
  ```typescript
  // ✅ 正确 - 提供安全的默认值
  const props = withDefaults(defineProps<CTableProps>(), {
    width: 1200,
    height: 600,
    virtualScroll: true
  })

  // ❌ 错误 - 无默认值可能导致运行时错误
  const props = defineProps<CTableProps>()
  ```

---

## 文档完整性

### 类型文档

- [ ] **类型定义必须有注释**
  ```typescript
  /**
   * CTable 组件 Props
   * 兼容 Ant Design Vue Table API
   */
  export interface CTableProps {
    /**
     * 表格数据源
     * @deprecated 使用 `data` 代替
     */
    dataSource?: any[]

    /**
     * 表格数据源
     */
    data?: any[]
  }
  ```

### 使用示例

- [ ] **主要功能有使用示例**
  ```typescript
  /**
   * @example
   * ```typescript
   * // 基础使用
   * <CTable :data="data" :columns="columns" />
   *
   * // 带分页
   * <CTable
   *   :data="data"
   *   :columns="columns"
   *   :pagination="{ pageSize: 20 }"
   * />
   * ```
   */
  ```

### README 更新

- [ ] **新功能更新 README**
  - API 文档
  - 使用示例
  - 迁移指南（如有 Breaking Changes）

---

## 审查流程

### 提交前检查

```bash
# 1. 类型检查
pnpm type-check

# 2. 代码检查
pnpm lint

# 3. 自动修复（如有问题）
pnpm lint:fix

# 4. 运行测试（如有）
pnpm test

# 5. 构建（确保构建成功）
pnpm build
```

### 审查清单使用

- [ ] 复制本清单
- [ ] 逐项检查
- [ ] 标记未通过项（在 PR 中说明）
- [ ] 确保所有必须项（标记为 ✅）通过

### 优先级

- **P0 - 必须修复**：类型错误、内存泄漏、安全问题
- **P1 - 应该修复**：性能问题、可访问性问题
- **P2 - 建议修复**：代码风格、注释完善

---

## 常见问题

### Q: 如何处理 any 类型？

A: 尽量避免 `any`，使用以下替代：
- `unknown` - 类型未知但安全
- 具体类型 - 如 `Record<string, any>`
- 泛型 - 如 `<T extends Record<string, any>>`

### Q: 什么时候使用 ref vs reactive？

A:
- **ref**: 基本类型、需要重新赋值的对象
- **reactive**: 深层响应式对象、不重新赋值的情况
- **推荐**: 统一使用 `ref`（更容易理解）

### Q: 如何避免内存泄漏？

A:
1. `onBeforeUnmount` 中清理所有事件监听器
2. 销毁 Canvas、Chart 等资源
3. 清理定时器（`setTimeout`, `setInterval`）
4. 避免闭包持有组件实例引用

---

## 相关文档

- [WORKFLOW.md](./WORKFLOW.md) - 工作流程和阶段
- [NAMING.md](../NAMING.md) - 命名规范
- [SKILLS.md](./SKILLS.md) - Skills 配置说明

---

**最后更新**: 2026-02-11
**维护者**: CatUI 开发团队
