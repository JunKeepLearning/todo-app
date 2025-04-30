<script setup>
import { onMounted, ref, computed, reactive } from 'vue';
import { getTodoItems , createTodoItem , updateTodoItem , deleteTodoItem} from '../src/api';
//存储展示列表
const todolist = ref([]);
//输入框值
const newTitle = ref('');
const newPriority = ref('');
const newStatus = ref('');
const newDueDate = ref('');
// 筛选器
const errorMessage = ref('');
const filterPriority = ref('');
const filterStatus = ref('');
const priorityOptions = ref(['high','medium','low']);
const statusOptions = ref(['未开始','进行中','已完成']);
// 编辑标识
const editingId = ref(null);
//column
const columns = ref(['任务','优先级','状态','完成时间','操作']);
// 赋予唯一ID并初始化状态
// 清空输入
const clearInput = () =>{
  newTitle.value = ''; 
  newPriority.value = '';
  newStatus.value = '';
  newDueDate.value = '';
  editingId.value = null;
}
//获取所有事项
const getItems = async() => {
  try {
    const response = await getTodoItems();
    todolist.value = response.todos; // 假设返回的数据是待办事项数组
    console.log(todolist.value);
  } catch (error) {
    errorMessage.value = '获取待办事项失败' + (error.message || JSON.stringify(error));
  }
};
// 创建待办事项
const createItem = async() => {
  // 验证title输入
  if (!newTitle.value.trim()) {
    errorMessage.value = '请输入待办事项内容';
    return;
  }
  if (newTitle.value.trim().length > 50) {
    errorMessage.value = '内容不能超过50个字符';
    return;
  }
  // 清空错误信息
  errorMessage.value = '';
  // 在传递输入之前，解包它的值
  const todoData = {
    title: newTitle.value,    // 获取值而不是ref
    priority: newPriority.value ? newPriority.value : null, // 获取值而不是ref
    status: newStatus.value ? newStatus.value : null,  // 获取值而不是ref
    due_date: newDueDate.value ? newDueDate.value : null,  // 获取值而不是ref
  };
  //判断是否在编辑
  if (editingId.value) {
    console.log("editingId: " , editingId.value);
    console.log("修改后的数据: " , todoData);
    await updateTodoItem(editingId.value, todoData);
    console.log("id:"+editingId.value+" 的内容已更新")
  }
  else {
    // 添加新任务
    console.log("新增数据tododata.title: " , todoData.title);
    console.log("新增数据tododata: ", todoData);
    await createTodoItem(todoData);
    console.log("新todo创建完成");
  };
  // 清空输入框
  clearInput();
  //刷新列表
  await getItems();
};

// 更新待办事项
const updateItem = async(id) => {
  const item = todolist.value.find((item) => item.id === id);
  //输入框显示需要更新的item
  if (item) {
    console.log("编辑："+item.title);
    newTitle.value=item.title;
    newPriority.value=item.priority;
    newStatus.value=item.status;
    newDueDate.value=item.due_date;
    //用于判断是否在编辑
    editingId.value=item.id;
  }
};
// 删除待办事项
const deleteItem = async(id) => {
  if (confirm('确定要删除这个待办事项吗？')) {
    // todolist.value = todolist.value.filter((item) => item.id !== id);
    await deleteTodoItem(id);
    await getItems();
    console.log("id:"+id+" 已经删除")
  }
};


// 排序和过滤逻辑
const processedTodolist = computed(() => {
  const todolistArray = Array.isArray(todolist.value) ? todolist.value : [];
  return todolistArray
    .filter((item) => {
      const priorityMatch = !filterPriority.value || item.priority === filterPriority.value;
      const statusMatch = !filterStatus.value || item.status === filterStatus.value;
      return priorityMatch && statusMatch;
    })
    .sort((a, b) => {
      const priorityMap = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityMap[b.priority] - priorityMap[a.priority];
    });
});
// 初始化
onMounted(() => {
  //初始化列表
  getItems();
});
</script>

<template>
  <!-- 容器 -->
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black to-purple-900 text-white font-sans m-0">
    <!-- 输入 -->
    <div class="flex gap-2 mb-5">
      <!-- 输入框 -->
      <input v-model="newTitle" placeholder="请输入待办事项" class="input-box" id="title_input">
      <!-- 优先级 -->
      <p for="priority-select">优先级</p>
      <select v-model="newPriority" class="select" id="priority_inp
ut">
        <option v-for="priority in priorityOptions" :key="priority" :value="priority">{{ priority }}</option>
      </select> 
      <!-- 状态 -->
      <p for="status-select">状态</p>
      <select v-model="newStatus" class="select" id = "status_input">
        <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
      </select> 
      <!-- 截止日期 -->
      <p for="dueDate-select">截止日期</p>
      <input type="date" v-model="newDueDate" class="time-input" id = "time_input">
      <!-- 添加 -->
      <button @click="createItem()" class="btn">{{ editingId ? '保存' : '添加' }}</button>
    </div>
    <!-- 错误信息 -->
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <!-- 过滤 -->
    <div class="filters">
      <h2 class="text-xl font-bold text-white">筛选</h2>
      <p class="text-white">优先级</p>
      <select v-model="filterPriority">
        <option value="">全部</option>
        <option v-for="priority in priorityOptions" :key="priority" :value="priority" class="text-black">{{ priority }}</option>
      </select>
      <p  class="text-white">状态</p>
      <select v-model="filterStatus">
        <option value="">全部</option>
        <option v-for="status in statusOptions" :key="status" :value="status" class="text-black">{{ status }}</option>
      </select>
    </div>
    
    <table class="todo-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col" :value="col">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in processedTodolist" :key="item.id">
          <td>{{ item.title }}</td>
          <td>{{ item.priority }}</td>
          <td>{{ item.status }}</td>
          <td>{{ item.due_date }}</td>
          <td>
            <button @click="updateItem(item.id)" class="btn edit-btn">编辑</button>
            <button @click="deleteItem(item.id)" class="btn delete-btn">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

.input-box {
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: none;
  color:black;
}

.select {
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  color:black;
}

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


.todo-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.todo-table th, 
.todo-table td {
  padding: 10px;
  text-align: center;
  border-right: 2px solid rgba(255, 255, 255, 0.3); /* 竖线分隔 */
}

.todo-table th:last-child, 
.todo-table td:last-child {
  border-right: none; /* 最后一列不加竖线 */
}

/* 透明灰色椭圆 */
.todo-table th {
  background-color: rgba(200, 200, 200, 0.2); 
  border-radius: 20px;
  padding: 8px 15px;
  font-weight: bold;
}

.completed {
  text-decoration: line-through;
  color: lightgray;
}


.progress-bar {
  margin: 0 10px;
}

.edit-btn {
  background-color: #4caf50;
}

.delete-btn {
  background-color: #f44336;
}

.error-message {
  color: #ff4444;
  margin-top: 5px;
  font-size: 20px;
  font-weight: bold;
}

.filters {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  color:rgb(9, 8, 8);
}
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
.priority-tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.priority-high { background-color: #ff4444; }
.priority-medium { background-color: #ffaa00; }
.priority-low { background-color: #44aa44; }
</style>
