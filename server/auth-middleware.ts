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
 * EMERGENCY FIX: Simple authentication middleware that restores original behavior
 * Only relies on session-based authentication
 */
export async function firebaseAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check if user is already authenticated via session
  if (req.user || (req.isAuthenticated && req.isAuthenticated())) {
    // Simply proceed if session exists
    return next();
  }

  // If no session, return 401
  return res.status(401).json({ 
    error: 'Unauthorized',
    message: 'Authentication required'
  });
}