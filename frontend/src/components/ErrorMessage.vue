<!-- src/components/ErrorMessage.vue -->
<template>
  <p v-if="message" class="error-message">
    {{ message }}
  </p>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  message: {
    type: String,
    required: false,
  },
});
</script>

<style scoped>
.error-message {
  color: red;
  font-weight: bold;
}
</style>
