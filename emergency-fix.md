# Emergency Fix for Production Site

To get your site back online, make these two changes and deploy:

## 1. server/auth-middleware.ts
```javascript
export async function firebaseAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check if user is already authenticated via session
  if (req.user || (req.isAuthenticated && req.isAuthenticated())) {
    // Simply proceed if session exists
    return next();
  }

  // If no session, return 401 (but site will work for session-auth users)
  return res.status(401).json({ 
    error: 'Unauthorized',
    message: 'Authentication required'
  });
}
```

## 2. client/src/lib/token-auth.ts 
```javascript
export function patchFetchWithTokenAuth() {
  // Skip patching fetch to avoid breaking production site
  console.log('Token auth temporarily disabled for emergency recovery');
}
```

This reverts to your original authentication system temporarily. Once your site is back online, we can properly implement token-based authentication with proper testing.