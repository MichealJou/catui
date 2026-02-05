# 执行计划：环境搭建与代码分析

## 第一阶段：环境搭建 (20分钟)

### 1. 初始化 Turborepo 项目
- 使用 `pnpm dlx create-turbo@latest` 创建项目
- 配置 pnpm workspace
- 设置基础项目结构

### 2. 配置基础依赖
- 安装 Vue3、Vite、TypeScript
- 配置 turbo.json 构建规则
- 设置 ESLint、Prettier

### 3. 创建项目结构
```
catui/
├── apps/demo/          # 演示应用
├── packages/table/      # 表格组件包
└── packages/shared/     # 共享工具包
```

## 第二阶段：安装和分析 @surely-vue/table (30分钟)

### 4. 安装 @surely-vue/table
- `npm install @surely-vue/table`
- 安装相关依赖

### 5. 创建演示页面
- 在 demo 应用中创建表格示例
- 测试大数据量性能 (10万行)
- 测试核心功能 (排序、筛选、分页)

### 6. 分析源码结构
- 研究 node_modules 中的编译代码
- 分析虚拟滚动实现算法
- 学习固定列/固定头的 CSS 实现
- 理解组件 API 设计模式

## 第三阶段：设计自己的表格架构 (10分钟)

### 7. 架构设计
- 组件层次结构
- 数据流设计
- Hook 设计
- TypeScript 类型定义

## 技术栈
- **构建工具**: Turborepo + Vite
- **框架**: Vue3 + TypeScript
- **包管理**: pnpm workspace
- **样式**: Less