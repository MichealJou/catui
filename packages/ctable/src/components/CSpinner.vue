<template>
  <span
    class="c-spinner"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      borderWidth: `${strokeWidth}px`,
      borderTopColor: color
    }"
  ></span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    strokeWidth?: number
    color?: string
  }>(),
  {
    size: 30,
    strokeWidth: 3,
    color: '#1677ff'
  }
)
</script>

<style scoped>
.c-spinner {
  display: inline-block;
  box-sizing: border-box;
  border-style: solid;
  border-color: #f0f0f0;
  border-radius: 50%;
  animation: c-spinner-rotate 0.9s linear infinite;
}

@keyframes c-spinner-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
