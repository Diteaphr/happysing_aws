# Cooler Master AI Design Platform

A collaborative design platform that combines Cooler Master's design DNA with AWS generative AI capabilities to enhance product design workflows.

## Project Structure

```
happysing_aws/
├── frontend/              # React + TypeScript frontend
│   ├── public/            # Static assets
│   │   ├── pages/        # Main application pages
│   │   ├── components/   # Reusable UI components
│   │   └── App.tsx       # Main application entry
│   └── package.json      # Frontend dependencies
│
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── main.py       # FastAPI application entry
│   │   └── routes/       # API endpoints
│   └── requirements.txt  # Python dependencies
│
└── README.md             # Project documentation
```

## Features

- Product Type Selection
- AI-Powered Prompt Refinement
- Image Generation with AWS Bedrock
- Design Feedback and Iteration
- Knowledge Base Integration
- Design DNA Preservation

## Setup Instructions

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## API Endpoints

- `POST /refine-prompt`: Optimize design prompts
- `POST /generate-image`: Generate design images
- `POST /submit-feedback`: Submit design feedback

## Development Roadmap

1. Basic UI Implementation
2. Mock API Integration
3. AWS Services Integration
4. Knowledge Base Development
5. Design DNA Integration
6. Production Deployment