#!/usr/bin/env node

/**
 * 语雀 MCP 配置脚本
 * 用于验证和设置语雀配置
 */

const fs = require('fs')
const path = require('path')

const CONFIG_FILE = path.join(__dirname, 'yuque-mcp.json')
const EXAMPLE_FILE = path.join(__dirname, 'yuque-config.example.json')

console.log('📚 语雀 MCP 配置向导')
console.log('====================\n')

// 检查配置文件是否存在
if (fs.existsSync(CONFIG_FILE)) {
  console.log('✅ 配置文件已存在:', CONFIG_FILE)
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))

  // 检查 token 是否已设置
  const token = config.mcpServers?.yuque?.env?.YUQUE_TOKEN
  if (token && token !== 'YOUR_YUQUE_TOKEN_HERE') {
    console.log('✅ 语雀 Token 已配置')
    console.log('🔗 Base URL:', config.mcpServers?.yuque?.env?.YUQUE_BASE_URL)
  } else {
    console.log('⚠️  请先配置语雀 Token:')
    console.log('\n1. 访问: https://www.yuque.com/settings/tokens')
    console.log('2. 创建新的个人访问令牌')
    console.log('3. 编辑配置文件: .claude/yuque-mcp.json')
    console.log('4. 将 YUQUE_TOKEN 替换为你的令牌\n')
  }
} else {
  console.log('❌ 配置文件不存在')
  console.log('请参考示例文件:', EXAMPLE_FILE)
}

console.log('\n📖 使用文档: .claude/YUQUE_MCP.md')
