test('添加待办事项', () => {
    const todos = [];
    const newTodo = { id: 1, text: '学习测试案例' };
    todos.push(newTodo);
    expect(todos).toContainEqual(newTodo);
});

test('删除待办事项', () => {
    const todos = [{ id: 1, text: '学习测试案例' }];
    const todoIdToDelete = 1;
    const updatedTodos = todos.filter(todo => todo.id !== todoIdToDelete);
    expect(updatedTodos).toHaveLength(0);
});

test('显示待办事项', () => {
    const todos = [{ id: 1, text: '学习测试案例' }];
    expect(todos).toHaveLength(1);
    expect(todos[0].text).toBe('学习测试案例');
});