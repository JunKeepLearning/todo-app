from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from app.client import supabase
from app.logger import setup_logger
from datetime import datetime
logger = setup_logger(__name__)

# 初始化 FastAPI 路由器
router = APIRouter(tags=["todo"])

# -------------------- 数据模型定义 --------------------
class TodoModel(BaseModel):
    title: str
    priority: Optional[str] = None  # 例如 high / medium / low
    status: Optional[str] = None    # 例如 pending / completed
    due_date: Optional[datetime] = None  # ISO 格式的日期字符串

# ------------ 参数管理 --------------------------
# True: 用户可以看所有人的数据, False: 用户只能看自己的数据
ALLOW_ALL_USERS = True  
# 根据ALLOW_ALL_USERS去确认是否需要user_id
def get_user_id_header():
    return Header(None) if ALLOW_ALL_USERS else Header(...)

# -------------------- API 接口 --------------------
# 获取所有todo
@router.get("/todos")
def get_todos(user_id: str = get_user_id_header()):
    """
    获取待办事项，根据配置决定是否筛选用户
    """
    try:
        query = supabase.table("todo_items").select("*")
        if not ALLOW_ALL_USERS:
            query = query.eq("user_id", user_id)
        response = query.execute()
        return {"todos": response.data}
    except Exception as e:
        logger.error(f"获取待办事项失败: {str(e)}")
        raise HTTPException(status_code=500, detail="无法获取待办事项")
# 新增todo
@router.post("/todos")
def create_todo(todo: TodoModel, user_id: str = get_user_id_header()):
    """
    创建待办事项，始终关联到用户
    """
    try:
        new_todo = {
            "title": todo.title,
            "priority": todo.priority,
            "status": todo.status,
            "due_date": todo.due_date.isoformat() if todo.due_date else None,
            "user_id": user_id if not ALLOW_ALL_USERS else None
        }
        response = supabase.table("todo_items").insert(new_todo).execute()
        return {"todo": response.data[0]}
    except Exception as e:
        logger.error(f"创建失败: {str(e)}")
        raise HTTPException(status_code=500, detail="创建待办事项失败")
# 更新todo
@router.patch("/todos/{todo_id}")
def update_todo(todo_id: int, todo: TodoModel, user_id: str = get_user_id_header()):
    """
    更新待办事项，根据配置决定是否筛选用户
    """
    try:
        updates = {k: v for k, v in todo.model_dump().items() if v is not None}
        if not updates:
            raise HTTPException(status_code=400, detail="无更新内容")

        query = supabase.table("todo_items").update(updates).eq("id", todo_id)
        if not ALLOW_ALL_USERS:
            query = query.eq("user_id", user_id)
        response = query.execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="未找到待办事项")
        return {"todo": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新失败: {str(e)}")
        raise HTTPException(status_code=500, detail="更新失败")
# 删除todo
@router.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, user_id: str = get_user_id_header()):
    """
    删除待办事项，根据配置决定是否筛选用户
    """
    try:
        query = supabase.table("todo_items").delete().eq("id", todo_id)
        if not ALLOW_ALL_USERS:
            query = query.eq("user_id", user_id)
        response = query.execute()

        if response.data:
            return {"status": "success", "deleted": response.data[0]}
        else:
            raise HTTPException(status_code=404, detail="待办事项不存在")
    except Exception as e:
        logger.error(f"删除失败: {str(e)}")
        raise HTTPException(status_code=500, detail="删除失败")
# 同步todo
@router.post("/todos/batch")
def sync_todos(todos: list[TodoModel], user_id: str = get_user_id_header()):
    """
    批量同步待办事项，始终关联到用户
    """
    try:
        results = []
        for todo in todos:
            new_todo = {
                "title": todo.title,
                "priority": todo.priority,
                "status": todo.status,
                "due_date": todo.due_date.isoformat() if todo.due_date else None,
                "user_id": user_id if not ALLOW_ALL_USERS else None
            }
            response = supabase.table("todo_items").upsert(new_todo).execute()
            results.append(response.data)

        logger.info(f"批量同步成功: {len(results)} 条待办事项")
        return {"status": "success", "synced": len(results)}
    except Exception as e:
        logger.error(f"批量同步失败: {str(e)}")
        raise HTTPException(status_code=500, detail="批量同步失败")
