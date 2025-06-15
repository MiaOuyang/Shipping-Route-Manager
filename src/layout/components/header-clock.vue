<template>
  <div class="header-clock">
    <span>{{ currentTime }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const currentTime = ref('');

// 更新时间
const updateTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  currentTime.value = `${hours}:${minutes}:${seconds}`;
};

let timer = null;

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style lang="scss" scoped>
.header-clock {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 16px;
  font-size: 18px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  letter-spacing: 1px;
}
</style> 