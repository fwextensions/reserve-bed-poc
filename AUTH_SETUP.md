# Authentication Setup (POC)

## Overview

**This is a POC (Proof of Concept) implementation with simplified authentication.**

For demo purposes, Convex Auth has been removed and replaced with a simpler approach suitable for development and testing only.

## POC Implementation

### No Login Required
- Users can access both case worker and admin interfaces directly
- No authentication checks are performed
- Suitable for demo and development only

### Backend Changes
- All Convex functions that previously used auth context now accept a `userId` parameter
- No authorization checks are performed
- Functions like `placeHold`, `createReservation`, etc. require passing a userId

### Frontend Changes
- No login page or auth flows
- Layouts don't check authentication
- Components pass hardcoded user IDs from seeded data

## Environment Setup

### Local Development

1. Only Convex deployment variables are needed in `.env.local`:
   ```bash
   CONVEX_DEPLOYMENT=dev:your-deployment
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   ```

2. Run Convex dev server:
   ```bash
   npx convex dev
   ```

3. Run Next.js dev server:
   ```bash
   npm run dev
   ```

## Database Seeding

The seed script (`convex/seed.ts`) creates test users:
- Case workers
- Site admins

These user IDs can be used in the frontend for testing.

## Production Considerations

**⚠️ This POC approach is NOT suitable for production use.**

For a production deployment, you would need to:
1. Implement proper authentication (Convex Auth, NextAuth, Clerk, etc.)
2. Add authorization checks in all Convex functions
3. Implement role-based access control
4. Add session management
5. Secure all API endpoints
6. Add audit logging

## Migration Path

To add proper authentication later:
1. Install authentication provider (e.g., `@convex-dev/auth`)
2. Update Convex functions to use auth context instead of userId parameters
3. Add authorization checks based on user roles
4. Create login/logout flows in the frontend
5. Add protected route middleware
6. Update layouts to check authentication status

## Testing

Since there's no authentication:
- All users can access all features
- Use seeded user IDs for testing different roles
- Test role-specific features by passing different user IDs

## Notes

- This simplified approach was chosen to avoid the complexity of Convex Auth 0.0.90+ which requires numerous environment variables
- The focus is on demonstrating the core bed reservation functionality
- Authentication can be added later without major refactoring
