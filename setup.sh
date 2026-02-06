#!/bin/bash

# RoadRescue Frontend - Quick Setup Script
# This script automates the setup process

set -e  # Exit on any error

echo "🚗 RoadRescue Frontend - Quick Setup"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version 18+ is recommended. You have: $(node -v)"
fi

echo "✅ Node.js found: $(node -v)"
echo "✅ npm found: $(npm -v)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the project directory?"
    exit 1
fi

echo "📦 Installing dependencies..."
echo "This may take a few minutes..."
echo ""

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🎉 Setup Complete!"
    echo ""
    echo "📝 Next Steps:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Make sure your backend is running on http://localhost:8080"
    echo ""
    echo "2. Start the development server:"
    echo "   npm run dev"
    echo ""
    echo "3. Open your browser to:"
    echo "   http://localhost:3000"
    echo ""
    echo "4. Test the app:"
    echo "   - Register a new account"
    echo "   - Login with your credentials"
    echo "   - Create a breakdown request"
    echo "   - Become a mechanic"
    echo ""
    echo "📖 Documentation:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "   • README.md - Complete documentation"
    echo "   • QUICK_START.md - 5-minute guide"
    echo "   • FEATURES.md - Feature details"
    echo "   • PROJECT_SUMMARY.md - Overview"
    echo ""
    echo "🎨 Customization:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "   • Colors: Edit tailwind.config.js"
    echo "   • API URL: Edit vite.config.ts"
    echo "   • Environment: Copy .env.example to .env"
    echo ""
    echo "Happy coding! 🚀"
    echo ""
else
    echo ""
    echo "❌ Installation failed. Please check the error messages above."
    echo ""
    echo "Common fixes:"
    echo "  • Delete node_modules and package-lock.json, then try again"
    echo "  • Run: npm cache clean --force"
    echo "  • Check your internet connection"
    echo ""
    exit 1
fi
