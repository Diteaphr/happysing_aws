# AWS Bedrock Integration

This project demonstrates integration with AWS Bedrock for AI text and image generation services.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure AWS credentials:
   - Create a `.env` file in the `backend` directory (copy from the `.env.example` if available)
   - Add your AWS credentials and configuration:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here
   DYNAMODB_TABLE_NAME=UserFeedback
   BEDROCK_TEXT_MODEL=amazon.titan-text-lite-v1
   BEDROCK_IMAGE_MODEL=stability.stable-diffusion-xl-v1
   ```

3. Make sure your AWS account has:
   - Access to AWS Bedrock service
   - The specific models enabled in AWS Bedrock (Titan Text, Stable Diffusion XL, etc.)
   - A DynamoDB table named "UserFeedback" (or the name specified in your .env file)

## Testing AWS Bedrock Integration

Run the test script to verify AWS Bedrock connectivity:

```bash
# Test both prompt refinement and image generation
python test_bedrock.py

# Test only prompt refinement
python test_bedrock.py prompt

# Test only image generation
python test_bedrock.py image
```

## Running the API

Start the FastAPI server:

```bash
cd backend
uvicorn app.main:app --reload
```

## API Endpoints

- `POST /refine-prompt` - Refines a user prompt using AWS Bedrock's text generation
- `POST /generate-image` - Generates images based on a prompt using AWS Bedrock's image models
- `POST /submit-feedback` - Stores user feedback in DynamoDB

## Notes on Implementation

- This application uses AWS SDK (boto3) to interact with AWS services
- For production deployments, consider using IAM roles instead of access keys
- The image generation currently returns mock URLs - in production, you should upload the generated images to S3 and return those URLs 