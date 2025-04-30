from fastapi import FastAPI,Request
from fastapi.middleware.cors import CORSMiddleware
# from backend.tests.auth import router as auth_router # 放在前端实现了
from app.todo import router as todo_router
import time
from app.logger import setup_logger

logger = setup_logger(__name__)
# 创建 FastAPI 应用实例
app = FastAPI()
# ----------------配置CORS中间件-------------
# 用于允许前端（如 React、Vue）跨域访问后端API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 只允许前端开发地址
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE","PATCH"],# 允许的方法
    allow_headers=["Authorization", "Content-Type"], # 允许的请求头
)

# ---------------- 路由注册 ----------------
# 导入并注册 auth 和 todo 模块的路由
# app.include_router(auth_router)
app.include_router(todo_router)

@app.get("/")
def read_root():
    return {"message": "this is todo list."}

# ---------------- 请求日志中间件 ----------------
# 拦截每一个 HTTP 请求，记录方法、路径、响应状态和耗时
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()  # 请求开始时间
    logger.info(f"Request: {request.method} {request.url}")  # 记录请求方法和 URL

    response = await call_next(request)  # 继续处理请求

    duration = time.time() - start_time  # 计算耗时
    logger.info(f"Response: {response.status_code} (Duration: {duration:.2f}s)")  # 记录状态码和耗时

    return response

# ---------------- 启动命令（终端运行） ----------------
# 激活虚拟环境：
# venv\Scripts\activate
# app运行：
# uvicorn app.main:app --reload
