import { Router, Request, Response } from 'express';
import AuthService from '../services/auth';
import ResponseService from '../services/response';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { uploadProfilePicture, generateFileUrl } from '../services/upload';
import ValidationService from '../services/validation';
import { MOBILE_APP_SUPPORTED_ROLES } from '../config/constants';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    
    // Debug logging
    console.log('Registration request received:', JSON.stringify(userData, null, 2));

    // Transform frontend data to backend format
    const transformedUserData = {
      ...userData,
      // Handle both frontend formats (phoneNo vs phone, name vs first_name)
      phone: userData.phoneNo || userData.phone,
      nic: userData.nic || '000000000000', 
      // Split name into first_name and last_name
      first_name: (userData.name || userData.first_name || '').split(' ')[0] || '',
      last_name: (() => {
        const fullName = userData.name || userData.first_name || '';
        const nameParts = fullName.split(' ').filter((part: string) => part.trim() !== '');
        return nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
      })(),
    };

    console.log('Original userData:', JSON.stringify(userData, null, 2));
    console.log('Transformed userData:', JSON.stringify(transformedUserData, null, 2));

    // Validate input data
    const validationErrors = ValidationService.validateUserRegistration(transformedUserData);
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      return ResponseService.validationError(res, validationErrors);
    }

    // Register user
    const result = await AuthService.registerUser(transformedUserData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message, 201);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Registration error:', error);
    return ResponseService.error(res, 'Registration failed. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const loginData = req.body;
    
    // Debug logging
    console.log('Login request received:', JSON.stringify(loginData, null, 2));

    // Transform frontend data to backend format if needed
    const transformedLoginData = {
      ...loginData,
      // If identifier is sent, parse it into appropriate fields
      ...(loginData.identifier && {
        ...(loginData.identifier.includes('@') && { email: loginData.identifier }),
        ...(loginData.identifier.length === 10 && /^\d+$/.test(loginData.identifier) && { phone: loginData.identifier }),
        ...(loginData.identifier.length === 12 && /^\d+$/.test(loginData.identifier) && { nic: loginData.identifier }),
        ...(!loginData.identifier.includes('@') && loginData.identifier.length !== 10 && loginData.identifier.length !== 12 && { username: loginData.identifier }),
      })
    };

    console.log('Transformed login data:', JSON.stringify(transformedLoginData, null, 2));

    // Validate input data
    const validationErrors = ValidationService.validateLogin(transformedLoginData);
    if (validationErrors.length > 0) {
      console.log('Login validation errors:', validationErrors);
      return ResponseService.validationError(res, validationErrors);
    }
    
    console.log('Login validation passed, calling AuthService...');

    // Login user
    const result = await AuthService.loginUser(transformedLoginData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 401);
    }
  } catch (error) {
    console.error('Login error:', error);
    return ResponseService.error(res, 'Login failed. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/auth/google-auth
 * @desc    Google authentication for existing users
 * @access  Public
 */
router.post('/google-auth', async (req: Request, res: Response) => {
  try {
    const { idToken, accessToken, user } = req.body;

    if (!idToken || !accessToken || !user) {
      return ResponseService.error(res, 'Missing required Google authentication data', 400);
    }

    // Verify Google ID token and authenticate user
    const result = await AuthService.authenticateWithGoogle({ idToken, accessToken, user });

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 401);
    }
  } catch (error) {
    console.error('Google authentication error:', error);
    return ResponseService.error(res, 'Google authentication failed. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/auth/google-signup
 * @desc    Google signup for new users
 * @access  Public
 */
router.post('/google-signup', async (req: Request, res: Response) => {
  try {
    const { idToken, accessToken, user } = req.body;

    if (!idToken || !accessToken || !user) {
      return ResponseService.error(res, 'Missing required Google authentication data', 400);
    }

    // Validate Google signup data
    const validationErrors = ValidationService.validateGoogleSignup({ idToken, accessToken, user });
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    // Create new user with Google authentication
    const result = await AuthService.signupWithGoogle({ idToken, accessToken, user });

    if (result.success) {
      return ResponseService.success(res, result.data, result.message, 201);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Google signup error:', error);
    return ResponseService.error(res, 'Google signup failed. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authenticateToken, async (req: Request, res: Response) => {
  try {
    const passwordData = req.body;
    const userId = (req as any).user?.userId;

    // Validate input data
    const validationErrors = ValidationService.validatePasswordChange(passwordData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    // Change password
    const result = await AuthService.changePassword(userId, passwordData);

    if (result.success) {
      return ResponseService.success(res, null, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Password change error:', error);
    return ResponseService.error(res, 'Password change failed. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset OTP
 * @access  Public
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { nic } = req.body;

    // Validate input data
    const validationErrors = ValidationService.validateForgotPassword({ nic });
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    // Send OTP
    const result = await AuthService.forgotPassword(nic);

    if (result.success) {
      return ResponseService.success(res, null, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return ResponseService.error(res, 'Failed to process request. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const resetData = req.body;

    // Validate input data
    const validationErrors = ValidationService.validateResetPassword(resetData);
    if (validationErrors.length > 0) {
      return ResponseService.validationError(res, validationErrors);
    }

    // Reset password
    const result = await AuthService.resetPassword(resetData);

    if (result.success) {
      return ResponseService.success(res, null, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return ResponseService.error(res, 'Password reset failed. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    // Get user profile from database
    const connection = await require('../config/database').pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT id, username, email, phone, nic, role, first_name, last_name, location_id, is_active, created_at, updated_at
        FROM users WHERE id = ?
      `, [userId]);

      const users = rows as any[];
      if (users.length === 0) {
        return ResponseService.error(res, 'User not found', 404);
      }

      const user = users[0];
      return ResponseService.success(res, user, 'Profile retrieved successfully');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Profile retrieval error:', error);
    return ResponseService.error(res, 'Failed to retrieve profile. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/auth/verify-token
 * @desc    Verify JWT token validity
 * @access  Private
 */
router.get('/verify-token', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  return ResponseService.success(res, { valid: true, user: req.user }, 'Token is valid');
});

/**
 * @route   PUT /api/v1/auth/update-language
 * @desc    Update user language preference
 * @access  Private
 */
router.put('/update-language', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const languageData = req.body;
    
    // Update language preference
    const result = await AuthService.updateLanguage(languageData);

    if (result.success) {
      return ResponseService.success(res, null, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Language update error:', error);
    return ResponseService.error(res, 'Failed to update language preference. Please try again.', 500);
  }
});

/**
 * @route   PUT /api/v1/auth/update-profile
 * @desc    Update user profile details
 * @access  Private
 */
router.put('/update-profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const updateData = req.body;
    
    // Update profile
    const result = await AuthService.updateProfile(userId, updateData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return ResponseService.error(res, 'Failed to update profile. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/auth/upload-profile-picture
 * @desc    Upload profile picture
 * @access  Private
 */
router.post('/upload-profile-picture', authenticateToken, uploadProfilePicture.single('profile_picture'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return ResponseService.error(res, 'No file uploaded', 400);
    }

    const userId = req.user!.userId;
    const filename = req.file.filename;
    const fileUrl = generateFileUrl(filename);
    
    // Update user's profile_image_url in database
    const updateData = { profile_image_url: fileUrl };
    const result = await AuthService.updateProfile(userId, updateData);

    if (result.success) {
      return ResponseService.success(res, {
        filename: filename,
        url: fileUrl,
        user: result.data
      }, 'Profile picture uploaded successfully');
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Profile picture upload error:', error);
    return ResponseService.error(res, 'Failed to upload profile picture. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/auth/locations
 * @desc    Add user location
 * @access  Private
 */
router.post('/locations', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const locationData = { ...req.body, user_id: userId };
    
    // Add location
    const result = await AuthService.addUserLocation(locationData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Add location error:', error);
    return ResponseService.error(res, 'Failed to add location. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/auth/locations
 * @desc    Get user locations
 * @access  Private
 */
router.get('/locations', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // Get locations
    const result = await AuthService.getUserLocations(userId);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get locations error:', error);
    return ResponseService.error(res, 'Failed to retrieve locations. Please try again.', 500);
  }
});

/**
 * @route   PUT /api/v1/auth/locations/:id
 * @desc    Update user location
 * @access  Private
 */
router.put('/locations/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const locationId = parseInt(req.params.id);
    const updateData = req.body;
    
    // Update location
    const result = await AuthService.updateUserLocation(locationId, updateData);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Update location error:', error);
    return ResponseService.error(res, 'Failed to update location. Please try again.', 500);
  }
});

/**
 * @route   DELETE /api/v1/auth/locations/:id
 * @desc    Delete user location
 * @access  Private
 */
router.delete('/locations/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const locationId = parseInt(req.params.id);
    
    // Delete location
    const result = await AuthService.deleteUserLocation(locationId);

    if (result.success) {
      return ResponseService.success(res, null, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Delete location error:', error);
    return ResponseService.error(res, 'Failed to delete location. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/auth/locations/summary
 * @desc    Get user location summary
 * @access  Private
 */
router.get('/locations/summary', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // Get location summary
    const result = await AuthService.getUserLocationSummary(userId);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get location summary error:', error);
    return ResponseService.error(res, 'Failed to retrieve location summary. Please try again.', 500);
  }
});

/**
 * @route   GET /api/v1/auth/locations/nearby
 * @desc    Get nearby locations
 * @access  Private
 */
router.get('/locations/nearby', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { latitude, longitude, radius } = req.query;
    
    if (!latitude || !longitude) {
      return ResponseService.error(res, 'Latitude and longitude are required', 400);
    }
    
    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const radiusKm = radius ? parseFloat(radius as string) : 10;
    
    // Get nearby locations
    const result = await AuthService.getNearbyLocations(lat, lng, radiusKm);

    if (result.success) {
      return ResponseService.success(res, result.data, result.message);
    } else {
      return ResponseService.error(res, result.message, 400);
    }
  } catch (error) {
    console.error('Get nearby locations error:', error);
    return ResponseService.error(res, 'Failed to retrieve nearby locations. Please try again.', 500);
  }
});

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh JWT token (placeholder for future implementation)
 * @access  Private
 */
router.post('/refresh-token', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  // This is a placeholder for future token refresh implementation
  return ResponseService.error(res, 'Token refresh not implemented yet', 501);
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (placeholder for future implementation)
 * @access  Private
 */
router.post('/logout', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  // This is a placeholder for future logout implementation
  // In a real implementation, you might want to blacklist the token
  return ResponseService.success(res, null, 'Logout successful');
});

export default router;
