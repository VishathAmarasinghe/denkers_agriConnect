import express from 'express';
const { body, validationResult } = require('express-validator');
import GoogleAuthService from '../services/googleAuth';
import ResponseService from '../services/response';

const router = express.Router();
const responseService = ResponseService;

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
  async (req: express.Request, res: express.Response) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseService.error(
          res,
          'Validation Error',
          400,
          errors.array().map((err: any) => err.msg)
        );
      }

      const { idToken } = req.body;

      // Authenticate with Google
      const result = await GoogleAuthService.authenticateWithGoogle(idToken);

      return responseService.success(
        res,
        {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.first_name,
            lastName: result.user.last_name,
            profilePicture: result.user.profile_image_url,
            createdAt: result.user.created_at,
          },
          accessToken: result.accessToken,
        },
        'Google authentication successful',
        200
      );
    } catch (error: any) {
      console.error('Google authentication error:', error);
      return responseService.error(
        res,
        'Authentication failed',
        401,
        [error.message]
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
  async (req: express.Request, res: express.Response) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseService.error(
          res,
          'Validation Error',
          400,
          errors.array().map((err: any) => err.msg)
        );
      }

      const { accessToken } = req.body;

      // Get user profile from Google
      const profile = await GoogleAuthService.getUserProfile(accessToken);

      return responseService.success(
        res,
        profile,
        'Profile retrieved successfully',
        200
      );
    } catch (error: any) {
      console.error('Get profile error:', error);
      return responseService.error(
        res,
        'Failed to get profile',
        400,
        [error.message]
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
  async (req: express.Request, res: express.Response) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseService.error(
          res,
          'Validation Error',
          400,
          errors.array().map((err: any) => err.msg)
        );
      }

      const { accessToken } = req.body;

      // Revoke Google access
      await GoogleAuthService.revokeAccess(accessToken);

      return responseService.success(
        res,
        null,
        'Google access revoked successfully',
        200
      );
    } catch (error: any) {
      console.error('Revoke access error:', error);
      return responseService.error(
        res,
        'Failed to revoke access',
        400,
        [error.message]
      );
    }
  }
);

export default router;
