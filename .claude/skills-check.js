#!/usr/bin/env node

/**
 * CatUI Skills 验证脚本
 *
 * 验证项目所需的 Claude Skills 是否已安装
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 项目所需的 skills
const requiredSkills = [
  { name: 'vue', package: 'bobmatnyc/claude-mpm-skills@vue', description: 'Vue 开发最佳实践' },
  { name: 'ant-design-vue', package: 'teachingai/full-stack-skills@ant-design-vue', description: 'Ant Design Vue' },
  { name: 'element-plus-vue3', package: 'teachingai/full-stack-skills@element-plus-vue3', description: 'Element Plus Vue 3' },
  { name: 'ui-design-system', package: 'davila7/claude-code-templates@ui-design-system', description: 'UI 设计系统' },
  { name: 'frontend-design', package: 'jwynia/agent-skills@frontend-design', description: '前端设计助手' },
  { name: 'interaction-design', package: 'aj-geddes/useful-ai-prompts@interaction-design', description: '交互设计指南' },
];

function checkSkillInstalled(skillName) {
  const skillsDir = path.join(require('os').homedir(), '.agents', 'skills');
  const skillPath = path.join(skillsDir, skillName);
  return fs.existsSync(skillPath);
}

function main() {
  log('\n🔍 CatUI Skills 验证', 'cyan');
  log('=' .repeat(60), 'cyan');

  let allInstalled = true;
  const results = [];

  for (const skill of requiredSkills) {
    const installed = checkSkillInstalled(skill.name);
    results.push({ ...skill, installed });
    if (!installed) {
      allInstalled = false;
    }
  }

  // 显示结果
  console.log('\n');
  for (const result of results) {
    const status = result.installed ? '✅' : '❌';
    const statusColor = result.installed ? 'green' : 'red';
    const nameColor = result.installed ? 'reset' : 'yellow';

    log(`${status} ${result.name}`, statusColor);
    log(`   └─ ${result.description}`, nameColor);
    if (!result.installed) {
      log(`   └─ 安装命令: npx skills add ${result.package} -g`, 'blue');
    }
    console.log();
  }

  log('='.repeat(60), 'cyan');

  if (allInstalled) {
    log('\n✨ 所有必需的 skills 已安装！', 'green');
    log('\n💡 提示: 使用 pnpm skills:update 更新 skills', 'blue');
    process.exit(0);
  } else {
    const missing = results.filter(r => !r.installed).length;
    log(`\n⚠️  缺少 ${missing} 个 skills`, 'yellow');
    log('\n💡 运行以下命令安装:', 'blue');
    log('   pnpm skills:setup', 'cyan');
    process.exit(1);
  }
}

main();
