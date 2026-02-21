# SurelyVue Guide 功能对照清单（CTable）

更新时间：2026-02-16

## 已读取的 Guide 菜单页

根据 `https://www.surelyvue.com/doc/guide` 对应资源文件读取到的菜单页：

- `src/doc/introduction.md`（简介/功能点）
- `src/doc/quick-start.md`（快速开始）
- `src/doc/faq.md`（常见问题）
- `src/doc/introduction.en-US.md`
- `src/doc/quick-start.en-US.md`
- `src/doc/faq.en-US.md`

> 功能点清单来源于 introduction 页中的“功能点”表格。

## 功能对照（Surely 功能点 vs 当前 CTable）

状态说明：

- `已完成`：当前代码已具备并可用
- `部分完成`：有基础能力，但还不完整
- `未完成`：当前未实现

| Surely 功能点 | 当前状态 | 说明 |
|---|---|---|
| 边框定制 | 已完成 | `bordered` + 主题样式覆盖 |
| 紧凑 | 已完成 | `size=large/middle/small` 已打通到渲染层 |
| 自定义单元格 | 已完成 | `render/customRender` |
| 自定义行样式 | 已完成 | `rowStyle(record,index)` 已支持 |
| 斑马纹 | 已完成 | `stripe/stripeColor` |
| 单选 | 已完成 | `rowSelection.type='radio'` |
| 多选 | 已完成 | `rowSelection.type='checkbox'` |
| 单列排序 | 已完成 | 本地/远程 |
| 多列排序 | 已完成 | `multiple` + `sortConfig` |
| 服务端排序 | 已完成 | `sortMode='remote'` + `onSortRequest` |
| 反选 | 已完成 | 暴露 `invertSelection()` |
| 全选 | 已完成 | 表头 checkbox 级联 |
| 筛选 | 已完成 | 列筛选 + 面板筛选 |
| 自定义筛选 | 部分完成 | `onFilter`、关键字筛选；高级自定义 UI 仍可扩展 |
| 列宽拖动 | 已完成 | `resizable` |
| 固定头 | 已完成 | 表格内容区滚动时头部固定 |
| 固定列 | 已完成 | 左右冻结列 |
| 表头吸顶 | 未完成 | 页面滚动吸顶未做独立能力 |
| 分页 | 已完成 | 内置分页组件 |
| 自定义分页 | 已完成 | adapter + 插槽扩展 |
| 页头 | 已完成 | `header` 插槽 |
| 页尾 | 已完成 | `footer` 插槽 |
| 合计 | 已完成 | `summary` 插槽 |
| 表头合并 | 未完成 | 暂未支持 header merge（仅数据区合并） |
| 表头分组 | 已完成 | `columns.children` 多级表头已支持 |
| 行合并 | 已完成 | 支持 `mergeCells` 与列级 `rowSpan` 基础能力 |
| 列合并 | 已完成 | 支持 `mergeCells` 与列级 `colSpan` 基础能力 |
| 增删改查 | 已完成 | 提供 append/update/remove + cell/row 编辑能力 |
| 折叠数据 | 部分完成 | 行展开基础版已支持，复杂自定义内容仍待增强 |
| 树形数据 | 已完成 | tree data + 展开/折叠已支持 |
| 嵌套子表格 | 未完成 | nested table 未完成 |
| 虚拟行滚动 | 已完成 | VTable 原生 |
| 虚拟列滚动 | 已完成 | VTable 原生 |
| 加载中 | 已完成 | 内置 + 三套适配 + 插槽 |
| 空数据 | 已完成 | 空数组场景可渲染 |
| 编辑单元格 | 已完成 | 支持 click/dblclick/enter/manual 触发 + 校验 |
| 编辑行 | 已完成 | 支持 row 模式基础编辑 |
| 自动行高 | 未完成 | 未打通自动高度策略 |
| 国际化 | 已完成 | `locale + i18n` 基础文案包已支持 |
| 动画 | 未完成 | 暂无动画体系 |
| 拖拽排序 | 部分完成 | 已有列拖拽；行拖拽/树拖拽未完成 |
| 暗黑模式 | 已完成 | 三大主题 dark 预设 |
| 右键功能集 | 已完成 | 支持内置右键菜单 + 自定义菜单项 |
| 图表 | 未完成 | 未实现 |
| 文件导入 | 已完成 | 支持 CSV/XLSX 导入接口 |
| 复制导入 | 部分完成 | 支持 CSV 文本解析导入（`importCsvText`） |
| 打印 | 已完成 | `printTable()` 已支持 |
| 导出 CSV | 已完成 | `exportCsv()` 基础版 |
| 导出 EXCEL | 已完成 | `exportExcel()` 已支持 |

## 汇总

- 已完成：39
- 部分完成：2
- 未完成：7

## 建议下一批优先级（P0）

1. 树形数据 + 折叠数据 + 行展开
2. 表头分组/合并 + 行列合并
3. 右键菜单 + 反选 + 页头/页尾/合计
4. 编辑单元格/编辑行
5. EXCEL 导出 + 导入 + 打印
