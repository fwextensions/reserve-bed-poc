# Bed Reservation System

A real-time mobile web application that enables case workers to reserve beds for clients across multiple provider sites.

## Tech Stack

- **Frontend**: Next.js 15.5 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI
- **Backend**: Convex (real-time database)
- **Authentication**: Convex Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Convex:
```bash
# Create a Convex account at https://dashboard.convex.dev
# Then run:
npx convex dev
```

3. Configure environment variables:
```bash
# Copy the example file
cp .env.local.example .env.local

# Add your Convex deployment URL (provided by `convex dev`)
```

### Development

Run both the Next.js dev server and Convex dev server:

```bash
# Terminal 1: Start Convex dev server
npm run convex:dev

# Terminal 2: Start Next.js dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── (case-worker)/          # Case worker routes
├── (admin)/                # Site admin routes
├── layout.tsx              # Root layout
└── page.tsx                # Home page

components/
├── ui/                     # Shadcn components
├── case-worker/            # Case worker specific components
└── admin/                  # Admin specific components

convex/
├── schema.ts               # Database schema
└── ...                     # Query and mutation functions

lib/
├── convex.ts               # Convex client setup
└── utils.ts                # Utility functions

types/
└── index.ts                # Shared TypeScript types
```

## Features

- Real-time bed availability across all provider sites
- Temporary 30-second holds to prevent double-booking
- Role-based access control (case workers and site admins)
- Mobile-optimized touch interface
- Four bed types: apple, orange, lemon, grape

## Deployment

### Prerequisites

1. Create a Convex account at [convex.dev](https://convex.dev)
2. Create a Vercel account at [vercel.com](https://vercel.com)

### Deploy to Vercel

1. **Set up Convex deployment:**
   ```bash
   npx convex deploy
   ```
   This will create a production Convex deployment and provide you with a deployment URL.

2. **Configure Vercel environment variables:**
   
   In your Vercel project settings, add these environment variables:
   - `CONVEX_DEPLOYMENT`: Your Convex deployment URL (e.g., `https://your-project.convex.cloud`)
   - `NEXT_PUBLIC_CONVEX_URL`: Same as CONVEX_DEPLOYMENT

3. **Deploy to Vercel:**
   
   Connect your GitHub repository to Vercel, or use the CLI:
   ```bash
   vercel
   ```

   The build command `npm run build` will automatically:
   - Deploy your Convex functions
   - Generate the Convex API types
   - Build the Next.js application

### Important Notes

- The `convex/_generated` folder is auto-generated during build and should not be committed to git
- Make sure your Convex deployment URL is set in environment variables before deploying
- The build script runs `convex deploy` which requires the `CONVEX_DEPLOY_KEY` environment variable (automatically set by Vercel when you link your project)

## License

Private - All rights reserved
