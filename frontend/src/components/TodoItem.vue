<template>
  <tr>
    <td class="px-4 py-2">{{ item.title }}</td>
    <td class="px-4 py-2">{{ item.priority }}</td>
    <td class="px-4 py-2">{{ item.status }}</td>
    <td class="px-4 py-2">{{ item.due_date }}</td>
    <td class="px-4 py-2 space-x-2">
      <button
        @click="$emit('update', item.id)"
        class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        编辑
      </button>
      <button
        @click="$emit('delete', item.id)"
        class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        删除
      </button>
    </td>
  </tr>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
      validator(value) {
        return ['id', 'title', 'priority', 'status', 'due_date'].every(k => k in value);
      },
    },
  },
};
</script>
