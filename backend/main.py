import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "src")))

from fastapi import FastAPI, HTTPException, File, UploadFile, Depends, Form
from core.exceptions import BedrockAPIError
from models.request_models import ExtractionRequest
from models.response_models import ExtractionResponse
from utils.uuid_utils import generate_request_id  # Assuming this generates request IDs
from PIL import Image, UnidentifiedImageError
from io import BytesIO
from contextlib import asynccontextmanager
from core.logging_config import get_logger
from services.extract_service import ExtractionService
from services.bedrock_client import BedrockClient  # Assuming this is the API client
import boto3
import aiohttp
from fastapi.middleware.cors import CORSMiddleware 
#
# Create FastAPI app
@asynccontextmanager
async def lifespan(app: FastAPI):
    global bedrock_client, extraction_service
    """
    Asynchronously initialize the BedrockClient.
    """
    session = boto3.Session(profile_name="default")
    model_mapping = {
        "Claude 3 Haiku": "anthropic.claude-3-haiku-20240307-v1:0",
        "Claude 3.5 Sonnet": "anthropic.claude-3-5-sonnet-20240620-v1:0"
    }
    bedrock_client =BedrockClient(session, model_mapping)
    
    extraction_service = ExtractionService(bedrock_client)
    
    print("Startup: BedrockClient and ExtractionService initialized")
    yield
    print("Shutdown: Cleaning up resources if needed")
    
app = FastAPI(lifespan=lifespan)

# Declare global variables
bedrock_client = None
extraction_service = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


# Initialize Bedrock client and ExtractionService
# # Ensure BedrockClient is correctly initialized

# @app.on_event("startup")
# async def startup_event():
#     """
#     Initialize BedrockClient and ExtractionService during app startup.
#     """
#     global bedrock_client, extraction_service
    
#     # Initialize BedrockClient
#     bedrock_client = await init_bedrock_client()
    
#     # Initialize ExtractionService
#     extraction_service = ExtractionService(bedrock_client)


@app.post("/api/extract", response_model=ExtractionResponse)
async def extract_information(
    image: UploadFile = File(...),  # Expecting image file from the user
    model_name: str = Form(...),
    max_tokens: int = Form(...),
    temperature: float = Form(...),
    top_p: float = Form(...),
    user_prompt: str = Form(...)
    # req: ExtractionRequest = Depends()  # Extract request details from body
):
    """
    FastAPI endpoint to process an extraction request.
    """
    logger = get_logger("api-extract")
    
    # if extraction_service is None:
    #     raise HTTPException(status_code=500, detail="Extraction service not initialized")
    
    try:
        # Generate a unique request ID
        request_id = generate_request_id()
        logger.info(f"Processing request with ID: {request_id}")

        # Load and process the uploaded image
        image_data = await image.read()
        logger.info(f"Received image of size: {len(image_data)} bytes")
        
        try:
            pil_image = Image.open(BytesIO(image_data))
            logger.info(f"Image format: {pil_image.format}")
        except UnidentifiedImageError:
            logger.error("Unsupported or invalid image format.")
            raise HTTPException(status_code=400, detail="Invalid or unsupported image format")

        # Handle RGBA or palette-based images
        if pil_image.mode in ("RGBA", "P"):
            pil_image = pil_image.convert("RGB")
            logger.info("Converted image to RGB mode for processing.")

        # Save the image in logs for debugging
        image_format = pil_image.format or "JPEG"  # Default to JPEG if unknown
        image_save_path = f"logs/{request_id}/input_image.{image_format.lower()}"
        os.makedirs(os.path.dirname(image_save_path), exist_ok=True)
        pil_image.save(image_save_path, format=image_format)
        logger.info(f"Image saved at: {image_save_path}")

        # Construct the request object
        req = ExtractionRequest(
            model_name=model_name,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            user_prompt=user_prompt,
        )
        
        
        # Call the extraction service
        response = await extraction_service.extract_information(request_id, pil_image, req)

        if response.error:
            raise HTTPException(status_code=400, detail=response.error)

        logger.info(f"Returning response:{response}")
        return {"extracted_data": response.extracted_data, "error": None}

    except BedrockAPIError as e:
        logger.error(f"Bedrock API error: {e}")
        raise HTTPException(status_code=500, detail=f"Bedrock API error: {e}")

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")