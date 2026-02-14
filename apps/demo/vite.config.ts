import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS() as any
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@catui/ctable': resolve(__dirname, '../../packages/ctable/src')
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          // antd theme variables
        }
      }
    }
  },
})