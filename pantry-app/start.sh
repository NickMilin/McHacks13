#!/bin/bash
# PantryPal - Start Script
# Launches both frontend and backend servers

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_PATH="$(dirname "$SCRIPT_DIR")/.venv/bin/python"

echo -e "${GREEN}🍳 Starting PantryPal...${NC}"
echo ""

# Check if .env exists for backend
if [ ! -f "$SCRIPT_DIR/backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Warning: backend/.env not found. Copy .env.example and add your GUMLOOP API key.${NC}"
fi

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C and other termination signals
trap cleanup SIGINT SIGTERM

# Start Flask backend
echo -e "${GREEN}🚀 Starting Flask backend on http://localhost:5001${NC}"
cd "$SCRIPT_DIR/backend"
"$VENV_PATH" app.py &
BACKEND_PID=$!

# Give backend a moment to start
sleep 1

# Start React frontend
echo -e "${GREEN}🚀 Starting React frontend on http://localhost:5173${NC}"
cd "$SCRIPT_DIR"
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ Both servers are running!${NC}"
echo -e "   Frontend: ${YELLOW}http://localhost:5173${NC}"
echo -e "   Backend:  ${YELLOW}http://localhost:5001/api${NC}"
echo ""
echo -e "Press ${RED}Ctrl+C${NC} to stop both servers."
echo ""

# Wait for both processes
wait
