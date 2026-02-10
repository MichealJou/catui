<template>
  <Transition name="spin-fade">
    <div v-if="visible" class="spin-nested-loading">
      <div class="spin-spinning">
        <span class="spin-dot spin-dot-spin">
          <i class="spin-dot-item"></i>
          <i class="spin-dot-item"></i>
          <i class="spin-dot-item"></i>
          <i class="spin-dot-item"></i>
        </span>
        <div v-if="text" class="spin-text">{{ text }}</div>
        <div v-if="showProgress" class="spin-progress">
          <div class="spin-progress-bar">
            <div class="spin-progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="spin-progress-text">{{ progress }}%</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CLoading',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ''
    },
    showProgress: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      default: 0
    }
  }
})
</script>

<style scoped>
/* Loading 容器 - 相对定位，可以插入到任何容器中 */
.spin-nested-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 背景遮罩 */
.spin-nested-loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
}

/* Spin 容器 */
.spin-spinning {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* 旋转圆点容器 */
.spin-dot {
  position: relative;
  display: inline-block;
  font-size: 20px;
  width: 1em;
  height: 1em;
}

/* 单个圆点 */
.spin-dot-item {
  position: absolute;
  display: block;
  width: 9px;
  height: 9px;
  background-color: #1677ff;
  border-radius: 100%;
  transform: scale(0.75);
  transform-origin: 50% 50%;
  opacity: 0.3;
  animation: spinMove 1s infinite linear alternate;
}

/* 四个圆点的位置和延迟 */
.spin-dot-item:nth-child(1) {
  top: 0;
  left: 0;
}

.spin-dot-item:nth-child(2) {
  top: 0;
  right: 0;
  animation-delay: 0.4s;
}

.spin-dot-item:nth-child(3) {
  right: 0;
  bottom: 0;
  animation-delay: 0.8s;
}

.spin-dot-item:nth-child(4) {
  bottom: 0;
  left: 0;
  animation-delay: 1.2s;
}

/* 整体旋转 */
.spin-dot-spin {
  transform: rotate(45deg);
  animation: spinRotate 1.2s infinite linear;
}

/* 加载文字 */
.spin-text {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
}

/* 进度条容器 */
.spin-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 200px;
  margin-top: 8px;
}

.spin-progress-bar {
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.spin-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1677ff 0%, #40a9ff 100%);
  border-radius: 2px;
  transition: width 0.3s ease-out;
  position: relative;
  overflow: hidden;
}

/* 进度条光效 */
.spin-progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

.spin-progress-text {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  font-weight: 500;
}

/* 动画关键帧 */
@keyframes spinMove {
  to {
    opacity: 1;
  }
}

@keyframes spinRotate {
  to {
    transform: rotate(405deg);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 尺寸变体 - 通过父类控制 */
.spin-sm .spin-dot {
  font-size: 14px;
}

.spin-sm .spin-dot-item {
  width: 6px;
  height: 6px;
}

.spin-lg .spin-dot {
  font-size: 32px;
}

.spin-lg .spin-dot-item {
  width: 14px;
  height: 14px;
}

/* 过渡动画 */
.spin-fade-enter-active,
.spin-fade-leave-active {
  transition: opacity 0.2s ease;
}

.spin-fade-enter-from,
.spin-fade-leave-to {
  opacity: 0;
}
</style>
