# AgriConnect Backend - Docker Compose Setup

This guide will help you set up and run the complete AgriConnect backend using Docker Compose.

##  Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose installed
- Git (for cloning the repository)

### 1. Start the Complete Backend
```bash
# Make the startup script executable
chmod +x start-with-auto-init.sh

# Start production environment
./start-with-auto-init.sh

# Or start development environment
./start-with-auto-init.sh dev
```

### 2. Access Your Services
Once everything is running, you can access:

- **Main App**: http://localhost:3000
- **Nginx (HTTP)**: http://localhost:80
- **Nginx (HTTPS)**: https://localhost:443
- **phpMyAdmin**: http://localhost:8080
- **Redis Commander**: http://localhost:8081
- **MailHog**: http://localhost:8025
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001

##  Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx (80/443)│    │   Main App      │    │   MySQL (3306)  │
│   (Reverse Proxy)│◄──►│   (Node.js)     │◄──►│   (Database)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Redis (6379)  │    │   Prometheus    │    │   Grafana       │
│   (Cache/Session)│    │   (Monitoring)  │    │   (Dashboard)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Services Included

### Core Services
- **App**: Node.js backend application
- **MySQL**: Primary database
- **Redis**: Caching and session storage
- **Nginx**: Reverse proxy with SSL termination

### Development Tools
- **MailHog**: Email testing service
- **phpMyAdmin**: Database management interface
- **Redis Commander**: Redis management interface

### Monitoring (Production)
- **Prometheus**: Metrics collection
- **Grafana**: Data visualization and dashboards

## 📁 File Structure

```
backend/
├── docker-compose.yml          # Main production compose file
├── docker-compose.dev.yml      # Development overrides
├── Dockerfile                  # Multi-stage Docker build
├── nginx.conf                  # Nginx configuration
├── start-with-auto-init.sh     # Startup script
├── env.example                 # Environment variables template
├── monitoring/                 # Monitoring configurations
│   ├── prometheus.yml         # Prometheus config
│   └── grafana/               # Grafana dashboards
├── ssl/                       # SSL certificates (auto-generated)
├── logs/                      # Application logs
└── uploads/                   # File uploads
```

## 🌍 Environment Configuration

### 1. Copy Environment Template
```bash
cp env.example .env
```

### 2. Update Configuration
Edit `.env` file with your actual values:
```bash
# Database
DB_PASSWORD=your_secure_password
DB_NAME=agriconnect

# JWT
JWT_SECRET=your_super_secret_key

# External APIs
GOOGLE_MAPS_API_KEY=your_google_api_key
WEATHER_API_KEY=your_weather_api_key
```

## 🚀 Running Different Environments

### Production Environment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Development Environment
```bash
# Start with development overrides
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Using the Startup Script
```bash
# Production (default)
./start-with-auto-init.sh

# Development
./start-with-auto-init.sh dev

# Help
./start-with-auto-init.sh help
```

## 📊 Monitoring and Health Checks

### Health Check Endpoints
- **App**: http://localhost:3000/health
- **Nginx**: http://localhost/health
- **MySQL**: Automatic health checks
- **Redis**: Automatic health checks

### Metrics Collection
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

## 🔒 Security Features

### SSL/TLS
- Auto-generated self-signed certificates
- HTTPS redirection
- Modern cipher suites

### Rate Limiting
- API endpoints: 10 requests/second
- Authentication: 5 requests/minute
- Configurable limits

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- HSTS with 1-year max-age

## 🗄️ Database Management

### Accessing MySQL
```bash
# Via command line
docker-compose exec mysql mysql -u agriconnect -p agriconnect

# Via phpMyAdmin
# Open http://localhost:8080 in your browser
```

### Database Initialization
The following SQL files are automatically executed:
1. `database-schema.sql` - Core database structure
2. `database-location-updates.sql` - Location data
3. `database-soil-collection-updates.sql` - Soil collection data

### Backup and Restore
```bash
# Backup
docker-compose exec mysql mysqldump -u agriconnect -p agriconnect > backup.sql

# Restore
docker-compose exec -T mysql mysql -u agriconnect -p agriconnect < backup.sql
```

## 📝 Useful Commands

### Service Management
```bash
# Start specific service
docker-compose up -d app

# Restart service
docker-compose restart app

# View service logs
docker-compose logs -f app

# Execute command in container
docker-compose exec app npm run test
```

### Database Operations
```bash
# Reset database
docker-compose down -v
docker-compose up -d

# View database logs
docker-compose logs mysql

# Access MySQL shell
docker-compose exec mysql mysql -u agriconnect -p
```

### Monitoring
```bash
# View all container status
docker-compose ps

# View resource usage
docker stats

# View network configuration
docker network ls
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :3000

# Kill the process or change port in docker-compose.yml
```

#### 2. Database Connection Issues
```bash
# Check MySQL status
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

#### 3. SSL Certificate Issues
```bash
# Regenerate SSL certificates
rm -rf ssl/
./start-with-auto-init.sh
```

#### 4. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x start-with-auto-init.sh
```

### Log Analysis
```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f app

# View last 100 lines
docker-compose logs --tail=100 app
```

## 🔄 Updates and Maintenance

### Update Services
```bash
# Pull latest images
docker-compose pull

# Restart with new images
docker-compose up -d

# Clean up old images
docker image prune
```

### Backup Strategy
```bash
# Create backup script
mkdir -p backups
docker-compose exec mysql mysqldump -u agriconnect -p agriconnect > backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [MySQL Docker Image](https://hub.docker.com/_/mysql)
- [Redis Docker Image](https://hub.docker.com/_/redis)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

## 🤝 Contributing

When making changes to the Docker setup:

1. Test in development environment first
2. Update documentation
3. Test production deployment
4. Commit changes with clear descriptions

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review service logs
3. Check Docker and Docker Compose versions
4. Ensure all prerequisites are met

---

**Happy Dockerizing! 🐳**
