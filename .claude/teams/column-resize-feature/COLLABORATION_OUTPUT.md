# CTable 列宽拖拽调整功能 - 多角色协同输出

## 📋 协同工作流程

```
┌─────────────────────────────────────────────────────────────────┐
│                      多角色协同开发                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🎨 Designer          👨‍💻 Developer          👁️ Reviewer        │
│  ┌─────────┐         ┌─────────┐            ┌─────────┐        │
│  │交互设计  │ ──────> │代码实现  │ ─────────> │质量审查  │        │
│  └─────────┘         └─────────┘            └─────────┘        │
│       │                   │                      │              │
│       │                   │                      │              │
│       └───────────────────┴──────────────────────┘              │
│                           │                                     │
│                           ▼                                     │
│                    ┌─────────────┐                              │
│                    │ 🧪 Tester   │                              │
│                    │   测试验证   │                              │
│                    └─────────────┘                              │
│                           │                                     │
│                           ▼                                     │
│                    ┌─────────────┐                              │
│                    │ ✅ 最终代码  │                              │
│                    └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Designer 输出

### 交互设计要点
- **触发区域**: 8px 宽度，列边界左右各 4px
- **视觉反馈**: col-resize 光标 + 蓝色指示线
- **拖拽状态**: 显示预览线 + 宽度 Tooltip
- **双击功能**: 自动适应内容宽度

### Props 设计
```typescript
interface ResizeConfig {
  enabled?: boolean              // 是否启用
  hitAreaWidth?: number          // 触发区域宽度，默认 8
  minWidth?: number              // 全局最小宽度，默认 50
  maxWidth?: number              // 全局最大宽度，默认 1000
  mode?: 'single' | 'adjacent'   // 调整模式
  dblClickAutoSize?: boolean     // 双击自动适应
  showSizeTooltip?: boolean      // 显示宽度提示
}
```

---

## 👨‍💻 Developer 输出

### 技术实现方案
- 基于 VTable 的 `columnResize` 配置
- 修改文件: `types/index.ts`, `VTableAdapter.ts`, `CTable.vue`
- 使用 Map 存储列宽状态

### 核心逻辑
```typescript
// VTableAdapter
const columnResize = {
  enable: true,
  minWidth: 50,
  maxWidth: 1000
}

// 事件监听
listeners: {
  resize_column: (args) => {
    // 更新列宽
    emit('column-resize', info)
  }
}
```

---

## 👁️ Reviewer 输出

### 需要修复的问题
1. ❌ `types/index.ts` 缺少完整类型定义
2. ❌ 缺少 `column-resize-end` 事件
3. ❌ 未处理固定列边界情况
4. ❌ 缺少 `defineExpose` 暴露方法

### 改进建议
```typescript
// 添加完整类型
export interface ColumnResizeInfo {
  column: string
  oldWidth: number
  newWidth: number
}

// 暴露方法
defineExpose({
  getColumnWidth: (key: string) => number,
  setColumnWidth: (key: string, width: number) => void,
  autoFitColumn: (key: string) => void
})
```

---

## 🧪 Tester 输出

### 测试用例
- 配置验证测试
- 拖拽交互测试
- 宽度约束测试
- 事件触发测试
- 边界情况测试

### 性能指标
- 拖拽响应延迟 < 16ms
- 拖拽过程内存增长 < 1MB/min
- 100 列表格拖拽 CPU < 50%

---

## ✅ 整合后的最终实现

### 文件修改清单

| 文件 | 修改内容 |
|------|----------|
| `types/index.ts` | 添加 ResizeConfig, ColumnResizeInfo 类型 |
| `VTableAdapter.ts` | 添加 columnResize 配置和事件监听 |
| `CTable.vue` | 添加 resizable prop 和事件 |

---

## 📝 使用示例

```vue
<template>
  <CTable
    :columns="columns"
    :data="data"
    :resizable="{
      enabled: true,
      minWidth: 60,
      maxWidth: 500,
      dblClickAutoSize: true
    }"
    @column-resize="handleResize"
  />
</template>

<script setup lang="ts">
const columns = [
  { key: 'name', title: '姓名', width: 120, resizable: true },
  { key: 'age', title: '年龄', width: 80, minWidth: 60 }
]

const handleResize = (info) => {
  console.log(`列 ${info.column} 宽度: ${info.oldWidth} → ${info.newWidth}`)
}
</script>
```

---

## 🎯 下一步

1. 根据整合方案编写代码
2. 运行类型检查: `pnpm type-check`
3. 运行代码检查: `pnpm lint`
4. 编写测试用例
5. 提交 PR

---

**生成时间**: 2026-02-12
**参与角色**: Designer, Developer, Reviewer, Tester