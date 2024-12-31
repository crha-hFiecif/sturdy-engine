import logging
from typing import Optional

def get_logger(request_id: Optional[str] = None) -> logging.Logger:
    logger = logging.getLogger("app_logger")
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter('[%(asctime)s] %(levelname)s [%(name)s] [request_id=%(request_id)s] %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.DEBUG)
    # 使用 LoggerAdapter 增加 request_id
    return logging.LoggerAdapter(logger, {'request_id': request_id or 'N/A'})