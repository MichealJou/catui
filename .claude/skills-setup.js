#!/usr/bin/env node

/**
 * CatUI Skills 安装脚本
 *
 * 安装项目所需的 Claude Skills
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 项目所需的 skills
const requiredSkills = [
  { name: 'vue', package: 'bobmatnyc/claude-mpm-skills@vue' },
  { name: 'ant-design-vue', package: 'teachingai/full-stack-skills@ant-design-vue' },
  { name: 'element-plus-vue3', package: 'teachingai/full-stack-skills@element-plus-vue3' },
  { name: 'ui-design-system', package: 'davila7/claude-code-templates@ui-design-system' },
  { name: 'frontend-design', package: 'jwynia/agent-skills@frontend-design' },
  { name: 'interaction-design', package: 'aj-geddes/useful-ai-prompts@interaction-design' },
];

function checkSkillInstalled(skillName) {
  const skillsDir = path.join(require('os').homedir(), '.agents', 'skills');
  const skillPath = path.join(skillsDir, skillName);
  return fs.existsSync(skillPath);
}

function installSkill(skill) {
  log(`\n📦 安装 ${skill.name}...`, 'blue');
  try {
    execSync(`npx skills add ${skill.package} -g -y`, {
      stdio: 'inherit',
      timeout: 120000,
    });
    log(`✅ ${skill.name} 安装成功`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${skill.name} 安装失败: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('\n🚀 CatUI Skills 安装向导', 'blue');
  log('=' .repeat(40), 'blue');

  let installedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const skill of requiredSkills) {
    if (checkSkillInstalled(skill.name)) {
      log(`✓ ${skill.name} 已安装，跳过`, 'yellow');
      skippedCount++;
    } else {
      const success = installSkill(skill);
      if (success) {
        installedCount++;
      } else {
        failedCount++;
      }
    }
  }

  log('\n' + '='.repeat(40), 'blue');
  log('\n📊 安装摘要:', 'blue');
  log(`  ✅ 新安装: ${installedCount}`, 'green');
  log(`  ⏭️  已跳过: ${skippedCount}`, 'yellow');
  log(`  ❌ 失败: ${failedCount}`, failedCount > 0 ? 'red' : 'green');

  if (failedCount === 0) {
    log('\n🎉 所有 skills 安装完成！', 'green');
    log('\n💡 提示: 使用 pnpm skills:check 验证安装', 'blue');
    process.exit(0);
  } else {
    log('\n⚠️  部分 skills 安装失败，请检查错误信息', 'yellow');
    process.exit(1);
  }
}

main();
