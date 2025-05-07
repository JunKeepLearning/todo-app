<!-- TodoFilters.vue -->
<template>
  <div class="filters">
    <h2 class="text-xl font-bold text-white">筛选</h2>
    <p class="text-white">优先级</p>
    <select 
      :value="modelValuePriority" 
      @change="emit('update:modelValuePriority', $event.target.value)"
      class="custom-select"
    >
      <option value="">全部</option>
      <option v-for="priority in priorityOptions" :key="priority" :value="priority" class="text-black">{{ priority }}</option>
    </select>
    <p class="text-white">状态</p>
    <select 
      :value="modelValueStatus" 
      @change="emit('update:modelValueStatus', $event.target.value)"
      class="custom-select"
    >
      <option value="">全部</option>
      <option v-for="status in statusOptions" :key="status" :value="status" class="text-black">{{ status }}</option>
    </select>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 绑定筛选条件
const props = defineProps({
  modelValuePriority: String,
  modelValueStatus: String,
});

const emit = defineEmits(['update:modelValuePriority', 'update:modelValueStatus']);

const priorityOptions = ref(['high', 'medium', 'low']);
const statusOptions = ref(['未开始', '进行中', '已完成']);
</script>

<style scoped>
.filters {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  color: rgb(9, 8, 8);
}

select {
  padding: 8px;
  border-radius: 5px;
  background-color: transparent;
  border: 1px solid #cccccc;
  color: black;
}

.custom-select {
  background-color: white;
  text-color: black;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.text-black {
  color: black;
}
</style>
