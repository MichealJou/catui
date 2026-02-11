# 语雀 MCP 配置指南

本项目已集成语雀 MCP（Model Context Protocol），用于管理语雀知识库文档。

## 📋 前置要求

1. **语雀账号**
   - 访问 [https://www.yuque.com](https://www.yuque.com) 注册账号

2. **个人访问令牌**
   - 进入 [设置 > 令牌](https://www.yuque.com/settings/tokens)
   - 创建新的访问令牌（需要 `repo:read` 和 `repo:write` 权限）

## 🔧 配置步骤

### 1. 编辑配置文件

编辑 `.claude/yuque-mcp.json`:

```json
{
  "mcpServers": {
    "yuque": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-yuque"],
      "env": {
        "YUQUE_TOKEN": "你的实际令牌",
        "YUQUE_BASE_URL": "https://www.yuque.com"
      }
    }
  }
}
```

### 2. 验证配置

```bash
node .claude/yuque-setup.js
```

### 3. 重启 Claude Code

配置完成后，重启 Claude Code 使 MCP 服务器生效。

## 📖 使用方式

### 在 Claude Code 中使用

```
# 创建文档
"使用语雀 MCP 创建一个新文档，标题为 'CTable 组件设计'"

# 搜索文档
"在语雀中搜索关于 Canvas 渲染的文档"

# 更新文档
"将 README.md 的内容同步到语雀知识库"

# 获取文档列表
"列出语雀知识库中所有关于组件的文档"
```

### 可用功能

| 功能 | 描述 | 示例 |
|------|------|------|
| 创建文档 | 在指定知识库创建新文档 | 创建"组件 API 文档" |
| 搜索文档 | 根据关键词搜索文档 | 搜索"虚拟滚动"相关文档 |
| 更新文档 | 更新已有文档内容 | 更新"快速开始"文档 |
| 移动文档 | 移动文档到不同目录 | 移动到"已归档"文件夹 |
| 删除文档 | 删除不需要的文档 | 删除"草稿"文档 |

## 🔒 安全提示

1. **不要提交 Token 到代码仓库**
   - `.claude/yuque-mcp.json` 已在 `.gitignore` 中
   - 只提交示例配置文件

2. **定期更换 Token**
   - 建议每 90 天更换一次访问令牌
   - 避免在公共场所暴露令牌

3. **最小权限原则**
   - 只授予必要的权限范围
   - 使用只读令牌进行文档查看

## 🛠️ 故障排除

### 问题：MCP 服务器无法启动

**解决方案：**
```bash
# 手动测试 MCP 服务器
npx -y @modelcontextprotocol/server-yuque
```

### 问题：Token 无效

**解决方案：**
1. 检查 Token 是否正确复制
2. 确认 Token 未过期
3. 验证 Token 权限是否足够

### 问题：无法访问知识库

**解决方案：**
1. 确认知识库 ID 正确
2. 检查账号是否有访问权限
3. 验证知识库是否已公开或已共享

## 📚 相关文档

- [语雀 API 文档](https://www.yuque.com/yuque/developer)
- [MCP 规范](https://modelcontextprotocol.io)
- [项目 WORKFLOW.md](./WORKFLOW.md)
