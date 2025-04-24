import boto3
import json
import os
from typing import Dict, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get configuration from environment variables
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
DYNAMODB_TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "UserFeedback")
BEDROCK_TEXT_MODEL = os.getenv("BEDROCK_TEXT_MODEL", "amazon.titan-text-lite-v1")
BEDROCK_IMAGE_MODEL = os.getenv("BEDROCK_IMAGE_MODEL", "stability.stable-diffusion-xl-v1")

# Create Bedrock client
bedrock_runtime = boto3.client("bedrock-runtime", region_name=AWS_REGION)

def call_bedrock_prompt_refiner(prompt: str) -> Dict:
    """
    Call AWS Bedrock to refine a prompt using the configured text model
    """
    body = {
        "inputText": prompt,
        "textGenerationConfig": {
            "temperature": 0.7,
            "maxTokenCount": 300,
            "stopSequences": [],
            "topP": 0.9
        }
    }

    response = bedrock_runtime.invoke_model(
        body=json.dumps(body),
        modelId=BEDROCK_TEXT_MODEL,
        contentType="application/json",
        accept="application/json"
    )

    result = json.loads(response["body"].read().decode())
    generated_text = result.get("results", [{}])[0].get("outputText", "")
    
    # Extract keywords from generated text (placeholder logic)
    keywords = ["RGB燈效", "極簡風格"] if "RGB" in generated_text else ["高效散熱", "現代風格"]
    
    return {
        "refined_prompt": generated_text,
        "keywords": keywords
    }

def call_bedrock_generate_image(prompt: str) -> List[str]:
    """
    Call AWS Bedrock to generate images using the configured image model
    """
    body = {
        "text_prompts": [{"text": prompt}],
        "cfg_scale": 10,
        "seed": 0,
        "steps": 50
    }

    response = bedrock_runtime.invoke_model(
        body=json.dumps(body),
        modelId=BEDROCK_IMAGE_MODEL,
        contentType="application/json",
        accept="application/json"
    )

    result = json.loads(response["body"].read().decode())
    
    # In a real implementation, you would:
    # 1. Extract the image data (base64)
    # 2. Convert to image if needed
    # 3. Upload to S3
    # 4. Return S3 URLs
    
    # Mock S3 URLs for now
    return [
        "https://your-s3-bucket/design1.jpg",
        "https://your-s3-bucket/design2.jpg"
    ]

# For DynamoDB integration
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
feedback_table = dynamodb.Table(DYNAMODB_TABLE_NAME)

def save_feedback_to_dynamodb(feedback_data: Dict) -> Dict:
    """
    Save user feedback to DynamoDB
    """
    feedback_table.put_item(Item=feedback_data)
    return {"status": "success", "message": "Feedback saved to DynamoDB"} 