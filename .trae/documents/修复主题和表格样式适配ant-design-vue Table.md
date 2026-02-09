## 修复主题和表格样式适配ant-design-vue Table

### 1. 更新 S2ThemeManager 颜色配置
- 将品牌色从 `#1890ff` 更新为 Ant Design 5.0+ 官方品牌色 `#1677ff`
- 更新所有主题（default、dark、compact）的颜色配置，使用Ant Design官方颜色规范
- 精确配置边框色、表头背景色、悬停色、选中色等

### 2. 更新 S2Table.vue 样式
- 调整表格容器的圆角、阴影、边框样式，匹配ant-design-vue Table
- 更新工具栏、分页器等组件的样式，确保与Ant Design风格一致
- 优化CSS变量使用，确保主题切换时样式正确应用

### 3. 测试验证
- 运行开发服务器，验证主题切换功能
- 检查不同主题下的表格样式是否正确显示
- 确认样式细节（边框、圆角、阴影、颜色）符合Ant Design规范