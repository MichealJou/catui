# 快速开始

5 分钟上手 CTable，创建您的第一个高性能表格。

---

## 🎯 学习目标

通过本教程，您将学会：
- ✅ 创建基础的 CTable 组件
- ✅ 配置列和数据
- ✅ 启用分页功能
- ✅ 添加行选择功能

---

## 🚀 基础示例（2分钟）

### 步骤 1: 创建表格组件

创建 `MyFirstTable.vue`：

```vue
<template>
  <div class="container">
    <h1>我的第一个表格</h1>
    <CTable
      :columns="columns"
      :dataSource="data"
      :width="800"
      :height="400"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CTable from '@catui/ctable'

// 定义列配置
const columns = ref([
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '姓名', width: 120 },
  { key: 'age', title: '年龄', width: 80 },
  { key: 'city', title: '城市', width: 150 }
])

// 定义数据
const data = ref([
  { id: 1, name: '张三', age: 25, city: '北京' },
  { id: 2, name: '李四', age: 30, city: '上海' },
  { id: 3, name: '王五', age: 28, city: '广州' },
  { id: 4, name: '赵六', age: 35, city: '深圳' },
  { id: 5, name: '钱七', age: 27, city: '杭州' }
])
</script>

<style scoped>
.container {
  padding: 20px;
}
</style>
```

### 运行效果

| ID | 姓名 | 年龄 | 城市 |
|----|------|------|------|
| 1 | 张三 | 25 | 北京 |
| 2 | 李四 | 30 | 上海 |
| 3 | 王五 | 28 | 广州 |
| 4 | 赵六 | 35 | 深圳 |
| 5 | 钱七 | 27 | 杭州 |

---

## 📊 添加分页（1分钟）

### 启用分页功能

```vue
<template>
  <div class="container">
    <h1>带分页的表格</h1>
    <CTable
      :columns="columns"
      :dataSource="data"
      :width="800"
      :height="400"
      :pagination="pagination"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CTable from '@catui/ctable'

const columns = ref([
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '姓名', width: 120 },
  { key: 'age', title: '年龄', width: 80 },
  { key: 'city', title: '城市', width: 150 }
])

// 模拟更多数据
const data = ref(Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `用户${i + 1}`,
  age: 20 + (i % 30),
  city: ['北京', '上海', '广州', '深圳'][i % 4]
})))

// 分页配置
const pagination = ref({
  current: 1,        // 当前页
  pageSize: 10,      // 每页条数
  total: 100,        // 总条数
  showSizeChanger: true,  // 显示每页条数选择器
  showQuickJumper: true,   // 显示快速跳转
  showTotal: (total: number) => `共 ${total} 条`  // 显示总数
})
</script>
```

---

## ☑️ 添加行选择（2分钟）

### 启用多选功能

```vue
<template>
  <div class="container">
    <h1>带选择的表格</h1>

    <div class="toolbar">
      <span>已选择 {{ selectedRows.length }} 条</span>
      <button @click="handleSelectAll">全选</button>
      <button @click="handleClearSelection">清空</button>
    </div>

    <CTable
      :columns="columns"
      :dataSource="data"
      :width="800"
      :height="400"
      :rowSelection="rowSelection"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CTable from '@catui/ctable'

const columns = ref([
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '姓名', width: 120 },
  { key: 'age', title: '年龄', width: 80 },
  { key: 'city', title: '城市', width: 150 }
])

const data = ref(Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `用户${i + 1}`,
  age: 20 + (i % 30),
  city: ['北京', '上海', '广州', '深圳'][i % 4]
})))

// 行选择配置
const rowSelection = ref({
  type: 'checkbox',           // 多选类型
  selectedRowKeys: ref([]),   // 选中的行keys
  onChange: (selectedRows: any[], selectedKeys: string[]) => {
    console.log('选中行:', selectedRows)
    console.log('选中keys:', selectedKeys)
  }
})

const selectedRows = ref([])

// 处理选择变化
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

// 全选
const handleSelectAll = () => {
  rowSelection.value.selectedRowKeys.value = data.value.map(item => item.id)
}

// 清空选择
const handleClearSelection = () => {
  rowSelection.value.selectedRowKeys.value = []
}
</script>

<style scoped>
.container {
  padding: 20px;
}

.toolbar {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
}

button {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  color: #1890ff;
  border-color: #1890ff;
}
</style>
```

---

## 🎨 添加主题（可选）

### 使用预设主题

```vue
<template>
  <div class="container">
    <h1>主题切换示例</h1>

    <div class="theme-selector">
      <button @click="theme = 'ant-design'">Ant Design</button>
      <button @click="theme = 'ant-design-dark'">Ant Design Dark</button>
      <button @click="theme = 'element-plus'">Element Plus</button>
      <button @click="theme = 'naive'">Naive UI</button>
    </div>

    <CTable
      :columns="columns"
      :dataSource="data"
      :width="800"
      :height="400"
      :theme="theme"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CTable from '@catui/ctable'

const columns = ref([
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: '姓名', width: 120 },
  { key: 'age', title: '年龄', width: 80 }
])

const data = ref([
  { id: 1, name: '张三', age: 25 },
  { id: 2, name: '李四', age: 30 },
  { id: 3, name: '王五', age: 28 }
])

// 主题切换
const theme = ref('ant-design')
</script>

<style scoped>
.theme-selector {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

.theme-selector button {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.theme-selector button:hover {
  color: #1890ff;
  border-color: #1890ff;
}
</style>
```

---

## 🚀 完整示例

所有功能组合在一起的完整示例：

```vue
<template>
  <div class="container">
    <h1>完整的 CTable 示例</h1>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="stats">
        <span>总计: {{ data.length }} 条</span>
        <span>已选: {{ selectedRows.length }} 条</span>
      </div>
      <div class="actions">
        <button @click="handleSelectAll">全选</button>
        <button @click="handleClearSelection">清空</button>
        <button @click="handleRefresh">刷新</button>
      </div>
    </div>

    <!-- 表格 -->
    <CTable
      :columns="columns"
      :dataSource="data"
      :width="1200"
      :height="500"
      :theme="theme"
      :pagination="pagination"
      :rowSelection="rowSelection"
      @selection-change="handleSelectionChange"
    />

    <!-- 主题切换 -->
    <div class="theme-selector">
      <span>主题：</span>
      <button
        v-for="t in themes"
        :key="t.value"
        :class="{ active: theme === t.value }"
        @click="theme = t.value"
      >
        {{ t.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CTable from '@catui/ctable'

// 列配置
const columns = ref([
  { key: 'id', title: 'ID', width: 80, sortable: true },
  { key: 'name', title: '姓名', width: 120 },
  { key: 'age', title: '年龄', width: 80, sortable: true },
  { key: 'email', title: '邮箱', width: 200 },
  { key: 'city', title: '城市', width: 120 },
  { key: 'status', title: '状态', width: 100 }
])

// 生成模拟数据
const data = ref(Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `用户${i + 1}`,
  age: 20 + (i % 40),
  email: `user${i + 1}@example.com`,
  city: ['北京', '上海', '广州', '深圳', '杭州'][i % 5],
  status: ['活跃', '禁用', '待审核'][i % 3]
})))

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 50,
  total: 1000,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 行选择配置
const selectedRows = ref([])
const rowSelection = ref({
  type: 'checkbox',
  selectedRowKeys: ref([]),
  onChange: (selectedRows: any[]) => {
    console.log('选中:', selectedRows)
  }
})

// 主题配置
const theme = ref('ant-design')
const themes = [
  { label: 'Ant Design', value: 'ant-design' },
  { label: 'Ant Dark', value: 'ant-design-dark' },
  { label: 'Element Plus', value: 'element-plus' },
  { label: 'Naive UI', value: 'naive' }
]

// 事件处理
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

const handleSelectAll = () => {
  rowSelection.value.selectedRowKeys.value = data.value.map(item => item.id)
}

const handleClearSelection = () => {
  rowSelection.value.selectedRowKeys.value = []
}

const handleRefresh = () => {
  console.log('刷新数据')
  // 实际项目中这里会重新加载数据
}
</script>

<style scoped>
.container {
  padding: 20px;
}

.toolbar {
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats {
  display: flex;
  gap: 16px;
  color: rgba(0, 0, 0, 0.65);
}

.actions {
  display: flex;
  gap: 8px;
}

button {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

button:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.theme-selector {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-selector button.active {
  color: #1890ff;
  border-color: #1890ff;
  background: #e6f7ff;
}
</style>
```

---

## 🎉 恭喜！

您已经成功创建了第一个 CTable 组件！

### 您学会了：
- ✅ 基础表格配置
- ✅ 分页功能
- ✅ 行选择功能
- ✅ 主题切换

### 📚 下一步

- 📗 [基础用法](../02-user-guide/basic-usage.md) ⏳ - 深入了解更多配置
- 📗 [分页功能](../02-user-guide/pagination.md) ⏳ - 分页详细配置
- 📗 [主题定制](../02-user-guide/theming.md) ⏳ - 自定义主题
- 📗 [虚拟滚动](../02-user-guide/virtual-scroll.md) ⏳ - 处理大数据量

---

**需要帮助？**
- ❓ [常见问题](../09-faq/) ⏳
- 🐛 [报告 Bug](链接)
