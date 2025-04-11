from app.client import supabase as client
def test_create_todo():
    response = client.post('/todos', json={'title': 'Test Todo'})
    assert response.status_code == 201
    assert response.json['title'] == 'Test Todo'

def test_update_todo():
    response = client.post('/todos', json={'title': 'Test Todo'})
    todo_id = response.json['id']
    response = client.put(f'/todos/{todo_id}', json={'title': 'Updated Todo'})
    assert response.status_code == 200
    assert response.json['title'] == 'Updated Todo'

def test_delete_todo():
    response = client.post('/todos', json={'title': 'Test Todo'})
    todo_id = response.json['id']
    response = client.delete(f'/todos/{todo_id}')
    assert response.status_code == 204

def test_get_todo():
    response = client.post('/todos', json={'title': 'Test Todo'})
    todo_id = response.json['id']
    response = client.get(f'/todos/{todo_id}')
    assert response.status_code == 200
    assert response.json['title'] == 'Test Todo'