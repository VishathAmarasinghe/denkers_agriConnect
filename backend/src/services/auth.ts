import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { User, UserCreateData, LoginData, PasswordChangeData, ForgotPasswordData, ResetPasswordData, AuthResponse, ApiResponse, JWTPayload, AuthServiceInterface, LanguageUpdateData, ProfileUpdateData, UserLocationCreateData, UserLocationUpdateData } from '../types';
import ValidationService from './validation';
import NotificationService from './notification';
import OTPService from './otp';
import { ROLE_MAPPING, MOBILE_APP_SUPPORTED_ROLES, DB_ROLE_FARMER } from '../config/constants';
import UserLocationModel from '../models/UserLocation';

class AuthService implements AuthServiceInterface {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    this.JWT_EXPIRES_IN = '24h';
  }

  /**
   * Register a new user
   */
  async registerUser(userData: UserCreateData): Promise<AuthResponse> {
    try {
      console.log('AuthService: Starting user registration for:', userData.username);
      
      // Validate input data
      const validationErrors = ValidationService.validateUserRegistration(userData);
      if (validationErrors.length > 0) {
        console.log('AuthService: Validation failed with errors:', validationErrors);
        return {
          success: false,
          message: 'Validation failed',
          data: undefined
        };
      }
      
      console.log('AuthService: Validation passed, checking for existing users...');

      // Check if user already exists
      const existingUser = await this.findUserByUsername(userData.username);
      if (existingUser) {
        return {
          success: false,
          message: 'Username already exists',
          data: undefined
        };
      }

      // Only check email uniqueness if email is provided
      if (userData.email) {
        const existingEmail = await this.findUserByEmail(userData.email);
        if (existingEmail) {
          return {
            success: false,
            message: 'Email already exists',
            data: undefined
          };
        }
      }

      const existingPhone = await this.findUserByPhone(userData.phone);
      if (existingPhone) {
        return {
          success: false,
          message: 'Phone number already exists',
          data: undefined
        };
      }

      const existingNic = await this.findUserByNic(userData.nic);
      if (existingNic) {
        return {
          success: false,
          message: 'NIC already exists',
          data: undefined
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      console.log('AuthService: Creating user in database...');
      const connection = await pool.getConnection();
      try {
        const insertQuery = `
          INSERT INTO users (username, email, phone, nic, password_hash, role, first_name, last_name, location_id, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const insertValues = [
          userData.username,
          userData.email,
          userData.phone,
          userData.nic,
          hashedPassword,
          userData.role,
          userData.first_name,
          userData.last_name,
          userData.location_id || null,
          true // is_active
        ];
        
        console.log('AuthService: Insert query:', insertQuery);
        console.log('AuthService: Insert values:', insertValues);
        
        const [result] = await connection.execute(insertQuery, insertValues);

        const userId = (result as any).insertId;

        // Get the created user (without password)
        const [users] = await connection.execute(`
          SELECT id, username, email, phone, nic, role, first_name, last_name, location_id, is_active, created_at, updated_at, google_oauth_id, profile_image_url
          FROM users WHERE id = ?
        `, [userId]);

        const user = (users as any[])[0];

        // Generate JWT token
        const token = this.generateToken(user);

        return {
          success: true,
          message: 'User registered successfully',
          data: {
            token,
            user
          }
        };
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.',
        data: undefined
      };
    }
  }

  /**
   * Login user
   */
  async loginUser(loginData: LoginData): Promise<AuthResponse> {
    try {
      console.log('AuthService: Login attempt with data:', { 
        username: loginData.username, 
        email: loginData.email, 
        hasPassword: !!loginData.password 
      });
      
      // Validate input data
      const validationErrors = ValidationService.validateLogin(loginData);
      if (validationErrors.length > 0) {
        console.log('AuthService: Login validation failed:', validationErrors);
        return {
          success: false,
          message: 'Validation failed',
          data: undefined
        };
      }
      
      console.log('AuthService: Login validation passed, searching for user...');

      // Find user by username, email, phone, or NIC
      let user = null;
      if (loginData.username) {
        console.log('AuthService: Searching for user by username:', loginData.username);
        user = await this.findUserByUsername(loginData.username);
      } else if (loginData.email) {
        console.log('AuthService: Searching for user by email:', loginData.email);
        user = await this.findUserByEmail(loginData.email);
      } else if (loginData.phone) {
        console.log('AuthService: Searching for user by phone:', loginData.phone);
        user = await this.findUserByPhone(loginData.phone);
      } else if (loginData.nic) {
        console.log('AuthService: Searching for user by NIC:', loginData.nic);
        user = await this.findUserByNic(loginData.nic);
      }
      
      // If still no user found and we have a username, try searching by phone or NIC
      if (!user && loginData.username) {
        console.log('AuthService: Trying to find user by phone:', loginData.username);
        user = await this.findUserByPhone(loginData.username);
        
        // If still no user found, try searching by NIC
        if (!user) {
          console.log('AuthService: Trying to find user by NIC:', loginData.username);
          user = await this.findUserByNic(loginData.username);
        }
      }
      
      if (!user) {
        console.log('AuthService: User not found');
        return {
          success: false,
          message: 'Invalid username/email/phone/NIC or password',
          data: undefined
        };
      }
      
      console.log('AuthService: User found:', { id: user.id, username: user.username, role: user.role });

      // Check if user is active
      if (!user.is_active) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact support.',
          data: undefined
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid username/email/phone/NIC or password',
          data: undefined
        };
      }

      // Generate JWT token
      const token = this.generateToken(user);

      // Remove password from user object
      const { password_hash, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: userWithoutPassword
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.',
        data: undefined
      };
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: number, passwordData: PasswordChangeData): Promise<ApiResponse> {
    try {
      // Validate input data
      const validationErrors = ValidationService.validatePasswordChange(passwordData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validationErrors.map(error => `${error.field}: ${error.message}`)
        };
      }

      // Get user
      const user = await this.findUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(passwordData.current_password, user.password_hash);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(passwordData.new_password, 10);

      // Update password
      const connection = await pool.getConnection();
      try {
        await connection.execute(`
          UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [hashedNewPassword, userId]);

        return {
          success: true,
          message: 'Password changed successfully'
        };
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        message: 'Password change failed. Please try again.'
      };
    }
  }

  /**
   * Forgot password - send OTP
   */
  async forgotPassword(nic: string): Promise<ApiResponse> {
    try {
      // Validate NIC
      const validationErrors = ValidationService.validateForgotPassword({ nic });
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validationErrors.map(error => `${error.field}: ${error.message}`)
        };
      }

      // Find user by NIC
      const user = await this.findUserByNic(nic);
      if (!user) {
        return {
          success: false,
          message: 'No user found with this NIC number'
        };
      }

      // Check if user is active
      if (!user.is_active) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact support.'
        };
      }

      // Get phone number from user record
      const phone = user.phone;
      if (!phone) {
        return {
          success: false,
          message: 'No phone number found for this account. Please contact support.'
        };
      }

      // Generate and store OTP
      const otp = OTPService.generateOTP(phone);
      OTPService.storeOTP(phone, otp);

      // Send OTP via SMS
      const smsSent = await NotificationService.sendSMS({
        recipient: phone,
        message: `Your password reset OTP is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`
      });

      if (!smsSent) {
        return {
          success: false,
          message: 'Failed to send OTP. Please try again.'
        };
      }

      // Store OTP in database
      const connection = await pool.getConnection();
      try {
        const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await connection.execute(`
          UPDATE users SET reset_otp = ?, reset_otp_expiry = ?
          WHERE id = ?
        `, [otp, expiryTime, user.id]);

        return {
          success: true,
          message: `OTP sent successfully to ${phone.substring(0, 3)}****${phone.substring(phone.length - 2)}`
        };
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Failed to process request. Please try again.'
      };
    }
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(resetData: ResetPasswordData): Promise<ApiResponse> {
    try {
      // Validate input data
      const validationErrors = ValidationService.validateResetPassword(resetData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validationErrors.map(error => `${error.field}: ${error.message}`)
        };
      }

      // Find user by NIC
      const user = await this.findUserByNic(resetData.nic);
      if (!user) {
        return {
          success: false,
          message: 'No user found with this NIC number'
        };
      }

      // Verify OTP
      if (user.reset_otp !== resetData.otp) {
        return {
          success: false,
          message: 'Invalid OTP'
        };
      }

      // Check OTP expiry
      if (!user.reset_otp_expiry || new Date() > user.reset_otp_expiry) {
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.'
        };
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(resetData.new_password, 10);

      // Update password and clear OTP
      const connection = await pool.getConnection();
      try {
        await connection.execute(`
          UPDATE users SET password_hash = ?, reset_otp = NULL, reset_otp_expiry = NULL, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [hashedNewPassword, user.id]);

        // Clear OTP from memory (use phone from user record)
        OTPService.clearOTP(user.phone);

        return {
          success: true,
          message: 'Password reset successfully'
        };
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Password reset failed. Please try again.'
      };
    }
  }

  /**
   * Google authentication for existing users
   */
  async authenticateWithGoogle(googleData: { idToken: string; accessToken: string; user: any }): Promise<AuthResponse> {
    try {
      console.log('AuthService: Google authentication attempt for:', googleData.user.email);
      
      // Find user by email
      const user = await this.findUserByEmail(googleData.user.email);
      if (!user) {
        return {
          success: false,
          message: 'No account found with this email. Please sign up first.',
          data: undefined
        };
      }

      // Check if user is active
      if (!user.is_active) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact support.',
          data: undefined
        };
      }

      // Update Google OAuth ID if not set
      if (!user.google_oauth_id) {
        await this.updateGoogleOAuthId(user.id!, googleData.user.id);
        user.google_oauth_id = googleData.user.id;
      }

      // Generate JWT token
      const token = this.generateToken(user);

      // Remove password from user object
      const { password_hash, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'Google authentication successful',
        data: {
          token,
          user: userWithoutPassword
        }
      };
    } catch (error) {
      console.error('Google authentication error:', error);
      return {
        success: false,
        message: 'Google authentication failed. Please try again.',
        data: undefined
      };
    }
  }

  /**
   * Google signup for new users
   */
  async signupWithGoogle(googleData: { idToken: string; accessToken: string; user: any }): Promise<AuthResponse> {
    try {
      console.log('AuthService: Google signup attempt for:', googleData.user.email);
      
      // Check if user already exists
      const existingUser = await this.findUserByEmail(googleData.user.email);
      if (existingUser) {
        return {
          success: false,
          message: 'An account with this email already exists. Please sign in instead.',
          data: undefined
        };
      }

      // Create new user with Google data
      const userData: UserCreateData = {
        username: googleData.user.email, // Use email as username
        email: googleData.user.email,
        phone: '0000000000', // Default phone number since Google doesn't provide it
        nic: '000000000000', // Default NIC since Google doesn't provide it
        password: '', // No password for Google users
        role: DB_ROLE_FARMER, // Mobile app only supports farmers
        first_name: googleData.user.name.split(' ')[0] || googleData.user.name,
        last_name: googleData.user.name.split(' ').slice(1).join(' ') || '',
        google_oauth_id: googleData.user.id,
        profile_image_url: googleData.user.photo,
      };

      // Create user
      const connection = await pool.getConnection();
      try {
        const [result] = await connection.execute(`
          INSERT INTO users (username, email, phone, nic, password_hash, role, first_name, last_name, google_oauth_id, profile_image_url, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          userData.username,
          userData.email,
          userData.phone,
          userData.nic,
          null, // No password hash for Google users
          userData.role,
          userData.first_name,
          userData.last_name,
          userData.google_oauth_id,
          userData.profile_image_url,
          true
        ]);

        const userId = (result as any).insertId;

        // Get the created user (without password)
        const [users] = await connection.execute(`
          SELECT id, username, email, phone, nic, role, first_name, last_name, location_id, is_active, created_at, updated_at, google_oauth_id, profile_image_url
          FROM users WHERE id = ?
        `, [userId]);

        const user = (users as any[])[0];

        // Generate JWT token
        const token = this.generateToken(user);

        return {
          success: true,
          message: 'Google signup successful',
          data: {
            token,
            user
          }
        };
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Google signup error:', error);
      return {
        success: false,
        message: 'Google signup failed. Please try again.',
        data: undefined
      };
    }
  }

  /**
   * Update user's Google OAuth ID
   */
  private async updateGoogleOAuthId(userId: number, googleOAuthId: string): Promise<void> {
    try {
      const connection = await pool.getConnection();
      try {
        await connection.execute(`
          UPDATE users SET google_oauth_id = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [googleOAuthId, userId]);
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error updating Google OAuth ID:', error);
      throw error;
    }
  }

  /**
   * Update user language preference
   */
  async updateLanguage(languageData: LanguageUpdateData): Promise<ApiResponse> {
    try {
      // Validate input data
      const validationErrors = ValidationService.validateLanguageUpdate(languageData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validationErrors.map(error => `${error.field}: ${error.message}`)
        };
      }

      let user: User | null = null;

      // Find user by either userId or NIC
      if (languageData.userId) {
        user = await this.findUserById(languageData.userId);
      } else if (languageData.nic) {
        user = await this.findUserByNic(languageData.nic);
      }

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Check if user is active
      if (!user.is_active) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact support.'
        };
      }

      // Update language preference
      const connection = await pool.getConnection();
      try {
        await connection.execute(`
          UPDATE users SET language = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [languageData.language, user.id]);

        return {
          success: true,
          message: `Language preference updated to ${this.getLanguageName(languageData.language)} successfully`
        };
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Language update error:', error);
      return {
        success: false,
        message: 'Failed to update language preference. Please try again.'
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: number, updateData: ProfileUpdateData): Promise<ApiResponse> {
    try {
      // Validate input data
      const validationErrors = ValidationService.validateProfileUpdate(updateData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validationErrors.map(error => `${error.field}: ${error.message}`)
        };
      }

      // Find user by ID
      const user = await this.findUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Check if user is active
      if (!user.is_active) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact support.'
        };
      }

      // Check if email is being updated and if it's already taken by another user
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await this.findUserByEmail(updateData.email);
        if (existingUser && existingUser.id !== userId) {
          return {
            success: false,
            message: 'Email is already taken by another user'
          };
        }
      }

      // Check if phone is being updated and if it's already taken by another user
      if (updateData.phone && updateData.phone !== user.phone) {
        const existingUser = await this.findUserByPhone(updateData.phone);
        if (existingUser && existingUser.id !== userId) {
          return {
            success: false,
            message: 'Phone number is already taken by another user'
          };
        }
      }

      // Update profile
      const connection = await pool.getConnection();
      try {
        const allowedFields = [
          'first_name', 'last_name', 'email', 'phone', 
          'profile_image_url', 'language', 'location_id',
          'latitude', 'longitude', 'place_id', 'location_name', 'location_address'
        ];
        
        const updates: string[] = [];
        const values: any[] = [];
        
        for (const [key, value] of Object.entries(updateData)) {
          if (allowedFields.includes(key) && value !== undefined) {
            updates.push(`${key} = ?`);
            values.push(value);
          }
        }
        
        if (updates.length === 0) {
          return {
            success: false,
            message: 'No valid fields to update'
          };
        }
        
        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(userId);
        
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        await connection.execute(query, values);

        // Get updated user data
        const updatedUser = await this.findUserById(userId);
        
        return {
          success: true,
          message: 'Profile updated successfully',
          data: updatedUser
        };
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: 'Failed to update profile. Please try again.'
      };
    }
  }

  /**
   * Add user location
   */
  async addUserLocation(locationData: UserLocationCreateData): Promise<ApiResponse> {
    try {
      // Validate user exists
      const user = await this.findUserById(locationData.user_id);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Create location
      const newLocation = await UserLocationModel.create(locationData);
      
      return {
        success: true,
        message: 'Location added successfully',
        data: newLocation
      };
    } catch (error) {
      console.error('Add user location error:', error);
      return {
        success: false,
        message: 'Failed to add location. Please try again.'
      };
    }
  }

  /**
   * Update user location
   */
  async updateUserLocation(locationId: number, updateData: UserLocationUpdateData): Promise<ApiResponse> {
    try {
      // Update location
      const updatedLocation = await UserLocationModel.update(locationId, updateData);
      
      if (!updatedLocation) {
        return {
          success: false,
          message: 'Location not found'
        };
      }
      
      return {
        success: true,
        message: 'Location updated successfully',
        data: updatedLocation
      };
    } catch (error) {
      console.error('Update user location error:', error);
      return {
        success: false,
        message: 'Failed to update location. Please try again.'
      };
    }
  }

  /**
   * Delete user location
   */
  async deleteUserLocation(locationId: number): Promise<ApiResponse> {
    try {
      // Delete location
      const success = await UserLocationModel.delete(locationId);
      
      if (!success) {
        return {
          success: false,
          message: 'Location not found'
        };
      }
      
      return {
        success: true,
        message: 'Location deleted successfully'
      };
    } catch (error) {
      console.error('Delete user location error:', error);
      return {
        success: false,
        message: 'Failed to delete location. Please try again.'
      };
    }
  }

  /**
   * Get user locations
   */
  async getUserLocations(userId: number): Promise<ApiResponse> {
    try {
      // Get locations
      const locations = await UserLocationModel.findByUserId(userId);
      
      return {
        success: true,
        message: 'Locations retrieved successfully',
        data: locations
      };
    } catch (error) {
      console.error('Get user locations error:', error);
      return {
        success: false,
        message: 'Failed to retrieve locations. Please try again.'
      };
    }
  }

  /**
   * Get user location summary
   */
  async getUserLocationSummary(userId: number): Promise<ApiResponse> {
    try {
      // Get location summary
      const summary = await UserLocationModel.getUserLocationSummary(userId);
      
      if (!summary) {
        return {
          success: false,
          message: 'User not found'
        };
      }
      
      return {
        success: true,
        message: 'Location summary retrieved successfully',
        data: summary
      };
    } catch (error) {
      console.error('Get user location summary error:', error);
      return {
        success: false,
        message: 'Failed to retrieve location summary. Please try again.'
      };
    }
  }

  /**
   * Get nearby locations
   */
  async getNearbyLocations(latitude: number, longitude: number, radiusKm: number = 10): Promise<ApiResponse> {
    try {
      // Get nearby locations
      const nearbyLocations = await UserLocationModel.getNearbyLocations(latitude, longitude, radiusKm);
      
      return {
        success: true,
        message: 'Nearby locations retrieved successfully',
        data: nearbyLocations
      };
    } catch (error) {
      console.error('Get nearby locations error:', error);
      return {
        success: false,
        message: 'Failed to retrieve nearby locations. Please try again.'
      };
    }
  }

  /**
   * Get language name from code
   */
  private getLanguageName(languageCode: string): string {
    const languageNames = {
      'si': 'Sinhala',
      'ta': 'Tamil',
      'en': 'English'
    };
    return languageNames[languageCode as keyof typeof languageNames] || languageCode;
  }

  /**
   * Generate JWT token
   */
  generateToken(user: User): string {
    // Map database role to application role
    const applicationRole = ROLE_MAPPING[user.role as keyof typeof ROLE_MAPPING] || user.role;
    
    const payload: JWTPayload = {
      userId: user.id!,
      username: user.username,
      role: applicationRole,
      accessRole: [applicationRole] // Add accessRole array for compatibility with frontend
    };

    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN } as any);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Find user by ID
   */
  private async findUserById(id: number): Promise<User | null> {
    try {
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute(`
          SELECT * FROM users WHERE id = ?
        `, [id]);

        const users = rows as User[];
        return users.length > 0 ? users[0] : null;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Find user by ID error:', error);
      return null;
    }
  }

  /**
   * Find user by username
   */
  private async findUserByUsername(username: string): Promise<User | null> {
    try {
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute(`
          SELECT * FROM users WHERE username = ?
        `, [username]);

        const users = rows as User[];
        return users.length > 0 ? users[0] : null;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Find user by username error:', error);
      return null;
    }
  }

  /**
   * Find user by email
   */
  private async findUserByEmail(email: string): Promise<User | null> {
    try {
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute(`
          SELECT * FROM users WHERE email = ?
        `, [email]);

        const users = rows as User[];
        return users.length > 0 ? users[0] : null;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Find user by email error:', error);
      return null;
    }
  }

  /**
   * Find user by phone
   */
  private async findUserByPhone(phone: string): Promise<User | null> {
    try {
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute(`
          SELECT * FROM users WHERE phone = ?
        `, [phone]);

        const users = rows as User[];
        return users.length > 0 ? users[0] : null;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Find user by phone error:', error);
      return null;
    }
  }

  /**
   * Find user by NIC
   */
  private async findUserByNic(nic: string): Promise<User | null> {
    try {
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute(`
          SELECT * FROM users WHERE nic = ?
        `, [nic]);

        const users = rows as User[];
        return users.length > 0 ? users[0] : null;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Find user by NIC error:', error);
      return null;
    }
  }
}

export default new AuthService();
