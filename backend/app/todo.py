from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.client import supabase
from app.logger import setup_logger

logger = setup_logger(__name__)

# 初始化 FastAPI 路由器
router = APIRouter(tags=["todo"])

# -------------------- 数据模型定义 --------------------

class TodoModel(BaseModel):
    title: str
    priority: Optional[str] = None  # 例如 high / medium / low
    status: Optional[str] = None    # 例如 pending / completed
    due_date: Optional[str] = None  # ISO 格式的日期字符串

# -------------------- API 接口 --------------------

@router.get("/todos")
def get_todos():
    """
    获取所有待办事项
    """
    try:
        response = supabase.table("todo_items").select("*").execute()
        return {"todos": response.data}
    except Exception as e:
        logger.error(f"获取待办事项失败: {str(e)}")
        raise HTTPException(status_code=500, detail="无法获取待办事项")

@router.post("/todos")
def create_todo(todo: TodoModel):
    """
    创建新待办事项
    """
    try:
        new_todo = {
            "title": todo.title,
            "priority": todo.priority,
            "status": todo.status,
            "due_date": todo.due_date
        }
        response = supabase.table("todo_items").insert(new_todo).execute()
        return {"todo": response.data[0]}
    except Exception as e:
        logger.error(f"创建失败: {str(e)}")
        raise HTTPException(status_code=500, detail="创建待办事项失败")

@router.patch("/todos/{todo_id}")
def update_todo(todo_id: int, todo: TodoModel):
    """
    更新待办事项
    """
    try:
        updates = {k: v for k, v in todo.model_dump().items() if v is not None}
        if not updates:
            raise HTTPException(status_code=400, detail="无更新内容")

        response = supabase.table("todo_items").update(updates).eq("id", todo_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="未找到待办事项")
        return {"todo": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新失败: {str(e)}")
        raise HTTPException(status_code=500, detail="更新失败")

@router.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    """
    删除待办事项
    """
    try:
        response = supabase.table("todo_items").delete().eq("id", todo_id).execute()
        if response.data:
            return {"status": "success", "deleted": response.data[0]}
        else:
            raise HTTPException(status_code=404, detail="待办事项不存在")
    except Exception as e:
        logger.error(f"删除失败: {str(e)}")
        raise HTTPException(status_code=500, detail="删除失败")

# -------------------- 调试用 CLI --------------------

if __name__ == "__main__":
    # 本地运行查看数据
    result = supabase.table("todo_items").select("*").execute()
    for item in result.data:
        print("\n".join(f"{k}: {v}" for k, v in item.items()))
        print("-" * 30)
    print("✔ 所有待办事项读取完毕")
