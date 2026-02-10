# CTable 代码规范

> 本文档定义了 CTable 项目的编码标准和最佳实践，所有贡献者必须遵守这些规范。

**版本**: 1.0.0
**最后更新**: 2026-02-10
**参考标准**: Airbnb Style Guide + Vue 官方风格指南 + TypeScript 最佳实践

---

## 目录

- [1. 通用原则](#1-通用原则)
- [2. TypeScript 规范](#2-typescript-规范)
- [3. Vue 组件规范](#3-vue-组件规范)
- [4. 命名规范](#4-命名规范)
- [5. 文件组织规范](#5-文件组织规范)
- [6. 注释规范](#6-注释规范)
- [7. Git 提交规范](#7-git-提交规范)
- [8. 代码审查规范](#8-代码审查规范)
- [9. 测试规范](#9-测试规范)
- [10. 性能优化规范](#10-性能优化规范)

---

## 1. 通用原则

### 1.1 可读性优先

```typescript
// ✅ Good - 清晰易懂
const isActive = user.status === 'active'
const hasPermission = user.permissions.includes('write')

// ❌ Bad - 难以理解
const a = user.s === 'a'
const b = user.p.indexOf('w') > -1
```

### 1.2 避免过早优化

```typescript
// ✅ Good - 先保证正确性
function getUserById(id: string): User | undefined {
  return users.find(user => user.id === id)
}

// ❌ Bad - 过早优化，牺牲可读性
function g(id){for(let i=0,u;i<users.length;i++){if((u=users[i]).i==id)return u}}
```

### 1.3 DRY (Don't Repeat Yourself)

```typescript
// ✅ Good - 提取公共逻辑
function formatDate(date: Date, format: string): string {
  // 统一的格式化逻辑
}

// ❌ Bad - 重复代码
const date1 = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
const date2 = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
```

---

## 2. TypeScript 规范

### 2.1 类型定义

#### 使用明确的类型而非 any

```typescript
// ✅ Good - 明确的类型
interface User {
  id: string
  name: string
  age: number
  email?: string  // 可选属性
}

function getUser(id: string): User | undefined {
  // ...
}

// ❌ Bad - 使用 any
function getUser(id: any): any {
  // ...
}
```

#### 优先使用 interface 定义对象类型

```typescript
// ✅ Good - 使用 interface
interface TableColumn {
  key: string
  title: string
  width?: number
}

// ✅ Good - 使用 type 定义联合类型
type ThemePreset = 'light' | 'dark' | 'auto'

// ❌ Bad - 混用
type TableColumn = {
  key: string
  title: string
}
```

#### 使用泛型增强复用性

```typescript
// ✅ Good - 泛型函数
function first<T>(arr: T[]): T | undefined {
  return arr[0]
}

// 使用
const firstNumber = first<number>([1, 2, 3])
const firstString = first<string>(['a', 'b', 'c'])
```

### 2.2 变量声明

#### 使用 const 优先，let 次之

```typescript
// ✅ Good
const MAX_SIZE = 100
const config = { timeout: 5000 }
for (let i = 0; i < items.length; i++) {
  // ...
}

// ❌ Bad
var MAX_SIZE = 100
```

#### 避免使用 var

```typescript
// ✅ Good
let count = 0

// ❌ Bad
var count = 0
```

### 2.3 函数定义

#### 使用箭头函数

```typescript
// ✅ Good - 箭头函数
const add = (a: number, b: number): number => a + b

// ✅ Good - 对象方法简写
const calculator = {
  add(a: number, b: number) {
    return a + b
  }
}

// ❌ Bad - function 关键字
function add(a: number, b: number): number {
  return a + b
}
```

#### 参数默认值

```typescript
// ✅ Good
function createConfig(options: Config = {}): Config {
  return {
    timeout: 5000,
    retries: 3,
    ...options
  }
}

// ❌ Bad
function createConfig(options?: Config): Config {
  const opts = options || {}
  // ...
}
```

### 2.4 异步编程

#### 优先使用 async/await

```typescript
// ✅ Good
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  const data = await response.json()
  return data
}

// ❌ Bad - 回调地狱
function fetchUser(id: string, callback: (user: User) => void) {
  fetch(`/api/users/${id}`)
    .then(res => res.json())
    .then(data => callback(data))
}
```

#### 错误处理

```typescript
// ✅ Good - 完整的错误处理
async function loadUserData(userId: string) {
  try {
    const user = await fetchUser(userId)
    return { success: true, data: user }
  } catch (error) {
    console.error('Failed to load user:', error)
    return { success: false, error }
  }
}

// ❌ Bad - 没有错误处理
async function loadUserData(userId: string) {
  const user = await fetchUser(userId)
  return user
}
```

### 2.5 解构赋值

```typescript
// ✅ Good - 对象解构
interface User {
  id: string
  name: string
  email: string
}

function displayUser({ name, email }: User) {
  console.log(`${name}: ${email}`)
}

// ✅ Good - 数组解构
const [first, second, ...rest] = items

// ❌ Bad
function displayUser(user: User) {
  console.log(`${user.name}: ${user.email}`)
}
```

---

## 3. Vue 组件规范

### 3.1 组件定义

#### 使用 `<script setup>` 语法（推荐）

```vue
<!-- ✅ Good -->
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const emit = defineEmits<{
  update: [value: string]
  change: [event: Event]
}>()

const isVisible = ref(true)
const doubleCount = computed(() => props.count * 2)
</script>

<template>
  <div class="component">
    <h2>{{ title }}</h2>
    <p>Count: {{ doubleCount }}</p>
  </div>
</template>

<!-- ❌ Bad - 使用 Options API -->
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    title: String,
    count: Number
  },
  setup() {
    // ...
  }
})
</script>
```

### 3.2 组件命名

#### 多单词组件名

```vue
<!-- ✅ Good - 多单词 -->
<script setup lang="ts">
// UserProfile.vue
// DataTable.vue
// PaginationItem.vue
</script>

<!-- ❌ Bad - 单单词 -->
<!-- User.vue -->
<!-- Table.vue -->
```

#### PascalCase 文件名

```
✅ Good:
- UserProfile.vue
- DataTable.vue
- PaginationItem.vue

❌ Bad:
- userProfile.vue
- data-table.vue
- DATA_TABLE.vue
```

### 3.3 Props 定义

```vue
<script setup lang="ts">
// ✅ Good - 类型安全的 Props
interface Props {
  user: User
  pageSize: number
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false
})

// ❌ Bad - 运行时 Props 定义
defineProps({
  user: Object,
  pageSize: Number,
  isActive: {
    type: Boolean,
    default: false
  }
})
</script>
```

### 3.4 Emits 定义

```vue
<script setup lang="ts">
// ✅ Good - 类型安全的 Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [event: Event]
  'submit': [formData: FormData]
}>()

function handleSubmit() {
  emit('submit', new FormData())
}

// ❌ Bad - 没有类型
const emit = defineEmits(['update:modelValue', 'change', 'submit'])
</script>
```

### 3.5 模板规范

```vue
<template>
  <!-- ✅ Good - 使用 kebab-case -->
  <div class="user-profile">
    <user-avatar :size="32" :user="currentUser" />
    <button @click="handleClick">
      Click me
    </button>
  </div>

  <!-- ❌ Bad - 混用大小写 -->
  <div class="UserProfile">
    <UserAvatar :Size="32" />
    <button @click="handleClick()">
      Click me
    </button>
  </div>
</template>
```

### 3.6 样式规范

```vue
<style scoped>
/* ✅ Good - 使用 BEM 命名 */
.table-row {
  display: flex;
}

.table-row--active {
  background-color: #f0f0f0;
}

.table-cell {
  flex: 1;
}

.table-cell__header {
  font-weight: bold;
}

/* ❌ Bad - 深层选择器 */
.table .row .cell span {
  color: red;
}
</style>
```

---

## 4. 命名规范

### 4.1 文件命名

```
Components:   PascalCase
- UserProfile.vue
- DataTable.vue
- PaginationItem.vue

Utils:        camelCase
- formatDate.ts
- deepClone.ts
- eventBus.ts

Types:        camelCase
- userTypes.ts
- tableTypes.ts
- apiTypes.ts

Constants:    UPPER_SNAKE_CASE
- API_URLS.ts
- ERROR_CODES.ts
- CONFIG.ts
```

### 4.2 变量命名

```typescript
// ✅ Good - camelCase
const userName = 'John'
const isActive = true
const maxRetryCount = 3

// ❌ Bad
const user_name = 'John'
const is_active = true
const MAX_RETRY_COUNT = 3  // 只用于常量
```

### 4.3 常量命名

```typescript
// ✅ Good - UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3
const API_BASE_URL = 'https://api.example.com'
const DEFAULT_TIMEOUT = 5000

// ❌ Bad
const maxRetryCount = 3
const apiBaseUrl = 'https://api.example.com'
```

### 4.4 类和接口命名

```typescript
// ✅ Good - PascalCase
class UserManager {}
interface UserRepository {}
abstract class BaseService {}

// ❌ Bad
class userManager {}
interface IUserRepository {}
```

### 4.5 类型命名

```typescript
// ✅ Good - PascalCase
interface User {}
type ThemePreset = 'light' | 'dark'
enum LogLevel {
  DEBUG,
  INFO,
  ERROR
}

// ✅ Good - 类型后缀
type UserDTO = DataTransferObject<User>
type UserVO = ViewDataObject<User>
type APIResponse<T> = {
  data: T
  status: number
}

// ❌ Bad
interface user {}
type theme_preset = 'light' | 'dark'
```

### 4.6 函数命名

```typescript
// ✅ Good - 动词开头
function getUserById(id: string): User {}
function formatDate(date: Date): string {}
function isValidEmail(email: string): boolean {}

// 事件处理器
function handleClick() {}
function handleSubmit() {}
function onUserChange() {}

// ✅ Good - 布尔值返回
function isActive(): boolean {}
function hasPermission(): boolean {}
function canEdit(): boolean {}

// ❌ Bad
function user() {}
function date() {}
function active() {}
```

### 4.7 私有成员命名

```typescript
// ✅ Good - # 前缀 (ES2022)
class UserService {
  #cache: Map<string, User>
  #logger: Logger

  constructor() {
    this.#cache = new Map()
  }
}

// ✅ Good - _ 前缀 (传统方式)
class UserService {
  private _cache: Map<string, User>
  private _logger: Logger

  getCache() {
    return this._cache
  }
}

// ❌ Bad - 没有标记
class UserService {
  cache: Map<string, User>  // 应该是私有
}
```

---

## 5. 文件组织规范

### 5.1 目录结构

```
src/
├── components/          # 通用组件
│   ├── Button/
│   │   ├── Button.vue
│   │   ├── Button.test.ts
│   │   └── types.ts
│   └── index.ts
├── composables/         # 组合式函数
│   ├── useTable.ts
│   └── useVirtualScroll.ts
├── utils/              # 工具函数
│   ├── format.ts
│   └── validate.ts
├── types/              # 类型定义
│   ├── index.ts
│   └── user.ts
├── constants/          # 常量
│   └── config.ts
└── index.ts           # 入口文件
```

### 5.2 导入顺序

```typescript
// 1. Node.js 内置模块
import path from 'path'
import fs from 'fs'

// 2. 第三方库
import { ref, computed } from 'vue'
import { cloneDeep } from 'lodash-es'

// 3. 内部模块
import { Button } from '@/components'
import { useTable } from '@/composables'
import type { User } from '@/types'

// 4. 相对路径导入
import { formatDate } from './utils/format'
import type { LocalType } from './types'

// 5. 样式导入
import './styles.css'
```

### 5.3 导出规范

```typescript
// ✅ Good - 命名导出
export const API_URL = 'https://api.example.com'
export function formatDate(date: Date): string {}
export interface User {}

// ✅ Good - 默认导出（仅用于组件）
export default defineComponent({
  // ...
})

// ❌ Bad - 混用
export default {
  API_URL,
  formatDate
}
```

---

## 6. 注释规范

### 6.1 文件注释

```typescript
/**
 * 用户管理服务
 *
 * 提供用户的增删改查功能，包括：
 * - 用户列表查询
 * - 用户详情获取
 * - 用户创建和更新
 * - 用户删除
 *
 * @module UserService
 * @author Team CTable
 * @since 2026-02-10
 */
```

### 6.2 函数注释（JSDoc）

```typescript
/**
 * 根据用户 ID 获取用户信息
 *
 * @param id - 用户 ID
 * @returns 用户对象，如果不存在则返回 undefined
 * @throws {Error} 当 API 请求失败时抛出错误
 *
 * @example
 * ```typescript
 * const user = await getUserById('123')
 * console.log(user.name)
 * ```
 */
async function getUserById(id: string): Promise<User | undefined> {
  // ...
}
```

### 6.3 接口注释

```typescript
/**
 * 用户数据接口
 *
 * 表示系统中的用户信息
 */
interface User {
  /**
   * 用户唯一标识符
   */
  id: string

  /**
   * 用户显示名称
   */
  name: string

  /**
   * 用户邮箱地址
   * @format email
   */
  email: string

  /**
   * 用户角色
   * @default 'user'
   */
  role?: 'admin' | 'user' | 'guest'
}
```

### 6.4 行内注释

```typescript
// ✅ Good - 解释为什么
// 使用防抖优化性能，避免频繁触发 API 请求
const debouncedSearch = debounce(handleSearch, 300)

// ✅ Good - 解释复杂逻辑
// 计算第一个真正可见的行（考虑滚动偏移）
const firstVisibleRowIndex = Math.floor(scrollTop / cellHeight)

// ❌ Bad - 重复代码
// 设置 count 为 0
const count = 0

// ❌ Bad - 无意义注释
// Good
const isActive = true
```

### 6.5 TODO 注释

```typescript
// TODO: 优化大数据量下的性能问题
// FIXME: 修复内存泄漏问题
// HACK: 临时方案，需要重构
// NOTE: 这个方法会在下一个版本废弃
```

---

## 7. Git 提交规范

### 7.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 7.2 Type 类型

```
feat:     新功能
fix:      修复 Bug
docs:     文档更新
style:    代码格式（不影响功能）
refactor: 重构
perf:     性能优化
test:     测试相关
chore:    构建/工具相关
revert:   回滚提交
```

### 7.3 提交示例

```bash
# ✅ Good
feat(table): 添加虚拟滚动功能

- 实现缓冲区机制
- 优化滚动性能
- 支持百万级数据渲染

Closes #123

# ✅ Good
fix(renderer): 修复网格线不跟随滚动的问题

计算滚动偏移，确保网格线与内容同步

Fixes #456

# ❌ Bad
add feature
fix bug
update
```

### 7.4 分支命名

```
feature/功能名称     # 新功能
fix/问题描述         # Bug 修复
hotfix/紧急修复      # 生产环境紧急修复
refactor/重构内容    # 代码重构
docs/文档内容        # 文档更新
test/测试相关        # 测试相关
```

---

## 8. 代码审查规范

### 8.1 审查清单

#### 功能性
- [ ] 代码实现了预期功能
- [ ] 没有明显的 Bug
- [ ] 边界情况已处理

#### 可读性
- [ ] 变量和函数命名清晰
- [ ] 代码逻辑易懂
- [ ] 必要的地方有注释

#### 性能
- [ ] 没有明显的性能问题
- [ ] 避免不必要的重渲染
- [ ] 大数据量有优化措施

#### 安全性
- [ ] 没有安全漏洞
- [ ] 输入验证完整
- [ ] 敏感数据已保护

#### 测试
- [ ] 有相应的单元测试
- [ ] 测试覆盖核心逻辑
- [ ] 测试用例有意义

### 8.2 审查流程

1. **自我审查** - 提交前自己审查代码
2. **Pull Request** - 创建 PR 并描述变更
3. **同行审查** - 至少一人审查通过
4. **测试验证** - CI/CD 测试通过
5. **合并代码** - 审查通过后合并

---

## 9. 测试规范

### 9.1 测试文件命名

```
Component.test.ts    # 单元测试
Component.spec.ts    # 规范测试
Component.e2e.ts     # E2E 测试
```

### 9.2 测试结构

```typescript
describe('UserService', () => {
  // 准备测试环境
  beforeEach(() => {
    // 初始化代码
  })

  afterEach(() => {
    // 清理代码
  })

  describe('getUserById', () => {
    it('应该返回正确的用户', async () => {
      // Arrange（准备）
      const userId = '123'

      // Act（执行）
      const user = await getUserById(userId)

      // Assert（断言）
      expect(user).toBeDefined()
      expect(user.id).toBe(userId)
    })

    it('当用户不存在时应该返回 undefined', async () => {
      const userId = 'non-existent'
      const user = await getUserById(userId)
      expect(user).toBeUndefined()
    })
  })
})
```

### 9.3 测试覆盖率

- **单元测试覆盖率**: ≥ 80%
- **核心功能覆盖率**: 100%
- **关键路径覆盖率**: 100%

---

## 10. 性能优化规范

### 10.1 Vue 性能

```vue
<script setup lang="ts">
// ✅ Good - 使用 computed 缓存计算结果
const filteredList = computed(() => {
  return list.value.filter(item => item.active)
})

// ❌ Bad - 每次调用都重新计算
function getFilteredList() {
  return list.value.filter(item => item.active)
}
</script>
```

### 10.2 避免不必要的响应式

```typescript
// ✅ Good - 使用 shallowRef
const largeData = shallowRef<LargeDataType>(initLargeData())

// ❌ Bad - 使用 ref（深度响应式，性能差）
const largeData = ref<LargeDataType>(initLargeData())
```

### 10.3 虚拟滚动

```typescript
// ✅ Good - 大列表使用虚拟滚动
import { useVirtualList } from '@vueuse/core'

const { list, containerProps, wrapperProps } = useVirtualList(
  largeDataSource,
  { itemHeight: 50 }
)
```

### 10.4 防抖和节流

```typescript
// ✅ Good - 搜索使用防抖
import { useDebounceFn } from '@vueuse/core'

const debouncedSearch = useDebounceFn(handleSearch, 300)

// ✅ Good - 滚动使用节流
import { useThrottleFn } from '@vueuse/core'

const throttledScroll = useThrottleFn(handleScroll, 100)
```

---

## 工具配置

### ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    'prettier'
  ],
  rules: {
    'vue/multi-word-component-names': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn'
  }
}
```

### Prettier 配置

```javascript
// .prettierrc.js
module.exports = {
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false
}
```

### TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## 参考资源

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Vue 官方风格指南](https://vuejs.org/style-guide/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

**变更历史**:

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-02-10 | 初始版本 |

---

**维护者**: CTable 开发团队
