#!/bin/bash

# AgriConnect Backend Deployment Script
# This script handles production deployment

set -e

# Configuration
APP_NAME="agriconnect-backend"
DEPLOY_DIR="/opt/agriconnect"
BACKUP_DIR="/opt/backups"
LOG_FILE="/var/log/agriconnect/deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
fi

# Create necessary directories
log "Creating deployment directories..."
sudo mkdir -p "$DEPLOY_DIR" "$BACKUP_DIR" "$(dirname "$LOG_FILE")"
sudo chown $USER:$USER "$DEPLOY_DIR" "$BACKUP_DIR" "$(dirname "$LOG_FILE")"

# Backup current deployment
if [ -d "$DEPLOY_DIR/current" ]; then
    log "Creating backup of current deployment..."
    BACKUP_NAME="backup-$(date +'%Y%m%d-%H%M%S')"
    cp -r "$DEPLOY_DIR/current" "$BACKUP_DIR/$BACKUP_NAME"
    log "Backup created: $BACKUP_NAME"
fi

# Build the application
log "Building application..."
npm run build:clean

# Create new deployment directory
DEPLOY_TIME=$(date +'%Y%m%d-%H%M%S')
NEW_DEPLOY_DIR="$DEPLOY_DIR/releases/$DEPLOY_TIME"
log "Creating new deployment directory: $NEW_DEPLOY_DIR"
mkdir -p "$NEW_DEPLOY_DIR"

# Copy application files
log "Copying application files..."
cp -r dist/* "$NEW_DEPLOY_DIR/"
cp package*.json "$NEW_DEPLOY_DIR/"
cp .env "$NEW_DEPLOY_DIR/"

# Install production dependencies
log "Installing production dependencies..."
cd "$NEW_DEPLOY_DIR"
npm ci --only=production

# Create uploads and logs directories
mkdir -p uploads logs

# Set proper permissions
log "Setting file permissions..."
chmod 755 "$NEW_DEPLOY_DIR"
chmod 644 "$NEW_DEPLOY_DIR"/*.js
chmod 755 "$NEW_DEPLOY_DIR/uploads"
chmod 755 "$NEW_DEPLOY_DIR/logs"

# Update current symlink
log "Updating current deployment symlink..."
cd "$DEPLOY_DIR"
ln -sfn "releases/$DEPLOY_TIME" current

# Restart the application
log "Restarting application..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "$APP_NAME"; then
        pm2 restart "$APP_NAME"
    else
        pm2 start "$NEW_DEPLOY_DIR/dist/src/server.js" --name "$APP_NAME"
    fi
    pm2 save
else
    warning "PM2 not found. Please restart the application manually."
fi

# Cleanup old deployments (keep last 5)
log "Cleaning up old deployments..."
cd "$DEPLOY_DIR/releases"
ls -t | tail -n +6 | xargs -r rm -rf

# Health check
log "Performing health check..."
sleep 5
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log "Deployment successful! Application is healthy."
else
    error "Deployment failed! Application is not responding."
fi

log "Deployment completed successfully!"
log "New deployment: $NEW_DEPLOY_DIR"
log "Current deployment: $DEPLOY_DIR/current"
