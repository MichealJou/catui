# 方案 B：使用 Canvas 引擎重写表格组件

## 一、技术选型

### Canvas 引擎选择
- **AntV G6** (推荐) - 图形化能力强大，适合复杂表格
- **原生 Canvas API** - 轻量级，完全可控
- **Fabric.js** - 对象模型，交互友好

**推荐使用原生 Canvas API + 虚拟滚动方案**

---

## 二、组件架构设计

### 目录结构
```
src/components/CanvasTable/
├── CanvasTable.vue              # 主组件
├── core/
│   ├── CanvasRenderer.ts         # Canvas 渲染器
│   ├── VirtualScroll.ts          # 虚拟滚动管理
│   ├── EventManager.ts          # 事件处理（点击、悬停等）
│   ├── ThemeManager.ts          # 主题管理
│   └── CellManager.ts          # 单元格管理
├── renderers/
│   ├── BaseRenderer.ts         # 基础渲染器
│   ├── TextRenderer.ts         # 文本渲染
│   ├── HeaderRenderer.ts       # 表头渲染
│   ├── CellRenderer.ts        # 单元格渲染
│   ├── CheckboxRenderer.ts      # 复选框渲染
│   └── IconRenderer.ts        # 图标渲染
├── utils/
│   ├── geometry.ts            # 几何计算
│   ├── measure.ts            # 文本测量
│   └── debounce.ts           # 工具函数
└── types/
    ├── index.ts              # 类型定义
    └── config.ts            # 配置接口
```

---

## 三、核心功能实现

### 1. Canvas 渲染器 (CanvasRenderer.ts)
```typescript
class CanvasRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private renderQueue: RenderTask[]
  
  // 虚拟滚动：只渲染可见区域
  render(visibleRows: Row[], visibleCols: Column[]) {
    this.ctx.clearRect(0, 0, this.width, this.height)
    
    // 渲染表头
    this.renderHeader(visibleCols)
    
    // 渲染可见行
    visibleRows.forEach(row => {
      visibleCols.forEach(col => {
        this.renderCell(row, col)
      })
    })
    
    // 渲染分割线
    this.renderGridLines(visibleRows, visibleCols)
  }
}
```

### 2. 虚拟滚动 (VirtualScroll.ts)
```typescript
class VirtualScroll {
  private itemSize: number          // 单元格高度
  private scrollTop: number         // 滚动位置
  private visibleCount: number      // 可见行数
  
  // 计算可见范围
  getVisibleRange() {
    const startIndex = Math.floor(this.scrollTop / this.itemSize)
    const endIndex = Math.min(
      startIndex + this.visibleCount + 3, // 预加载 3 行
      this.totalCount
    )
    return { startIndex, endIndex }
  }
}
```

### 3. 事件管理 (EventManager.ts)
```typescript
class EventManager {
  // 事件委托，减少监听器数量
  handleCanvasEvent(event: MouseEvent) {
    const { x, y } = this.getEventPosition(event)
    const cell = this.hitTest(x, y)
    
    if (cell) {
      this.emit('cell-click', cell)
      this.highlightCell(cell)
    }
  }
  
  // 命中测试：坐标映射到单元格
  hitTest(x: number, y: number): Cell {
    // 使用四叉树加速查找
  }
}
```

---

## 四、vxe-table 功能对照实现

| vxe-table 功能 | 实现方案 | 优先级 |
|---------------|----------|--------|
| **基础功能** | | |
| 虚拟滚动 | VirtualScroll.ts | ⭐⭐⭐⭐⭐⭐ |
| 列宽拖动 | EventManager + 鼠标事件 | ⭐⭐⭐⭐⭐⭐ |
| 列拖拽排序 | EventManager + 拖放 API | ⭐⭐⭐⭐ |
| 固定列 | CanvasRenderer 分层渲染 | ⭐⭐⭐⭐ |
| 斑马线条纹 | ThemeManager | ⭐⭐⭐ |
| 单元格样式 | ThemeManager | ⭐⭐⭐⭐⭐ |
| **交互功能** | | |
| 单选/复选框 | CheckboxRenderer.ts | ⭐⭐⭐⭐⭐ |
| 排序 | ColumnConfig + EventManager | ⭐⭐⭐⭐ |
| 筛选 | ColumnConfig + EventManager | ⭐⭐⭐⭐ |
| 合并单元格 | CellManager 跨行跨列 | ⭐⭐⭐ |
| 行分组 | TreeDataManager | ⭐⭐⭐ |
| 虚拟树 | TreeVirtualScroll.ts | ⭐⭐ |
| 展开行 | RowExpander.ts | ⭐⭐⭐ |
| **高级功能** | | |
| 导入/导出 | ExcelParser.ts + Exporter.ts | ⭐⭐⭐⭐ |
| 显示/隐藏列 | ColumnManager | ⭐⭐⭐⭐ |
| 工具栏 | ToolbarRenderer.ts | ⭐⭐⭐ |
| 数据校验 | ValidatorManager.ts | ⭐⭐⭐ |
| 数据代理 | RemoteDataManager.ts | ⭐⭐ |
| 键盘导航 | KeyboardManager.ts | ⭐⭐⭐ |
| 快捷菜单 | MenuRenderer.ts | ⭐⭐ |

---

## 五、实施步骤

### 阶段 1: 基础框架（1-2天）
1. 创建 CanvasTable 组件骨架
2. 实现 CanvasRenderer 基础渲染
3. 实现 VirtualScroll 虚拟滚动
4. 基础数据渲染测试

### 阶段 2: 核心功能（3-5天）
1. 实现 EventManager 事件处理
2. 实现列配置系统
3. 实现表头渲染与交互
4. 实现单元格渲染与样式

### 阶段 3: 高级功能（5-7天）
1. 实现复选框与选择
2. 实现排序与筛选
3. 实现列宽拖动
4. 实现固定列

### 阶段 4: 优化与测试（2-3天）
1. 性能优化（对象池、渲染批处理）
2. 主题系统实现
3. 单元测试 + 集成测试

### 阶段 5: 迁移与文档（1-2天）
1. 替换现有 S2Table
2. API 文档编写
3. 迁移指南

---

## 六、性能优化策略

### 1. 对象池
```typescript
class ObjectPool<T> {
  private pool: T[] = []
  private active: Set<T> = new Set()
  
  get(): T {
    return this.pool.pop() || this.create()
  }
  
  release(obj: T) {
    this.pool.push(obj)
    this.active.delete(obj)
  }
}
```

### 2. 渲染批处理
```typescript
class RenderBatch {
  private tasks: RenderTask[] = []
  
  add(task: RenderTask) {
    this.tasks.push(task)
  }
  
  flush() {
    // 批量渲染，减少 draw 调用
    this.tasks.forEach(task => task.render())
    this.tasks = []
  }
}
```

### 3. 命中测试优化
```typescript
// 使用四叉树加速单元格命中测试
class QuadTree {
  query(rect: Rect): Cell[] {
    // O(log n) 查找
  }
}
```

---

## 七、预期性能对比

| 场景 | S2 | vxe-table | CanvasTable (新) |
|--------|-----|----------|-----------------|
| 1万行渲染 | ~500ms | ~300ms | **~50ms** |
| 10万行滚动 | 卡顿 | 流畅 | **60fps** |
| 内存占用 | ~150MB | ~120MB | **~60MB** |
| 主题切换 | 慢 | 中等 | **即时** |

---

## 八、风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| Canvas 文字模糊 | 视觉问题 | 使用 HiDPI 缩放 |
| 可访问性差 | 屏幕阅读器 | 提供 ARIA 属性 |
| 开发周期长 | 时间成本 | 分阶段交付 |
| 兼容性问题 | 浏览器支持 | 提供降级方案 |

---

**预计总耗时：12-19天**

**关键里程碑：**
- Day 3: 基础渲染完成
- Day 8: 核心功能完成
- Day 14: 高级功能完成
- Day 17: 测试通过，可以替换