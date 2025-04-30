# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
dfd

TodoPage.vue  （总页面）
├── ErrorMessage.vue （显示错误信息）
├── TodoInput.vue （新增待办）
├── TodoFilters.vue （筛选条件）
├── TodoList.vue  （待办列表）
│     ├── TodoItem.vue （单个待办项）

文件名	主要职责
TodoPage.vue	作为总控制器，负责加载数据，渲染页面，显示 Loading/Error
ErrorMessage.vue	单独显示错误提示，比如 "网络错误，请重试"
TodoInput.vue	负责新增/输入新的待办事项
TodoFilters.vue	负责筛选条件，比如按优先级/状态筛选
TodoList.vue	负责渲染一整个待办列表
TodoItem.vue	负责渲染单条待办 + 编辑、删除按钮

页面逻辑流程（生命周期）
1.TodoPage 加载时，调用 fetchTodos()
2.如果有错误，显示 ErrorMessage
3.正常情况下：
    上方是 TodoInput（新增待办）
    中间是 TodoFilters（筛选）
    下面是 TodoList
        TodoList 里每个待办项是 TodoItem
4.用户可以添加、删除、更新、筛选 todos

页面（TodoPage）是组装中心
组件（TodoList、TodoItem、TodoInput、TodoFilters、ErrorMessage）负责各自的单一功能
store（todo.js）集中管理数据
api（todo.js）集中管理请求