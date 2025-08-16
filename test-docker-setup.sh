#!/bin/bash

# Test script for AgriConnect Docker setup
# This script tests if all services are running correctly

echo "Testing AgriConnect Docker Setup..."
echo "=================================="

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

# Function to test service health
test_service() {
    local service_name=$1
    local port=$2
    local endpoint=$3
    local max_attempts=30
    local attempt=1
    
    echo "Testing $service_name on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port$endpoint" > /dev/null 2>&1; then
            echo "  ✓ $service_name is running and healthy"
            return 0
        fi
        
        echo "  Attempt $attempt/$max_attempts: $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "  ✗ $service_name failed to start after $max_attempts attempts"
    return 1
}

# Check if services are running
echo ""
echo "Checking service status..."
docker-compose -f docker-compose.full.yml ps

echo ""
echo "Testing service connectivity..."

# Test backend health endpoint
if test_service "Backend" "3000" "/health"; then
    echo "  Backend API is accessible"
else
    echo "  Backend API is not accessible"
fi

# Test frontend
if test_service "Frontend" "3005" ""; then
    echo "  Frontend is accessible"
else
    echo "  Frontend is not accessible"
fi

# Test MySQL connection
echo "Testing MySQL connection..."
if docker exec $(docker-compose -f docker-compose.full.yml ps -q mysql) mysqladmin ping -h localhost > /dev/null 2>&1; then
    echo "  ✓ MySQL is running and accessible"
else
    echo "  ✗ MySQL is not accessible"
fi

# Test Redis connection
echo "Testing Redis connection..."
if docker exec $(docker-compose -f docker-compose.full.yml ps -q redis) redis-cli ping > /dev/null 2>&1; then
    echo "  ✓ Redis is running and accessible"
else
    echo "  ✗ Redis is not accessible"
fi

# Test MailHog
if test_service "MailHog" "8025" ""; then
    echo "  ✓ MailHog is accessible"
else
    echo "  ✗ MailHog is not accessible"
fi

echo ""
echo "=================================="
echo "Test completed!"
echo ""
echo "If all services show ✓, your setup is working correctly!"
echo "Access your applications at:"
echo "  Frontend: http://localhost:3005"
echo "  Backend: http://localhost:3000"
echo "  MailHog: http://localhost:8025"
echo "  Database: localhost:3307"
