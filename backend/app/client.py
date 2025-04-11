# client.py
from supabase import create_client, Client
from app.config import settings
from app.logger import setup_logger

logger = setup_logger(__name__)

# -----------Supabase 客户端初始化----------------
def get_supabase_client() -> Client:
    try:
        return create_client(
            supabase_url=settings.SUPABASE_URL,
            supabase_key=settings.SUPABASE_KEY
        )
    except Exception as e:
        logger.error(f"Supabase连接失败: {str(e)}")
        raise e

supabase = get_supabase_client()
