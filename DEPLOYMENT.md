# Deployment Guide

## Deploying to Vercel

### Step 1: Set up Convex

1. Go to [convex.dev](https://convex.dev) and create an account
2. Create a new project
3. Run locally to initialize:
   ```bash
   npx convex dev
   ```
4. Deploy to production:
   ```bash
   npx convex deploy --prod
   ```
5. Copy your production deployment URL (e.g., `https://your-project.convex.cloud`)

### Step 2: Configure Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. In the project settings, add these environment variables:
   - `CONVEX_DEPLOYMENT`: Your Convex production URL
   - `NEXT_PUBLIC_CONVEX_URL`: Same as CONVEX_DEPLOYMENT
   - `CONVEX_DEPLOY_KEY`: Get this from your Convex dashboard under Settings → Deploy Keys

### Step 3: Deploy

1. Push your code to GitHub
2. Vercel will automatically build and deploy
3. The build process will:
   - Run `convex deploy` to deploy your backend functions
   - Generate the Convex API types in `convex/_generated`
   - Build the Next.js application

### Troubleshooting

**Error: "Module not found: Can't resolve '@/convex/_generated/api'"**

This means the Convex codegen didn't run. Make sure:
- `CONVEX_DEPLOY_KEY` is set in Vercel environment variables
- The build command is `npm run build` (not `next build`)
- Your Convex deployment is properly configured

**Error: "CONVEX_DEPLOYMENT is not set"**

Add the environment variables in Vercel project settings:
1. Go to your project → Settings → Environment Variables
2. Add `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`
3. Redeploy

### Local Development

For local development, use:
```bash
# Terminal 1: Start Convex dev server
npx convex dev

# Terminal 2: Start Next.js dev server
npm run dev
```

Make sure your `.env.local` file has the correct Convex URLs from `npx convex dev`.
