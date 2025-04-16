from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Cooler Master AI Design Platform API")

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
    # Mock implementation - in production, this would call AWS Bedrock
    keywords = ["現代風格", "鋁合金", "RGB燈效", "簡約設計"]
    refined = f"{request.prompt} - {' - '.join(keywords)}"
    
    return RefinedPrompt(
        original_prompt=request.prompt,
        refined_prompt=refined,
        keywords=keywords
    )

@app.post("/generate-image", response_model=ImageResponse)
async def generate_image(request: PromptRequest):
    # Mock implementation - in production, this would call AWS Bedrock
    mock_images = [
        "https://example.com/mock-images/design1.jpg",
        "https://example.com/mock-images/design2.jpg",
        "https://example.com/mock-images/design3.jpg"
    ]
    
    return ImageResponse(image_urls=mock_images)

@app.post("/submit-feedback")
async def submit_feedback(feedback: FeedbackRequest):
    # Mock implementation - in production, this would save to DynamoDB
    return {"status": "success", "message": "Feedback received"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 