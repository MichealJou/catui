/**
 * 路由配置
 */
import type { RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/table'
  },
  {
    path: '/table',
    name: 'table',
    component: () => import('../views/CanvasTableDemo.vue'),
    meta: {
      title: '基础表格',
      icon: '📊'
    }
  }
]

export default routes
