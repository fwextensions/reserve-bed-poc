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

Deploy to Vercel:

```bash
# Deploy Convex backend
npm run convex:deploy

# Deploy Next.js frontend (via Vercel CLI or GitHub integration)
vercel
```

## License

Private - All rights reserved
