#!/bin/bash
set -e

echo "🚀 Starting full stack setup for Render..."

# === Backend ===
echo "📦 Installing backend dependencies..."
cd backend
npm ci --only=production
echo "🏗️ Building backend..."
npm run build || echo "No build script, skipping..."
echo "▶️ Starting backend server..."
npm start &  # or change to your backend start command

# === Frontend ===
cd ..
echo "📦 Installing frontend dependencies..."
cd frontend
npm ci --only=production
echo "🏗️ Building frontend..."
npm run build
echo "🌐 Serving frontend..."
npx serve -s dist -l 3000 &  # use 'build' or 'dist' depending on framework

# === Python API (main app) ===
cd ..
echo "🐍 Starting Python API..."
uvicorn main:app --host 0.0.0.0 --port 8000
