import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from './layouts/AdminLayout.vue'
import routes from './router'
import 'uno.css'

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(AdminLayout)
app.use(router)
app.mount('#app')
