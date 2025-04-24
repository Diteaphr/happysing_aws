import os
import sys
from dotenv import load_dotenv

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our Bedrock client functions
from app.utils.bedrock_client import call_bedrock_prompt_refiner, call_bedrock_generate_image

# Load environment variables
load_dotenv()

def test_prompt_refiner():
    """Test the prompt refiner functionality"""
    test_prompt = "設計一款現代風格的電腦機殼，注重散熱和實用性"
    print(f"Testing prompt refiner with: '{test_prompt}'")
    
    try:
        result = call_bedrock_prompt_refiner(test_prompt)
        print("Refined prompt:", result["refined_prompt"])
        print("Keywords:", result["keywords"])
        print("Success!")
    except Exception as e:
        print(f"Error occurred: {str(e)}")

def test_image_generator():
    """Test the image generator functionality"""
    test_prompt = "futuristic computer case with RGB lighting and minimal design"
    print(f"Testing image generator with: '{test_prompt}'")
    
    try:
        result = call_bedrock_generate_image(test_prompt)
        print("Generated image URLs:", result)
        print("Success!")
    except Exception as e:
        print(f"Error occurred: {str(e)}")

if __name__ == "__main__":
    # Check if we should test prompt refiner, image generator, or both
    if len(sys.argv) > 1:
        if sys.argv[1] == "prompt":
            test_prompt_refiner()
        elif sys.argv[1] == "image":
            test_image_generator()
        else:
            print("Invalid argument. Use 'prompt' or 'image'")
    else:
        print("Testing both components:")
        print("=" * 50)
        test_prompt_refiner()
        print("=" * 50)
        test_image_generator() 