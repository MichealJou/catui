import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
  transformerCompileClass
} from 'unocss'

export default defineConfig({
  // 预设
  presets: [
    presetUno(), // 默认预设（类似 Tailwind CSS）
    presetAttributify(), // 属性化模式（如 <div flex="~ items-center">）
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle'
      }
    }) // 图标预设
  ],

  // 转换器
  transformers: [
    transformerDirectives(), // 支持 @apply 指令
    transformerVariantGroup(), // 支持变体组（如 :hover:bg-blue:bg-red）
    transformerCompileClass() // 编译时生成 CSS
  ],

  // 快捷方式
  shortcuts: {
    // 布局
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'flex-col-center': 'flex flex-col items-center justify-center',

    // 按钮
    'btn': 'px-4 py-2 rounded cursor-pointer border-none outline-none transition-all',
    'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600',
    'btn-default': 'btn bg-gray-200 text-gray-800 hover:bg-gray-300',
    'btn-danger': 'btn bg-red-500 text-white hover:bg-red-600',

    // 输入框
    'input': 'px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500',

    // 卡片
    'card': 'bg-white rounded-lg shadow-md p-4',

    // 文本
    'text-primary': 'text-gray-900',
    'text-secondary': 'text-gray-600',
    'text-disabled': 'text-gray-400'
  },

  // 主题
  theme: {
    colors: {
      primary: {
        DEFAULT: '#1890ff',
        light: '#40a9ff',
        dark: '#096dd9'
      },
      success: {
        DEFAULT: '#52c41a',
        light: '#73d13d',
        dark: '#389e0d'
      },
      warning: {
        DEFAULT: '#faad14',
        light: '#ffc53d',
        dark: '#d48806'
      },
      error: {
        DEFAULT: '#ff4d4f',
        light: '#ff7875',
        dark: '#cf1322'
      }
    }
  },

  // 规则
  rules: [
    // 自定义规则
    ['text-shadow', { 'text-shadow': '0 2px 4px rgba(0,0,0,0.1)' }],
    ['card-shadow', { 'box-shadow': '0 1px 2px rgba(0,0,0,0.03)' }]
  ],

  // 安全模式
  safelist: [
    // 始终生成的类
    'bg-blue-500',
    'text-white',
    'rounded'
  ],

  // 别名
  aliases: {
    // 别名定义
  }
})
