# 用户登录注册的逻辑都放在前端
# 这里只是做接受token获取用户信息
from fastapi import HTTPException, Header
from jose import jwt, JWTError
from app.config import settings
from app.logger import setup_logger  # 导入自定义日志模块

# 初始化 logger
logger = setup_logger(__name__)

SUPABASE_JWT_SECRET = settings.SUPABASE_JWT_SECRET

def get_user_id_by_token(authorization: str = Header(...)) -> str:
    if not authorization:
        logger.warning("未收到 Authorization 头")
        raise HTTPException(status_code=400, detail="缺少 Authorization 头")

    logger.info("收到的 Authorization: %s", authorization)
    if isinstance(authorization, list):
        authorization = authorization[0]

    if not authorization.startswith("Bearer "):
        logger.warning("Authorization 头格式无效: %s", authorization)
        raise HTTPException(status_code=401, detail="无效的授权头")

    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            logger.warning("Token 中缺少用户信息: %s", token)
            raise HTTPException(status_code=401, detail="Token 中缺少用户信息")
        logger.info("成功解析 Token，用户 ID: %s", user_id)
        return user_id
    except JWTError as e:
        logger.error("Token 解码失败或无效: %s", str(e), exc_info=True)
        raise HTTPException(status_code=401, detail="Token 无效或过期")