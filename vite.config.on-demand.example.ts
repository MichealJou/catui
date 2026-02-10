import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),

    // 自动按需导入组件
    Components({
      // 自动导入的组件目录
      dirs: [],

      // 组件解析器
      resolvers: [
        // ant-design-vue 自动按需导入
        AntDesignVueResolver({
          importStyle: false, // 样式自动导入（推荐使用 CSS）
        }),

        // 如果使用 element-plus，取消注释：
        // ElementPlusResolver({
        //   importStyle: 'css'
        // }),

        // 如果使用 naive-ui，取消注释：
        // NaiveUiResolver()
      ],

      // 配置文件扩展名
      extensions: ['vue', 'tsx'],

      // 生成类型声明文件
      dts: 'src/components.d.ts',
    }),
  ],

  resolve: {
    alias: {
      '@': '/src'
    }
  },

  build: {
    // 启用 CSS 代码分割
    cssCodeSplit: true,

    // 构建后是否生成 source map 文件
    sourcemap: false,

    // 设置最终构建的浏览器兼容目标
    target: 'es2015',

    // 打包文件大小警告的限制 (kb)
    chunkSizeWarningLimit: 500
  }
})
