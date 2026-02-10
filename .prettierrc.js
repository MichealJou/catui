module.exports = {
  // 使用单引号
  singleQuote: true,

  // 不使用分号
  semi: false,

  // 每行最大字符数
  printWidth: 100,

  // 缩进空格数
  tabWidth: 2,

  // 使用空格缩进
  useTabs: false,

  // 对象属性添加引号
  quoteProps: 'as-needed',

  // JSX 使用单引号
  jsxSingleQuote: true,

  // 尾随逗号
  trailingComma: 'none',

  // 对象最后一项加逗号
  // (与 trailingComma 冲突，这里主要控制对象字面量)
  // 注意：Prettier 3.0+ 已移除此选项，统一使用 trailingComma

  // 大括号内空格
  bracketSpacing: true,

  // JSX 标签反尖括号换行
  bracketSameLine: false,

  // 箭头函数参数括号
  arrowParens: 'avoid',

  // HTML 空白敏感度
  htmlWhitespaceSensitivity: 'css',

  // Vue 文件缩进 <script> 和 <style>
  vueIndentScriptAndStyle: false,

  // 行尾换行符
  endOfLine: 'lf',

  // 单个属性的标签换行
  singleAttributePerLine: false,

  // 插入 @prettier 标记
  insertPragma: false,

  // 只有在文件顶部有 @prettier 标记时才格式化
  requirePragma: false,

  // prose wrap（Markdown 等）
  proseWrap: 'preserve',

  // HTML 空白符折叠
  htmlWhitespaceSensitivity: 'css',

  // 结束标签 > 换行
  bracketSameLine: false
}
