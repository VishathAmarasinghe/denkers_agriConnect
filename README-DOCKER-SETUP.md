# AgriConnect Full Stack Docker Setup

This setup allows you to run the entire AgriConnect application (frontend + backend + database + redis + mailhog) with a single command!

## Quick Start

### **One Command to Rule Them All:**
```bash
./start-agriconnect.sh
```

That's it! This will start everything you need.

## Prerequisites

- Docker Desktop installed and running
- docker-compose available
- Git repository cloned

## What Gets Started

| Service | Port | Description |
|---------|------|-------------|
| **Frontend** | 3005 | Next.js web application |
| **Backend** | 3000 | Node.js/Express API |
| **MySQL** | 3307 | Database |
| **Redis** | 6379 | Caching & sessions |
| **MailHog** | 8025 | Email testing UI |

## How to Use

### **Start Everything:**
```bash
./start-agriconnect.sh
```

### **Test Your Setup:**
```bash
./test-docker-setup.sh
```

### **Stop Everything:**
- Press `Ctrl+C` in the terminal
- Or run: `docker-compose -f docker-compose.full.yml down`

### **View Logs:**
```bash
docker-compose -f docker-compose.full.yml logs -f
```

### **Restart Services:**
```bash
docker-compose -f docker-compose.full.yml restart
```

## Manual Commands (Alternative)

If you prefer to run commands manually:

```bash
# Start all services
docker-compose -f docker-compose.full.yml up --build

# Start in background
docker-compose -f docker-compose.full.yml up -d --build

# Stop services
docker-compose -f docker-compose.full.yml down

# View running services
docker-compose -f docker-compose.full.yml ps
```

## Access Your Application

Once everything is running:

- **Frontend**: http://localhost:3005
- **Backend API**: http://localhost:3000
- **MailHog**: http://localhost:8025
- **Database**: localhost:3307 (user: agriconnect, password: secure_password)

## Troubleshooting

### **Docker not running:**
```bash
# Start Docker Desktop first, then run:
./start-agriconnect.sh
```

### **Port conflicts:**
If ports are already in use, check what's using them:
```bash
# Check port 3000
lsof -i :3000

# Check port 3005
lsof -i :3005
```

### **Database connection issues:**
```bash
# Check if MySQL is running
docker-compose -f docker-compose.full.yml ps mysql

# View MySQL logs
docker-compose -f docker-compose.full.yml logs mysql
```

### **Rebuild everything:**
```bash
# Stop and remove everything
docker-compose -f docker-compose.full.yml down -v

# Start fresh
./start-agriconnect.sh
```

### **Test your setup:**
```bash
# Run the test script to verify everything is working
./test-docker-setup.sh
```

## File Structure

```
AgriConnect/
├── docker-compose.full.yml    # Main Docker Compose file
├── start-agriconnect.sh       # Startup script
├── test-docker-setup.sh       # Test script
├── web_app/                   # Frontend (Next.js)
│   └── Dockerfile.dev        # Frontend Dockerfile
├── backend/                   # Backend (Node.js)
│   └── Dockerfile            # Backend Dockerfile
└── README-DOCKER-SETUP.md    # This file
```

## Development Workflow

1. **Start services**: `./start-agriconnect.sh`
2. **Make code changes** in `web_app/` or `backend/`
3. **Changes auto-reload** (hot reloading enabled)
4. **Test your setup**: `./test-docker-setup.sh`
5. **Stop services**: `Ctrl+C`

## Benefits

- **Single command** to start everything
- **Hot reloading** for development
- **Consistent environment** across team members
- **Easy cleanup** with Ctrl+C
- **Health checks** for all services
- **Production-like** setup
- **Test script** to verify everything works

## Need Help?

If you encounter issues:

1. Check if Docker is running
2. Ensure ports are available
3. Run the test script: `./test-docker-setup.sh`
4. Try rebuilding: `docker-compose -f docker-compose.full.yml down -v && ./start-agriconnect.sh`
5. Check service logs: `docker-compose -f docker-compose.full.yml logs [service-name]`

---

**Happy coding!**
