import json
import asyncio
from typing import Any, Dict
from core.exceptions import BedrockAPIError
# 假設我們用 asyncio.to_thread 方式呼叫同步的 boto3 客戶端

class BedrockClient:
    def __init__(self, session, model_mapping: Dict[str, str]):
        self.session = session
        self.client = self.session.client("bedrock-runtime", region_name="us-east-1")
        self.model_mapping = model_mapping

    async def invoke_model(self, model_name: str, body: Dict[str, Any]) -> Dict[str, Any]:
        model_id = self.model_mapping[model_name]
        
        def sync_invoke():
            response = self.client.invoke_model(
                body=json.dumps(body),
                modelId=model_id
            )
            # response['body'] is a StreamingBody, need to read
            return json.loads(response.get('body').read())
        
        try:
            response_body = await asyncio.to_thread(sync_invoke)
            return response_body
        except Exception as e:
            raise BedrockAPIError(f"Bedrock API invocation failed: {e}")