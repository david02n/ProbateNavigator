import { Request, Response, NextFunction } from "express";
import { verifyIdToken } from "./firebase-admin";
import { storage } from "./storage";

// Extend Express Request type with user property
declare global {
  namespace Express {
    interface Request {
      user?: any; // Will hold the authenticated user data
      firebaseUser?: any; // Will hold the decoded Firebase token
    }
  }
}

/**
 * Firebase authentication middleware
 * Supports both session-based and token-based authentication
 * 1. First checks for user session (cookie-based)
 * 2. If no session, tries for token-based auth
 */
export async function firebaseAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // STEP 1: Check if user is already authenticated via session
    if (req.user) {
      // User is already authenticated via session/cookie, allow request
      console.log('User authenticated via session:', req.user.email);
      return next();
    }
    
    // STEP 2: Check for Authorization header if no active session
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // If no session and no token, use session authentication as fallback
      if (req.isAuthenticated && req.isAuthenticated()) {
        console.log('Using session authentication as fallback');
        return next();
      }
      
      // No authentication available
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Extract token for token-based authentication
    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token format'
      });
    }

    try {
      // Verify Firebase token
      const decodedToken = await verifyIdToken(idToken);
      
      // Store the Firebase user info on the request
      req.firebaseUser = decodedToken;
      
      // Get the email from decoded token
      const email = decodedToken.email;
      if (!email) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Token does not contain user email'
        });
      }
      
      // Look up user in database by email
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'User not found in database'
          });
        }
        
        // Attach user to request
        req.user = user;
        
        // Update last login time if necessary
        const now = new Date();
        const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
        if (!lastLogin || (now.getTime() - lastLogin.getTime() > 3600000)) {
          // Update last login time if it's been more than an hour
          await storage.updateUser(user.id, { lastLogin: now });
        }
        
        // Proceed to route handler
        next();
      } catch (dbError) {
        console.error('Database error in auth middleware:', dbError);
        return res.status(500).json({
          error: 'Server error',
          message: 'Error accessing user database'
        });
      }
    } catch (tokenError) {
      // If token verification fails, try cookie-based session as fallback
      if (req.isAuthenticated && req.isAuthenticated()) {
        console.log('Token verification failed, using session auth as fallback');
        return next();
      }
      
      console.error('Token verification failed:', tokenError);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Last resort fallback - if there's a session, use it
    if (req.isAuthenticated && req.isAuthenticated()) {
      console.log('Error in auth process, using session auth as fallback');
      return next();
    }
    
    return res.status(500).json({
      error: 'Server error',
      message: 'Authentication process failed'
    });
  }
}