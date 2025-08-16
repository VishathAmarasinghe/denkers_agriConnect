# AgriConnect Backend API

A professional, production-ready backend API for the AgriConnect agricultural platform.

## 🏗️ Architecture

```
src/
├── config/          # Configuration files (database, environment)
├── controllers/     # Request handlers and business logic
├── middleware/      # Custom middleware (auth, validation, etc.)
├── models/          # Database models and data access layer
├── routes/          # API route definitions
├── services/        # Business logic services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and helpers
└── server.ts        # Main application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- TypeScript

### Installation
```bash
npm install
```

### Environment Setup
Copy `.env.example` to `.env` and configure:
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=agriconnect
PORT=3000
JWT_SECRET=your_jwt_secret
```

### Development
```bash
npm run dev          # Development with hot reload
npm run build        # Build for production
npm start           # Start production server
```

### Database
```bash
npm run init-db      # Initialize database schema
```

## 📚 API Documentation

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset with OTP

### Field Officers
- `GET /api/v1/field-officers` - List all field officers
- `GET /api/v1/field-officers/:id` - Get field officer details
- `POST /api/v1/field-officers/contact-requests` - Create contact request
- `GET /api/v1/field-officers/contact-requests/my-requests` - Get user's requests

### Admin Operations
- `GET /api/v1/field-officers/admin/contact-requests` - Admin view all requests
- `POST /api/v1/field-officers/admin/contact-requests/:id/assign` - Assign request
- `POST /api/v1/field-officers/admin/contact-requests/:id/reject` - Reject request

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- SQL injection prevention
- Rate limiting
- CORS configuration

## 🧪 Testing

```bash
npm test             # Run all tests
npm run test:unit    # Unit tests only
npm run test:integration  # Integration tests
```

## 📦 Production Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Use PM2 or similar process manager
4. Configure reverse proxy (Nginx)
5. Set up SSL certificates

## 📝 Code Standards

- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Consistent error handling
- Comprehensive logging
- API response standardization

## 🤝 Contributing

1. Follow the established code structure
2. Write tests for new features
3. Update documentation
4. Follow commit message conventions
5. Submit pull requests for review

## 📄 License

This project is licensed under the MIT License.
