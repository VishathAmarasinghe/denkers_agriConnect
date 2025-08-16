#!/bin/bash

echo "🚀 Starting AgriConnect Database Initialization..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Run database initialization
echo "🗄️  Initializing database..."
node dist/scripts/init-db.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database initialization completed successfully!"
    echo ""
    echo "📋 What was created:"
    echo "   • Users table with admin users:"
    echo "     - Username: admin, Password: admin123"
    echo "     - Username: admin_user, Password: 123456"
    echo "   • Market items with categories (Grains, Vegetables, Fruits, etc.)"
    echo "   • Sample market prices for all items"
    echo "   • Warehouse categories and sample warehouses"
    echo "   • Field officers and soil collection centers"
    echo "   • Equipment categories and sample machines"
    echo "   • Locations table with Sri Lankan provinces and districts"
    echo ""
    echo "🚀 You can now start the server with: npm start"
else
    echo "❌ Database initialization failed. Please check the error messages above."
    exit 1
fi
