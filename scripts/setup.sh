#!/bin/bash

echo "🚀 Setting up RelaWand Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️ Docker is not installed. MongoDB will need to be installed manually."
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd ../server && npm install

# Create environment file
echo "⚙️ Setting up environment configuration..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
else
    echo "⚠️ .env file already exists"
fi

cd ..

# Start MongoDB if Docker is available
if command -v docker &> /dev/null; then
    echo "🐳 Starting MongoDB with Docker..."
    docker-compose up -d mongodb
    echo "⏳ Waiting for MongoDB to be ready..."
    sleep 10
fi

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update server/.env with your configuration"
echo "2. Run 'npm run dev' to start both client and server"
echo "3. Open http://localhost:3000 for the frontend"
echo "4. API will be available at http://localhost:5000"
echo ""
echo "🔧 Useful commands:"
echo "  npm run dev          - Start both client and server in development mode"
echo "  npm run docker:up    - Start MongoDB and Redis with Docker"
echo "  npm run docker:down  - Stop Docker services"