#!/bin/bash

# Blubb Development Startup Script
echo "🚀 Starting Blubb development environment..."

# Check if we're in the right directory
if [ ! -d "client" ] || [ ! -d "signaling-server" ]; then
    echo "❌ Error: Please run this script from the blubb project root directory"
    echo "   Expected structure:"
    echo "   blubb/"
    echo "   ├── client/"
    echo "   ├── signaling-server/"
    echo "   └── start-dev.sh"
    exit 1
fi

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $SIGNALING_PID $CLIENT_PID 2>/dev/null
    wait
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start signaling server
echo "📡 Starting signaling server..."
cd signaling-server

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing signaling server dependencies..."
    npm install
fi

# Start the signaling server in background
npm start &
SIGNALING_PID=$!

# Wait a moment for server to start
sleep 2

# Check if signaling server started successfully
if ! kill -0 $SIGNALING_PID 2>/dev/null; then
    echo "❌ Failed to start signaling server"
    exit 1
fi

echo "✅ Signaling server started (PID: $SIGNALING_PID)"

# Start Next.js client
echo "🌐 Starting Next.js client..."
cd ../client

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing client dependencies..."
    npm install
fi

# Start the client in background
npm run dev &
CLIENT_PID=$!

# Wait a moment for client to start
sleep 3

# Check if client started successfully
if ! kill -0 $CLIENT_PID 2>/dev/null; then
    echo "❌ Failed to start Next.js client"
    kill $SIGNALING_PID 2>/dev/null
    exit 1
fi

echo "✅ Next.js client started (PID: $CLIENT_PID)"
echo ""
echo "🎉 Blubb is ready!"
echo "   📱 Client: http://localhost:3000"
echo "   📡 Signaling server: http://localhost:5000"
echo "   📊 Health check: http://localhost:5000/health"
echo ""
echo "💡 To test audio:"
echo "   1. Open http://localhost:3000 in two browser windows"
echo "   2. Join the same room in both windows"
echo "   3. Allow microphone access when prompted"
echo "   4. Use the microphone button to unmute and talk"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes to finish
wait 