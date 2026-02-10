import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),

    // UnoCSS - 原子化 CSS
    UnoCSS(),

    // 自动按需导入组件
    Components({
      dirs: [], // 自动导入的组件目录
      resolvers: [
        AntDesignVueResolver({
          importStyle: false
        })
      ],
      extensions: ['vue', 'tsx'],
      dts: 'src/components.d.ts'
    })
  ],

  resolve: {
    alias: {
      '@': '/src'
    }
  },

  build: {
    cssCodeSplit: true,
    sourcemap: false,
    target: 'es2015',
    chunkSizeWarningLimit: 500
  }
})
