<template>
  <div class="admin-layout">
    <!-- 左侧菜单 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor"/>
            <path d="M7 7h10M7 12h3M7 17h3" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="logo-text">CatUI</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="route in navigationRoutes"
          :key="route.path"
          :to="route.path"
          class="nav-item"
          active-class="nav-item-active"
        >
          <svg v-if="route.meta?.icon" class="nav-icon" viewBox="0 0 24 24" fill="none">
            <text x="12" y="16" text-anchor="middle" font-size="16" fill="currentColor">{{ route.meta.icon }}</text>
          </svg>
          <span class="nav-text">{{ route.meta?.title }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- 右侧内容 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 导航路由
const navigationRoutes = computed(() => {
  const allRoutes = router.getRoutes()
  return allRoutes
    .filter(r => r.path !== '/' && !r.path.includes(':pathMatch'))
    .map(r => ({
      path: r.path,
      meta: r.meta
    }))
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
  overflow: hidden;
}

/* ========== 左侧边栏 ========== */
.sidebar {
  width: 220px;
  background: #ffffff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 28px;
  height: 28px;
  color: #1677ff;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #1f1f2f;
  letter-spacing: 0.5px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  color: #666;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-item:hover {
  background: #f5f5f5;
  color: #1677ff;
}

.nav-item-active {
  background: #e6f4ff;
  color: #1677ff;
  font-weight: 500;
}

.nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.nav-text {
  font-size: 14px;
}

/* ========== 右侧内容区 ========== */
.main-content {
  flex: 1;
  background: #ffffff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 确保表格铺满整个区域 */
.main-content :deep(.ctable-wrapper) {
  width: 100%;
  height: 100%;
}
</style>
