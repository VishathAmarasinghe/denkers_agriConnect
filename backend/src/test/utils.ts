import { jest } from '@jest/globals';

/**
 * Test utilities for backend services
 */

export interface MockDatabaseConnection {
  query: jest.Mock;
  execute: jest.Mock;
  release: jest.Mock;
  rollback: jest.Mock;
  commit: jest.Mock;
}

export interface MockPool {
  getConnection: jest.Mock;
  query: jest.Mock;
  execute: jest.Mock;
}

/**
 * Create a mock database connection
 */
export const createMockConnection = (): MockDatabaseConnection => ({
  query: jest.fn(),
  execute: jest.fn(),
  release: jest.fn(),
  rollback: jest.fn(),
  commit: jest.fn(),
});

/**
 * Create a mock database pool
 */
export const createMockPool = (): MockPool => ({
  getConnection: jest.fn(),
  query: jest.fn(),
  execute: jest.fn(),
});

/**
 * Mock environment variables for testing
 */
export const mockEnvironmentVariables = () => {
  const originalEnv = process.env;
  
  process.env = {
    ...originalEnv,
    NODE_ENV: 'test',
    DB_HOST: 'localhost',
    DB_USER: 'test_user',
    DB_PASSWORD: 'test_password',
    DB_NAME: 'test_agriconnect',
    JWT_SECRET: 'test_jwt_secret',
    GOOGLE_CLIENT_ID: 'test_google_client_id',
    GOOGLE_CLIENT_SECRET: 'test_google_client_secret',
    SMTP_HOST: 'test_smtp_host',
    SMTP_PORT: '587',
    SMTP_USER: 'test_smtp_user',
    SMTP_PASS: 'test_smtp_pass',
  };

  return () => {
    process.env = originalEnv;
  };
};

/**
 * Create mock user data for testing
 */
export const createMockUser = (overrides: Partial<any> = {}) => ({
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
});

/**
 * Create mock warehouse data for testing
 */
export const createMockWarehouse = (overrides: Partial<any> = {}) => ({
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
});

/**
 * Create mock equipment data for testing
 */
export const createMockEquipment = (overrides: Partial<any> = {}) => ({
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
});

/**
 * Create mock soil testing schedule data for testing
 */
export const createMockSoilTestingSchedule = (overrides: Partial<any> = {}) => ({
  id: 1,
  center_id: 1,
  date: '2024-01-01',
  max_appointments: 20,
  start_time: '09:00',
  end_time: '17:00',
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

/**
 * Create mock soil testing request data for testing
 */
export const createMockSoilTestingRequest = (overrides: Partial<any> = {}) => ({
  id: 1,
  user_id: 1,
  schedule_id: 1,
  time_slot_id: 1,
  soil_sample_details: 'Sample from field A',
  preferred_date: '2024-01-01',
  preferred_time: '09:00-10:00',
  status: 'pending',
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

/**
 * Create mock time slot data for testing
 */
export const createMockTimeSlot = (overrides: Partial<any> = {}) => ({
  id: 1,
  schedule_id: 1,
  start_time: '09:00',
  end_time: '10:00',
  is_available: true,
  max_appointments: 5,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

/**
 * Mock bcrypt functions
 */
export const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
};

/**
 * Mock JWT functions
 */
export const mockJwt = {
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
};

/**
 * Mock nodemailer transporter
 */
export const mockTransporter = {
  sendMail: jest.fn(),
  verify: jest.fn(),
};

/**
 * Mock nodemailer
 */
export const mockNodemailer = {
  createTransport: jest.fn(() => mockTransporter),
};

/**
 * Mock googleapis
 */
export const mockGoogleapis = {
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
};

/**
 * Setup common mocks for testing
 */
export const setupCommonMocks = () => {
  // Mock bcrypt
  jest.mock('bcryptjs', () => mockBcrypt);
  
  // Mock jsonwebtoken
  jest.mock('jsonwebtoken', () => mockJwt);
  
  // Mock nodemailer
  jest.mock('nodemailer', () => mockNodemailer);
  
  // Mock googleapis
  jest.mock('googleapis', () => mockGoogleapis);
  
  // Mock database
  jest.mock('../config/database', () => ({
    pool: createMockPool(),
  }));
};

/**
 * Reset all mocks
 */
export const resetAllMocks = () => {
  jest.clearAllMocks();
  
  // Reset bcrypt mocks
  mockBcrypt.hash.mockResolvedValue('hashed_password' as never);
  mockBcrypt.compare.mockResolvedValue(true as never);
  
  // Reset JWT mocks
  mockJwt.sign.mockReturnValue('mock_jwt_token');
  
  // Reset transporter mocks
  mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' } as never);
};

/**
 * Create a mock response object for testing Express routes
 */
export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Create a mock request object for testing Express routes
 */
export const createMockRequest = (overrides: Partial<any> = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null as any,
  ...overrides,
});

/**
 * Create a mock next function for testing Express middleware
 */
export const createMockNext = () => jest.fn();

/**
 * Assert that a function throws an error with a specific message
 */
export const expectToThrow = async (fn: () => Promise<any>, errorMessage: string) => {
  await expect(fn()).rejects.toThrow(errorMessage);
};

/**
 * Assert that a function throws an error of a specific type
 */
export const expectToThrowErrorType = async (fn: () => Promise<any>, ErrorType: any) => {
  await expect(fn()).rejects.toThrow(ErrorType);
};

/**
 * Wait for a specified number of milliseconds (useful for testing async operations)
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create a mock date for testing time-sensitive operations
 */
export const createMockDate = (dateString: string) => {
  const mockDate = new Date(dateString);
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  return mockDate;
};

/**
 * Restore the original Date implementation
 */
export const restoreDate = () => {
  jest.restoreAllMocks();
};

/**
 * Test data factories
 */
export const TestDataFactory = {
  users: {
    farmer: () => createMockUser({ role: 'farmer' }),
    fieldOfficer: () => createMockUser({ role: 'field_officer' }),
    admin: () => createMockUser({ role: 'admin' }),
  },
  
  warehouses: {
    active: () => createMockWarehouse({ is_active: true }),
    inactive: () => createMockWarehouse({ is_active: false }),
    withCapacity: (capacity: number) => createMockWarehouse({ capacity }),
  },
  
  equipment: {
    available: () => createMockEquipment({ is_available: true }),
    unavailable: () => createMockEquipment({ is_available: false }),
    withRate: (rate: number) => createMockEquipment({ daily_rate: rate }),
  },
  
  schedules: {
    active: () => createMockSoilTestingSchedule({ is_active: true }),
    inactive: () => createMockSoilTestingSchedule({ is_active: false }),
    withCapacity: (capacity: number) => createMockSoilTestingSchedule({ max_appointments: capacity }),
  },
  
  requests: {
    pending: () => createMockSoilTestingRequest({ status: 'pending' }),
    approved: () => createMockSoilTestingRequest({ status: 'approved' }),
    rejected: () => createMockSoilTestingRequest({ status: 'rejected' }),
  },
  
  timeSlots: {
    available: () => createMockTimeSlot({ is_available: true }),
    unavailable: () => createMockTimeSlot({ is_available: false }),
    withCapacity: (capacity: number) => createMockTimeSlot({ max_appointments: capacity }),
  },
};

/**
 * Common test assertions
 */
export const CommonAssertions = {
  /**
   * Assert that a database query was called with specific parameters
   */
  expectDatabaseQuery: (mockConnection: MockDatabaseConnection, expectedQuery: string, expectedParams?: any[]) => {
    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.stringContaining(expectedQuery),
      expectedParams || expect.anything()
    );
  },
  
  /**
   * Assert that a database execute was called with specific parameters
   */
  expectDatabaseExecute: (mockConnection: MockDatabaseConnection, expectedQuery: string, expectedParams?: any[]) => {
    expect(mockConnection.execute).toHaveBeenCalledWith(
      expect.stringContaining(expectedQuery),
      expectedParams || expect.anything()
    );
  },
  
  /**
   * Assert that a service method was called with specific parameters
   */
  expectServiceCall: (mockService: any, methodName: string, expectedParams?: any[]) => {
    expect(mockService[methodName]).toHaveBeenCalledWith(...(expectedParams || []));
  },
  
  /**
   * Assert that a notification was sent
   */
  expectNotificationSent: (mockNotificationService: any, methodName: string, expectedParams?: any[]) => {
    expect(mockNotificationService[methodName]).toHaveBeenCalledWith(...(expectedParams || []));
  },
};
