# CTable 三方对标与合并方案（SurelyVue + VXE + CTable）

更新时间：2026-02-16

## 对标范围

- SurelyVue Guide：`https://www.surelyvue.com/doc/guide`
- VXE Table 文档：`https://vxetable.cn/#/component/table/colDrag/group`
- 当前项目：`packages/ctable/src/components/CTable.vue`、`packages/ctable/src/adapters/VTableAdapter.ts`

说明：
- SurelyVue 的全量能力点以 Guide introduction 功能表为基线。
- VXE 以官方 README「功能点」和 `v4/src/views/table/colDrag/*` Demo 源码为基线。
- 本文中“已确认”表示从官方源码或官方文档直接读取；“推断”会明确标注。

## 一、VXE `colDrag/group` 专项结论（已确认）

来自 `v4/src/views/table/colDrag/group/Demo1.vue`：

- 通过 `column-config.drag = true` 启用列拖拽。
- 支持 `vxe-colgroup` 多级分组表头参与拖拽。
- 示例中与 `tree-config` 同时开启（树形结构 + 分组表头 + 列拖拽可并存）。

来自 `v4/src/views/table/colDrag/*` 其他 Demo（已确认）：

- `column-drag-config.icon`：可配置拖拽图标。
- `column-drag-config.showGuidesStatus`：可关闭拖拽引导线状态提示。
- `column-drag-config.trigger`：可设置触发区域（如 `cell`）。
- `column-drag-config.disabledMethod`：按列禁用拖拽。
- `column-drag-config.visibleMethod`：按列决定是否展示拖拽能力。
- `column-drag-config.dragStartMethod`：拖拽开始前拦截。
- `column-drag-config.dragEndMethod`：拖拽结束确认，可拒绝落位。
- 事件：`column-dragstart`、`column-dragend`。
- 与固定列并存：`fixed/Demo1.vue`。

## 二、三方能力差异清单（核心）

状态定义：
- `✅` 已具备
- `🟡` 部分具备
- `❌` 未具备

| 功能点 | SurelyVue | VXE | 当前 CTable | 差异说明 |
|---|---|---|---|---|
| 基础表格/大数据虚拟滚动 | ✅ | ✅ | ✅ | 三者均具备 |
| 三大主题风格 | ✅ | ✅（主题体系更强） | ✅ | CTable 已做三套主题，但主题 token 细粒度不如 VXE |
| 斑马线/边框 | ✅ | ✅ | ✅ | CTable 近期已修复开关一致性 |
| 复选框/单选/全选 | ✅ | ✅ | ✅ | CTable 已支持，但交互细节与 VXE 仍有差距 |
| 分页（显隐切换） | ✅ | ✅ | ✅ | CTable 具备，主题联动已支持 |
| 本地排序 + 远程排序 | ✅ | ✅ | ✅ | CTable 有模式开关与扩展点 |
| 多字段排序 | ✅ | ✅ | 🟡 | CTable 支持基础 multiple，但 UI 与受控策略需增强 |
| 本地筛选 + 远程筛选 | ✅ | ✅ | ✅ | CTable 有本地/远程管线与扩展回调 |
| 高级筛选面板（字段/关键字） | ✅ | ✅ | 🟡 | CTable 有基础面板，表达式能力不够 |
| 列显隐 | ✅ | ✅ | ✅ | CTable 已有控制面板与事件 |
| 固定列（左/右） | ✅ | ✅ | ✅ | CTable 支持左右冻结 |
| 列宽拖拽 | ✅ | ✅ | ✅ | CTable 已接入 |
| 列拖拽排序（基础） | ✅ | ✅ | ✅ | CTable 通过 `draggable` + VTable drag |
| 列拖拽：分组表头 | 🟡 | ✅ | ❌ | CTable 目前无多级表头拖拽能力 |
| 列拖拽：触发器 trigger | 🟡 | ✅ | ❌ | CTable 未暴露 drag trigger 配置 |
| 列拖拽：可见/禁用方法 | 🟡 | ✅ | ❌ | CTable 缺 `visibleMethod/disabledMethod` |
| 列拖拽：开始/结束拦截 | 🟡 | ✅ | ❌ | CTable 缺 `dragStartMethod/dragEndMethod` |
| 列拖拽事件回调 | 🟡 | ✅ | ❌ | CTable 仅有列更新，无 drag 事件语义 |
| 树形数据 | ✅ | ✅ | ❌ | CTable 尚未完整树形渲染管线 |
| 展开行 | ✅ | ✅ | ❌ | CTable 类型里有定义，渲染未打通 |
| 表头分组（多级） | ✅ | ✅ | ❌ | 当前列模型 `children` 未落地到适配器 |
| 行/列合并 | ✅ | ✅ | ❌ | CTable 未实现 span/merge |
| 编辑（单元格/行） | ✅ | ✅ | ❌ | CTable 已禁止单元格点击编辑，编辑体系待补 |
| 右键菜单 | ✅ | ✅ | ❌ | CTable 未实现 |
| 导入/导出/打印 | ✅（CSV/Excel/打印） | ✅ | 🟡 | CTable 目前 CSV 基础版 |
| 键盘导航 | ✅ | ✅ | ❌ | CTable 未实现 |
| 数据代理（统一远程管线） | ✅ | ✅ | ❌ | CTable 远程分散在排序/筛选回调 |

## 三、三方“冲突点”整理

## 1) 排序状态冲突

- 冲突描述：
  - VTable 原生排序状态与 CTable 本地/远程排序管线可能重复生效。
- 当前处理：
  - 通过 `sort_click` 里 `updateSortState(..., false)` 仅更新图标，避免二次排序。
- 统一规则：
  - `sortMode=local`：仅 CTable 排序管线生效。
  - `sortMode=remote`：仅触发 `onSortRequest`，不改原数据顺序。

## 2) 筛选状态冲突

- 冲突描述：
  - 列 `filteredValue`（受控）与内部 `activeFilters`（非受控）并存。
- 统一规则：
  - 受控优先（column.filteredValue > internalState）。
  - 清空行为同时清受控映射和内部映射。

## 3) 列拖拽与固定列/分组头冲突

- 冲突描述：
  - 拖拽后可能破坏固定列边界、分组层级关系。
- 统一规则：
  - 固定列边界不可穿透（默认）。
  - 分组列内部允许重排，跨组需显式开启 `isCrossDrag`。
  - 对于分组列，落位前做层级合法性校验。

## 4) 点击选中态导致文本“消失”冲突

- 冲突描述：
  - 底层编辑/选中层覆盖文本。
- 当前处理：
  - `editCellTrigger: 'api'` + `disableSelect` 系列配置。
- 统一规则：
  - 默认关闭单元格编辑态与高亮选区，除非显式开启编辑模式。

## 四、统一合并能力模型（建议 API）

在不破坏现有 API 前提下，新增：

```ts
interface ColumnDragConfig {
  enabled?: boolean
  trigger?: 'icon' | 'cell' | 'header'
  icon?: string | object
  showGuidesStatus?: boolean
  isCrossDrag?: boolean
  visibleMethod?: (ctx: { column: Column }) => boolean
  disabledMethod?: (ctx: { column: Column }) => boolean
  dragStartMethod?: (ctx: { column: Column }) => boolean | Promise<boolean>
  dragEndMethod?: (ctx: {
    oldColumn: Column
    newColumn: Column
    oldIndex: number
    newIndex: number
  }) => boolean | Promise<boolean>
}

interface CTableProps {
  columnDragConfig?: ColumnDragConfig
  onColumnDragStart?: (payload: any) => void
  onColumnDragEnd?: (payload: any) => void
}
```

分组表头建议：

```ts
interface Column {
  key: string
  title?: string
  children?: Column[]
  // 其他已存在属性保持不变
}
```

适配器实现规则：
- 有 `children` 时构建多级表头结构。
- 拖拽时维护 `children` 树结构，不只平铺数组。
- 固定列与分组列冲突时优先保证结构合法，再执行拖拽落位。

## 五、合并执行顺序（按依赖）

1. `P0`：多级表头渲染（不含拖拽）
2. `P0`：列拖拽统一配置 `columnDragConfig` + 事件回调
3. `P0`：分组表头拖拽（组内拖拽）
4. `P1`：跨组拖拽（`isCrossDrag`）+ 合法性校验
5. `P1`：拖拽拦截方法（start/end）+ 回滚机制
6. `P1`：拖拽与固定列边界策略（不可穿透/可配置）
7. `P2`：树形 + 展开行并行适配验证（与分组拖拽组合）

每步验收：
- `pnpm --filter @catui/demo build`
- demo 手工回归：排序、筛选、分页、列显隐、列拖拽、固定列、复选框
- 文档更新：本文件 + `packages/ctable/README.md`

## 六、当前结论（给本轮）

- `SurelyVue` 的“Guide 功能覆盖面”与 `VXE` 高度重合；`VXE` 在列拖拽细节和可拦截能力更强。
- `CTable` 当前“能用层”已覆盖核心展示与基础交互，但在“结构化复杂表头 + 拖拽规则引擎 + 编辑/树形/合并”上仍有明显差距。
- 本次合并的关键不是再堆功能，而是先建立统一的 `columnDragConfig + grouped columns` 语义层，再逐项补齐。

