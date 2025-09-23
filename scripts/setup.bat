@echo off
echo 🚀 Setting up RelaWand Application...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Docker is not installed. MongoDB will need to be installed manually.
)

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install

REM Install client dependencies
echo 📦 Installing client dependencies...
cd client
npm install

REM Install server dependencies
echo 📦 Installing server dependencies...
cd ..\server
npm install

REM Create environment file
echo ⚙️ Setting up environment configuration...
if not exist .env (
    copy .env.example .env
    echo ✅ Created .env file from template
) else (
    echo ⚠️ .env file already exists
)

cd ..

REM Start MongoDB if Docker is available
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 🐳 Starting MongoDB with Docker...
    docker-compose up -d mongodb
    echo ⏳ Waiting for MongoDB to be ready...
    timeout /t 10 /nobreak >nul
)

echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo 1. Update server/.env with your configuration
echo 2. Run 'npm run dev' to start both client and server
echo 3. Open http://localhost:3000 for the frontend
echo 4. API will be available at http://localhost:5000
echo.
echo 🔧 Useful commands:
echo   npm run dev          - Start both client and server in development mode
echo   npm run docker:up    - Start MongoDB and Redis with Docker
echo   npm run docker:down  - Stop Docker services
pause