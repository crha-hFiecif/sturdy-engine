from typing import Dict, Any
import json
import os
from core.exceptions import BedrockAPIError, ImageProcessingError
from models.request_models import ExtractionRequest
from models.response_models import ExtractionResponse
from utils.image_utils import pil_image_to_base64
from core.logging_config import get_logger

class ExtractionService:
    def __init__(self, bedrock_client):
        self.bedrock_client = bedrock_client

    async def extract_information(self, 
                                  request_id: str,
                                  image,   # PIL Image
                                  req: ExtractionRequest) -> ExtractionResponse:
        logger = get_logger(request_id)
        try:
            # 準備請求目錄
            log_root = "logs"
            request_dir = os.path.join(log_root, request_id)
            if not os.path.exists(request_dir):
                os.makedirs(request_dir)
            
            image_path = os.path.join(request_dir, "input_image.jpg")
            image.save(image_path, format="JPEG")
            
            system_prompt_path = os.path.join(request_dir, "system_prompt.txt")
            user_prompt_path = os.path.join(request_dir, "user_prompt.txt")
            with open(system_prompt_path, "w", encoding="utf-8") as f:
                f.write(req.system_prompt if req.system_prompt else "")
            with open(user_prompt_path, "w", encoding="utf-8") as f:
                f.write(req.user_prompt)
            
            encoded_image = pil_image_to_base64(image)

            messages = [
                {
                    "role": 'user',
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": encoded_image
                            }
                        },
                        {
                            "type": "text",
                            "text": req.user_prompt
                        }
                    ]
                }
            ]

            body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": req.max_tokens,
                "messages": messages,
                "temperature": req.temperature,
                "top_p": req.top_p,
                "system": req.system_prompt or ""
            }

            response = await self.bedrock_client.invoke_model(req.model_name, body)
            # 回傳的 content 在 response['content'][0]['text']
            extracted_text = response['content'][0]['text']

            # 嘗試解析 JSON
            try:
                parsed_json = json.loads(extracted_text)
                extracted_response = ExtractionResponse(extracted_data=parsed_json)
                # return ExtractionResponse(extracted_data=parsed_json)
            except json.JSONDecodeError:
                extracted_response = ExtractionResponse(extracted_data={"extracted_text": extracted_text})
            
            response_path = os.path.join(request_dir, "response.json")
            with open(response_path, "w", encoding="utf-8") as f:
                json.dump(extracted_response.dict(), f, ensure_ascii=False, indent=4)
                
            logger.info(
                "Extraction complete. Request ID: %s, Data: %s",
                request_id,
                request_dir
            )    
            return extracted_response
            
        except BedrockAPIError as e:
            logger.error(f"Bedrock API error: {e}")
            return ExtractionResponse(error=str(e))
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return ExtractionResponse(error=str(e))