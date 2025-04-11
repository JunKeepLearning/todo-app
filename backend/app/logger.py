# app/logger.py
import logging
import coloredlogs
from typing import Optional

def setup_logger(name: Optional[str] = None) -> logging.Logger:
    """配置并返回预定义格式的logger"""
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    if not logger.handlers:  # 避免重复添加handler
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    # 使日志支持颜色输出
    coloredlogs.install(level='INFO', logger=logger)
    
    return logger
