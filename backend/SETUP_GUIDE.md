# AgriConnect Authentication Setup Guide

This guide will help you set up the complete authentication system for AgriConnect backend.

## Prerequisites

- Node.js (v16 or higher)
- MySQL database
- Google OAuth credentials (optional)
- Notify.lk account (for SMS)
- SMTP credentials (optional, for emails)

## 1. Install Dependencies

```bash
cd backend
npm install
```

## 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=agriconnect
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Google OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Notify.lk Configuration (for SMS)
NOTIFY_LK_API_KEY=your_notify_lk_api_key
NOTIFY_LK_SENDER_ID=your_notify_lk_sender_id

# SMTP Configuration (Optional - for emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:19006
```

## 3. Database Setup

### 3.1 Create Database

```sql
CREATE DATABASE IF NOT EXISTS agriconnect;
USE agriconnect;
```

### 3.2 Run Schema

```bash
# Option 1: Run the schema file directly in MySQL
mysql -u root -p < database-schema.sql

# Option 2: Use the init endpoint (after starting the server)
curl -X POST http://localhost:3000/api/init-db
```

### 3.3 Verify Database Connection

```bash
curl http://localhost:3000/api/test-db
```

## 4. Google OAuth Setup (Optional)

### 4.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/v1/auth/google/callback`
   - `http://localhost:3001/api/v1/auth/google/callback` (if using different port)
7. Copy Client ID and Client Secret to your `.env` file

### 4.2 Test Google OAuth

```bash
# Test the OAuth flow
curl "http://localhost:3000/api/v1/auth/google"
```

## 5. Notify.lk Setup (for SMS)

### 5.1 Create Notify.lk Account

1. Sign up at [Notify.lk](https://notify.lk/)
2. Get your API Key from the Notify.lk Dashboard
3. Set up your Sender ID (approved by Notify.lk)
4. Add credentials to `.env` file

### 5.2 Test SMS (if configured)

You can test the Notify.lk integration using the provided test script:

```bash
# Set your test phone number in .env
TEST_PHONE=+94712345678

# Run the test script
node test-notify-lk.js
```

The password reset functionality will automatically use Notify.lk if configured.

## 6. SMTP Setup (Optional - for emails)

### 6.1 Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in your `.env` file

### 6.2 Test Email (if configured)

The system will automatically use SMTP if configured for welcome emails and password resets.

## 7. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 8. Test the Authentication System

### 8.1 Health Check

```bash
curl http://localhost:3000/health
```

### 8.2 API Documentation

```bash
curl http://localhost:3000/api/v1/docs
```

### 8.3 Run Test Suite

```bash
# Install axios for testing
npm install axios --save-dev

# Run the test suite
node test-auth.js
```

## 9. API Endpoints Overview

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/v1/auth/register` | POST | Farmer registration | No |
| `/api/v1/auth/login` | POST | User login | No |
| `/api/v1/auth/google` | GET | Google OAuth | No |
| `/api/v1/auth/forgot-password` | POST | Request password reset | No |
| `/api/v1/auth/reset-password` | POST | Reset password with OTP | No |
| `/api/v1/auth/change-password` | POST | Change password | Yes |
| `/api/v1/auth/profile` | GET | Get user profile | Yes |
| `/api/v1/auth/refresh-token` | POST | Refresh JWT token | Yes |
| `/api/v1/auth/logout` | POST | Logout user | Yes |

## 10. Security Features

### 10.1 Rate Limiting

- **Authentication endpoints:** 5 requests per 15 minutes
- **Password reset endpoints:** 3 requests per hour

### 10.2 Password Security

- Minimum 6 characters
- Bcrypt hashing with 12 salt rounds
- Secure password validation

### 10.3 JWT Security

- 7-day expiration
- HS256 algorithm
- Configurable secret key

### 10.4 CORS Protection

- Configurable allowed origins
- Credentials support
- Secure headers with Helmet

## 11. Frontend Integration

### 11.1 Web Application

```javascript
// Login example
const login = async (username, password) => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  }
  throw new Error(data.message);
};

// Authenticated request
const getProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/v1/auth/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### 11.2 Mobile Application

```typescript
// React Native example
const login = async (username: string, password: string) => {
  const response = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  if (data.success) {
    await SecureStore.setItemAsync('token', data.data.token);
    return data.data.user;
  }
  throw new Error(data.message);
};
```

## 12. Troubleshooting

### 12.1 Common Issues

**Database Connection Failed**
- Check database credentials in `.env`
- Ensure MySQL service is running
- Verify database exists

**Google OAuth Not Working**
- Check Client ID and Secret in `.env`
- Verify redirect URI matches exactly
- Ensure Google+ API is enabled

**SMS Not Sending**
- Verify Notify.lk API key and sender ID
- Check phone number format (should include country code)
- Ensure sufficient Notify.lk credits

**Email Not Sending**
- Check SMTP credentials
- Verify Gmail App Password
- Check firewall/network restrictions

### 12.2 Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

### 12.3 Logs

Check server console for detailed error messages and debugging information.

## 13. Production Deployment

### 13.1 Environment Variables

- Use strong, unique JWT_SECRET
- Set NODE_ENV=production
- Configure production database
- Use HTTPS URLs for OAuth callbacks

### 13.2 Security Considerations

- Enable HTTPS
- Use environment-specific CORS origins
- Implement proper logging and monitoring
- Regular security updates

### 13.3 Scaling

- Use Redis for OTP storage (instead of in-memory)
- Implement database connection pooling
- Consider load balancing for high traffic

## 14. Support

For issues or questions:

1. Check the logs and error messages
2. Verify all environment variables are set
3. Test individual components
4. Review the API documentation at `/api/v1/docs`

## 15. Next Steps

After setting up authentication:

1. Implement user roles and permissions
2. Add email verification
3. Set up audit logging
4. Implement session management
5. Add two-factor authentication
6. Set up password policies
7. Implement account lockout mechanisms
