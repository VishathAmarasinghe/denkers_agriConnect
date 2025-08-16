import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { User } from '../types';

export class GoogleAuthService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
  }

  /**
   * Verify Google ID token
   */
  async verifyIdToken(idToken: string): Promise<any> {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      return payload;
    } catch (error) {
      console.error('Error verifying Google ID token:', error);
      throw new Error('Invalid Google ID token');
    }
  }

  /**
   * Authenticate user with Google
   */
  async authenticateWithGoogle(idToken: string): Promise<{ user: User; accessToken: string }> {
    try {
      // Verify the Google ID token
      const googleUser = await this.verifyIdToken(idToken);

      // Check if user exists in database
      let user = await this.findUserByGoogleOAuthId(googleUser.sub);

      if (!user) {
        // Create new user if doesn't exist
        user = await this.createUserFromGoogle(googleUser);
      } else {
        // Update existing user's Google info
        await this.updateUserGoogleInfo(user.id, googleUser);
      }

      // Generate JWT token
      const accessToken = this.generateJWT(user);

      return { user, accessToken };
    } catch (error) {
      console.error('Error authenticating with Google:', error);
      throw error;
    }
  }

  /**
   * Find user by Google OAuth ID
   */
  private async findUserByGoogleOAuthId(googleOAuthId: string): Promise<User | null> {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE google_oauth_id = ?',
        [googleOAuthId]
      );

      const users = rows as any[];
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error finding user by Google OAuth ID:', error);
      return null;
    }
  }

  /**
   * Create new user from Google data
   */
  private async createUserFromGoogle(googleUser: any): Promise<User> {
    try {
      const [result] = await pool.execute(
        `INSERT INTO users (
          google_oauth_id, 
          email, 
          first_name, 
          last_name, 
          profile_image_url, 
          email_verified,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          googleUser.sub,
          googleUser.email,
          googleUser.given_name || '',
          googleUser.family_name || '',
          googleUser.picture || '',
          googleUser.email_verified || false,
        ]
      );

      const insertResult = result as any;
      const userId = insertResult.insertId;

      // Fetch the created user
      const [userRows] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      const users = userRows as any[];
      return users[0];
    } catch (error) {
      console.error('Error creating user from Google:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Update user's Google information
   */
  private async updateUserGoogleInfo(userId: number, googleUser: any): Promise<void> {
    try {
      await pool.execute(
        `UPDATE users SET 
          email = ?, 
          first_name = ?, 
          last_name = ?, 
          profile_picture = ?, 
          email_verified = ?,
          updated_at = NOW()
        WHERE id = ?`,
        [
          googleUser.email,
          googleUser.given_name || '',
          googleUser.family_name || '',
          googleUser.picture || '',
          googleUser.email_verified || false,
          userId,
        ]
      );
    } catch (error) {
      console.error('Error updating user Google info:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Generate JWT token
   */
  private generateJWT(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      googleOAuthId: user.google_oauth_id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };

    return jwt.sign(payload, process.env.JWT_SECRET!);
  }

  /**
   * Get user's Google profile information
   */
  async getUserProfile(accessToken: string): Promise<any> {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      const oauth2 = require('googleapis').oauth2('v2');
      const oauth2Client = new oauth2.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      
      oauth2Client.setCredentials({ access_token: accessToken });
      
      const profile = await oauth2Client.userinfo.get();
      return profile.data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * Revoke Google access token
   */
  async revokeAccess(accessToken: string): Promise<void> {
    try {
      await this.oauth2Client.revokeToken(accessToken);
    } catch (error) {
      console.error('Error revoking Google access:', error);
      throw new Error('Failed to revoke access');
    }
  }
}

export default new GoogleAuthService();
