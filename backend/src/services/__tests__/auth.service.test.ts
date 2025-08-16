import AuthService from '../auth';
import ValidationService from '../validation';
import NotificationService from '../notification';
import OTPService from '../otp';
import { User, UserCreateData, LoginData, PasswordChangeData, ForgotPasswordData, ResetPasswordData, ProfileUpdateData, AuthResponse } from '../../types';
import bcrypt from 'bcryptjs';
import { pool } from '../../config/database';

// Mock dependencies
jest.mock('../validation');
jest.mock('../notification');
jest.mock('../otp');
jest.mock('bcryptjs');
jest.mock('../../config/database');

describe('AuthService', () => {
  // Mock data
  const mockUserData: UserCreateData = {
    username: 'testuser',
    email: 'test@example.com',
    phone: '+1234567890',
    nic: '123456789012',
    password: 'Password123!',
    role: 'farmer',
    first_name: 'Test',
    last_name: 'User'
  };

  const mockLoginData: LoginData = {
    username: 'testuser',
    password: 'Password123!'
  };

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    phone: '+1234567890',
    nic: '123456789012',
    password_hash: 'hashed_password',
    role: 'farmer',
    first_name: 'Test',
    last_name: 'User',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  };

  // Mock connection
  const mockConnection = {
    query: jest.fn(),
    execute: jest.fn(),
    release: jest.fn()
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup database connection mock
    (pool.getConnection as jest.Mock).mockResolvedValue(mockConnection);

    // Setup bcrypt mocks
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Setup validation mocks
    (ValidationService.validateUserRegistration as jest.Mock).mockReturnValue([]);
    (ValidationService.validateLogin as jest.Mock).mockReturnValue([]);
    (ValidationService.validatePasswordChange as jest.Mock).mockReturnValue([]);
    (ValidationService.validateForgotPassword as jest.Mock).mockReturnValue([]);
    (ValidationService.validateResetPassword as jest.Mock).mockReturnValue([]);
    (ValidationService.validateLanguageUpdate as jest.Mock).mockReturnValue([]);
    (ValidationService.validateProfileUpdate as jest.Mock).mockReturnValue([]);

    // Setup notification mock
    (NotificationService.sendSMS as jest.Mock).mockResolvedValue(true);

    // Setup OTP mock
    (OTPService.generateOTP as jest.Mock).mockReturnValue('123456');
    (OTPService.storeOTP as jest.Mock).mockReturnValue(undefined);
    (OTPService.clearOTP as jest.Mock).mockReturnValue(undefined);
    (OTPService.verifyOTP as jest.Mock).mockReturnValue(true);
  });

  describe('User Registration', () => {
    describe('registerUser', () => {
      it('should register user successfully when all data is valid', async () => {
        // Mock database responses for uniqueness checks (private methods)
        mockConnection.execute
          .mockResolvedValueOnce([[]])  // findUserByUsername - No existing username
          .mockResolvedValueOnce([[]])  // findUserByEmail - No existing email
          .mockResolvedValueOnce([[]])  // findUserByPhone - No existing phone
          .mockResolvedValueOnce([[]])  // findUserByNic - No existing NIC
          .mockResolvedValueOnce([{ insertId: 1 }])  // Insert user
          .mockResolvedValueOnce([[mockUser]]); // Get created user

        const result = await AuthService.registerUser(mockUserData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('User registered successfully');
        expect(result.data).toBeDefined();
        expect(ValidationService.validateUserRegistration).toHaveBeenCalledWith(mockUserData);
        expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, expect.any(Number));
      });

      it('should return error when validation fails', async () => {
        const validationErrors = [{ field: 'username', message: 'Username is required' }];
        (ValidationService.validateUserRegistration as jest.Mock).mockReturnValue(validationErrors);

        const result = await AuthService.registerUser(mockUserData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Validation failed');
      });

      it('should return error for duplicate username', async () => {
        mockConnection.execute.mockResolvedValueOnce([[{ id: 1 }]]); // findUserByUsername returns user

        const result = await AuthService.registerUser(mockUserData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Username already exists');
      });

      it('should return error for duplicate email', async () => {
        mockConnection.execute
          .mockResolvedValueOnce([[]])  // findUserByUsername - No existing username
          .mockResolvedValueOnce([[{ id: 1 }]]); // findUserByEmail - Existing email

        const result = await AuthService.registerUser(mockUserData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Email already exists');
      });

      it('should return error for duplicate phone', async () => {
        mockConnection.execute
          .mockResolvedValueOnce([[]])  // findUserByUsername - No existing username
          .mockResolvedValueOnce([[]])  // findUserByEmail - No existing email
          .mockResolvedValueOnce([[{ id: 1 }]]); // findUserByPhone - Existing phone

        const result = await AuthService.registerUser(mockUserData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Phone number already exists');
      });

      it('should return error for duplicate NIC', async () => {
        mockConnection.execute
          .mockResolvedValueOnce([[]])  // findUserByUsername - No existing username
          .mockResolvedValueOnce([[]])  // findUserByEmail - No existing email
          .mockResolvedValueOnce([[]])  // findUserByPhone - No existing phone
          .mockResolvedValueOnce([[{ id: 1 }]]); // findUserByNic - Existing NIC

        const result = await AuthService.registerUser(mockUserData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('NIC already exists');
      });

      it('should handle database errors gracefully', async () => {
        mockConnection.execute
          .mockResolvedValueOnce([[]])  // findUserByUsername - No existing username
          .mockResolvedValueOnce([[]])  // findUserByEmail - No existing email
          .mockResolvedValueOnce([[]])  // findUserByPhone - No existing phone
          .mockResolvedValueOnce([[]])  // findUserByNic - No existing NIC
          .mockRejectedValueOnce(new Error('Database error')); // Insert user fails

        const result = await AuthService.registerUser(mockUserData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Registration failed. Please try again.');
      });
    });
  });

  describe('User Authentication', () => {
    describe('loginUser', () => {
      it('should login successfully with valid credentials', async () => {
        mockConnection.execute.mockResolvedValueOnce([[mockUser]]); // findUserByUsername returns user
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const result = await AuthService.loginUser(mockLoginData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Login successful');
        expect(result.data).toBeDefined();
        expect(result.data?.token).toBeDefined();
        expect(result.data?.user).toBeDefined();
        expect(bcrypt.compare).toHaveBeenCalledWith(mockLoginData.password, mockUser.password_hash);
      });

      it('should return error for non-existent user', async () => {
        // Mock attempts to find user by username, phone, and NIC (all return empty)
        mockConnection.execute
          .mockResolvedValueOnce([[]])  // findUserByUsername - No user found
          .mockResolvedValueOnce([[]])  // findUserByPhone - No user found
          .mockResolvedValueOnce([[]]); // findUserByNic - No user found

        const result = await AuthService.loginUser(mockLoginData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid username/email/phone/NIC or password');
      });

      it('should return error for inactive account', async () => {
        const inactiveUser = { ...mockUser, is_active: false };
        mockConnection.execute.mockResolvedValueOnce([[inactiveUser]]); // findUserByUsername returns inactive user

        const result = await AuthService.loginUser(mockLoginData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Account is deactivated. Please contact support.');
      });

      it('should return error for incorrect password', async () => {
        mockConnection.execute.mockResolvedValueOnce([[mockUser]]); // findUserByUsername returns user
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        const result = await AuthService.loginUser(mockLoginData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid username/email/phone/NIC or password');
      });
    });
  });

  describe('Password Management', () => {
    describe('changePassword', () => {
      const mockPasswordData: PasswordChangeData = {
        current_password: 'OldPassword123!',
        new_password: 'NewPassword123!'
      };

      it('should change password successfully', async () => {
        mockConnection.execute
          .mockResolvedValueOnce([[mockUser]])  // findUserById returns user
          .mockResolvedValueOnce([{ affectedRows: 1 }]); // update password

        const result = await AuthService.changePassword(1, mockPasswordData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Password changed successfully');
        expect(bcrypt.compare).toHaveBeenCalledWith(mockPasswordData.current_password, mockUser.password_hash);
        expect(bcrypt.hash).toHaveBeenCalledWith(mockPasswordData.new_password, expect.any(Number));
      });

      it('should return error for incorrect current password', async () => {
        mockConnection.execute.mockResolvedValueOnce([[mockUser]]); // findUserById returns user
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        const result = await AuthService.changePassword(1, mockPasswordData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Current password is incorrect');
      });

      it('should return error for non-existent user', async () => {
        mockConnection.execute.mockResolvedValueOnce([[]]); // findUserById returns no user

        const result = await AuthService.changePassword(1, mockPasswordData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('User not found');
      });
    });

    describe('forgotPassword', () => {
      const mockForgotPasswordData: ForgotPasswordData = {
        nic: '123456789012'
      };

      it('should send OTP successfully', async () => {
        mockConnection.execute
          .mockResolvedValueOnce([[mockUser]])  // findUserByNic returns user
          .mockResolvedValueOnce([{ affectedRows: 1 }]); // update OTP

        const result = await AuthService.forgotPassword(mockForgotPasswordData.nic);

        expect(result.success).toBe(true);
        expect(result.message).toContain('OTP sent successfully');
        expect(OTPService.generateOTP).toHaveBeenCalled();
        expect(NotificationService.sendSMS).toHaveBeenCalled();
      });

      it('should return error for non-existent user', async () => {
        mockConnection.execute.mockResolvedValueOnce([[]]); // findUserByNic returns no user

        const result = await AuthService.forgotPassword(mockForgotPasswordData.nic);

        expect(result.success).toBe(false);
        expect(result.message).toBe('No user found with this NIC number');
      });

      it('should handle SMS sending failure', async () => {
        mockConnection.execute.mockResolvedValueOnce([[mockUser]]); // findUserByNic returns user
        (NotificationService.sendSMS as jest.Mock).mockResolvedValue(false);

        const result = await AuthService.forgotPassword(mockForgotPasswordData.nic);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to send OTP. Please try again.');
      });
    });

    describe('resetPassword', () => {
      const mockResetPasswordData: ResetPasswordData = {
        nic: '123456789012',
        otp: '123456',
        new_password: 'NewPassword123!'
      };

      it('should reset password successfully', async () => {
        mockConnection.execute
          .mockResolvedValueOnce([[{ ...mockUser, reset_otp: '123456', reset_otp_expiry: new Date(Date.now() + 600000) }]]) // findUserByNic returns user with OTP
          .mockResolvedValueOnce([{ affectedRows: 1 }]); // update password

        const result = await AuthService.resetPassword(mockResetPasswordData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Password reset successfully');
        expect(bcrypt.hash).toHaveBeenCalledWith(mockResetPasswordData.new_password, expect.any(Number));
      });

      it('should return error for non-existent user', async () => {
        mockConnection.execute.mockResolvedValueOnce([[]]); // findUserByNic returns no user

        const result = await AuthService.resetPassword(mockResetPasswordData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('No user found with this NIC number');
      });

      it('should return error for invalid OTP', async () => {
        mockConnection.execute.mockResolvedValueOnce([[{ ...mockUser, reset_otp: '654321' }]]); // findUserByNic returns user with wrong OTP

        const result = await AuthService.resetPassword(mockResetPasswordData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid OTP');
      });
    });
  });

  describe('Profile Management', () => {
    describe('updateProfile', () => {
      const mockUpdateData: ProfileUpdateData = {
        first_name: 'Updated',
        last_name: 'Name',
        email: 'updated@example.com',
        phone: '+9876543210',
        language: 'si'
      };

      it('should update profile successfully', async () => {
        mockConnection.execute
          .mockResolvedValueOnce([[mockUser]])  // findUserById returns user
          .mockResolvedValueOnce([{ affectedRows: 1 }])  // update profile
          .mockResolvedValueOnce([[mockUser]]); // findUserById returns updated user

        const result = await AuthService.updateProfile(1, mockUpdateData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Profile updated successfully');
      });

      it('should return error for non-existent user', async () => {
        mockConnection.execute.mockResolvedValueOnce([[]]); // findUserById returns no user

        const result = await AuthService.updateProfile(1, mockUpdateData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('User not found');
      });

      it('should handle database errors gracefully', async () => {
        mockConnection.execute
          .mockResolvedValueOnce([[mockUser]])  // findUserById returns user
          .mockResolvedValueOnce([[]])  // findUserByEmail - no existing email
          .mockResolvedValueOnce([[]])  // findUserByPhone - no existing phone
          .mockRejectedValueOnce(new Error('Database error')); // update profile fails

        const result = await AuthService.updateProfile(1, mockUpdateData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to update profile. Please try again.');
      });
    });
  });
});