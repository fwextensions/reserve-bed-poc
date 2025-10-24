# Project Organization

## Route Structure

The application uses Next.js App Router with route groups for role-based layouts:

### Case Worker Routes `(case-worker)/`
- `/` - Main availability dashboard showing bed counts by type
- `/bed-type/[type]` - Bed type detail view with site breakdown
- `/reserve` - Reservation flow with hold management

### Admin Routes `(admin)/`
- `/` - Admin dashboard with inventory overview
- `/site/[siteId]` - Site management interface

## Component Organization

### UI Components `components/ui/`
Shadcn components installed via CLI. Do not modify directly.

### Case Worker Components `components/case-worker/`
- `BedTypeCard` - Displays bed type with available count
- `SiteCard` - Shows site info and availability
- `HoldTimer` - Countdown timer for active holds
- `ReservationFlow` - Multi-step reservation form

### Admin Components `components/admin/`
- `BedInventoryManager` - Editable bed count interface
- `ReservationList` - Table of active reservations
- `SiteInfoEditor` - Site contact information form

## Convex Backend Organization

### Schema `convex/schema.ts`
Defines four tables: users, sites, holds, reservations

### Function Files
- `sites.ts` - Site CRUD operations
- `beds.ts` - Availability calculation queries
- `holds.ts` - Hold placement, refresh, release, cleanup
- `reservations.ts` - Reservation creation and release

### Function Types
- **Queries**: Read-only, real-time subscriptions (e.g., `getBedAvailability`)
- **Mutations**: Write operations with validation (e.g., `placeHold`)
- **Actions**: Scheduled tasks (e.g., `cleanupExpiredHolds` runs every 5 seconds)

## Data Flow Patterns

1. **Real-time Updates**: Components subscribe to Convex queries, updates push automatically
2. **Optimistic Updates**: Not used - rely on Convex's fast round-trip (< 500ms)
3. **Error Handling**: Mutations return `{ success: boolean, error?: string, code?: ErrorCode }`
4. **Authorization**: Checked in Convex functions, not client-side

## Naming Conventions

- **Components**: PascalCase (e.g., `BedTypeCard`)
- **Files**: kebab-case for pages, PascalCase for components
- **Convex functions**: camelCase (e.g., `getBedAvailability`)
- **Types/Interfaces**: PascalCase (e.g., `BedType`, `Hold`)
- **Enums**: PascalCase with SCREAMING_SNAKE_CASE values

## State Management

- **Server State**: Managed by Convex queries (no Redux/Zustand needed)
- **Local State**: React useState for form inputs and UI state
- **Auth State**: Managed by Convex Auth provider
- **No global client state** - rely on Convex subscriptions for shared data
