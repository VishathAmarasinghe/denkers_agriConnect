import { jest } from '@jest/globals';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_NAME = 'test_agriconnect';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.GOOGLE_CLIENT_ID = 'test_google_client_id';
process.env.GOOGLE_CLIENT_SECRET = 'test_google_client_secret';
process.env.SMTP_HOST = 'test_smtp_host';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test_smtp_user';
process.env.SMTP_PASS = 'test_smtp_pass';

// Global test setup
beforeAll(async () => {
  // Setup test environment
  console.log('Setting up test environment...');
  
  // Mock database connection
  jest.mock('../config/database', () => ({
    pool: {
      getConnection: jest.fn(),
      query: jest.fn(),
      execute: jest.fn(),
    }
  }));
  
  // Mock bcrypt
  jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
    genSalt: jest.fn(),
  }));
  
  // Mock jsonwebtoken
  jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  }));
  
  // Mock nodemailer
  jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
      sendMail: jest.fn(),
      verify: jest.fn(),
    })),
  }));
  
  // Mock googleapis
  jest.mock('googleapis', () => ({
    google: {
      auth: {
        OAuth2: jest.fn(),
      },
      oauth2: jest.fn(() => ({
        userinfo: {
          get: jest.fn(),
        },
      })),
    },
  }));
});

// Global test cleanup
afterAll(async () => {
  // Cleanup test environment
  console.log('Cleaning up test environment...');
});

// Global beforeEach to reset mocks
beforeEach(() => {
  jest.clearAllMocks();
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

// Mock process.exit to prevent tests from exiting
process.exit = jest.fn() as never;

// Global test utilities
(global as any).testUtils = {
  createMockUser: (overrides = {}) => ({
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    phone: '+1234567890',
    nic: '1234567890123',
    password_hash: 'hashed_password',
    role: 'farmer' as const,
    first_name: 'Test',
    last_name: 'User',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),
  
  createMockWarehouse: (overrides = {}) => ({
    id: 1,
    name: 'Test Warehouse',
    description: 'Test warehouse description',
    address: 'Test Address',
    latitude: 6.9271,
    longitude: 79.8612,
    capacity: 1000,
    category_id: 1,
    owner_id: 1,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),
  
  createMockEquipment: (overrides = {}) => ({
    id: 1,
    name: 'Test Equipment',
    description: 'Test equipment description',
    category_id: 1,
    owner_id: 1,
    daily_rate: 100,
    is_available: true,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),
};

// Type declaration for global test utilities
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        createMockUser: (overrides?: any) => any;
        createMockWarehouse: (overrides?: any) => any;
        createMockEquipment: (overrides?: any) => any;
      };
    }
  }
}
