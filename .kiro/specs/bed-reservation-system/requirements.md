# Requirements Document

## Introduction

This document specifies the requirements for a mobile web-based bed reservation system that enables case workers to reserve beds for clients across multiple provider sites in real-time. The system includes separate interfaces for case workers (mobile client app) and site administrators (admin UI), with real-time synchronization of bed availability across all users.

## Glossary

- **Bed Reservation System**: The complete web application including mobile client app and site admin interface
- **Case Worker**: A user who reserves beds for clients using the mobile client app
- **Site Admin**: A user who manages bed availability and reservations for a specific provider site
- **Provider Site**: A physical location that offers beds for clients
- **Bed Type**: A category of bed (apple, orange, lemon, or grape in this POC)
- **Hold**: A temporary reservation on a bed that prevents other users from reserving it
- **Hold Time**: The duration a bed remains held before automatic release (30 seconds in this POC)
- **Reservation**: A confirmed bed assignment for a specific client
- **Convex Auth**: The built-in authentication system provided by Convex
- **Mobile Client App**: The interface used by case workers to view and reserve beds
- **Site Admin UI**: The interface used by site administrators to manage bed inventory

## Requirements

### Requirement 1: User Authentication and Authorization

**User Story:** As a system user, I want to authenticate with role-based access, so that case workers and site admins have appropriate permissions.

#### Acceptance Criteria

1. WHEN a user accesses THE Bed Reservation System, THE Bed Reservation System SHALL authenticate the user using Convex Auth
2. THE Bed Reservation System SHALL assign users one of two roles: Case Worker or Site Admin
3. WHEN a Case Worker authenticates, THE Bed Reservation System SHALL grant access to the Mobile Client App interface
4. WHEN a Site Admin authenticates, THE Bed Reservation System SHALL grant access to the Site Admin UI for their assigned Provider Site
5. THE Bed Reservation System SHALL restrict each Site Admin to manage exactly one Provider Site

### Requirement 2: Real-Time Bed Availability Display

**User Story:** As a case worker, I want to see real-time bed availability across all sites, so that I can quickly find available beds for my clients.

#### Acceptance Criteria

1. WHEN a Case Worker opens the Mobile Client App, THE Mobile Client App SHALL display the total count of available beds for each Bed Type across all Provider Sites
2. WHEN bed availability changes at any Provider Site, THE Mobile Client App SHALL update the displayed counts within 2 seconds for all connected Case Workers
3. WHEN a Case Worker taps a Bed Type, THE Mobile Client App SHALL display the count of available beds of that Bed Type at each Provider Site
4. THE Mobile Client App SHALL exclude beds with active Holds or Reservations from the available bed count
5. WHEN a Case Worker views a Provider Site, THE Mobile Client App SHALL display the site name, address, and phone number

### Requirement 3: Bed Reservation Flow Initiation

**User Story:** As a case worker, I want multiple ways to start a bed reservation, so that I can choose the most efficient workflow for my situation.

#### Acceptance Criteria

1. WHEN a Case Worker taps a Provider Site from the Bed Type detail view, THE Mobile Client App SHALL initiate a reservation flow with the Bed Type and Provider Site pre-selected
2. WHEN a Case Worker taps the Reserve Bed button from the main screen, THE Mobile Client App SHALL initiate a reservation flow without pre-selecting Bed Type or Provider Site
3. WHEN a reservation flow starts without pre-selected values, THE Mobile Client App SHALL prompt the Case Worker to select a Bed Type and Provider Site
4. THE Mobile Client App SHALL prevent initiation of a reservation flow if no beds are available at any Provider Site

### Requirement 4: Temporary Bed Hold Management

**User Story:** As a case worker, I want beds to be held temporarily when I start a reservation, so that other users cannot reserve the same bed while I complete the process.

#### Acceptance Criteria

1. WHEN a Case Worker selects both a Bed Type and Provider Site, THE Bed Reservation System SHALL place a Hold on one bed of that Bed Type at that Provider Site
2. THE Bed Reservation System SHALL set the Hold Time to 30 seconds from the moment the Hold is placed
3. WHILE a Hold is active, THE Bed Reservation System SHALL prevent other Case Workers from placing Holds or Reservations on that bed
4. WHEN a Hold Time expires, THE Bed Reservation System SHALL automatically release the Hold and make the bed available
5. WHEN a Case Worker cancels a reservation flow, THE Bed Reservation System SHALL immediately release any active Hold

### Requirement 5: Hold Expiration Notification and Refresh

**User Story:** As a case worker, I want to be notified when my hold is about to expire, so that I can extend it if I need more time.

#### Acceptance Criteria

1. WHEN a Hold Time expires during an active reservation flow, THE Mobile Client App SHALL display a notification to the Case Worker
2. THE Mobile Client App SHALL provide an option to refresh the Hold within the expiration notification
3. WHEN a Case Worker chooses to refresh a Hold, THE Bed Reservation System SHALL attempt to place a new Hold on a bed of the same Bed Type at the same Provider Site
4. IF no beds of the requested Bed Type are available at the Provider Site when refreshing, THEN THE Bed Reservation System SHALL notify the Case Worker that the Hold cannot be refreshed
5. WHEN a Hold is successfully refreshed, THE Bed Reservation System SHALL reset the Hold Time to 30 seconds

### Requirement 6: Reservation Completion

**User Story:** As a case worker, I want to complete a reservation by entering client information, so that the bed is officially assigned to my client.

#### Acceptance Criteria

1. WHILE a Hold is active, THE Mobile Client App SHALL prompt the Case Worker to enter the client name
2. WHILE a Hold is active, THE Mobile Client App SHALL prompt the Case Worker to enter notes about client needs
3. WHEN a Case Worker submits a reservation with client name and notes, THE Bed Reservation System SHALL convert the Hold to a confirmed Reservation
4. WHEN a Reservation is confirmed, THE Bed Reservation System SHALL store the client name, notes, Bed Type, Provider Site, Case Worker identity, and timestamp
5. THE Bed Reservation System SHALL maintain Reservations indefinitely until released by a Site Admin

### Requirement 7: Real-Time Availability Updates Across All Interfaces

**User Story:** As a user of the system, I want to see bed availability update in real-time across all apps, so that everyone has accurate information.

#### Acceptance Criteria

1. WHEN a Hold is placed on a bed, THE Bed Reservation System SHALL update the available bed count in all connected Mobile Client Apps within 2 seconds
2. WHEN a Hold is placed on a bed, THE Bed Reservation System SHALL update the available bed count in the affected Provider Site's Site Admin UI within 2 seconds
3. WHEN a Reservation is confirmed, THE Bed Reservation System SHALL update the available bed count in all connected Mobile Client Apps within 2 seconds
4. WHEN a Reservation is confirmed, THE Bed Reservation System SHALL update the available bed count in the affected Provider Site's Site Admin UI within 2 seconds
5. WHEN a Reservation is released, THE Bed Reservation System SHALL update the available bed count in all connected interfaces within 2 seconds

### Requirement 8: Site Admin Bed Inventory Management

**User Story:** As a site admin, I want to set and update the number of beds available at my site, so that case workers see accurate availability.

#### Acceptance Criteria

1. WHEN a Site Admin accesses the Site Admin UI, THE Site Admin UI SHALL display the total count of each Bed Type at their Provider Site
2. THE Site Admin UI SHALL allow the Site Admin to set the count for each Bed Type (apple, orange, lemon, grape) to any non-negative integer
3. WHEN a Site Admin updates a bed count, THE Bed Reservation System SHALL update the available bed count in all connected Mobile Client Apps within 2 seconds
4. THE Site Admin UI SHALL display the count of beds with active Holds for each Bed Type
5. THE Site Admin UI SHALL display the count of confirmed Reservations for each Bed Type

### Requirement 9: Site Admin Reservation Management

**User Story:** As a site admin, I want to view and manage reservations at my site, so that I can release beds when clients no longer need them.

#### Acceptance Criteria

1. THE Site Admin UI SHALL display a list of all confirmed Reservations at the Site Admin's Provider Site
2. WHEN displaying a Reservation, THE Site Admin UI SHALL show the client name, notes, Bed Type, Case Worker identity, and reservation timestamp
3. THE Site Admin UI SHALL provide a control to release each Reservation
4. WHEN a Site Admin releases a Reservation, THE Bed Reservation System SHALL remove the Reservation and increment the available bed count
5. WHEN a Site Admin releases a Reservation, THE Bed Reservation System SHALL update all connected interfaces within 2 seconds

### Requirement 10: Provider Site Configuration

**User Story:** As a site admin, I want to manage my site's basic information, so that case workers can contact us if needed.

#### Acceptance Criteria

1. THE Bed Reservation System SHALL store a name, address, and phone number for each Provider Site
2. THE Site Admin UI SHALL display the Provider Site name, address, and phone number
3. THE Site Admin UI SHALL allow the Site Admin to update the Provider Site name, address, and phone number
4. WHEN a Site Admin updates Provider Site information, THE Bed Reservation System SHALL update the information displayed in all connected Mobile Client Apps within 2 seconds
5. WHERE a Provider Site has zero beds of a particular Bed Type, THE Bed Reservation System SHALL not require that Bed Type to be displayed or managed

### Requirement 11: Mobile-Optimized User Interface

**User Story:** As a case worker using a mobile device, I want an interface optimized for touch and small screens, so that I can efficiently reserve beds on the go.

#### Acceptance Criteria

1. THE Mobile Client App SHALL render with a responsive layout optimized for mobile screen sizes between 320 pixels and 428 pixels wide
2. THE Mobile Client App SHALL provide touch targets of at least 44 pixels by 44 pixels for all interactive elements
3. THE Mobile Client App SHALL display content in a single-column layout on mobile devices
4. THE Mobile Client App SHALL use typography with a minimum font size of 16 pixels for body text
5. THE Mobile Client App SHALL provide visual feedback within 100 milliseconds when a Case Worker taps an interactive element

### Requirement 12: Deployment and Hosting

**User Story:** As a system administrator, I want the application deployed to a reliable hosting platform, so that users can access it from anywhere.

#### Acceptance Criteria

1. THE Bed Reservation System SHALL be deployable to Vercel hosting platform
2. THE Bed Reservation System SHALL support environment-based configuration for Convex backend connection
3. WHEN deployed to Vercel, THE Bed Reservation System SHALL serve the Mobile Client App and Site Admin UI over HTTPS
4. THE Bed Reservation System SHALL maintain compatibility with alternative hosting platforms for future migration
5. THE Bed Reservation System SHALL provide configuration documentation for Vercel deployment
