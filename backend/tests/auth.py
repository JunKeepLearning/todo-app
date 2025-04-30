from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.client import supabase
from app.logger import setup_logger # 日志模块

router = APIRouter(prefix="/auth", tags=["认证"])
# 使用新的日志配置
logger = setup_logger(__name__)
# -------------------- 数据模型 --------------------

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    username: Optional[str] = None  # 目前未使用，保留字段

class UserLogin(UserBase):
    password: str

# -------------------- 注册接口 --------------------

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """
    注册新用户 Supabase Auth 
    """
    try:
        auth_response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
        })
        logger.info(f"注册成功: {user.email}")
        return {
            "message": "注册成功",
            "user": auth_response.user
        }
    except Exception as e:
        logger.error(f"注册失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# -------------------- 登录接口 --------------------

@router.post("/login", response_model=dict)
async def login(user: UserLogin):
    """
    用户登录（返回 access_token 和用户信息）
    """
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        logger.info(f"登录成功: {user.email}")
        return {
            "message": "登录成功",
            "access_token": auth_response.session.access_token,
            "token_type": "bearer",
            "user": auth_response.user
        }
    except Exception as e:
        logger.warning(f"登录失败: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误"
        )

# -------------------- 获取当前用户 --------------------

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    依赖注入：从 token 获取当前用户信息
    """
    try:
        token = credentials.credentials
        user = supabase.auth.get_user(token)
        return user
    except Exception as e:
        logger.warning("Token 无效或用户验证失败")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据"
        )

# ---------------- 用户信息 -------------------
@router.get("/me", response_model=dict)
async def get_user_info(current_user=Depends(get_current_user)):
    """
    获取当前登录用户信息
    """
    try:
        return {
            "user": current_user.user
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# -------------------- 登出接口 --------------------

@router.post("/logout")
async def logout(current_user=Depends(get_current_user)):
    """
    用户退出登录,清除 session
    """
    try:
        supabase.auth.sign_out()
        logger.info("用户登出成功")
        return {"message": "退出成功"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# -------------------- 刷新 Token --------------------

@router.post("/refresh-token")
async def refresh_token(current_user=Depends(get_current_user)):
    """
    刷新用户 session 获取新的 access_token
    """
    try:
        auth_response = supabase.auth.refresh_session()
        logger.info("刷新 Token 成功")
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# -------------------- 单元测试：手动注册 --------------------

if __name__ == "__main__":
    try:
        response = supabase.auth.sign_up({
            "email": "workforvpn@163.com",
            "password": "cnmbgcd1234",
        })
        print("注册成功:", response)
    except Exception as e:
        print(f"注册失败: {str(e)}")
        if hasattr(e, 'response') and hasattr(e.response, 'json'):
            print(f"详细错误: {e.response.json()}")
