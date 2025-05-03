<!-- TodoInput.vue -->
<template>
  <div class="flex gap-2 mb-5">
    <!-- 输入框：绑定待办事项标题 -->
    <input
      v-model="newTitle"
      placeholder="请输入待办事项"
      class="input-box"
      id="title_input"
    />
        
    <!-- 优先级选择框 -->
    <select v-model="newPriority" class="select" id="priority_input">
      <option
        v-for="priority in priorityOptions"
        :key="priority"
        :value="priority"
      >
        {{ priority }}
      </option>
    </select>
    
    <!-- 状态选择框 -->
    <select v-model="newStatus" class="select" id="status_input">
      <option
        v-for="status in statusOptions"
        :key="status"
        :value="status"
      >
        {{ status }}
      </option>
    </select>
    
    <!-- 日期选择框 -->
    <input
      type="date"
      v-model="newDueDate"
      class="time-input"
      id="time_input"
    />
    
    <!-- 提交按钮，根据是否为编辑状态显示不同文本 -->
    <button @click="submit" class="btn">
      {{ editingId ? '保存' : '添加' }}
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useErrorStore } from '../stores/error'; // 引入错误状态管理

// 接收父组件传入的 prop：当前正在编辑的 todo 对象
const props = defineProps({
  editingTodo: Object,
});

// 向父组件发出事件：submit（提交新增/编辑）、cancelEdit（取消编辑）
const emit = defineEmits(['submit', 'cancelEdit']);

// 错误提示 store
const errorStore = useErrorStore();

// 定义表单绑定变量（使用 ref 实现响应式）
const newTitle = ref('');
const newPriority = ref('');
const newStatus = ref('');
const newDueDate = ref('');
const editingId = ref(null); // 若有值，表示当前是“编辑模式”

// 定义下拉框的选项数组
const priorityOptions = ['high', 'medium', 'low'];
const statusOptions = ['未开始', '进行中', '已完成'];

// 清空所有输入，并重置为“新增”状态
const clearInput = () => {
  newTitle.value = '';
  newPriority.value = '';
  newStatus.value = '';
  newDueDate.value = '';
  editingId.value = null;
  errorStore.clearError(); // 清除错误提示
  emit('cancelEdit'); // 通知父组件取消编辑状态
};

// 输入验证
const validateInput = () => {
    const errorMessages = {
    emptyTitle: '请输入有效的待办事项',
    titleTooLong: '内容不能超过50个字符',
  };

  if (!newTitle.value.trim()) {
    errorStore.setError(errorMessages.emptyTitle);
    console.log('Validation failed: empty title');
    return false;
  }
  if (newTitle.value.trim().length > 50) {
    errorStore.setError(errorMessages.titleTooLong);
    console.log('Validation failed: title too long');
    return false;
  }
  console.log('Validation passed.');
  return true;
};

// 提交按钮点击事件
const submit = () => {
  console.log('Submit button clicked.');
  if (!validateInput()) return;

  console.log('Submitting data:', {
    id: editingId ? editingId.value : null,
    title: newTitle.value.trim(),
    priority: newPriority.value,
    status: newStatus.value,
    due_date: newDueDate.value || null,
  });

  emit('submit', {
    id: editingId ? editingId.value : null,
    title: newTitle.value.trim(),
    priority: newPriority.value,
    status: newStatus.value,
    due_date: newDueDate.value || null,
  });
  // 清空输入框
  clearInput();
};

// 监听 editingTodo 的变化（首次加载和后续更新）
watch(
  () => props.editingTodo,
  (todo) => {
    if (todo) {
      // 进入编辑模式：填充表单字段并记录 ID
      newTitle.value = todo.title;
      newPriority.value = todo.priority || '';
      newStatus.value = todo.status || '';
      newDueDate.value = todo.due_date || '';
      editingId.value = todo.id;
    } else {
      // 清除编辑状态
      clearInput();
    }
  },
  { immediate: true } // 初始就执行一次
);

</script>

<style scoped>
/* 输入框样式 */
.input-box {
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: none;
  color: black;
}

/* 下拉选择框样式 */
.select {
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  color: black;
}

/* 日期输入框样式 */
.time-input {
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
}
.time-input:focus {
  border-color: #ffcc00;
  box-shadow: 0 0 10px rgba(255, 152, 0, 0.8);
}

/* 提交按钮样式 */
.btn {
  padding: 10px 15px;
  background-color: #ff9800;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
.btn:hover {
  background-color: #e68900;
}
</style>
