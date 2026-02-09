## 整理 S2 完整 API 文档

基于项目中的 TypeScript 类型定义，整理以下 API 文档：

### 1. S2Options API 文档
- 文件：`S2Options-API文档.md`
- 内容来源：`/node_modules/@antv/s2/lib/common/interface/s2Options.d.ts`
- 包含：
  - S2BasicOptions（基础选项）
  - S2PivotSheetOptions（透视表选项）
  - S2FrozenOptions（冻结选项）

### 2. S2Theme 主题配置文档
- 文件：`S2Theme-API文档.md`
- 内容来源：`/node_modules/@antv/s2/lib/common/interface/theme.d.ts`
- 包含：
  - ThemeCfg（主题配置）
  - S2Theme（主题定义）
  - Palette（色板）
  - 各单元格主题配置

### 3. S2Style 样式配置文档
- 文件：`S2Style-API文档.md`
- 内容来源：`/node_modules/@antv/s2/lib/common/interface/style.d.ts`
- 包含：
  - DataCellStyle（数据单元格）
  - RowCellStyle（行头单元格）
  - ColCellStyle（列头单元格）
  - CornerCellStyle（角头单元格）

### 4. S2Interaction 交互配置文档
- 文件：`S2Interaction-API文档.md`
- 内容来源：`/node_modules/@antv/s2/lib/common/interface/interaction.d.ts`
- 包含：
  - InteractionOptions（交互选项）
  - 交互状态管理
  - 刷选、多选、悬停等交互

### 5. SpreadSheet 实例方法文档
- 文件：`SpreadSheet-API文档.md`
- 内容来源：`/node_modules/@antv/s2/lib/sheet-type/spread-sheet.d.ts`
- 包含：
  - setTheme（设置主题）
  - setOptions（设置选项）
  - setDataCfg（设置数据）
  - render（渲染）
  - destroy（销毁）

### 6. S2Events 事件系统文档
- 文件：`S2Events-API文档.md`
- 内容来源：`/node_modules/@antv/s2/lib/common/interface/events.d.ts`
- 包含：
  - 所有可用事件
  - 事件类型定义

### 7. 创建索引文档
- 文件：`S2-API-索引.md`
- 列出所有文档及快速导航