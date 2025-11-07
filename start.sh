#!/bin/bash

# Exit immediately if a command fails
set -e

echo "🚀 Starting full stack setup..."

# === Backend ===
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo "▶️ Starting backend server..."
npm run dev &  # Run in background

# === Frontend ===
cd ..
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
echo "▶️ Starting frontend server..."
npm run dev &  # Run in background

# === Root (Python API) ===
cd ..
echo "🐍 Starting Python API with Uvicorn..."
uvicorn main:app --host 0.0.0.0 --port 8000
