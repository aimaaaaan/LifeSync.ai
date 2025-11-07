# DNA Testing Order Tracking System - Documentation

## Overview

The LifeSync.ai order tracking system has been completely revamped to provide real-time tracking of DNA test kits through 5 distinct stages. Users can now see the entire lifecycle of their test from order placement to result delivery.

## 5 Tracking Stages

### Stage 1: Order Placed (Pending)
- **Label**: Order Placed
- **Description**: Your DNA test kit order has been received
- **Status**: Initial state when order is created
- **Icon**: Clock

### Stage 2: Out for Lab (Out for Lab)
- **Label**: Out for Lab
- **Description**: Your kit is on the way to our laboratory
- **Status**: Kit has been dispatched
- **Icon**: Package
- **Estimated Duration**: 5 days

### Stage 3: Kit Reached Lab (Kit Reached Lab)
- **Label**: Kit Reached Lab
- **Description**: Your kit has arrived at our laboratory
- **Status**: Kit has been received and logged
- **Icon**: CheckCircle2
- **Estimated Duration**: 3 days

### Stage 4: DNA Data Being Tested (Testing in Progress)
- **Label**: DNA Data Being Tested
- **Description**: Your DNA sample is being analyzed in our lab
- **Status**: Active testing phase
- **Icon**: Microscope
- **Estimated Duration**: 7 days

### Stage 5: Processing Your Result (Processing Result)
- **Label**: Processing Your Result
- **Description**: Your test results are being processed and analyzed
- **Status**: Final analysis phase
- **Icon**: Zap
- **Estimated Duration**: 3 days

### Stage 6: Result is Out (Result Ready)
- **Label**: Result is Out
- **Description**: Your DNA test results are ready to view
- **Status**: Completed state
- **Icon**: CheckCircle2

## Database Schema

### Order Type Updates

```typescript
interface Order {
  // ... existing fields
  
  // New tracking fields
  trackingStage: TrackingStage;
  trackingHistory: TrackingStageDetail[];
}

type TrackingStage = 
  | 'pending' 
  | 'out_for_lab' 
  | 'kit_reached_lab' 
  | 'testing_in_progress' 
  | 'processing_result' 
  | 'result_ready'
  | 'cancelled';

interface TrackingStageDetail {
  stage: TrackingStage;
  label: string;
  description: string;
  completedAt?: string; // ISO timestamp
}
```

### Firestore Structure

```
users/
  {userId}/
    orders/
      {orderId}/
        - orderId: string
        - userId: string
        - userEmail: string
        - userName: string
        - trackingStage: TrackingStage
        - trackingHistory: TrackingStageDetail[]
        - status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
        - createdAt: ISO timestamp
        - updatedAt: ISO timestamp
        - ... (other order fields)
```

## API Endpoints

### Create Order (POST)
```
POST /api/orders
```

**Request:**
```json
{
  "orderData": { /* order form data */ },
  "userInfo": {
    "userId": "user123",
    "userEmail": "user@example.com",
    "userName": "John Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order456",
  "message": "Order saved successfully",
  "timestamp": "2024-11-07T10:00:00Z"
}
```

Order is automatically initialized with:
- `trackingStage: "pending"`
- `trackingHistory: [{ stage: "pending", label: "Order Placed", ... }]`

### Get All Orders (GET)
```
GET /api/orders
Headers:
  x-user-id: user123
  x-user-email: user@example.com
```

### Get Order Details (GET)
```
GET /api/orders/[orderId]
Headers:
  x-user-id: user123
```

### Update Tracking Stage (PATCH)
```
PATCH /api/orders/[orderId]
Headers:
  x-user-id: user123

Body:
{
  "trackingStage": "out_for_lab",
  "notes": "Kit dispatched to lab"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order tracking stage updated successfully",
  "data": { /* updated order */ },
  "timestamp": "2024-11-07T10:30:00Z"
}
```

## Firestore Functions

### `initializeTrackingHistory()`
Initializes tracking history for new orders.

```typescript
const history = initializeTrackingHistory();
// Returns: [{ stage: 'pending', label: 'Order Placed', ... }]
```

### `getTrackingStageConfig(stage: TrackingStage)`
Gets configuration for a tracking stage.

```typescript
const config = getTrackingStageConfig('out_for_lab');
// Returns: { label: 'Out for Lab', description: '...' }
```

### `updateOrderTrackingStage(userId, orderId, stage, notes?)`
Updates order's tracking stage and maintains history.

```typescript
const success = await updateOrderTrackingStage(
  'user123',
  'order456',
  'kit_reached_lab',
  'Kit received and logged'
);
```

**Behavior:**
- Adds new stage to `trackingHistory`
- Updates `trackingStage` to new value
- Auto-updates `status` based on stage (result_ready → 'completed')
- Sets `updatedAt` timestamp
- Maintains chronological order of history

## Tracking Helper Utilities

Located in `/src/lib/tracking-helpers.ts`

### `getProgressPercentage(stage: TrackingStage): number`
Get progress percentage for current stage (0-100%).

```typescript
getProgressPercentage('testing_in_progress'); // Returns: 67
```

### `getNextStage(stage: TrackingStage): TrackingStage | null`
Get the next valid tracking stage.

```typescript
getNextStage('kit_reached_lab'); // Returns: 'testing_in_progress'
getNextStage('result_ready'); // Returns: null
```

### `isValidStageTransition(from: TrackingStage, to: TrackingStage): boolean`
Validate if a stage transition is allowed.

```typescript
isValidStageTransition('out_for_lab', 'kit_reached_lab'); // true
isValidStageTransition('result_ready', 'processing_result'); // false
isValidStageTransition('testing_in_progress', 'cancelled'); // true
```

### `isStageCompleted(order: Order, stage: TrackingStage): boolean`
Check if a stage has been completed for an order.

```typescript
isStageCompleted(order, 'kit_reached_lab'); // true/false
```

### `getEstimatedDaysRemaining(stage: TrackingStage): number`
Get estimated remaining days for current stage.

```typescript
getEstimatedDaysRemaining('testing_in_progress'); // 7
```

## UI Components

### OrderStatusBadge
Displays current tracking stage with color-coded badge.

```tsx
<OrderStatusBadge 
  trackingStage={order.trackingStage}
  status={order.status}
/>
```

**Supported Stages:**
- pending: Yellow
- out_for_lab: Blue
- kit_reached_lab: Indigo
- testing_in_progress: Purple
- processing_result: Orange
- result_ready: Green
- cancelled: Red

### OrderStatusTimeline
Displays full tracking timeline with progress indicator.

```tsx
<OrderStatusTimeline order={order} />
```

**Features:**
- Visual timeline with all stages
- Completion dates for each stage
- Progress bar (0-100%)
- Current stage indicator with animation
- Estimated completion information

## Implementation Examples

### Update Order Tracking (Admin/Backend)

```typescript
import { updateOrderTrackingStage } from '@/lib/firestore';

// Move order to next stage
await updateOrderTrackingStage(
  'user123',
  'order456',
  'out_for_lab',
  'Dispatched from warehouse'
);
```

### Display Tracking Timeline (Frontend)

```tsx
'use client';

import { OrderStatusTimeline } from '@/components/order-status-timeline';
import { useEffect, useState } from 'react';

export default function TrackingPage({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'x-user-id': userId,
        }
      });
      const data = await res.json();
      setOrder(data.data);
    };
    
    fetchOrder();
  }, [orderId]);

  return order ? <OrderStatusTimeline order={order} /> : <div>Loading...</div>;
}
```

### Custom Tracking Widget

```tsx
import { getProgressPercentage, STAGE_DESCRIPTIONS } from '@/lib/tracking-helpers';

export function TrackingWidget({ order }: { order: Order }) {
  const progress = getProgressPercentage(order.trackingStage);
  const stageInfo = STAGE_DESCRIPTIONS[order.trackingStage];

  return (
    <div>
      <p className="text-lg font-semibold">{stageInfo.label}</p>
      <p className="text-sm text-gray-600">{stageInfo.description}</p>
      <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
        <div 
          className="h-full bg-green-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">{progress}% Complete</p>
    </div>
  );
}
```

## Migration Guide

If you have existing orders without tracking stages:

```typescript
// Add default tracking history to existing orders
const defaultHistory = initializeTrackingHistory();

const updateExistingOrders = async () => {
  // For each order that doesn't have trackingHistory
  await updateDoc(orderRef, {
    trackingStage: 'pending',
    trackingHistory: defaultHistory,
  });
};
```

## Frontend Integration

### Update Order Tracking Page

```tsx
// Order list now shows tracking stages
<OrderStatusBadge 
  trackingStage={order.trackingStage}
  status={order.status}
/>

// View detailed timeline
<OrderStatusTimeline order={order} />
```

### Display Estimated Completion

```tsx
import { getEstimatedDaysRemaining } from '@/lib/tracking-helpers';

const estimatedDays = getEstimatedDaysRemaining(order.trackingStage);
<p>Estimated completion: {estimatedDays} days</p>
```

## Progress Calculation

Progress bar shows percentage based on current stage:
- pending: 16%
- out_for_lab: 33%
- kit_reached_lab: 50%
- testing_in_progress: 67%
- processing_result: 83%
- result_ready: 100%

## Timeline Display

The OrderStatusTimeline component shows:
1. ✓ All completed stages with completion timestamps
2. → Current stage with animation
3. ○ Pending stages (not yet reached)
4. Progress bar showing overall completion %

## Next Steps

1. **Admin Dashboard**: Create interface to manually advance tracking stages
2. **Email Notifications**: Send emails when stage changes
3. **SMS Alerts**: Send SMS notifications (optional)
4. **Analytics**: Track stage completion metrics
5. **Automation**: Connect with lab systems for automatic updates

## Testing

```typescript
// Test stage transitions
const order = { trackingStage: 'pending' };
expect(isValidStageTransition('pending', 'out_for_lab')).toBe(true);
expect(getProgressPercentage('kit_reached_lab')).toBe(50);
expect(getNextStage('testing_in_progress')).toBe('processing_result');

// Test timeline component
render(<OrderStatusTimeline order={mockOrder} />);
expect(screen.getByText('Order Placed')).toBeInTheDocument();
expect(screen.getByText('Out for Lab')).toBeInTheDocument();
```

## Troubleshooting

### Order not showing tracking stage
- Ensure order was created after update
- Check Firestore for `trackingStage` field
- Fallback to `status` field if `trackingStage` is undefined

### Progress bar not updating
- Verify `trackingStage` is correctly set
- Check that `trackingHistory` is populated
- Use `getProgressPercentage()` for calculation

### Timestamps incorrect
- Ensure Firestore timestamps are ISO format
- Use `new Date().toISOString()` for new timestamps
- Format for display with `date-fns` library

## Support

For questions or issues, refer to:
- `/src/types/order.ts` - Type definitions
- `/src/lib/firestore.ts` - Database operations
- `/src/lib/tracking-helpers.ts` - Helper utilities
- `/src/components/order-status-timeline.tsx` - Timeline component
- `/src/components/order-status-badge.tsx` - Badge component
