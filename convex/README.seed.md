# Database Seeding

This directory contains seed functions to populate the database with sample data for development and testing.

## Usage

### Seeding the Database

1. Start the Convex dev server:
   ```bash
   npx convex dev
   ```

2. Open the Convex dashboard (the URL will be shown in the terminal)

3. Navigate to the Functions tab

4. Find and run the `seed:seedDatabase` mutation

5. The database will be populated with:
   - 4 sample provider sites with varying bed inventories
   - 4 sample case workers
   - 4 sample site admins (one per site)

### Sample Data Created

#### Sites
- **Hope Haven Shelter** - 123 Market Street, San Francisco, CA 94102
  - Apple: 20, Orange: 0, Lemon: 0, Grape: 0
  - (Tests single bed type availability)
  
- **Safe Harbor Center** - 456 Mission Street, San Francisco, CA 94103
  - Apple: 0, Orange: 15, Lemon: 12, Grape: 0
  - (Tests partial bed type availability)
  
- **Community Care House** - 789 Valencia Street, San Francisco, CA 94110
  - Apple: 6, Orange: 12, Lemon: 10, Grape: 8
  - (Tests full bed type availability)
  
- **Riverside Refuge** - 321 Embarcadero, San Francisco, CA 94111
  - Apple: 8, Orange: 6, Lemon: 15, Grape: 10
  - (Tests mixed bed type availability)

#### Case Workers
- Sarah Johnson (sarah.johnson@example.com)
- Michael Chen (michael.chen@example.com)
- Emily Rodriguez (emily.rodriguez@example.com)
- David Williams (david.williams@example.com)

#### Site Admins
- Jennifer Martinez (admin.hopehaven@example.com) - Hope Haven Shelter
- Robert Thompson (admin.safeharbor@example.com) - Safe Harbor Center
- Lisa Anderson (admin.communitycare@example.com) - Community Care House
- James Wilson (admin.riverside@example.com) - Riverside Refuge

### Clearing the Database

To clear all data and start fresh:

1. Run the `seed:clearDatabase` mutation from the Convex dashboard

2. This will delete all:
   - Sites
   - Users
   - Holds
   - Reservations

3. You can then run `seedDatabase` again to repopulate

## Notes

- The seed function checks if sites already exist and will not seed if data is present
- Clear the database first if you need to re-seed
- These are sample users for development only - they are not connected to Convex Auth
- In production, users will be created through the authentication flow
