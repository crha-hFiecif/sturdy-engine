class BedrockAPIError(Exception):
    """呼叫 Bedrock API 時產生的錯誤"""
    pass

class ImageProcessingError(Exception):
    """處理圖片時發生的錯誤"""
    pass