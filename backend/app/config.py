from pydantic import AnyUrl, Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str = Field(..., env="SUPABASE_URL")
    SUPABASE_KEY: str = Field(..., min_length=20)
    DEBUG: bool = Field(False, env="DEBUG")
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # 忽略额外环境变量

settings = Settings()

'''
import os
from dotenv import load_dotenv

# 先加载 .env 文件
load_dotenv()

class Settings:
    def __init__(self):
        self.PROJECT_NAME = "todoList"
        self.SUPABASE_URL = os.getenv("SUPABASE_URL")
        self.SUPABASE_KEY = os.getenv("SUPABASE_KEY")
        self.DATABASE_URL = os.getenv("DATABASE_URL")
        self.DEBUG = os.getenv("DEBUG", "False").lower() == "true"
        # Fetch variables
        self.USER = os.getenv("user")
        self.PASSWORD = os.getenv("password")
        self.HOST = os.getenv("host")
        self.PORT = os.getenv("port")
        self.DBNAME = os.getenv("dbname")
        
settings = Settings()

if __name__ == "__main__":
    print(settings.SUPABASE_URL)
    print(settings.SUPABASE_KEY)
    print(settings.DATABASE_URL)
    print(settings.DEBUG)
    print(settings.PROJECT_NAME)
'''