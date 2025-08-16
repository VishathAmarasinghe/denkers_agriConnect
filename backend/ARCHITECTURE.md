# AgriConnect Backend Architecture

## Overview

The AgriConnect backend follows a **layered architecture pattern** with clear separation of concerns. This architecture promotes maintainability, testability, and scalability by decoupling different aspects of the application.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│                    (Routes/Controllers)                     │
├─────────────────────────────────────────────────────────────┤
│                     Business Layer                          │
│                      (Services)                            │
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                            │
│                     (Models)                               │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                      │
│                (Database, External APIs)                   │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # Database connection & config
│   │   └── passport.js   # Passport.js OAuth configuration
│   ├── middleware/       # Express middleware
│   │   └── auth.js       # Authentication & authorization
│   ├── models/           # Data models (MVC Model)
│   │   ├── User.js       # User data model
│   │   └── Location.js   # Location data model
│   ├── routes/           # Route handlers (MVC Controller)
│   │   ├── index.js      # Main router
│   │   ├── auth.js       # Authentication routes
│   │   └── users.js      # User management routes
│   ├── services/         # Business logic layer
│   │   ├── auth.js       # Authentication business logic
│   │   ├── user.js       # User management business logic
│   │   ├── validation.js # Input validation logic
│   │   ├── response.js   # API response formatting
│   │   ├── notification.js # SMS & email services
│   │   └── otp.js        # OTP management
│   ├── scripts/          # Database scripts
│   └── server.js         # Application entry point
├── database-schema.sql   # Database structure
├── package.json          # Dependencies
└── .env                  # Environment variables
```

## Layer Responsibilities

### 1. Presentation Layer (Routes)

**Purpose**: Handle HTTP requests and responses, route definition, and basic request validation.

**Responsibilities**:
- Define API endpoints
- Handle HTTP methods (GET, POST, PUT, DELETE)
- Basic request parsing
- Call appropriate services
- Format responses using ResponseService
- Handle middleware (authentication, rate limiting)

**Files**:
- `src/routes/auth.js` - Authentication endpoints
- `src/routes/users.js` - User management endpoints
- `src/routes/index.js` - Main router configuration

**Example**:
```javascript
router.post('/register', authLimiter, ResponseService.asyncHandler(async (req, res) => {
  const sanitizedData = ValidationService.sanitizeInput(req.body);
  const validation = ValidationService.validateRegistration(sanitizedData);
  
  if (!validation.isValid) {
    return ResponseService.validationError(res, validation.errors);
  }

  const result = await AuthService.registerFarmer(sanitizedData);
  return ResponseService.created(res, result, 'Farmer registered successfully');
}));
```

### 2. Business Layer (Services)

**Purpose**: Contain all business logic, validation rules, and orchestrate data operations.

**Responsibilities**:
- Business logic implementation
- Data validation and sanitization
- Orchestrating multiple model operations
- Error handling and business rule enforcement
- External service integration

**Files**:
- `src/services/auth.js` - Authentication business logic
- `src/services/user.js` - User management business logic
- `src/services/validation.js` - Input validation rules
- `src/services/response.js` - API response formatting
- `src/services/notification.js` - External notification services
- `src/services/otp.js` - OTP management logic

**Example**:
```javascript
class AuthService {
  static async registerFarmer(userData) {
    // Validation
    if (!userData.username || !userData.password || !userData.first_name || !userData.phone) {
      throw new Error('Username, password, first name, and phone are required');
    }

    // Business rules
    const existingUsername = await User.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username already exists');
    }

    // Data processing
    const password_hash = await bcrypt.hash(userData.password, 12);
    
    // Create user
    const user = await User.create({ ...userData, password_hash, role: 'farmer' });
    
    // Generate token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    
    return { user, token };
  }
}
```

### 3. Data Layer (Models)

**Purpose**: Handle data persistence, database operations, and data structure.

**Responsibilities**:
- Database queries and operations
- Data transformation
- Connection management
- Data validation at the database level

**Files**:
- `src/models/User.js` - User data operations
- `src/models/Location.js` - Location data operations

**Example**:
```javascript
class User {
  static async findByUsername(username) {
    try {
      const connection = await pool.getConnection();
      const query = 'SELECT * FROM users WHERE username = ?';
      const [rows] = await connection.execute(query, [username]);
      connection.release();
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by username: ${error.message}`);
    }
  }
}
```

### 4. Infrastructure Layer

**Purpose**: Provide external services, database connections, and system configuration.

**Responsibilities**:
- Database connection management
- External API integrations (Notify.lk, Google OAuth)
- Environment configuration
- Security middleware

**Files**:
- `src/config/database.js` - Database connection
- `src/config/passport.js` - OAuth configuration
- `src/middleware/auth.js` - JWT authentication
- `src/server.js` - Server configuration

## Service Dependencies

```
Routes → Services → Models
   ↓         ↓        ↓
Response   Validation  Database
Service    Service    Connection
```

## Key Benefits of This Architecture

### 1. **Separation of Concerns**
- Routes only handle HTTP concerns
- Services contain business logic
- Models handle data operations
- Each layer has a single responsibility

### 2. **Maintainability**
- Easy to locate and modify specific functionality
- Clear boundaries between different concerns
- Reduced coupling between components

### 3. **Testability**
- Services can be unit tested independently
- Mock external dependencies easily
- Clear interfaces between layers

### 4. **Reusability**
- Services can be reused across different routes
- Validation logic is centralized
- Response formatting is consistent

### 5. **Scalability**
- Easy to add new services
- Can scale different layers independently
- Clear separation makes it easier to optimize

## Data Flow Example

### User Registration Flow

1. **Route Layer** (`/auth/register`)
   - Receives HTTP POST request
   - Applies rate limiting middleware
   - Sanitizes input data
   - Calls validation service
   - Calls auth service
   - Formats response

2. **Validation Layer** (`ValidationService`)
   - Validates required fields
   - Checks data formats
   - Returns validation results

3. **Business Layer** (`AuthService`)
   - Checks business rules (username uniqueness)
   - Hashes password
   - Calls user model to create user
   - Generates JWT token
   - Returns result

4. **Data Layer** (`User Model`)
   - Executes SQL INSERT
   - Returns created user data

5. **Response Layer** (`ResponseService`)
   - Formats success response
   - Sets appropriate HTTP status
   - Returns JSON response

## Error Handling Strategy

### 1. **Service Layer Errors**
- Business logic errors throw descriptive Error objects
- Validation errors include detailed field information
- Database errors are wrapped with context

### 2. **Route Layer Error Handling**
- Uses `ResponseService.asyncHandler` to catch async errors
- Maps service errors to appropriate HTTP status codes
- Provides consistent error response format

### 3. **Global Error Handling**
- Centralized error handling middleware
- Environment-specific error details (dev vs prod)
- Logging and monitoring integration

## Security Features

### 1. **Input Validation**
- All inputs are sanitized and validated
- Business rule enforcement
- SQL injection prevention

### 2. **Authentication & Authorization**
- JWT-based authentication
- Role-based access control
- Middleware-based protection

### 3. **Rate Limiting**
- Authentication endpoint protection
- Password reset throttling
- Configurable limits per endpoint

### 4. **Security Headers**
- Helmet.js for security headers
- CORS configuration
- Request size limits

## Best Practices Implemented

### 1. **Async/Await Pattern**
- Consistent use of async/await
- Proper error handling with try-catch
- No callback hell

### 2. **Environment Configuration**
- Centralized environment variables
- Development vs production settings
- Secure credential management

### 3. **Logging & Monitoring**
- Structured error logging
- Request/response logging
- Performance monitoring hooks

### 4. **Code Organization**
- Single responsibility principle
- Dependency injection pattern
- Clear naming conventions

## Future Enhancements

### 1. **Caching Layer**
- Redis integration for session management
- Query result caching
- Rate limiting storage

### 2. **Message Queue**
- Asynchronous task processing
- Email/SMS queuing
- Background job processing

### 3. **API Versioning**
- Semantic versioning support
- Backward compatibility
- Deprecation management

### 4. **Microservices**
- Service decomposition
- Inter-service communication
- Independent deployment

This architecture provides a solid foundation for building scalable, maintainable, and secure backend applications while following industry best practices and design patterns.
