#!/usr/bin/env bash
# Quick Start Script for IoT Room Access Control System

set -e

echo "=========================================="
echo "IoT Room Access Control - Quick Start"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${BLUE}1. Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js${NC}"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Python 3 not found. Please install Python 3${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
echo -e "${GREEN}✓ Python $(python3 --version)${NC}"
echo ""

# Step 2: Install frontend dependencies
echo -e "${BLUE}2. Installing frontend dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

# Step 3: Install backend dependencies
echo -e "${BLUE}3. Installing backend dependencies...${NC}"
cd back
pip install -r requirements.txt
cd ..
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

# Step 4: Summary
echo "=========================================="
echo -e "${GREEN}✓ Installation Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}To run the application:${NC}"
echo ""
echo "Terminal 1 - Start Backend:"
echo -e "  ${YELLOW}cd back${NC}"
echo -e "  ${YELLOW}python app.py${NC}"
echo ""
echo "Terminal 2 - Start Frontend:"
echo -e "  ${YELLOW}npm run dev${NC}"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo -e "${BLUE}Default Users:${NC}"
echo "  • Admin (ID: 1)"
echo "  • John Doe (ID: 2)"
echo "  • Jane Smith (ID: 3)"
echo "  • Bob Johnson (ID: 4)"
echo ""
echo -e "${BLUE}For detailed setup, see FULLSTACK_SETUP.md${NC}"
echo "==========================================="
