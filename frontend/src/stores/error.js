// src/stores/error.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useErrorStore = defineStore('error', () => {
  const errorMessage = ref('');  // 用于存储错误消息

  const setError = (message) => {
    errorMessage.value = message;  // 设置错误消息
  };

  const clearError = () => {
    errorMessage.value = '';  // 清除错误消息
  };
  const hasError = () => {
    return errorMessage.value !== ''; // 检查是否存在错误消息
  };

  return {
    errorMessage,
    setError,
    clearError,
    hasError // 新增的功能
  };
});
