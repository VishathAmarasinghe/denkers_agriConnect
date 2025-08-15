import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import bcrypt from 'bcryptjs';

// Function to configure passport strategies
function configurePassport(): void {
  // Google OAuth configuration
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/google/callback';

  // Check if Google OAuth is configured
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn('Google OAuth not configured. Skipping Google OAuth strategy.');
    return;
  }

  // Configure Google OAuth strategy
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  }, async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findByGoogleOAuthId(profile.id);
    
    if (user) {
      // User exists, return them
      return done(null, user);
    }
    
    // Check if user exists with the same email
    if (profile.emails && profile.emails.length > 0) {
      const email = profile.emails[0].value;
      user = await User.findByEmail(email);
      
      if (user) {
        // User exists with email but no Google ID, link accounts
        await User.update(user.id!, {
          google_oauth_id: profile.id,
          profile_image_url: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
        });
        
        // Get updated user
        user = await User.findById(user.id!);
        return done(null, user);
      }
    }
    
    // Create new user if none exists
    const userData = {
      role: 'farmer' as const, // Default role for Google OAuth users
      username: profile.displayName.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000),
      email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '',
      phone: '', // Will need to be added later
      nic: '000000000000', // Default NIC for Google OAuth users
      password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Random password
      first_name: profile.name.givenName || profile.displayName.split(' ')[0],
      last_name: profile.name.familyName || profile.displayName.split(' ').slice(1).join(' '),
      google_oauth_id: profile.id,
      profile_image_url: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : undefined,
      is_active: true
    };
    
    user = await User.create(userData);
    
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));
}

// Serialize user for the session
passport.serializeUser((user: any, done: any) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: number, done: any) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Initialize passport configuration
configurePassport();

export default passport;
