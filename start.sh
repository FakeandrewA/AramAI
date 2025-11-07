#!/bin/bash
set -e

echo "🚀 Starting full stack setup for Render..."

# === Backend ===
echo "📦 Installing backend dependencies..."
cd backend
npm install --omit=dev

echo "▶️ Starting backend server..."
npm start &  # run backend in background

# === Frontend ===
cd ..
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --include=dev  # Vite needs devDependencies like @vitejs/plugin-react

echo "🏗️ Building frontend..."
npm run build

echo "🌐 Serving frontend..."
npx serve -s dist -l 3000 &  # serve built frontend on port 3000

# === Python API (FastAPI) ===
cd ..
echo "🐍 Starting Python API..."
uvicorn main:app --host 0.0.0.0 --port 8000
