# AgriConnect Backend API Documentation

## Overview

The AgriConnect Backend API provides a comprehensive set of endpoints for managing agricultural services, field officers, and user interactions.

## Base URL

```
Production: https://api.agriconnect.lk
Development: http://localhost:3000
```

## API Version

All endpoints are prefixed with `/api/v1`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "timestamp": "2025-08-14T11:50:00.000Z"
}
```

## Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"],
  "timestamp": "2025-08-14T11:50:00.000Z"
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Authentication Endpoints

### User Registration

**POST** `/api/v1/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "farmer123",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+94712345678",
  "password": "securepassword123",
  "role": "farmer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "farmer123",
    "role": "farmer"
  }
}
```

### User Login

**POST** `/api/v1/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "farmer123",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "farmer123",
      "role": "farmer"
    }
  }
}
```

---

## Field Officer Endpoints

### Get All Field Officers

**GET** `/api/v1/field-officers`

Retrieve all active field officers with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `specialization` (optional): Filter by specialization
- `province_id` (optional): Filter by province
- `district_id` (optional): Filter by district

**Response:**
```json
{
  "success": true,
  "message": "Field officers retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Kumara Perera",
        "designation": "Senior Agricultural Officer",
        "specialization": "general_support",
        "center": "Colombo Agricultural Center",
        "phone_no": "+94112345679"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### Get Field Officer by ID

**GET** `/api/v1/field-officers/:id`

Retrieve specific field officer details.

**Response:**
```json
{
  "success": true,
  "message": "Field officer retrieved successfully",
  "data": {
    "id": 1,
    "name": "Kumara Perera",
    "designation": "Senior Agricultural Officer",
    "description": "Experienced agricultural officer",
    "center": "Colombo Agricultural Center",
    "phone_no": "+94112345679",
    "specialization": "general_support"
  }
}
```

---

## Contact Request Endpoints

### Create Contact Request

**POST** `/api/v1/field-officers/contact-requests`

Create a new contact request (requires authentication).

**Request Body:**
```json
{
  "field_officer_id": 1,
  "farmer_name": "John Doe",
  "farmer_mobile": "+94712345678",
  "farmer_address": "123 Farm Road, Colombo",
  "current_issues": "Pest infestation in paddy field",
  "urgency_level": "high"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact request created successfully",
  "data": {
    "id": 1
  }
}
```

### Get User's Contact Requests

**GET** `/api/v1/field-officers/contact-requests/my-requests`

Retrieve authenticated user's contact requests.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "message": "Contact requests retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "field_officer_name": "Kumara Perera",
        "status": "pending",
        "urgency_level": "high",
        "created_at": "2025-08-14T11:50:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

## Admin Endpoints

### Get All Contact Requests

**GET** `/api/v1/field-officers/admin/contact-requests`

Retrieve all contact requests (admin only).

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `urgency_level` (optional): Filter by urgency

### Assign Contact Request

**POST** `/api/v1/field-officers/admin/contact-requests/:id/assign`

Assign a contact request to a field officer (admin only).

**Request Body:**
```json
{
  "admin_notes": "Assigned to pest control specialist"
}
```

### Reject Contact Request

**POST** `/api/v1/field-officers/admin/contact-requests/:id/reject`

Reject a contact request (admin only).

**Request Body:**
```json
{
  "rejection_reason": "Request outside service area",
  "admin_notes": "Service not available in this region"
}
```

---

## Specialization Endpoints

### Get Available Specializations

**GET** `/api/v1/field-officers/specializations/available`

Retrieve list of all available specializations.

**Response:**
```json
{
  "success": true,
  "message": "Available specializations retrieved successfully",
  "data": [
    "general_support",
    "pest_control",
    "fertilizer_guidance",
    "extension_services",
    "crop_management"
  ]
}
```

---

## Rate Limiting

- **General API**: 10 requests per second
- **Authentication**: 5 requests per minute
- **Contact Requests**: 3 requests per minute

---

## Error Handling

The API provides detailed error messages for debugging:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Phone number must be valid Sri Lankan format",
    "Password must be at least 6 characters long"
  ]
}
```

---

## Support

For API support and questions:
- Email: api-support@agriconnect.lk
- Documentation: https://docs.agriconnect.lk
- Status Page: https://status.agriconnect.lk
