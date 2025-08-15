#!/bin/bash

# AgriConnect Backend Startup Script
# This script sets up the complete backend environment using Docker Compose

set -e

echo " Starting AgriConnect Backend..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo " Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo " Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Function to create SSL certificates if they don't exist
create_ssl_certificates() {
    if [ ! -d "./ssl" ]; then
        echo " Creating SSL certificates directory..."
        mkdir -p ssl
    fi
    
    if [ ! -f "./ssl/cert.pem" ] || [ ! -f "./ssl/key.pem" ]; then
        echo " Generating self-signed SSL certificates..."
        openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=AgriConnect/CN=localhost"
        echo " SSL certificates generated successfully!"
    else
        echo " SSL certificates already exist"
    fi
}

# Function to create necessary directories
create_directories() {
    echo " Creating necessary directories..."
    mkdir -p logs/nginx
    mkdir -p uploads
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    echo " Directories created successfully!"
}

# Function to check if .env file exists
check_env_file() {
    if [ ! -f ".env" ]; then
        echo "  No .env file found. Creating from example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            echo " .env file created from .env.example"
            echo "  Please update the .env file with your actual configuration values"
        else
            echo " No .env.example file found. Please create a .env file manually."
            exit 1
        fi
    else
        echo " .env file found"
    fi
}

# Function to start services
start_services() {
    local environment=${1:-production}
    
    if [ "$environment" = "development" ]; then
        echo " Starting development environment..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    else
        echo " Starting production environment..."
        docker-compose up -d
    fi
}

# Function to wait for services to be ready
wait_for_services() {
    echo " Waiting for services to be ready..."
    
    # Wait for MySQL
    echo " Waiting for MySQL..."
    until docker-compose exec -T mysql mysqladmin ping -h localhost -u agriconnect -psecure_password --silent; do
        sleep 2
    done
    echo " MySQL is ready!"
    
    # Wait for Redis
    echo " Waiting for Redis..."
    until docker-compose exec -T redis redis-cli ping; do
        sleep 2
    done
    echo " Redis is ready!"
    
    # Wait for App
    echo " Waiting for App..."
    until curl -f http://localhost:3000/health > /dev/null 2>&1; do
        sleep 2
    done
    echo " App is ready!"
}

# Function to show service status
show_status() {
    echo ""
    echo " Service Status:"
    echo "=================="
    docker-compose ps
    
    echo ""
    echo " Access URLs:"
    echo "==============="
    echo "Main App:          http://localhost:3000"
    echo "Nginx (HTTP):      http://localhost:80"
    echo "Nginx (HTTPS):     https://localhost:443"
    echo "phpMyAdmin:        http://localhost:8080"
    echo "Redis Commander:   http://localhost:8081"
    echo "MailHog:           http://localhost:8025"
    echo "Prometheus:        http://localhost:9090"
    echo "Grafana:           http://localhost:3001"
    
    echo ""
    echo " Default Credentials:"
    echo "======================="
    echo "MySQL:"
    echo "  - Host: localhost:3306"
    echo "  - User: agriconnect"
    echo "  - Password: secure_password"
    echo "  - Database: agriconnect"
    echo ""
    echo "Grafana:"
    echo "  - URL: http://localhost:3001"
    echo "  - Username: admin"
    echo "  - Password: admin"
}

# Main execution
main() {
    local environment=${1:-production}
    
    echo "🔧 Environment: $environment"
    
    # Create necessary directories and files
    create_directories
    create_ssl_certificates
    check_env_file
    
    # Start services
    start_services "$environment"
    
    # Wait for services to be ready
    wait_for_services
    
    # Show status
    show_status
    
    echo ""
    echo " AgriConnect Backend is now running!"
    echo ""
    echo " Useful Commands:"
    echo "==================="
    echo "View logs:          docker-compose logs -f"
    echo "Stop services:      docker-compose down"
    echo "Restart services:   docker-compose restart"
    echo "Update services:    docker-compose pull && docker-compose up -d"
    echo ""
}

# Parse command line arguments
case "${1:-}" in
    "dev"|"development")
        main "development"
        ;;
    "prod"|"production")
        main "production"
        ;;
    "help"|"--help"|"-h")
        echo "Usage: $0 [environment]"
        echo ""
        echo "Environments:"
        echo "  dev, development  - Start development environment"
        echo "  prod, production  - Start production environment (default)"
        echo "  help              - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                - Start production environment"
        echo "  $0 dev            - Start development environment"
        echo "  $0 production     - Start production environment"
        ;;
    *)
        main "production"
        ;;
esac
