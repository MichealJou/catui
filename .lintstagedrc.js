module.exports = {
  // TypeScript 和 Vue 文件
  '*.{js,jsx,ts,tsx,vue}': [
    'eslint --fix', // ESLint 检查并修复
    'prettier --write' // Prettier 格式化
  ],

  // JSON 和其他文本文件
  '*.{json,md,yml,yaml,css,scss,less}': [
    'prettier --write' // Prettier 格式化
  ]
}
