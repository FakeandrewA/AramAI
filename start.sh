#!/bin/bash
set -e

echo "🚀 Starting backend with internal FastAPI..."

# === Start FastAPI (Python) in background ===
echo "🐍 Installing Python dependencies..."
pip install -r requirements.txt

echo "▶️ Starting FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port 8000 &

# === Start Node backend ===
echo "📦 Installing Node dependencies..."
cd backend
npm ci --omit=dev

echo "🚀 Starting Node backend..."
npm start
