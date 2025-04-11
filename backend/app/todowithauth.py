from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.client import supabase
from app.auth import get_current_user  # 引入认证方法

# 创建路由对象
router = APIRouter(tags=["todo"])

# ---------------- 数据模型 ----------------
class TodoModel(BaseModel):
    title: str
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None

# ---------------- 路由 ----------------

@router.get("/todos")
def get_todos(current_user=Depends(get_current_user)):
    """
    获取当前用户的所有待办事项
    """
    try:
        user_id = current_user.user.id
        response = supabase.table('todo_items').select('*').eq('user_id', user_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/todos")
def create_todo(todo: TodoModel, current_user=Depends(get_current_user)):
    """
    创建新的待办事项，绑定当前用户
    """
    try:
        new_todo = {
            "title": todo.title,
            "priority": todo.priority,
            "status": todo.status,
            "due_date": todo.due_date,
            "user_id": current_user.user.id  # 用户绑定
        }
        response = supabase.table('todo_items').insert(new_todo).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/todos/{todo_id}")
def update_todo(todo_id: int, todo: TodoModel, current_user=Depends(get_current_user)):
    """
    更新指定待办事项，前提是它属于当前用户
    """
    try:
        updates = todo.model_dump()
        response = supabase.table('todo_items').update(updates).eq('id', todo_id).eq('user_id', current_user.user.id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="该待办事项不存在或无权限修改")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, current_user=Depends(get_current_user)):
    """
    删除指定待办事项，仅当它属于当前用户时可执行
    """
    try:
        response = supabase.table('todo_items').delete().eq('id', todo_id).eq('user_id', current_user.user.id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="该待办事项不存在或无权限删除")
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 可选：用于调试查看当前用户数据（仅开发阶段使用）
if __name__ == "__main__":
    result = supabase.table('todo_items').select('*').execute()
    for item in result.data:
        for key, value in item.items():
            print(f"{key}: {value}")
        print("*" * 20)
    print("Done!")
