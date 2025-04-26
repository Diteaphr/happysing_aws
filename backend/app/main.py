from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import mysql.connector
from mysql.connector import Error

from app.utils.bedrock_client import call_bedrock_prompt_refiner, call_bedrock_generate_image, save_feedback_to_dynamodb

app = FastAPI(title="Kaiyue Happysing AWS Platform API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在正式上線時建議換成限制的 domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 資料庫配置
DB_CONFIG = {
    "host": "database-coolermaster.cluster-cvi6i2agwesi.us-west-2.rds.amazonaws.com",
    "user": "admin",
    "password": "happysing",
    "port": 3306,
    "database": "s3images"
}

# ========= 原本的功能 =========

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
    result = call_bedrock_prompt_refiner(request.prompt)
    return RefinedPrompt(
        original_prompt=request.prompt,
        refined_prompt=result["refined_prompt"],
        keywords=result["keywords"]
    )

@app.post("/generate-image", response_model=ImageResponse)
async def generate_image(request: PromptRequest):
    image_urls = call_bedrock_generate_image(request.prompt)
    return ImageResponse(image_urls=image_urls)

@app.post("/submit-feedback")
async def submit_feedback(feedback: FeedbackRequest):
    result = save_feedback_to_dynamodb(feedback.dict())
    return result

# ========= 新增的功能：讀取 S3 Images from Aurora =========

@app.get("/api/get-images")
async def get_images():
    try:
        # 建立資料庫連線
        db = mysql.connector.connect(**DB_CONFIG)
        cursor = db.cursor(dictionary=True)
        
        # 執行查詢 - 直接從資料庫獲取圖片數據
        cursor.execute("""
            SELECT 
                id,
                image_url AS url,
                description,
                created_at,
                updated_at
            FROM images 
            ORDER BY created_at DESC
        """)
        results = cursor.fetchall()
        
        # 關閉連線
        cursor.close()
        db.close()

        if not results:
            return {"images": [], "message": "資料庫中沒有圖片"}
            
        # 處理結果，確保所有必要的字段都存在
        processed_results = []
        for img in results:
            processed_results.append({
                "id": img["id"],
                "url": img["url"],
                "description": img["description"] or "未命名圖片",
                "created_at": img["created_at"].isoformat() if img["created_at"] else None,
                "updated_at": img["updated_at"].isoformat() if img["updated_at"] else None
            })
            
        return {"images": processed_results}
        
    except Error as e:
        print(f"❌ 資料庫連線錯誤: {e}")
        raise HTTPException(status_code=500, detail="資料庫連線失敗")
    except Exception as e:
        print(f"❌ 讀取資料失敗: {e}")
        raise HTTPException(status_code=500, detail="讀取資料失敗")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
