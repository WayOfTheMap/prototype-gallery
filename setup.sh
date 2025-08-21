#!/bin/bash

echo "🎨 Prototype Gallery System - Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check for Node.js
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found: $(npm --version)${NC}"

echo ""
echo "Installing dependencies..."

# Install root dependencies if package.json exists
if [ -f "package.json" ]; then
    npm install
else
    echo -e "${YELLOW}No root package.json found, skipping...${NC}"
fi

# Install prototype-manager dependencies
echo "Installing prototype-manager dependencies..."
cd prototype-manager
npm install
cd ..

# Install Vercel CLI globally
echo ""
echo "Installing Vercel CLI globally..."
npm install -g vercel

# Check if Vercel CLI was installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI installation failed${NC}"
    echo "Try running: sudo npm install -g vercel"
    exit 1
fi
echo -e "${GREEN}✓ Vercel CLI installed${NC}"

# Create necessary directories
echo ""
echo "Creating directory structure..."
mkdir -p prototypes
mkdir -p gallery
echo -e "${GREEN}✓ Directories created${NC}"

# Make scripts executable
echo ""
echo "Making scripts executable..."
chmod +x deploy-prototype.sh 2>/dev/null || true
chmod +x new-prototype.sh 2>/dev/null || true
chmod +x new-prototype-in-folder.sh 2>/dev/null || true
chmod +x setup.sh 2>/dev/null || true
echo -e "${GREEN}✓ Scripts are executable${NC}"

# Check Vercel login status
echo ""
echo "Checking Vercel authentication..."
if vercel whoami &> /dev/null; then
    echo -e "${GREEN}✓ Already logged in to Vercel as: $(vercel whoami)${NC}"
else
    echo -e "${YELLOW}You need to login to Vercel${NC}"
    echo "This will open your browser for authentication."
    read -p "Press Enter to continue with Vercel login..."
    vercel login
fi

echo ""
echo "===================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Create your first prototype:"
echo "   ./new-prototype.sh my-feature my-prototype"
echo ""
echo "2. Deploy everything:"
echo "   npm run deploy-prototypes"
echo ""
echo "3. After first deployment, you'll get your gallery URL"
echo "   Bookmark it - it will stay consistent!"
echo ""
echo "Happy prototyping! 🚀"