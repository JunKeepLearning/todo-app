<!-- src/components/ErrorMessage.vue -->
<template>
  <p v-if="errorMessage" class="error-message">
    {{ errorMessage }}
  </p>
</template>

<script setup>
import { useErrorStore } from '../stores/error';
import { computed } from 'vue';

const errorStore = useErrorStore(); // 获取 Pinia store 实例
const errorMessage = computed(() => errorStore.errorMessage); // 绑定错误消息
</script>

<style scoped>
.error-message {
  color: red;
  font-weight: bold;
}
</style>
