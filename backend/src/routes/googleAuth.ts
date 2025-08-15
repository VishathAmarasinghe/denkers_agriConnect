import express from 'express';
import { body, validationResult } from 'express-validator';
import GoogleAuthService from '../services/googleAuth';
import { ResponseService } from '../services/response';

const router = express.Router();
const responseService = new ResponseService();

/**
 * @route POST /api/v1/auth/google
 * @desc Authenticate user with Google ID token
 * @access Public
 */
router.post(
  '/',
  [
    body('idToken')
      .notEmpty()
      .withMessage('Google ID token is required')
      .isString()
      .withMessage('Google ID token must be a string'),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseService.sendError(
          res,
          'Validation Error',
          errors.array(),
          400
        );
      }

      const { idToken } = req.body;

      // Authenticate with Google
      const result = await GoogleAuthService.authenticateWithGoogle(idToken);

      return responseService.sendSuccess(
        res,
        'Google authentication successful',
        {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.first_name,
            lastName: result.user.last_name,
            profilePicture: result.user.profile_picture,
            emailVerified: result.user.email_verified,
            createdAt: result.user.created_at,
          },
          accessToken: result.accessToken,
        },
        200
      );
    } catch (error: any) {
      console.error('Google authentication error:', error);
      return responseService.sendError(
        res,
        'Authentication failed',
        error.message,
        401
      );
    }
  }
);

/**
 * @route POST /api/v1/auth/google/profile
 * @desc Get user's Google profile information
 * @access Private
 */
router.post(
  '/profile',
  [
    body('accessToken')
      .notEmpty()
      .withMessage('Access token is required')
      .isString()
      .withMessage('Access token must be a string'),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseService.sendError(
          res,
          'Validation Error',
          errors.array(),
          400
        );
      }

      const { accessToken } = req.body;

      // Get user profile from Google
      const profile = await GoogleAuthService.getUserProfile(accessToken);

      return responseService.sendSuccess(
        res,
        'Profile retrieved successfully',
        profile,
        200
      );
    } catch (error: any) {
      console.error('Get profile error:', error);
      return responseService.sendError(
        res,
        'Failed to get profile',
        error.message,
        400
      );
    }
  }
);

/**
 * @route POST /api/v1/auth/google/revoke
 * @desc Revoke Google access token
 * @access Private
 */
router.post(
  '/revoke',
  [
    body('accessToken')
      .notEmpty()
      .withMessage('Access token is required')
      .isString()
      .withMessage('Access token must be a string'),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseService.sendError(
          res,
          'Validation Error',
          errors.array(),
          400
        );
      }

      const { accessToken } = req.body;

      // Revoke Google access
      await GoogleAuthService.revokeAccess(accessToken);

      return responseService.sendSuccess(
        res,
        'Google access revoked successfully',
        null,
        200
      );
    } catch (error: any) {
      console.error('Revoke access error:', error);
      return responseService.sendError(
        res,
        'Failed to revoke access',
        error.message,
        400
      );
    }
  }
);

export default router;
