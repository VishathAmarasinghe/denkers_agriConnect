# AgriConnect - Full Stack Agricultural Management Platform

A comprehensive agricultural management platform that connects farmers, field officers, and agricultural services through web applications, mobile apps, and robust backend APIs.

## Project Overview

AgriConnect is a full-stack agricultural management system designed to streamline farming operations, warehouse management, soil testing, equipment rental, and market operations. The platform consists of three main components:

- **Web Application** - Next.js frontend for administrators and field officers
- **Mobile Application** - React Native app for farmers
- **Backend API** - Node.js/Express server with MySQL database

## Quick Start

### Option 1: Docker Setup (Recommended)

**Start the entire application stack with one command:**

```bash
./start-agriconnect.sh
```

**Test your setup:**
```bash
./test-docker-setup.sh
```

### Option 2: Manual Setup

**Prerequisites:**
- Node.js 18+ and npm
- MySQL 8.0+
- Redis 7+
- Git

**Backend Setup:**
```bash
cd backend
npm install
cp env.example .env
# Configure your .env file with database credentials
npm run dev
```

**Frontend Setup:**
```bash
cd web_app
npm install
cp env.example .env
npm run dev
```

**Mobile App Setup:**
```bash
cd farmer_mobile_app
npm install
npx expo start
```

## Architecture

### System Components

| Component | Technology | Port | Description |
|-----------|------------|------|-------------|
| **Frontend** | Next.js 13 | 3005 | Web application for admins/officers |
| **Backend** | Node.js/Express | 3000 | RESTful API server |
| **Mobile App** | React Native/Expo | - | Cross-platform mobile application |
| **Database** | MySQL 8.0 | 3307 | Primary data storage |
| **Cache** | Redis 7 | 6379 | Session and data caching |
| **Email** | MailHog | 8025 | Email testing and development |

### Technology Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Material-UI
- **Backend**: Node.js, Express.js, TypeScript, MySQL2
- **Mobile**: React Native, Expo, TypeScript
- **Database**: MySQL 8.0, Redis
- **Authentication**: JWT, Passport.js, Google OAuth
- **File Upload**: Multer, Cloud storage support
- **Testing**: Jest, Supertest
- **Documentation**: OpenAPI/Swagger

## Project Structure

```
AgriConnect/
├── farmer_mobile_app/          # React Native mobile application
│   ├── app/                      # App screens and navigation
│   ├── components/               # Reusable UI components
│   ├── contexts/                 # React contexts (Auth, Theme)
│   ├── hooks/                    # Custom React hooks
│   ├── slices/                   # Redux toolkit slices
│   ├── utils/                    # Utility functions and API services
│   └── assets/                   # Images, fonts, and static files
│
├── web_app/                    # Next.js web application
│   ├── app/                      # App router pages and layouts
│   ├── components/               # UI components and layouts
│   ├── slices/                   # Redux toolkit store
│   ├── utils/                    # API services and utilities
│   ├── types/                    # TypeScript type definitions
│   └── public/                   # Static assets
│
├── backend/                    # Node.js/Express API server
│   ├── src/
│   │   ├── config/               # Database, authentication config
│   │   ├── middleware/           # Express middleware
│   │   ├── models/               # Database models and queries
│   │   ├── routes/               # API route definitions
│   │   ├── services/             # Business logic layer
│   │   ├── types/                # TypeScript interfaces
│   │   └── utils/                # Utility functions
│   ├── database-*.sql            # Database schema and sample data
│   └── Dockerfile                # Container configuration
│
├── docker-compose.full.yml    # Complete application stack
├── start-agriconnect.sh       # One-command startup script
├── test-docker-setup.sh       # Setup verification script
└── README-DOCKER-SETUP.md     # Docker setup documentation
```

## Core Features

### Agricultural Management
- **Soil Management**: Soil testing requests, collection centers, detailed reports
- **Crop Management**: Planting schedules, growth tracking, harvest planning
- **Field Monitoring**: Field visits, progress tracking, issue reporting

### Warehouse & Storage
- **Storage Management**: Warehouse bookings, inventory tracking
- **Request System**: Storage requests, approval workflows
- **Expiry Management**: Automatic notifications, expiry actions

### Equipment Rental
- **Equipment Catalog**: Categories, availability, pricing
- **Rental System**: Request management, approval workflows
- **Maintenance**: Equipment status, maintenance schedules

### Market Operations
- **Market Items**: Product catalog, pricing, availability
- **Price Tracking**: Market price monitoring, historical data
- **Trading**: Buy/sell operations, transaction history

### User Management
- **Multi-Role System**: Farmers, Field Officers, Administrators
- **Authentication**: JWT, Google OAuth, password management
- **Profile Management**: User profiles, preferences, settings

### Mobile Features
- **Offline Support**: Data caching, offline-first approach
- **Push Notifications**: Real-time updates, alerts
- **Location Services**: GPS integration, field mapping
- **QR Code Scanning**: Equipment identification, inventory tracking

## Authentication & Security

### User Roles
- **Farmer**: Access to personal data, requests, and basic features
- **Field Officer**: Field visit management, farmer support
- **Administrator**: Full system access, user management

### Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- Password encryption with bcrypt
- Rate limiting and request validation
- CORS configuration
- Helmet.js security headers

## Database Design

### Core Tables
- **users**: User accounts and profiles
- **warehouse_inventory**: Storage items and status
- **soil_testing_requests**: Soil testing workflow
- **equipment_rental**: Equipment management
- **market_items**: Product catalog
- **field_officer_contacts**: Field visit management

### Key Relationships
- User-warehouse relationships
- Equipment-category hierarchies
- Soil testing workflows
- Market price tracking
- Field visit scheduling

## Development Setup

### Prerequisites
- **Node.js 18+** and npm
- **MySQL 8.0+** database
- **Redis 7+** for caching
- **Docker** and Docker Compose (for containerized setup)
- **Git** for version control

### Environment Configuration

**Backend (.env):**
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=agriconnect
DB_PASSWORD=secure_password
DB_NAME=agriconnect
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret_here
SMTP_HOST=localhost
SMTP_PORT=1025
```

**Frontend (.env):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

### Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE agriconnect;
CREATE USER 'agriconnect'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON agriconnect.* TO 'agriconnect'@'localhost';
FLUSH PRIVILEGES;

# Import schema and sample data
mysql -u agriconnect -p agriconnect < backend/database-schema.sql
mysql -u agriconnect -p agriconnect < backend/warehouse-inventory-data.sql
```

## Testing

### Backend Testing
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Frontend Testing
```bash
cd web_app
npm test                   # Run tests
npm run lint              # Lint code
npm run build             # Build production
```

## Deployment

### Docker Deployment
```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d

# Development
docker-compose -f docker-compose.full.yml up -d
```

### Manual Deployment
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd web_app
npm run build
npm start
```

## Configuration

### Database Configuration
- **Connection Pooling**: Optimized for production loads
- **Migration System**: Version-controlled schema changes
- **Backup Strategy**: Automated database backups
- **Performance**: Indexed queries, optimized schemas

### API Configuration
- **Rate Limiting**: Request throttling per user/IP
- **Caching**: Redis-based response caching
- **Validation**: Input validation and sanitization
- **Error Handling**: Structured error responses

### Security Configuration
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers
- **Rate Limiting**: DDoS protection
- **Input Validation**: SQL injection prevention

## API Documentation

### Core Endpoints
- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Warehouse**: `/api/warehouse/*`
- **Soil Testing**: `/api/soil-testing/*`
- **Equipment**: `/api/equipment/*`
- **Market**: `/api/market/*`

### API Features
- RESTful design principles
- JWT authentication
- Role-based access control
- Request/response validation
- Error handling standards
- Rate limiting

## Troubleshooting

### Common Issues

**Database Connection:**
```bash
# Check MySQL status
sudo systemctl status mysql

# Verify credentials
mysql -u agriconnect -p
```

**Port Conflicts:**
```bash
# Check port usage
lsof -i :3000
lsof -i :3005
lsof -i :3307
```

**Docker Issues:**
```bash
# Clean restart
docker-compose down -v
docker system prune -f
./start-agriconnect.sh
```

### Debug Mode
```bash
# Backend debug
cd backend
DEBUG=* npm run dev

# Frontend debug
cd web_app
NODE_ENV=development npm run dev
```

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Jest**: Unit and integration testing

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

### Getting Help
- **Documentation**: Check this README and component-specific docs
- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Wiki**: Project wiki for detailed guides

### Contact
- **Project Maintainer**: [Your Name]
- **Email**: [your.email@example.com]
- **GitHub**: [Your GitHub Profile]

---

**AgriConnect** - Empowering Agriculture Through Technology

*Built with love for the farming community*
