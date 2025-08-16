# Backend Testing Guide

This document provides comprehensive information about testing the backend services in the AgriConnect application.

## Overview

The backend uses Jest as the testing framework with TypeScript support.



## Test Architecture

### Configuration
- **Framework**: Jest with ts-jest preset
- **Environment**: Node.js

### File Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── __tests__/              # Service test files
│   │   │   ├── auth.service.test.ts             (23 tests)
│   │   │   ├── equipmentRental.service.test.ts  (21 tests) 
│   │   │   ├── farmerWarehouse.service.test.ts   (7 tests) 
│   │   │   ├── fieldOfficer.service.test.ts     (13 tests) 
│   │   │   ├── notification.service.test.ts     (23 tests) 
│   │   │   ├── otp.service.test.ts              (19 tests) 
│   │   │   ├── soilCollectionCenter.service.test.ts (16 tests) 
│   │   │   ├── soilTestingReports.service.test.ts (14 tests) 
│   │   │   ├── soilTestingScheduling.service.test.ts (23 tests) 
│   │   │   ├── validation.service.test.ts       (18 tests) 
│   │   │   └── warehouse.service.test.ts        (23 tests) 
│   │   └── ...                     # Service implementations
│   └── test/
│       ├── setup.ts               # Global test setup and mocks
│       └── utils.ts               # Test utilities and factories
├── jest.config.js                 # Jest configuration
└── package.json                   # Test scripts and dependencies
```

## Test Commands

### Basic Commands
```bash
# Run all tests
npm test

# Run service tests only
npm run test:services

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with verbose output
npm run test:verbose

# Run tests in CI mode
npm run test:ci

# Run unit tests with coverage
npm run test:unit
```

### Individual Test Files
```bash
# Run specific test file
npm test -- --testPathPatterns=auth.service.test.ts

# Run specific test suite
npm test -- --testNamePatterns="AuthService"

# Run with debug information
npm run test:debug
```

## Jest Configuration

The Jest configuration includes:

- **TypeScript Support**: ts-jest preset for TypeScript compilation
- **Module Mapping**: `@/` alias resolves to `src/` directory
- **Coverage Exclusions**: Routes, middleware, models, scripts, and configuration files
- **Setup Files**: Global setup executed before all tests
- **Mock Settings**: Clear and restore mocks between tests

## Test Infrastructure

### Global Setup (`src/test/setup.ts`)

Provides:
- Mock environment variables for testing
- Global mocks for external dependencies:
  - Database connections (mysql2)
  - Authentication (bcryptjs, jsonwebtoken)
  - Email service (nodemailer)
  - Google APIs (googleapis)
- Console mocking for cleaner test output
- Global test utilities for common mock data

### Test Utilities (`src/test/utils.ts`)

Provides comprehensive utilities:

#### Mock Database Utilities
- `createMockConnection()`: Database connection mocks
- `createMockPool()`: Database pool mocks
- Mock transaction support (rollback, commit)

#### Mock Data Factories
- `TestDataFactory.users`: User mock data with role variants
- `TestDataFactory.warehouses`: Warehouse mock data with capacity variants
- `TestDataFactory.equipment`: Equipment mock data with availability variants
- `TestDataFactory.schedules`: Schedule mock data with status variants
- `TestDataFactory.requests`: Request mock data with status variants
- `TestDataFactory.timeSlots`: Time slot mock data with availability variants

#### Express Mocking
- `createMockRequest()`: Express request object mocks
- `createMockResponse()`: Express response object mocks
- `createMockNext()`: Express next function mocks

#### Common Assertions
- `CommonAssertions.expectDatabaseQuery()`: Assert database queries
- `CommonAssertions.expectDatabaseExecute()`: Assert database executions
- `CommonAssertions.expectServiceCall()`: Assert service method calls
- `CommonAssertions.expectNotificationSent()`: Assert notifications

## Service Test Coverage

### Authentication Service (`auth.service.test.ts`)
**Tests**: 23 passing
**Coverage**: User registration, authentication, password management, profile operations

- **User Registration**:
  - Successful registration with validation
  - Duplicate detection (username, email, phone, NIC)
  - Database error handling
  
- **User Authentication**:
  - Valid credential login
  - Invalid credential handling
  - Inactive account detection
  - Password verification
  
- **Password Management**:
  - Current password verification
  - Password change operations
  - Forgot password OTP generation
  - Password reset with OTP validation
  
- **Profile Management**:
  - Profile update operations
  - Data validation
  - Error handling

### Equipment Rental Service (`equipmentRental.service.test.ts`)
**Tests**: 21 passing
**Coverage**: Equipment CRUD, availability management, rental requests

- **Equipment Management**:
  - Create equipment with category validation
  - Update equipment with name uniqueness checks
  - Category-based equipment retrieval
  - Equipment availability tracking
  
- **Rental Operations**:
  - Rental request creation
  - Availability checking for date ranges
  - Equipment availability configuration
  - Farmer request management
  
- **Analytics**:
  - Equipment availability summaries
  - Available equipment queries with date filters

### Farmer Warehouse Service (`farmerWarehouse.service.test.ts`)
**Tests**: 7 passing
**Coverage**: Warehouse request management

- **Request Management**:
  - Warehouse storage request creation
  - Duration validation (90-day limit)
  - Pending request prevention
  - Request approval workflow
  
- **Farmer Operations**:
  - Farmer-specific request retrieval
  - Request status management

### Field Officer Service (`fieldOfficer.service.test.ts`)
**Tests**: 13 passing
**Coverage**: Field officer management, contact requests

- **Officer Management**:
  - Active field officer retrieval
  - Officer search and filtering
  - Officer availability status
  
- **Contact Requests**:
  - Contact request creation with validation
  - Officer availability checking
  - Farmer pending request prevention
  - Request assignment workflow
  - Farmer request history

### Notification Service (`notification.service.test.ts`)
**Tests**: 23 passing
**Coverage**: Email and SMS notifications, bulk operations

- **Email Operations**:
  - Individual email sending
  - Bulk email operations with partial failure handling
  - Email configuration testing
  - SMTP error handling
  
- **SMS Operations**:
  - Individual SMS sending with phone formatting
  - Bulk SMS operations with failure resilience
  - SMS API integration
  - Phone number normalization (Sri Lankan format)
  
- **Configuration**:
  - Service configuration validation
  - Missing configuration handling
  - Network error resilience

### OTP Service (`otp.service.test.ts`)
**Tests**: 19 passing
**Coverage**: OTP generation, storage, verification

- **OTP Generation**:
  - 6-digit numeric OTP generation
  - Unique OTP per phone number
  - Automatic expiry time setting
  
- **OTP Management**:
  - In-memory storage with expiry
  - OTP verification and cleanup
  - Resend rate limiting (1-minute cooldown)
  - Multi-phone number support
  
- **Validation**:
  - Valid/invalid OTP checking
  - Expiry time management
  - Automatic cleanup after verification

### Soil Collection Center Service (`soilCollectionCenter.service.test.ts`)
**Tests**: 16 passing
**Coverage**: Collection center CRUD, search operations

- **Center Management**:
  - Center creation with validation
  - Center updates and deletion
  - Active status management
  
- **Search Operations**:
  - Center search with criteria filtering
  - Location-based center retrieval
  - Pagination support
  
- **Error Handling**:
  - Not found scenarios
  - Database operation failures

### Soil Testing Reports Service (`soilTestingReports.service.test.ts`)
**Tests**: 14 passing
**Coverage**: Report management, file operations

- **Report Operations**:
  - Report upload with file handling
  - Report updates and retrievals
  - Farmer-specific report access
  - Public report management
  
- **File Management**:
  - File existence validation
  - Download access control
  - File metadata tracking
  
- **Search**:
  - Report search with multiple criteria
  - Farmer access control
  - Admin access permissions

### Soil Testing Scheduling Service (`soilTestingScheduling.service.test.ts`)
**Tests**: 23 passing
**Coverage**: Schedule management, time slots, requests

- **Schedule Management**:
  - Schedule creation with capacity limits
  - Schedule updates and completion marking
  - Today's schedule retrieval
  
- **Time Slot Operations**:
  - Available time slot queries
  - Time slot creation and updates
  - Capacity management
  
- **Request Processing**:
  - Testing request creation
  - Request status management
  - Farmer request history
  - Pending request tracking
  
- **Search Operations**:
  - Schedule search with date ranges
  - Request search with status filters

### Validation Service (`validation.service.test.ts`)
**Tests**: 18 passing
**Coverage**: Input validation for all services

- **User Validation**:
  - User registration data validation
  - Login credential validation
  - Password change validation
  - Profile update validation
  
- **Authentication Validation**:
  - Forgot password validation
  - Password reset validation
  - Language update validation
  
- **Service Data Validation**:
  - Soil collection center validation
  - Data format and constraint checking

### Warehouse Service (`warehouse.service.test.ts`)
**Tests**: 23 passing
**Coverage**: Warehouse CRUD, booking management

- **Warehouse Operations**:
  - Warehouse creation with name uniqueness
  - Warehouse updates with validation
  - Warehouse deletion and status management
  
- **Search and Retrieval**:
  - Warehouse search with parameters
  - Category-based filtering
  - Image association management
  
- **Booking System**:
  - Available time slot queries
  - Booking creation and management
  - Capacity and availability tracking
  
- **Image Management**:
  - Warehouse image uploads
  - Image-warehouse associations

## Mock Strategy

### Database Mocking
- Connection pooling simulation
- Query and execute method mocking
- Transaction support (commit/rollback)
- Result set simulation

### External Service Mocking
- Email service (nodemailer) with transporter mocking
- SMS service with API response simulation
- Authentication services (bcrypt, JWT)
- Google APIs for OAuth integration

### Data Consistency
- Consistent mock data across tests
- Factory pattern for data generation
- Override support for specific test cases
- Realistic data relationships

## Error Handling Testing

Each service includes comprehensive error handling tests:

- **Database Errors**: Connection failures, query errors
- **Validation Errors**: Input validation and constraint violations
- **Business Logic Errors**: Duplicate data, invalid state transitions
- **External Service Errors**: Network failures, API errors
- **Not Found Scenarios**: Missing resources and entities

## Performance Considerations

- **Test Isolation**: Each test runs independently
- **Mock Efficiency**: Lightweight mocks for fast execution
- **Parallel Execution**: Tests run in parallel where possible
- **Memory Management**: Automatic mock cleanup between tests

## CI/CD Integration

The test suite is configured for continuous integration:








