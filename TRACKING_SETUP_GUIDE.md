# 5-Stage DNA Testing Order Tracking - Quick Setup Guide

## What's New

Your order tracking system now features **5 distinct stages** that users can monitor in real-time:

1. 📦 **Out for Lab** - Kit is being shipped to lab
2. ✓ **Kit Reached Lab** - Kit has arrived at lab
3. 🔬 **DNA Data Being Tested** - Testing in progress
4. ⚡ **Processing Your Result** - Results being analyzed
5. ✅ **Result is Out** - Final results ready

## Quick File Changes

### New Files Created
- `/src/lib/tracking-helpers.ts` - Tracking utilities and helpers
- `/src/app/api/orders/[orderId]/route.ts` - Order detail & tracking update APIs
- `/TRACKING_SYSTEM_DOCUMENTATION.md` - Full documentation

### Updated Files
- `/src/types/order.ts` - Added TrackingStage and tracking history types
- `/src/lib/firestore.ts` - Added tracking stage management functions
- `/src/components/order-status-badge.tsx` - Enhanced with tracking stages
- `/src/components/order-status-timeline.tsx` - Complete rewrite for 5-stage timeline
- `/src/app/order-tracking/page.tsx` - Updated to display tracking stages

## How to Test

### 1. Create an Order
Orders are automatically initialized with `trackingStage: 'pending'` and tracking history.

```bash
POST /api/orders
{
  "orderData": { /* order fields */ },
  "userInfo": {
    "userId": "user123",
    "userEmail": "user@example.com",
    "userName": "John Doe"
  }
}
```

### 2. View Order with Timeline
```bash
GET /api/orders/[orderId]
Headers: x-user-id: user123
```

The response includes `trackingStage` and `trackingHistory`.

### 3. Update Tracking Stage (Admin)
```bash
PATCH /api/orders/[orderId]
Headers: x-user-id: user123
{
  "trackingStage": "out_for_lab",
  "notes": "Kit dispatched"
}
```

### 4. View Timeline in UI
Navigate to `/order-tracking` to see:
- Visual timeline with all 5 stages
- Completion timestamps
- Progress bar (0-100%)
- Current stage indicator

## Tracking Stage Flow

```
pending 
  ↓
out_for_lab 
  ↓
kit_reached_lab 
  ↓
testing_in_progress 
  ↓
processing_result 
  ↓
result_ready (100%)

(Can transition to 'cancelled' from any stage)
```

## Key Functions

### Update Tracking (Backend)
```typescript
import { updateOrderTrackingStage } from '@/lib/firestore';

await updateOrderTrackingStage(userId, orderId, 'kit_reached_lab', 'notes');
```

### Get Progress (Frontend)
```typescript
import { getProgressPercentage } from '@/lib/tracking-helpers';

const percent = getProgressPercentage(order.trackingStage);
```

### Validate Transition (Backend)
```typescript
import { isValidStageTransition } from '@/lib/tracking-helpers';

if (isValidStageTransition(current, next)) {
  // Safe to transition
}
```

## Frontend Display

### Show Badge with Stage
```tsx
<OrderStatusBadge 
  trackingStage={order.trackingStage}
  status={order.status}
/>
```

### Display Full Timeline
```tsx
<OrderStatusTimeline order={order} />
```

## Database Schema (Firestore)

```
users/{userId}/orders/{orderId}/
{
  orderId: "abc123",
  userId: "user123",
  trackingStage: "kit_reached_lab",
  trackingHistory: [
    {
      stage: "pending",
      label: "Order Placed",
      description: "...",
      completedAt: "2024-11-07T10:00:00Z"
    },
    {
      stage: "out_for_lab",
      label: "Out for Lab",
      description: "...",
      completedAt: "2024-11-07T11:30:00Z"
    },
    {
      stage: "kit_reached_lab",
      label: "Kit Reached Lab",
      description: "...",
      completedAt: "2024-11-07T14:00:00Z"
    }
  ],
  status: "confirmed",
  createdAt: "2024-11-07T10:00:00Z",
  updatedAt: "2024-11-07T14:00:00Z",
  // ... other order fields
}
```

## Styling & Colors

Each stage has a unique color:
- **pending** - Yellow (Clock ⏰)
- **out_for_lab** - Blue (Package 📦)
- **kit_reached_lab** - Indigo (CheckCircle ✓)
- **testing_in_progress** - Purple (Microscope 🔬)
- **processing_result** - Orange (Zap ⚡)
- **result_ready** - Green (CheckCircle ✓)
- **cancelled** - Red (X ❌)

## Timeline Features

✅ **For Completed Stages:**
- Green checkmark icon
- Completion timestamp
- Full label and description

🔵 **For Current Stage:**
- Animated pulse indicator
- Blue "Current" badge
- "Expected to complete soon" message

⚪ **For Pending Stages:**
- Gray icon
- Dimmed text
- No timestamp

📊 **Progress Bar:**
- Gradient from blue to green
- Shows percentage complete
- Smooth animation on updates

## Admin Actions

To manually update an order's tracking stage:

```typescript
// In your admin panel or backend process
const { updateOrderTrackingStage } = require('@/lib/firestore');

await updateOrderTrackingStage(
  userId,
  orderId,
  'processing_result',
  'Results under final review'
);
```

This will:
1. Add new stage to tracking history
2. Update current trackingStage
3. Auto-update order status if result is ready
4. Record completion timestamp
5. Update the updatedAt field

## Common Use Cases

### Move Order to Next Stage
```typescript
const nextStage = getNextStage(order.trackingStage);
if (nextStage) {
  await updateOrderTrackingStage(userId, orderId, nextStage);
}
```

### Cancel Order at Any Stage
```typescript
await updateOrderTrackingStage(userId, orderId, 'cancelled');
```

### Get Stage Completion Time
```typescript
const completionDate = getStageCompletionDate(order, 'kit_reached_lab');
```

### Estimate Completion
```typescript
const daysRemaining = getEstimatedDaysRemaining(order.trackingStage);
console.log(`Order ready in ~${daysRemaining} days`);
```

## Error Handling

```typescript
try {
  if (!isValidStageTransition(current, next)) {
    throw new Error(`Cannot transition from ${current} to ${next}`);
  }
  
  const success = await updateOrderTrackingStage(userId, orderId, next);
  if (!success) {
    throw new Error('Failed to update database');
  }
} catch (error) {
  console.error('Tracking update failed:', error);
  // Show user-friendly error
}
```

## Migration (If You Have Existing Orders)

For orders created before this update:

```typescript
import { initializeTrackingHistory } from '@/lib/firestore';

// Add tracking to existing orders without it
const addTrackingToOrder = async (userId: string, orderId: string) => {
  const orderRef = doc(db, 'users', userId, 'orders', orderId);
  
  await updateDoc(orderRef, {
    trackingStage: 'pending',
    trackingHistory: initializeTrackingHistory(),
  });
};
```

## Next Steps

1. ✅ **Setup Complete** - System is ready to use
2. **Create Admin Panel** - Add UI to update tracking stages
3. **Email Notifications** - Send emails on stage changes
4. **SMS Alerts** - Optional SMS notifications
5. **Analytics Dashboard** - Track completion metrics
6. **Lab Integration** - Connect with lab systems for auto-updates

## Support Files

- **Types**: `/src/types/order.ts`
- **Database**: `/src/lib/firestore.ts`
- **Helpers**: `/src/lib/tracking-helpers.ts`
- **Components**: `/src/components/order-status-timeline.tsx`
- **API**: `/src/app/api/orders/[orderId]/route.ts`
- **Full Docs**: `/TRACKING_SYSTEM_DOCUMENTATION.md`

## Testing the Timeline

1. Go to `/order-tracking` page
2. Place a new order
3. View the order - see timeline with "Order Placed" stage
4. Use API to update stages: `PATCH /api/orders/[orderId]`
5. Refresh page to see updated timeline with new stages

That's it! Your 5-stage DNA testing tracking system is live! 🎉
