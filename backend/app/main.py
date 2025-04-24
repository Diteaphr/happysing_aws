from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from app.utils.bedrock_client import call_bedrock_prompt_refiner, call_bedrock_generate_image, save_feedback_to_dynamodb

app = FastAPI(title="Kaiyue Happysing AWS Platform API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    product_type: str
    prompt: str

class RefinedPrompt(BaseModel):
    original_prompt: str
    refined_prompt: str
    keywords: List[str]

class ImageResponse(BaseModel):
    image_urls: List[str]

class FeedbackRequest(BaseModel):
    image_url: str
    rating: int
    tags: Optional[List[str]] = None
    comments: Optional[str] = None

@app.post("/refine-prompt", response_model=RefinedPrompt)
async def refine_prompt(request: PromptRequest):
    # Call AWS Bedrock to refine the prompt
    result = call_bedrock_prompt_refiner(request.prompt)
    
    return RefinedPrompt(
        original_prompt=request.prompt,
        refined_prompt=result["refined_prompt"],
        keywords=result["keywords"]
    )

@app.post("/generate-image", response_model=ImageResponse)
async def generate_image(request: PromptRequest):
    # Call AWS Bedrock to generate images
    image_urls = call_bedrock_generate_image(request.prompt)
    
    return ImageResponse(image_urls=image_urls)

@app.post("/submit-feedback")
async def submit_feedback(feedback: FeedbackRequest):
    # Save feedback to DynamoDB
    result = save_feedback_to_dynamodb(feedback.dict())
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 