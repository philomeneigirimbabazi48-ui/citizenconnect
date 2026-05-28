#!/bin/bash
echo "============================================"
echo "  CitizenConnect — Starting Project"
echo "============================================"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org"
  exit 1
fi

# Check MongoDB
if ! command -v mongod &> /dev/null; then
  echo "⚠️  MongoDB not detected locally."
  echo "   Make sure MongoDB is running, or update MONGODB_URI in backend/.env"
fi

echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

echo ""
echo "🌱 Seeding database with sample data..."
npm run seed

echo ""
echo "🚀 Starting backend server on http://localhost:5000 ..."
npm run dev &
BACKEND_PID=$!

sleep 2

echo ""
echo "🌐 Starting frontend on http://localhost:3000 ..."
cd ../frontend
npx serve public -p 3000 &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "  ✅ CitizenConnect is running!"
echo "  Open: http://localhost:3000"
echo ""
echo "  Demo accounts:"
echo "  Citizen: jean@citizenconnect.rw / citizen123"
echo "  Leader:  leader@citizenconnect.rw / leader123"
echo "============================================"
echo "  Press Ctrl+C to stop all servers"
echo ""

wait $BACKEND_PID $FRONTEND_PID
