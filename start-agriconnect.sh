#!/bin/bash

# AgriConnect Full Stack Startup Script
# This script starts the entire application (frontend + backend + database + redis + mailhog)

echo "Starting AgriConnect Full Stack Application..."
echo "================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: docker-compose is not installed. Please install it first."
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping AgriConnect services..."
    docker-compose -f docker-compose.full.yml down
    echo "Services stopped. Goodbye!"
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup SIGINT

echo "Building and starting services..."
echo "This may take a few minutes on first run..."

# Start all services
docker-compose -f docker-compose.full.yml up --build

echo ""
echo "AgriConnect is now running!"
echo "================================================"
echo "Frontend (Next.js): http://localhost:3005"
echo "Backend API: http://localhost:3000"
echo "Database: localhost:3307"
echo "Redis: localhost:6379"
echo "MailHog: http://localhost:8025"
echo ""
echo "Press Ctrl+C to stop all services"
echo "================================================"
