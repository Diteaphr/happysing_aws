#!/bin/bash

echo "Setting up Cooler Master AI Design Platform..."

# Create necessary directories
mkdir -p frontend/public/mock-images
mkdir -p backend/app/routes

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create Python virtual environment and install backend dependencies
echo "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Create mock images directory
echo "Creating mock images directory..."
mkdir -p frontend/public/mock-images

echo "Setup complete! To start the development servers:"
echo "1. Start the backend server:"
echo "   cd backend && uvicorn app.main:app --reload"
echo "2. Start the frontend development server:"
echo "   cd frontend && npm start" 