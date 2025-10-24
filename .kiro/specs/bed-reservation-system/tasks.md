# Implementation Plan

- [x] 1. Initialize project and configure development environment





  - Create Next.js 15.5 project with TypeScript and App Router
  - Install and configure Tailwind CSS v4
  - Initialize Shadcn UI and install required components (Button, Card, Input, Label, Toast, Dialog, Select, Textarea)
  - Initialize Convex and configure development environment
  - Set up project folder structure according to design (app routes, components, convex, lib, types)
  - Configure environment variables for Convex connection
  - _Requirements: 12.1, 12.2_

- [x] 2. Set up Convex backend schema (POC - No Auth)






  - [x] 2.1 Define database schema in convex/schema.ts

    - Create users table with role and siteId fields
    - Create sites table with name, address, phone, and bedCounts
    - Create holds table with siteId, bedType, caseWorkerId, expiresAt, createdAt
    - Create reservations table with siteId, bedType, caseWorkerId, clientName, notes, createdAt
    - Define BedType enum (apple, orange, lemon, grape)
    - Define Role enum (case_worker, site_admin)
    - _Requirements: 1.2, 10.1_

  - [x] 2.2 POC: Simplified auth approach

    - Removed Convex Auth dependency
    - Functions accept userId parameters instead of auth context
    - No authorization checks (suitable for demo only)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.3 Create database seed script





    - Write seed function to create sample sites with bed inventory
    - Create sample users (case workers and site admins)
    - _Requirements: 10.1_

- [x] 3. Implement Convex query functions for bed availability





  - [x] 3.1 Create getBedAvailability query


    - Query all sites and sum bed counts by type
    - Subtract active holds and reservations from totals
    - Return object with available count per bed type
    - _Requirements: 2.1, 2.4_


  - [x] 3.2 Create getBedAvailabilityByType query

    - Accept bedType parameter
    - Query all sites with that bed type
    - Calculate available count per site (total - holds - reservations)
    - Return array of site info with availability
    - _Requirements: 2.3, 2.5_


  - [x] 3.3 Create getSiteInventory query

    - Accept siteId parameter
    - Calculate total, available, onHold, and reserved counts for each bed type
    - Restrict access to site admin for their assigned site
    - _Requirements: 8.1, 8.4, 8.5_


  - [x] 3.4 Create getReservations query

    - Accept siteId parameter
    - Query all active reservations for the site
    - Join with users table to include case worker name
    - Restrict access to site admin for their assigned site
    - _Requirements: 9.1, 9.2_


  - [x] 3.5 Create getActiveHold query

    - Query holds for current authenticated case worker
    - Return active hold if exists and not expired
    - Return null if no active hold
    - _Requirements: 4.1_

- [x] 4. Implement Convex mutation functions for hold management





  - [x] 4.1 Create placeHold mutation


    - Validate user is case worker
    - Check if user already has an active hold
    - Verify bed of requested type is available at site
    - Create hold record with expiresAt = now + 30 seconds
    - Return success with holdId or error message
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 4.2 Create refreshHold mutation


    - Validate user is case worker
    - Find user's active hold
    - Verify bed still available (check current availability)
    - Update expiresAt to now + 30 seconds
    - Return success or error if bed no longer available
    - _Requirements: 5.3, 5.4, 5.5_

  - [x] 4.3 Create releaseHold mutation


    - Validate user is case worker
    - Find and delete user's active hold
    - Return success confirmation
    - _Requirements: 4.5_
-

- [x] 5. Implement Convex mutation functions for reservations



  - [x] 5.1 Create createReservation mutation


    - Validate user is case worker
    - Verify user has active non-expired hold
    - Validate clientName and notes are provided
    - Create reservation record with hold details and client info
    - Delete the hold record
    - Return success with reservationId or error
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 5.2 Create releaseReservation mutation


    - Validate user is site admin
    - Verify reservation belongs to admin's site
    - Delete reservation record
    - Return success confirmation
    - _Requirements: 9.3, 9.4, 9.5_


- [x] 6. Implement Convex mutation functions for site management




  - [x] 6.1 Create updateBedCounts mutation


    - Validate user is site admin
    - Verify counts are non-negative integers
    - Count active holds and reservations for each bed type
    - Validate new counts >= (holds + reservations) for each type
    - Update site bedCounts
    - Return success or validation error
    - _Requirements: 8.2, 8.3_

  - [x] 6.2 Create updateSiteInfo mutation


    - Validate user is site admin
    - Accept name, address, phone parameters
    - Update site record
    - Return success confirmation
    - _Requirements: 10.2, 10.3, 10.4_

- [x] 7. Implement scheduled action for hold expiration





  - [x] 7.1 Create cleanupExpiredHolds action


    - Query holds where expiresAt < current time
    - Delete expired hold records
    - Configure to run every 5 seconds using Convex scheduler
    - _Requirements: 4.4_


  - [x] 7.2 Implement hold expiration notification system

    - Create query to check if current user's hold is about to expire
    - Return hold with time remaining
    - Frontend will poll or subscribe to detect expiration
    - _Requirements: 5.1_
- [x] 8. Create shared TypeScript types and utilities




- [ ] 8. Create shared TypeScript types and utilities

  - Define BedType, Role, Site, Hold, Reservation types in types/index.ts
  - Create Convex client setup in lib/convex.ts
  - Create utility functions for date formatting and bed type display
  - Create constants for hold duration (30 seconds)
  - _Requirements: All_

- [x] 9. POC: Simplified UI (No Auth Required)




  - [x] 9.1 Create basic page structure


    - POC: No login page needed
    - Direct access to case worker and admin interfaces
    - Mock user context from seeded data
    - _Requirements: 1.1, 1.3, 1.4_

  - [x] 9.2 Create basic layouts


    - Create case worker layout (no auth check)
    - Create admin layout (no auth check)
    - Simple navigation structure
    - _Requirements: 1.3, 1.4, 1.5_

- [x] 10. Build mobile client app - availability dashboard



  - [x] 10.1 Create AvailabilityDashboard component


    - Subscribe to getBedAvailability query
    - Display grid of BedTypeCard components
    - Show loading state while data loads
    - Add "Reserve Bed" button to start flow without pre-selection
    - Implement mobile-optimized layout with single column
    - _Requirements: 2.1, 2.2, 3.2, 11.1, 11.3_

  - [x] 10.2 Create BedTypeCard component


    - Display bed type name and icon
    - Show available count prominently
    - Make card touchable with 44px minimum height
    - Add visual feedback on tap
    - Navigate to bed type detail on tap
    - _Requirements: 2.1, 11.2, 11.5_

  - [ ]* 10.3 Add loading and error states
    - Show skeleton loaders while data loads
    - Display error toast if query fails
    - Implement retry mechanism



    - _Requirements: 2.2_

- [x] 11. Build mobile client app - bed type detail view



  - [x] 11.1 Create BedTypeDetail page

    - Accept bedType parameter from route
    - Subscribe to getBedAvailabilityByType query


    - Display list of SiteCard components
    - Show message if no sites have this bed type available
    - Implement mobile-optimized layout
    - _Requirements: 2.3, 2.5, 11.1, 11.3_


  - [x] 11.2 Create SiteCard component






    - Display site name, address, phone number
    - Show available bed count for the selected type
    - Make card touchable with 44px minimum height
    - Add visual feedback on tap
    - Navigate to reservation flow with pre-selected bed type and site
    - _Requirements: 2.3, 2.5, 11.2, 11.5_


- [x] 12. Build mobile client app - reservation flow




  - [x] 12.1 Create ReservationFlow page component


    - Accept optional preselectedBedType and preselectedSiteId from route params
    - Implement multi-step form (bed type selection → site selection → client info)
    - Manage local state for selected values and form inputs
    - Handle navigation between steps
    - _Requirements: 3.1, 3.2, 3.3_



  - [x] 12.2 Implement bed type and site selection steps
    - Show bed type selector if not pre-selected
    - Show site selector if not pre-selected
    - Call placeHold mutation when both bed type and site are selected
    - Handle hold placement errors (no beds available)
    - Show loading state during hold placement
    - _Requirements: 3.3, 4.1, 4.3_

  - [x] 12.3 Implement hold timer and expiration handling
    - Create HoldTimer component showing countdown
    - Subscribe to hold expiration status
    - Display notification when hold expires
    - Provide "Refresh Hold" button in expiration notification
    - Call refreshHold mutation when user clicks refresh
    - Handle refresh failure (bed no longer available)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 12.4 Implement client information form

    - Create form with client name input (required)
    - Create form with notes textarea (required)
    - Validate inputs before submission
    - Call createReservation mutation on submit
    - Handle reservation errors (hold expired)
    - Show success message and navigate back to dashboard
    - _Requirements: 6.1, 6.2, 6.3, 6.4_



  - [x] 12.5 Implement cancellation flow
    - Add "Cancel" button on each step
    - Call releaseHold mutation if hold is active
    - Navigate back to previous screen
    - _Requirements: 4.5_


- [x] 13. Build site admin UI - dashboard







  - [ ] 13.1 Create AdminDashboard page


    - Get authenticated admin's siteId
    - Subscribe to getSiteInventory query
    - Display site name and basic info
    - Show summary cards for each bed type with total, available, on hold, reserved counts
    - Add navigation to detailed management views

    - _Requirements: 8.1, 8.4, 8.5_

  - [ ] 13.2 Create inventory summary cards
    - Display bed type with icon
    - Show total beds, available, on hold, reserved
    - Use color coding for status (green for available, yellow for holds, red for reserved)
    - Make cards responsive for desktop layout
    - _Requirements: 8.1, 8.4, 8.5_

- [ ] 14. Build site admin UI - bed inventory management
  - [ ] 14.1 Create BedInventoryManager component
    - Subscribe to getSiteInventory query
    - Display editable input for each bed type's total count
    - Show current holds and reservations (read-only)
    - Calculate and display available count
    - _Requirements: 8.1, 8.4, 8.5_

  - [ ] 14.2 Implement bed count updates
    - Add save button for each bed type
    - Call updateBedCounts mutation on save
    - Validate count >= (holds + reservations)
    - Show validation error if count too low
    - Show success toast on successful update
    - Disable inputs during save operation
    - _Requirements: 8.2, 8.3_

  - [ ] 14.3 Implement real-time update display
    - Subscribe to inventory changes
    - Update displayed counts automatically
    - Show visual indicator when counts change
    - _Requirements: 7.2, 7.4_

- [ ] 15. Build site admin UI - reservation management
  - [ ] 15.1 Create ReservationList component
    - Subscribe to getReservations query
    - Display table with columns: bed type, client name, notes, case worker, timestamp
    - Show empty state if no reservations
    - Make table responsive for desktop
    - _Requirements: 9.1, 9.2_

  - [ ] 15.2 Implement reservation release
    - Add "Release" button for each reservation
    - Show confirmation dialog before release
    - Call releaseReservation mutation on confirm
    - Show success toast on successful release
    - Handle errors gracefully
    - _Requirements: 9.3, 9.4_

  - [ ] 15.3 Implement real-time reservation updates
    - Subscribe to reservation changes
    - Add new reservations to list automatically
    - Remove released reservations from list automatically
    - Show visual indicator for new reservations
    - _Requirements: 7.2, 7.4, 9.5_

- [ ] 16. Build site admin UI - site information editor
  - [ ] 16.1 Create SiteInfoEditor component
    - Subscribe to site data
    - Display form with name, address, phone inputs
    - Pre-fill with current site information
    - _Requirements: 10.1, 10.2_

  - [ ] 16.2 Implement site info updates
    - Add save button
    - Call updateSiteInfo mutation on save
    - Show success toast on successful update
    - Handle errors gracefully
    - Disable inputs during save operation
    - _Requirements: 10.2, 10.3_

  - [ ] 16.3 Implement real-time site info updates
    - Subscribe to site information changes
    - Update displayed info automatically if changed by another admin
    - _Requirements: 10.4_

- [ ] 17. Implement real-time synchronization across all interfaces
  - [ ] 17.1 Verify case worker availability updates
    - Test that placing a hold updates all connected case worker apps
    - Test that creating a reservation updates all connected case worker apps
    - Test that releasing a reservation updates all connected case worker apps
    - Verify updates occur within 2 seconds
    - _Requirements: 7.1, 7.3_

  - [ ] 17.2 Verify admin UI updates
    - Test that holds placed by case workers update admin UI
    - Test that reservations created by case workers update admin UI
    - Test that bed count changes update case worker apps
    - Verify updates occur within 2 seconds
    - _Requirements: 7.2, 7.4, 7.5_

  - [ ] 17.3 Handle connection loss and reconnection
    - Test behavior when network connection is lost
    - Verify automatic reconnection
    - Ensure data syncs correctly after reconnection
    - _Requirements: 2.2, 7.1, 7.2_

- [ ] 18. Implement mobile UI optimizations
  - [ ] 18.1 Optimize touch interactions
    - Ensure all interactive elements have 44px minimum touch target
    - Add active states with visual feedback
    - Test tap responsiveness (feedback within 100ms)
    - Remove hover states that don't work on mobile
    - _Requirements: 11.2, 11.5_

  - [ ] 18.2 Optimize typography and layout
    - Set minimum font size to 16px for body text
    - Use single-column layout on mobile screens
    - Test on screen widths from 320px to 428px
    - Ensure no horizontal scrolling
    - _Requirements: 11.1, 11.3, 11.4_

  - [ ] 18.3 Add viewport and performance optimizations
    - Configure viewport meta tag
    - Lazy load non-critical components
    - Optimize images with Next.js Image component
    - Test time to interactive < 3 seconds
    - _Requirements: 11.1_

- [ ] 19. Configure deployment to Vercel
  - [ ] 19.1 Set up Vercel project
    - Connect GitHub repository to Vercel
    - Configure build settings for Next.js
    - Set up automatic deployments on push to main
    - _Requirements: 12.1, 12.3_

  - [ ] 19.2 Configure environment variables
    - Add Convex deployment URL to Vercel environment
    - Configure production environment variables
    - Test environment variable access in deployed app
    - _Requirements: 12.2_

  - [ ] 19.3 Deploy and verify
    - Deploy to Vercel production
    - POC: No authentication to test
    - Test real-time updates in production
    - Verify HTTPS access
    - _Requirements: 12.3_

  - [ ]* 19.4 Create deployment documentation
    - Document environment variables needed
    - Document deployment process
    - Document how to switch hosting platforms if needed
    - _Requirements: 12.4, 12.5_

- [ ] 20. End-to-end testing and validation
  - [ ]* 20.1 Test complete case worker flow
    - Test login as case worker
    - Test viewing availability dashboard
    - Test drilling down to bed type details
    - Test starting reservation from bed type view
    - Test starting reservation from Reserve Bed button
    - Test completing reservation with client info
    - Test canceling reservation at various stages
    - _Requirements: 1.3, 2.1, 2.3, 3.1, 3.2, 6.1, 6.2, 6.3_

  - [ ]* 20.2 Test hold expiration and refresh
    - Test hold timer countdown
    - Test hold expiration notification
    - Test refreshing hold successfully
    - Test refresh failure when bed no longer available
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 20.3 Test complete site admin flow
    - Test login as site admin
    - Test viewing admin dashboard
    - Test updating bed counts
    - Test validation when setting count too low
    - Test viewing reservations
    - Test releasing reservations
    - Test updating site information
    - _Requirements: 1.4, 8.1, 8.2, 8.3, 9.1, 9.2, 9.3, 10.2, 10.3_

  - [ ]* 20.4 Test real-time synchronization
    - Open multiple case worker apps in different browsers
    - Open admin UI in another browser
    - Test that actions in one app update others within 2 seconds
    - Test concurrent reservation attempts for last bed
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 20.5 Test mobile responsiveness
    - Test on iPhone SE (320px width)
    - Test on iPhone 14 Pro (393px width)
    - Test on iPad (768px width)
    - Verify touch targets are adequate
    - Verify no horizontal scrolling
    - Verify text is readable without zooming
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
