module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    '@vue/prettier', // 使 ESLint 与 Prettier 兼容
    'plugin:@typescript-eslint/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    // Vue 规则
    'vue/multi-word-component-names': 'error', // 组件名必须是多个单词
    'vue/no-v-html': 'warn', // 警告使用 v-html
    'vue/require-default-prop': 'off', // 不强制 props 默认值
    'vue/require-prop-types': 'off', // 不强制 props 类型声明
    'vue/component-definition-name-casing': ['error', 'PascalCase'], // 组件名使用 PascalCase
    'vue/component-name-in-template-casing': ['error', 'PascalCase'], // 模板中使用 PascalCase
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'never',
          component: 'always'
        },
        svg: 'always',
        math: 'always'
      }
    ],
    'vue/max-attributes-per-line': 'off', // 关闭每行最多属性数限制
    'vue/singleline-html-element-content-newline': 'off', // 关闭单行元素内容换行

    // TypeScript 规则
    '@typescript-eslint/no-explicit-any': 'warn', // 警告使用 any
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_', // 忽略 _ 开头的参数
        varsIgnorePattern: '^_' // 忽略 _ 开头的变量
      }
    ],
    '@typescript-eslint/explicit-function-return-type': 'off', // 不强制函数返回类型
    '@typescript-eslint/explicit-module-boundary-types': 'off', // 不强制模块边界类型
    '@typescript-eslint/no-non-null-assertion': 'off', // 允许非空断言
    '@typescript-eslint/ban-ts-comment': 'off', // 允许使用 @ts-ignore 等
    '@typescript-eslint/no-empty-function': 'off', // 允许空函数

    // 通用规则
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // 生产环境警告 console
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off', // 生产环境禁止 debugger
    'no-unused-vars': 'off', // 使用 TypeScript 的规则
    'prefer-const': 'error', // 优先使用 const
    'no-var': 'error', // 禁止使用 var
    'eqeqeq': ['error', 'always'], // 必须使用 === 和 !==
    'curly': ['error', 'all'], // 所有代码块使用大括号
    'brace-style': ['error', '1tbs'], // 大括号风格
    'semi': ['error', 'never'], // 不使用分号
    'quotes': ['error', 'single', { avoidEscape: true }], // 使用单引号
    'comma-dangle': ['error', 'never'], // 不允许尾随逗号
    'eol-last': ['error', 'always'], // 文件末尾空行
    'no-trailing-spaces': 'error', // 禁止尾随空格
    'indent': 'off', // 使用 Prettier
    'arrow-parens': ['error', 'as-needed'], // 箭头函数参数括号
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }] // 最多 1 个空行
  },
  globals: {
    // 全局变量
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  }
}
