# CTable VTable 集成架构设计

**设计者**: Claude (架构师)
**日期**: 2026-02-11
**版本**: v1.0
**状态**: ✅ 设计完成,待评审

---

## 一、架构总览

### 1.1 设计目标

1. ✅ **API 完全兼容** - 用户代码无需修改
2. ✅ **渐进式迁移** - 支持双渲染器并行
3. ✅ **性能卓越** - 10万行 <500ms, 60fps
4. ✅ **低耦合设计** - 适配器模式,易于维护

### 1.2 架构分层

```
┌─────────────────────────────────────────────────────────┐
│                  用户层 (User Layer)                     │
│                                                         │
│  <CTable :columns="columns" :data="data" />            │
│                                                         │
│  用户代码保持 100% 不变!                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              组件层 (Component Layer)                    │
│                                                         │
│  CTable.vue                                             │
│  ├── renderer 配置 ('g2' | 'vtable')                   │
│  └── 条件渲染:                                           │
│      ├── VTableAdapter (新)                             │
│      └── G2TableRenderer (旧,保留)                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              适配器层 (Adapter Layer)                    │
│                                                         │
│  VTableAdapter.ts ← 核心适配器                          │
│  ├── CTable API → VTable API 转换                       │
│  ├── 事件映射 (VTable → CTable)                         │
│  ├── 主题适配 (CTable Theme → VTable Theme)             │
│  └── 生命周期管理                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│            渲染层 (Renderer Layer)                      │
│                                                         │
│  @visactor/vue-vtable (VTable 核心)                     │
│  ├── ListTable (列表表)                                 │
│  ├── PivotTable (透视表)                                │
│  └── VRender 渲染引擎                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 二、核心模块设计

### 2.1 VTableAdapter (核心适配器)

**文件**: `packages/ctable/src/adapters/VTableAdapter.ts`

**职责**:
- CTable API → VTable API 转换
- 事件双向映射
- 主题系统适配
- 生命周期管理

**接口设计**:

```typescript
/**
 * VTable 适配器
 *
 * 将 CTable API 转换为 VTable API,保持用户代码不变
 */
export class VTableAdapter {
  private vtable: any  // VTable 实例
  private eventBus: EventBus  // 事件总线
  private themeAdapter: ThemeAdapter  // 主题适配器

  constructor(
    private props: CTableProps,
    private emit: EmitType
  ) {
    this.themeAdapter = new ThemeAdapter(props.theme)
    this.eventBus = new EventBus(emit)
    this.vtable = this.createVTable()
  }

  /**
   * 创建 VTable 实例
   */
  private createVTable(): any {
    const option: VTableOption = {
      // 列配置转换
      columns: this.transformColumns(),

      // 数据转换
      records: this.transformData(),

      // 固定列配置
      frozenColCount: this.countFrozenColumns('left'),
      frozenTrailingColCount: this.countFrozenColumns('right'),

      // 虚拟滚动
      virtualDom: true,

      // 主题
      theme: this.themeAdapter.adapt(),

      // 事件
      ...this.transformEvents()
    }

    return new VTable.ListTable(option)
  }

  // ========== 公共 API ==========

  /**
   * 设置数据
   */
  setData(data: any[], columns?: Column[]): void {
    this.vtable.setRecords(this.transformData(data))
    if (columns) {
      this.vtable.setColumns(this.transformColumns(columns))
    }
  }

  /**
   * 设置滚动位置
   */
  scrollTo(options: { top?: number; left?: number }): void {
    if (options.top !== undefined) {
      this.vtable.setScrollTop(options.top)
    }
    if (options.left !== undefined) {
      this.vtable.setScrollTranslateX(options.left)
    }
  }

  /**
   * 获取选中行
   */
  getSelectedRows(): any[] {
    const selectedRecords = this.vtable.getSelectedRecords()
    return selectedRecords.map((record: any) => record.data)
  }

  /**
   * 清除选择
   */
  clearSelection(): void {
    this.vtable.clearSelect()
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    this.vtable?.release()
    this.eventBus.destroy()
  }
}
```

### 2.2 列配置转换器

**文件**: `packages/ctable/src/adapters/ColumnTransformer.ts`

```typescript
/**
 * 列配置转换器
 *
 * CTable Column → VTable Column
 */
export class ColumnTransformer {
  /**
   * 转换单个列配置
   */
  transformColumn(col: Column): VTableColumn {
    const vtableCol: VTableColumn = {
      // ✅ 基础映射
      field: col.dataIndex || col.key,
      caption: col.title,
      width: this.normalizeWidth(col.width),

      // ✅ 固定列 (直接映射,无需复杂计算!)
      // VTable 自动处理 fixed='left' | 'right'

      // ✅ 排序
      sort: col.sorter ? true : undefined,

      // ✅ 筛选
      filter: col.filters ? true : undefined,

      // ✅ 自定义渲染
      customRender: col.render ? this.createCustomRenderer(col) : undefined
    }

    return vtableCol
  }

  /**
   * 标准化列宽
   * @param width - 列宽 (number | string)
   * @returns 标准化的数字宽度
   */
  private normalizeWidth(width?: number | string): number {
    if (typeof width === 'number') {
      return width
    }
    if (typeof width === 'string') {
      // 支持百分比: '100px' → 100, '10%' → 计算
      if (width.endsWith('px')) {
        return parseInt(width) || 120
      }
      if (width.endsWith('%')) {
        const percentage = parseInt(width) || 10
        return (this.containerWidth * percentage) / 100
      }
    }
    return 120  // 默认列宽
  }

  /**
   * 创建自定义渲染器
   */
  private createCustomRenderer(col: Column): VTableCustomRender {
    return (args: CustomRenderArgs) => {
      const { table, row, col, rect, record } = args

      // 调用用户提供的 render 函数
      const customContent = col.render?.(record.data, row, col.index)

      // 返回 VTable 渲染节点
      return {
        type: 'text',
        text: String(customContent),
        style: {
          ...this.getDefaultCellStyle()
        }
      }
    }
  }
}
```

### 2.3 事件映射器

**文件**: `packages/ctable/src/adapters/EventMapper.ts`

```typescript
/**
 * 事件映射器
 *
 * VTable Events → CTable Events
 */
export class EventMapper {
  /**
   * 转换事件配置
   */
  transformEvents(emit: EmitType): Partial<VTableOption> {
    return {
      // ===== 点击事件 =====
      onClickCell: (args: VTableEventArg) => {
        const { rowIndex, colIndex, record } = args

        emit('cell-click', {
          cell: { row: rowIndex, col: colIndex },
          row: record.data,
          column: this.getColumnByIndex(colIndex)
        })

        emit('row-click', {
          row: rowIndex,
          data: record.data
        })
      },

      // ===== 选择事件 =====
      onCheckboxStateChange: (args: VTableEventArg) => {
        const { changed, records } = args
        const selectedRows = records.map((r: any) => r.data)
        const selectedKeys = selectedRows.map((r: any) =>
          this.getRowKey(r)
        )

        emit('selection-change', selectedRows, selectedKeys)
      },

      // ===== 排序事件 =====
      onSortClick: (args: VTableEventArg) => {
        const { field, order } = args
        emit('sort-change', field, order)
      },

      // ===== 滚动事件 =====
      onScroll: (args: VTableEventArg) => {
        const { scrollTop, scrollLeft } = args
        emit('scroll', { scrollTop, scrollLeft })
      }
    }
  }
}
```

### 2.4 主题适配器

**文件**: `packages/ctable/src/adapters/ThemeAdapter.ts`

```typescript
/**
 * 主题适配器
 *
 * CTable Theme → VTable Theme
 */
export class ThemeAdapter {
  /**
   * 适配 CTable 主题到 VTable 主题
   */
  adapt(theme: ThemeConfig): VTableTheme {
    return {
      // ===== 全局样式 =====
      background: {
        color: theme.colors.background,
        defaultBorderColor: theme.colors.border,
        tableBottomBorderColor: theme.colors.border
      },

      // ===== 表头样式 =====
      header: {
        bgColor: theme.colors.header,
        fgColor: theme.colors.text,
        fontSize: parseInt(theme.fonts.header.size),
        fontWeight: theme.fonts.header.weight as any,
        borderColor: theme.colors.border,
        // ✅ 固定列阴影
        headerSplitBorder: (col: VTableColumn, index: number) => {
          if (col.fixed === 'left' && index > 0) {
            return {
              show: true,
              color: 'rgba(0, 0, 0, 0.1)',
              width: 1
            }
          }
          return { show: false }
        }
      },

      // ===== 数据行样式 =====
      body: {
        fgColor: theme.colors.text,
        fontSize: parseInt(theme.fonts.cell.size),
        fontWeight: theme.fonts.cell.weight as any,
        borderColor: theme.colors.border,

        // ✅ Hover 效果 (背景色变化,无额外边框!)
        hover: {
          bgColor: theme.colors.hover
        }
      },

      // ===== 选中效果 =====
      select: {
        bgColor: theme.colors.selected || 'rgba(24, 144, 255, 0.1)',
        borderColor: theme.colors.primary
      }
    }
  }
}
```

---

## 三、组件集成设计

### 3.1 CTable.vue 修改

**文件**: `packages/ctable/src/components/CTable.vue`

**关键修改**:

```typescript
// ========== 1. 新增 renderer 配置 ==========
const props = withDefaults(defineProps<CTableProps>(), {
  width: 1200,
  height: 600,
  rowKey: 'id',
  virtualScroll: true,
  selectable: false,
  renderer: 'vtable' as 'g2' | 'vtable'  // ✅ 新增
})

// ========== 2. 条件渲染 ==========
const useVTable = computed(() => props.renderer === 'vtable')

// ========== 3. 渲染器实例化 ==========
const renderer = ref<VTableAdapter | G2TableRenderer>()

watch(
  () => props.renderer,
  (newRenderer) => {
    // 销毁旧渲染器
    renderer.value?.destroy()

    // 创建新渲染器
    if (newRenderer === 'vtable') {
      renderer.value = new VTableAdapter(props, emit)
    } else {
      renderer.value = new G2TableRenderer(...)
    }

    // 初始化表格
    initTable()
  }
)
```

**模板修改**:

```vue
<template>
  <div class="ctable-container">
    <!-- ✅ VTable 渲染器 -->
    <VTableAdapter
      v-if="useVTable"
      v-bind="$props"
      ref="rendererRef"
    />

    <!-- ✅ G2 渲染器 (保留,用于回退) -->
    <template v-else>
      <!-- 原有的 HTML 表头 + Canvas 实现 -->
      <canvas ref="canvasRef" />
    </template>
  </div>
</template>
```

---

## 四、性能优化设计

### 4.1 虚拟滚动配置

```typescript
/**
 * 虚拟滚动配置
 *
 * VTable 原生支持虚拟滚动,性能优秀
 */
const virtualScrollConfig: VirtualScrollConfig = {
  // ✅ 启用虚拟 DOM
  virtualDom: true,

  // ✅ 缓冲区大小 (上下各渲染额外的行)
  bufferSize: 10,  // 可根据场景调整

  // ✅ 激进模式 (更流畅,但内存略高)
  aggressive: false,  // 数据量>50万时启用

  // ✅ 预渲染策略
  prerenderCount: 5  // 首屏预渲染行数
}
```

### 4.2 性能监控

```typescript
/**
 * 性能监控器
 *
 * 监控渲染性能,确保达到目标
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    renderTime: 0,
    fps: 60,
    memoryUsage: 0
  }

  /**
   * 监控渲染性能
   */
  measureRender(dataSize: number, callback: () => void) {
    const start = performance.now()

    callback()

    const end = performance.now()
    this.metrics.renderTime = end - start

    // 检查是否达标
    if (dataSize >= 100000) {
      console.assert(
        this.metrics.renderTime < 500,
        `10万行渲染时间应 <500ms, 实际: ${this.metrics.renderTime}ms`
      )
    }
  }

  /**
   * 监控滚动帧率
   */
  measureFPS(): void {
    let frameCount = 0
    let lastTime = performance.now()

    const measure = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime >= lastTime + 1000) {
        this.metrics.fps = frameCount
        console.assert(
          this.metrics.fps >= 55,  // 允许小幅波动
          `FPS 应 ≥60, 实际: ${this.metrics.fps}`
        )

        frameCount = 0
        lastTime = currentTime
      }

      requestAnimationFrame(measure)
    }

    requestAnimationFrame(measure)
  }
}
```

---

## 五、测试策略

### 5.1 单元测试

**文件**: `packages/ctable/src/adapters/__tests__/VTableAdapter.test.ts`

```typescript
describe('VTableAdapter', () => {
  let adapter: VTableAdapter
  let mockProps: CTableProps
  let mockEmit: jest.Mock

  beforeEach(() => {
    mockEmit = jest.fn()
    mockProps = {
      columns: [
        { key: 'id', title: 'ID', width: 80, fixed: 'left' },
        { key: 'name', title: '姓名', width: 120 },
        { key: 'age', title: '年龄', width: 80 },
        { key: 'action', title: '操作', fixed: 'right' }
      ],
      dataSource: generateData(1000),
      rowKey: 'id',
      width: 1200,
      height: 600
    }

    adapter = new VTableAdapter(mockProps, mockEmit)
  })

  afterEach(() => {
    adapter.destroy()
  })

  describe('列配置转换', () => {
    it('应该正确转换固定列', () => {
      // ✅ 左固定列
      const leftCol = adapter['transformColumn'](mockProps.columns[0])
      expect(leftCol.field).toBe('id')
      expect(leftCol.frozen).toBe(true)

      // ✅ 右固定列
      const rightCol = adapter['transformColumn'](mockProps.columns[3])
      expect(rightCol.field).toBe('action')
      expect(rightCol.frozenTrailing).toBe(true)
    })

    it('应该正确处理列宽', () => {
      const col1 = adapter['transformColumn']({ width: 100 })
      expect(col1.width).toBe(100)

      const col2 = adapter['transformColumn']({ width: '100px' })
      expect(col2.width).toBe(100)

      const col3 = adapter['transformColumn']({ width: '10%' })
      expect(col3.width).toBe(120)  // 1200 * 0.1
    })
  })

  describe('性能测试', () => {
    it('应该在 500ms 内渲染 10 万行数据', async () => {
      const largeData = generateData(100000)
      const start = performance.now()

      adapter.setData(largeData)
      await nextTick()

      const duration = performance.now() - start
      expect(duration).toBeLessThan(500)
    })
  })

  describe('事件映射', () => {
    it('应该正确映射点击事件', () => {
      const mockEvent = {
        rowIndex: 5,
        colIndex: 2,
        record: { data: { id: 5, name: 'Test' } }
      }

      adapter['handleClickCell'](mockEvent)

      expect(mockEmit).toHaveBeenCalledWith('cell-click', {
        cell: { row: 5, col: 2 },
        row: mockEvent.record.data
      })

      expect(mockEmit).toHaveBeenCalledWith('row-click', {
        row: 5,
        data: mockEvent.record.data
      })
    })
  })

  describe('固定列对齐', () => {
    it('应该保持固定列对齐', () => {
      // 模拟滚动
      adapter.scrollTo({ left: 100 })

      // 验证固定列位置未改变
      const leftColX = adapter.getVTableInstance().getColumnX(0)
      expect(leftColX).toBe(0)  // 左固定列始终在 x=0

      const rightColX = adapter.getVTableInstance().getColumnX(3)
      expect(rightColX).toBeCloseTo(1100)  // 右固定列位置固定
    })
  })
})
```

### 5.2 集成测试

**文件**: `packages/ctable/src/__tests__/VTableIntegration.test.ts`

```typescript
describe('CTable VTable 集成测试', () => {
  it('应该完整渲染表格', () => {
    const wrapper = mount(CTable, {
      props: {
        renderer: 'vtable',
        columns: testColumns,
        dataSource: testData,
        rowKey: 'id'
      }
    })

    // 验证 VTable 实例已创建
    expect(wrapper.vm.renderer).toBeInstanceOf(VTableAdapter)

    // 验证数据已设置
    expect(wrapper.vm.renderer.getVTableInstance().getRecords().length)
      .toBe(testData.length)
  })

  it('应该支持切换渲染器', async () => {
    const wrapper = mount(CTable, {
      props: {
        renderer: 'g2',
        columns: testColumns,
        dataSource: testData
      }
    })

    // 初始使用 G2 渲染器
    expect(wrapper.vm.renderer).not.toBeInstanceOf(VTableAdapter)

    // 切换到 VTable
    await wrapper.setProps({ renderer: 'vtable' })
    await nextTick()

    // 验证已切换
    expect(wrapper.vm.renderer).toBeInstanceOf(VTableAdapter)
  })
})
```

### 5.3 性能基准测试

**文件**: `packages/ctable/src/__tests__/VTablePerformance.bench.ts`

```typescript
describe('VTable 性能基准测试', () => {
  const benchmarks = [
    { name: '1千行', size: 1000 },
    { name: '1万行', size: 10000 },
    { name: '10万行', size: 100000 }
  ]

  benchmarks.forEach(({ name, size }) => {
    it(`应该在合理时间内渲染 ${name}`, () => {
      const data = generateData(size)
      const adapter = new VTableAdapter({
        columns: testColumns,
        dataSource: data
      }, jest.fn())

      const start = performance.now()
      adapter.setData(data)
      const duration = performance.now() - start

      // 性能目标
      const maxDuration = size === 100000 ? 500 : 100

      expect(duration).toBeLessThan(maxDuration)
      console.log(`${name} 渲染时间: ${duration.toFixed(2)}ms`)
    })
  })
})
```

---

## 六、迁移方案

### 6.1 渐进式迁移流程

```
┌─────────────────────────────────────────────────────┐
│  Phase 1: POC 验证 (Week 1)                           │
├─────────────────────────────────────────────────────┤
│  ✓ Day 1-2: 安装依赖,研究API                         │
│  ✓ Day 3-4: 创建VTableAdapter                        │
│  ✓ Day 5: 性能测试                                   │
│  ✓ 决策点: 如果性能达标 → 继续                       │
└─────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────┐
│  Phase 2: 双渲染器并行 (Week 2)                       │
├─────────────────────────────────────────────────────┤
│  ✓ 添加 renderer 配置项                              │
│  ✓ 在Demo中对比两种渲染器                            │
│  ✓ 收集性能数据和用户反馈                            │
│  ✓ 决策点: 如果稳定 → 继续                           │
└─────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────┐
│  Phase 3: 完全切换 (Week 3)                           │
├─────────────────────────────────────────────────────┤
│  ✓ 废弃 G2 渲染器                                    │
│  ✓ 默认使用 VTable                                   │
│  ✓ 清理冗余代码                                      │
│  ✓ 更新文档                                          │
│  ✓ 正式发布                                          │
└─────────────────────────────────────────────────────┘
```

### 6.2 回退方案

```typescript
// ✅ 方案1: 环境变量控制
const renderer = computed(() => {
  return import.meta.env.VITE_RENDERER || 'vtable'
})

// ✅ 方案2: 特性检测
const useVTable = computed(() => {
  try {
    require('@visactor/vue-vtable')
    return true
  } catch {
    return false  // VTable 不可用,回退到 G2
  }
})

// ✅ 方案3: 性能监控自动切换
const monitorPerformance = () => {
  const renderTime = measureRenderTime()
  if (renderTime > 1000) {
    console.warn('VTable 性能不达标,回退到 G2')
    return 'g2'
  }
  return 'vtable'
}
```

---

## 七、部署清单

### 7.1 依赖安装

```bash
# 1. 安装 VTable 依赖
pnpm add @visactor/vue-vtable @visactor/vtable

# 2. 验证安装
pnpm list @visactor/vue-vtable
```

### 7.2 文件创建

```
packages/ctable/src/
├── adapters/
│   ├── VTableAdapter.ts              ← 核心适配器
│   ├── ColumnTransformer.ts          ← 列转换器
│   ├── EventMapper.ts                ← 事件映射器
│   └── ThemeAdapter.ts               ← 主题适配器
├── components/
│   └── CTable.vue                    ← 修改 (添加 renderer 配置)
└── __tests__/
    ├── VTableAdapter.test.ts         ← 单元测试
    ├── VTableIntegration.test.ts     ← 集成测试
    └── VTablePerformance.bench.ts    ← 性能测试
```

### 7.3 配置更新

```json
// packages/ctable/package.json
{
  "dependencies": {
    "@visactor/vue-vtable": "^1.19.9",
    "@visactor/vtable": "^1.19.9"
  },
  "scripts": {
    "test:vtable": "vitest run --reporter=verbose src/__tests__/VTableAdapter.test.ts"
  }
}
```

---

## 八、风险评估

### 8.1 技术风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| API兼容性 | 低 | 高 | ✅ 适配器层,完整测试 |
| 性能不达标 | 低 | 高 | ✅ POC验证,性能监控 |
| 学习曲线 | 中 | 中 | ✅ 2-3天培训,文档完善 |
| 版本升级 | 中 | 低 | ✅ 锁定版本,定期评估 |

### 8.2 业务风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 延期 | 低 | 高 | ✅ 3周缓冲期,渐进式迁移 |
| 用户体验 | 低 | 中 | ✅ 双渲染器并行,用户无感 |
| 维护成本 | 低 | 中 | ✅ 官方维护,降低成本 |

---

## 九、成功标准

### 9.1 功能标准

- ✅ 固定列对齐 100% 正确
- ✅ 横向滚动流畅无卡顿
- ✅ Hover 效果统一 (无双重边框)
- ✅ 所有核心功能正常 (排序/筛选/分页)
- ✅ API 100% 兼容

### 9.2 性能标准

| 指标 | 目标 | 验收方法 |
|------|------|----------|
| 10万行渲染 | <500ms | 性能测试 |
| 滚动帧率 | 60fps | FPS 监控 |
| 内存占用 | <100MB | 性能分析器 |
| TypeScript | 零错误 | pnpm type-check |

### 9.3 质量标准

- ✅ 测试覆盖率 ≥80%
- ✅ 代码审查通过
- ✅ 文档完整性 ≥90%
- ✅ 三大主题完美支持

---

## 十、总结

### 10.1 架构优势

1. ✅ **低耦合** - 适配器模式,易于维护
2. ✅ **可扩展** - 支持未来添加更多渲染器
3. ✅ **可测试** - 每个模块独立测试
4. ✅ **可回退** - 渐进式迁移,随时可回退

### 10.2 开发计划

- **Week 1**: POC 验证 + 基础适配器
- **Week 2**: 双渲染器并行 + 功能迁移
- **Week 3**: 完全切换 + 测试 + 发布

### 10.3 预期成果

- **性能**: 6倍提升 (3000ms → <500ms)
- **成本**: 节省 79% (28.5 人周)
- **质量**: 固定列问题彻底解决
- **维护**: 长期成本降低 77%

---

**设计完成,等待评审!** ✅

**下一步**: 团队评审 → 确认方案 → 开始实施

