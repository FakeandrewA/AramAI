#!/bin/bash
set -e

echo "🚀 Starting full stack setup for Render..."

# === Backend ===
echo "📦 Installing backend dependencies..."
cd backend
npm ci --omit=dev
echo "▶️ Starting backend server..."
npm start &  # background backend

# === Frontend ===
cd ..
echo "📦 Installing frontend dependencies..."
cd frontend
npm ci --omit=dev
echo "🏗️ Building frontend..."
npm run build
echo "🌐 Serving frontend..."
npx serve -s dist -l 3000 &

# === Python API (main app) ===
cd ..
echo "🐍 Starting Python API..."
uvicorn main:app --host 0.0.0.0 --port 8000
