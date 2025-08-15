import { jest } from '@jest/globals';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_NAME = 'test_agriconnect';
process.env.JWT_SECRET = 'test_jwt_secret';

// Global test setup
beforeAll(async () => {
  // Setup test database or mocks
  console.log('Setting up test environment...');
});

// Global test cleanup
afterAll(async () => {
  // Cleanup test database or mocks
  console.log('Cleaning up test environment...');
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
