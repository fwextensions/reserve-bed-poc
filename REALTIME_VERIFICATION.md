# Real-Time Synchronization Verification Guide

This document provides verification procedures for Task 17: Real-time synchronization across all interfaces.

## Overview

The Bed Reservation System uses Convex's built-in real-time subscriptions to ensure all connected clients receive updates within 2 seconds. This is achieved through:

1. **Convex Queries**: All data fetching uses `useQuery` hooks that automatically subscribe to changes
2. **Reactive Updates**: When mutations modify data, all subscribed queries automatically re-run
3. **Visual Indicators**: UI components show visual feedback when data updates

## Requirements Coverage

- **Requirement 7.1**: Case worker availability updates propagate in real-time
- **Requirement 7.2**: Admin UI updates reflect case worker actions in real-time
- **Requirement 7.3**: Updates occur within 2 seconds
- **Requirement 7.4**: Bed count changes update case worker apps
- **Requirement 7.5**: Hold and reservation changes update admin UI
- **Requirement 2.2**: System handles connection loss and reconnection

## Verification Procedures

### Sub-task 17.1: Verify Case Worker Availability Updates

**Test Scenario 1: Placing a Hold Updates All Case Worker Apps**

1. Open two browser windows side-by-side
2. Navigate both to the case worker dashboard (`/case-worker`)
3. In Window 1, click "Reserve Bed"
4. Select a bed type and site (this places a hold automatically)
5. **Expected Result**: Window 2 should show the available count decrease within 2 seconds
6. **Visual Indicator**: The BedTypeCard in Window 2 should update immediately

**Test Scenario 2: Creating a Reservation Updates All Case Worker Apps**

1. Continue from Test Scenario 1
2. In Window 1, complete the reservation form with client name and notes
3. Click "Confirm Reservation"
4. **Expected Result**: Both windows should show the available count remain decreased
5. **Visual Indicator**: The hold timer disappears and availability stays reduced

**Test Scenario 3: Releasing a Reservation Updates All Case Worker Apps**

1. Open admin interface in a third window (`/admin`)
2. In the admin window, find the reservation and click "Release"
3. **Expected Result**: Both case worker windows should show available count increase within 2 seconds
4. **Visual Indicator**: BedTypeCard counts update immediately

### Sub-task 17.2: Verify Admin UI Updates

**Test Scenario 4: Holds Placed by Case Workers Update Admin UI**

1. Open admin dashboard (`/admin`)
2. Note the current "On Hold" count for a bed type
3. In a separate window, open case worker interface and place a hold
4. **Expected Result**: Admin UI "On Hold" count increases within 2 seconds
5. **Visual Indicator**: The InventorySummaryCard shows updated counts with blue ring highlight

**Test Scenario 5: Reservations Created by Case Workers Update Admin UI**

1. Keep admin dashboard open
2. In case worker window, complete a reservation
3. **Expected Result**: 
   - Admin UI "On Hold" count decreases
   - Admin UI "Reserved" count increases
   - New reservation appears in ReservationList with "New" badge
4. **Visual Indicator**: New reservation row has blue background and pulse animation

**Test Scenario 6: Bed Count Changes Update Case Worker Apps**

1. Open case worker dashboard in one window
2. Open admin dashboard in another window
3. In admin window, change the total bed count for a bed type
4. Click "Save"
5. **Expected Result**: Case worker window shows updated available count within 2 seconds
6. **Visual Indicator**: BedTypeCard updates immediately

### Sub-task 17.3: Handle Connection Loss and Reconnection

**Test Scenario 7: Network Disconnection**

1. Open case worker dashboard
2. Open browser DevTools (F12)
3. Go to Network tab and set throttling to "Offline"
4. Try to place a hold
5. **Expected Result**: Operation fails gracefully (Convex will queue the request)
6. Set throttling back to "Online"
7. **Expected Result**: Connection automatically reconnects, queued operations execute

**Test Scenario 8: Data Sync After Reconnection**

1. Open two case worker windows
2. In Window 1, go offline (DevTools Network > Offline)
3. In Window 2 (still online), place a hold
4. Bring Window 1 back online
5. **Expected Result**: Window 1 automatically syncs and shows the updated availability

## Implementation Details

### Real-Time Query Subscriptions

All components use Convex's `useQuery` hook which automatically subscribes to changes:

```typescript
// Case Worker Dashboard
const availability = useQuery(api.beds.getBedAvailability);

// Admin Dashboard
const inventory = useQuery(api.sites.getSiteInventory, { siteId });
const reservations = useQuery(api.reservations.getReservations, { siteId });
```

### Visual Update Indicators

**BedInventoryManager** (Admin UI):
- Detects changes using `useEffect` and `useRef` to track previous values
- Shows blue ring highlight for 2 seconds when data changes
- Displays "Updated" badge on changed bed types

**ReservationList** (Admin UI):
- Tracks new reservations by comparing previous and current reservation IDs
- Shows blue background and "New" badge for 3 seconds
- Uses pulse animation to draw attention

### Mutation Flow

1. User action triggers mutation (e.g., `placeHold`)
2. Mutation modifies database
3. Convex automatically invalidates affected queries
4. All subscribed components receive updated data
5. React re-renders with new data
6. Visual indicators show the change

## Performance Verification

### Measuring Update Latency

To verify the 2-second requirement:

1. Open browser DevTools Console
2. Add timing code to mutations:

```javascript
const start = Date.now();
await placeHold({ userId, siteId, bedType });
console.log(`Mutation completed in ${Date.now() - start}ms`);
```

3. In another window, add timing to query updates:

```javascript
useEffect(() => {
  if (availability) {
    console.log(`Query updated at ${Date.now()}`);
  }
}, [availability]);
```

4. **Expected Result**: Time difference should be < 2000ms (typically < 500ms)

## Troubleshooting

### Updates Not Appearing

1. Check Convex dev server is running (`npx convex dev`)
2. Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly in `.env.local`
3. Check browser console for connection errors
4. Ensure both windows are using the same Convex deployment

### Slow Updates

1. Check network latency in DevTools
2. Verify Convex deployment region
3. Check for large query result sets that may slow re-renders

### Visual Indicators Not Showing

1. Verify components are using the change detection logic
2. Check that `useEffect` dependencies are correct
3. Ensure timeout cleanup is working properly

## Conclusion

The real-time synchronization is implemented using Convex's reactive query system, which automatically handles:
- WebSocket connections for real-time updates
- Automatic reconnection on network issues
- Efficient query invalidation and re-execution
- Sub-second update propagation

All verification scenarios should demonstrate updates occurring within 2 seconds, typically much faster (< 500ms).
