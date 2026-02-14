# VTable (@visactor/vtable) 技能文档

> **最后更新**: 2025-02-13
> **版本**: 1.22.3

## 📚 官方文档

| 类型 | 链接 | 说明 |
|------|--------|------|
| **教程** | https://visactor.io/vtable/guide/Getting_Started/Getting_Started | 快速开始教程 |
| **ListTable 配置** | https://visactor.io/vtable/option/ListTable | ListTable 完整配置选项 |
| **API 方法** | https://visactor.io/vtable/api/Methods | 实例方法参考 |
| **API 属性** | https://visactor.io/vtable/api/Properties | 属性参考 |
| **API 事件** | https://visactor.io/vtable/api/events | 事件处理参考 |
| **GitHub** | https://github.com/VisActor/VTable | 开源仓库 |

## 🎯 在 CatUI 中的使用

### 基本配置模式

```typescript
// packages/ctable/src/adapters/VTableAdapter.ts

import { ListTable } from '@visactor/vtable'

const table = new ListTable({
  container: '#container',

  // 数据
  records: dataArray,

  // 列定义
  columns: columnArray,

  // 尺寸
  width: number,
  height: number,

  // 主题
  theme: themeObject,

  // 虚拟滚动
  virtual: true,

  // 其他配置...
})
```

### 常用配置项

#### 斑马线 (Stripe)

```typescript
// ✅ 正确：启用斑马线
stripe: {
  bgColor: '#fafafa'
}

// ✅ 正确：禁用斑马线（传递空对象）
stripe: {}

// ❌ 错误：传递 undefined 不会禁用斑马线
stripe: undefined
```

#### 列宽调整

```typescript
columnResize: {
  // 启用列宽拖拽调整
  dragMode: 'all' | 'none' | 'rightBorder'
}
```

#### 固定列

```typescript
frozenColCount: number,      // 左侧固定列数
frozenColEndCount: number    // 右侧固定列数
```

#### 分页

```typescript
pagination: {
  pageSize: number,
  current: number,
  total: number
}
```

#### 选择行

```typescript
select: {
  checkbox: boolean,           // 显示复选框
  headerCheckbox: boolean,     // 表头复选框
  clickArea: 'cell' | 'row' // 点击区域
}
```

#### 排序

```typescript
sort: {
  mode: 'single' | 'multiple',
  multiple: boolean
}
```

#### 筛选

```typescript
filter: {
  multiple: boolean,
  filterChange: (filter: any) => void
}
```

## 🔧 常见问题与解决方案

### Q: 斑马线不显示？

**A**: 检查以下几点：

1. **主题配置冲突** - 主题中已定义 `stripe`，初始化时传递的配置会覆盖主题配置
2. **正确的禁用方式** - 传递空对象 `{}` 而不是 `undefined` 或 `false`
3. **使用展开运算符** - 动态配置时使用 `...(condition ? config : {})`

### ✅ 正确解决方案

**不在初始化时传递 stripe 配置**，让主题中的默认 stripe 生效：

```typescript
// ✅ 方式：在主题中定义（推荐）
theme: {
  stripe: {
    bgColor: '#fafafa'
  }
}

// 初始化时不传递 stripe
new VTable.ListTable({
  theme: vtableTheme,
  // 不传递 stripe 配置
})
```

**如果需要动态控制斑马线开关**，添加 updateTheme 方法：

```typescript
updateTheme(stripeEnabled: boolean, stripeColor?: string) {
  const newTheme = { ...vtableTheme }
  if (stripeEnabled) {
    newTheme.stripe = {
      bgColor: stripeColor || '#fafafa'
    }
  } else {
    // 移除 stripe 配置，使用主题默认
    delete newTheme.stripe
  }
  this.table.setTheme(newTheme)
}
```

```typescript
// ✅ 正确配置
// 方式1：在初始化时传递
new VTable.ListTable({
  stripe: {
    bgColor: '#fafafa'
  }
})

// 方式2：在主题中定义
theme: {
  stripe: {
    bgColor: '#fafafa'
  }
}

// ❌ 错误：传递 undefined 不会禁用斑马线
stripe: undefined
```

### Q: 斑马线颜色不生效？

**A**: 检查：
1. `bgColor` 格式是否正确（必须是十六进制颜色）
2. 是否与其他样式配置冲突（如 `defaultStyle.bgColor`）

### Q: 如何更新表格数据？

**A**: 使用 API 方法：

```typescript
table.setRecords(newData)
table.setColumns(newColumns)
```

### Q: 如何获取选中的行？

**A**: 使用选择 API：

```typescript
const selectedRows = table.getSelectedRowIndexes()
const selectedData = table.getSelectedRecords()
```

## 📝 开发规范

1. **查阅文档优先** - 开发新功能前先查阅官方文档
2. **使用已有功能** - VTable 已有的功能直接使用，不重复开发
3. **正确的 API 格式** - 严格按照文档格式传递参数
4. **参考官方示例** - 遇到问题先看官方示例代码

## 🚀 待学习的内容

根据项目需求，以下功能需要深入学习：

- [ ] 自定义主题配置
- [ ] 单元格渲染自定义
- [ ] 编辑功能
- [ ] 导出功能
- [ ] 性能优化最佳实践
- [ ] 事件处理完整列表
- [ ] 树形表格配置
- [ ] 合并单元格

---

**使用规则**:
- 添加新学到的 API 时，更新此文档
- 遇到问题时先查阅此文档
- 官方文档更新时同步更新
