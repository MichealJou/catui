# 开发指南

贡献代码的指南，包括开发环境、代码规范和测试。

---

## 📖 文档列表

### 开发环境
- ⏳ [开发环境搭建](./setup.md) - 环境配置
- ✅ [代码质量保障](./code-quality.md) - ESLint、Prettier、UnoCSS

### 代码规范
- ✅ [代码规范](./coding-standards.md) - 编码标准和最佳实践

### 工作流程
- ⏳ [开发工作流](./workflow.md) - Git 工作流和分支管理
- ⏳ [测试指南](./testing.md) - 单元测试和 E2E 测试
- ⏳ [调试指南](./debugging.md) - 调试技巧

### 发布流程
- ⏳ [版本发布](./releasing.md) - 发布流程和版本管理

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-org/catui.git
cd catui
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
# 启动 demo 应用
pnpm dev:demo

# 启动所有开发服务器
pnpm dev
```

### 4. 代码质量检查

```bash
# 运行 ESLint
pnpm lint

# 格式化代码
pnpm prettier --write .

# 类型检查
pnpm type-check
```

---

## 📋 开发前准备

### 必需工具

- **Node.js**: >= 16.0.0
- **pnpm**: 最新版本
- **VS Code**: 推荐

### 推荐扩展

VS Code 会自动提示安装推荐的扩展（见 `.vscode/extensions.json`）：

- ESLint
- Prettier
- Volar (Vue 3 支持)
- UnoCSS

### 环境配置

确保配置文件正确：

```bash
# 检查配置文件
ls -la | grep -E "eslint|prettier|uno"

# 应该看到：
# .eslintrc.js
# .prettierrc.js
# uno.config.ts
```

---

## ✨ 代码质量工具

### ESLint

代码质量检查，确保代码符合规范。

```bash
# 检查所有文件
pnpm lint

# 检查并自动修复
pnpm lint:fix
```

### Prettier

代码格式化工具，保持代码风格一致。

```bash
# 检查格式
pnpm prettier --check .

# 格式化所有文件
pnpm prettier --write .
```

### UnoCSS

原子化 CSS 引擎，提高样式开发效率。

详见：[代码质量保障](./code-quality.md)

---

## 🎯 开发流程

### 功能开发流程

```
1. 创建分支
   git checkout -b feature/your-feature

2. 开发功能
   - 编写代码
   - 运行 lint
   - 编写测试

3. 提交代码
   git add .
   git commit -m "feat: add your feature"

4. 推送分支
   git push origin feature/your-feature

5. 创建 Pull Request
   - 填写 PR 模板
   - 等待 Code Review

6. 合并代码
   - Review 通过后合并
   - 删除分支
```

### Commit 规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```bash
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建/工具
```

示例：
```bash
git commit -m "feat(table): add virtual scroll support"
git commit -m "fix(renderer): fix grid line alignment"
```

---

## 🧪 测试

### 单元测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test Table.test.ts

# 监听模式
pnpm test:watch
```

### E2E 测试

```bash
# 运行 E2E 测试
pnpm test:e2e
```

### 测试覆盖率

```bash
# 生成覆盖率报告
pnpm test:coverage
```

目标覆盖率：>= 80%

---

## 📝 文档

### 文档更新

添加新功能时，记得更新相关文档：

- ✅ API 文档
- ✅ 使用示例
- ✅ 类型定义

### 文档位置

```
doc/
├── 01-getting-started/  # 入门教程
├── 02-user-guide/       # 用户指南
├── 03-api-reference/    # API 参考
├── 04-advanced/         # 高级用法
├── 05-architecture/     # 架构设计
├── 06-development/      # 开发指南（当前位置）
├── 07-examples/         # 示例代码
├── 08-migration/        # 迁移指南
├── 09-faq/              # 常见问题
└── 10-about/            # 关于项目
```

---

## 🔍 调试

### VS Code 调试

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

### 浏览器 DevTools

```bash
# 启动开发服务器（带 source map）
pnpm dev --debug

# 在浏览器中打开 DevTools 调试
```

---

## 🚀 发布流程

### 版本号规范

遵循 [Semantic Versioning](https://semver.org/)：

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1 (修复 Bug)
1.0.1 → 1.1.0 (新功能)
1.1.0 → 2.0.0 (破坏性变更)
```

### 发布步骤

```bash
# 1. 更新版本号
pnpm version patch|minor|major

# 2. 生成 CHANGELOG
pnpm changelog

# 3. 构建生产版本
pnpm build

# 4. 发布到 npm
pnpm publish

# 5. 推送标签
git push --tags
```

---

## 💡 最佳实践

### 1. 代码风格

- ✅ 使用 TypeScript
- ✅ 遵循代码规范
- ✅ 编写有意义的注释
- ✅ 保持函数简洁

### 2. 性能优化

- ✅ 使用虚拟滚动
- ✅ 避免不必要的响应式
- ✅ 使用计算属性缓存
- ✅ 懒加载组件

### 3. 可维护性

- ✅ 编写单元测试
- ✅ 更新文档
- ✅ 使用有意义的变量名
- ✅ 保持代码简单

---

## 🆘 遇到问题？

### 常见问题

1. **依赖安装失败**
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

2. **TypeScript 错误**
   ```bash
   pnpm type-check
   ```

3. **ESLint 错误**
   ```bash
   pnpm lint:fix
   ```

### 获取帮助

- 📖 查看[代码规范](./coding-standards.md)
- 📖 查看[代码质量保障](./code-quality.md)
- 🐛 [提交 Issue](链接)
- 💬 [ Discussions](链接)

---

## 🎓 学习资源

- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [G2 文档](https://g2.antv.antgroup.com/)
- [UnoCSS 文档](https://unocss.dev/)

---

**维护者**: CTable 开发团队
**最后更新**: 2026-02-10
