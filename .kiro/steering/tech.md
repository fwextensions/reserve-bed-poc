# Technology Stack

## Core Technologies

- **Frontend**: Next.js 15.5 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Button, Card, Input, Label, Toast, Dialog, Select, Textarea)
- **Backend**: Convex (real-time database with built-in query/mutation functions)
- **Authentication**: Convex Auth (email/password with role-based access)
- **Deployment**: Vercel

## Project Structure

```
app/
├── (case-worker)/          # Case worker routes with auth layout
├── (admin)/                # Site admin routes with auth layout
└── api/auth/               # Auth endpoints

components/
├── ui/                     # Shadcn components
├── case-worker/            # Case worker specific components
└── admin/                  # Admin specific components

convex/
├── schema.ts               # Database schema
├── auth.config.ts          # Auth configuration
├── sites.ts                # Site queries and mutations
├── beds.ts                 # Bed availability queries
├── holds.ts                # Hold management
└── reservations.ts         # Reservation management

lib/
├── convex.ts               # Convex client setup
└── utils.ts                # Utility functions

types/
└── index.ts                # Shared TypeScript types
```

## Common Commands

### Development
```bash
# Start Convex dev server (Terminal 1)
npx convex dev

# Start Next.js dev server (Terminal 2)
npm run dev
```

### Build & Deploy
```bash
# Build for production
npm run build

# Deploy to Vercel (automatic on push to main)
git push origin main
```

### Testing
```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

## Environment Variables

Required environment variables:
- `CONVEX_DEPLOYMENT`: Convex deployment URL
- `NEXT_PUBLIC_CONVEX_URL`: Public Convex URL for client

## Key Technical Constraints

- Real-time updates must propagate within 2 seconds
- Hold duration is fixed at 30 seconds
- Mobile viewport: 320px - 428px width
- Minimum touch target size: 44x44 pixels
- Minimum body text size: 16px
- Time to interactive: < 3 seconds

## Code Style

- Always use JavaScript or TypeScript for code, never use Python.
- Always use tabs for indentation.
- Always use double quotes.
- Always use semicolons.
- Always use LF line endings, even on Windows.
- Use trailing commas in object and array literals, but not in function parameters.
- Use the `const` keyword for declarations, unless the variable is going to be re-assigned.
- Use the `let` keyword for declarations that will be re-assigned.
- Generally use functional and declarative programming patterns; use classes if it makes sense to manage many instances of the same type.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).

In comments, start with a lowercase letter and do not end with a period unless the comment contains multiple sentences.  If a period is included, use two spaces after the period.

When writing commit messages, use the present tense.  Use a summary line, then a blank line, then a fairly detailed list of changes.  The commit message should almost never be a single line.
