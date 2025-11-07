# Order Tracking System - Visual Guide

## Tracking Stage Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  DNA TEST KIT JOURNEY                       │
└─────────────────────────────────────────────────────────────┘

                          ⏰ Pending
                      Order Placed
                  "Order received"
                         │
                         ↓
                    ⏱️ 2 days
                         │
                         ↓
                    📦 Out for Lab
                 "Kit on the way"
                         │
                         ↓
                    ⏱️ 5 days
                         │
                         ↓
                    ✓ Kit Reached Lab
                "Kit at laboratory"
                         │
                         ↓
                    ⏱️ 3 days
                         │
                         ↓
                    🔬 DNA Being Tested
                 "Sample analysis"
                         │
                         ↓
                    ⏱️ 7 days
                         │
                         ↓
                    ⚡ Processing Result
                "Results being analyzed"
                         │
                         ↓
                    ⏱️ 3 days
                         │
                         ↓
                    ✅ Result is Out
                 "Results ready!"
                 
    Total Estimated Time: 20+ days
```

## UI Timeline Component

```
┌──────────────────────────────────────────────────────────────────┐
│  Order Progress Timeline                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⏰ Order Placed                                                 │
│  │  "Your DNA test kit order has been received"                │
│  │  ✓ Completed: Nov 07, 2024 10:00 AM                         │
│  │                                                              │
│  ├─────────────────────────────────────────────────────────────┤
│  │                                                              │
│  📦 Out for Lab                                                │
│  │  "Your kit is on the way to our laboratory"                │
│  │  ✓ Completed: Nov 09, 2024 02:30 PM                        │
│  │                                                              │
│  ├─────────────────────────────────────────────────────────────┤
│  │                                                              │
│  ✓ Kit Reached Lab                                             │
│  │  "Your kit has arrived at our laboratory"                  │
│  │  ✓ Completed: Nov 12, 2024 11:00 AM                        │
│  │                                                              │
│  ├─────────────────────────────────────────────────────────────┤
│  │                                                              │
│  🔵 🔵 DNA Data Being Tested          [CURRENT] ⚫ Pulsing      │
│  │  "Your DNA sample is being analyzed in our lab"           │
│  │  → Expected to complete soon                               │
│  │                                                              │
│  ├─────────────────────────────────────────────────────────────┤
│  │                                                              │
│  ○ Processing Your Result                                      │
│  │  "Your test results are being processed and analyzed"      │
│  │                                                              │
│  ├─────────────────────────────────────────────────────────────┤
│  │                                                              │
│  ○ Result is Out                                               │
│    "Your DNA test results are ready to view"                  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ Overall Progress                               67% [████████░░] │
└──────────────────────────────────────────────────────────────────┘
```

## Status Badge Display

```
Order Status Badges:

  🟨 Order Placed        🟦 Out for Lab          🟪 Kit Reached Lab
  (Yellow)               (Blue)                  (Indigo)

  🟪 DNA Testing         🟧 Processing Result    🟩 Result Ready
  (Purple)               (Orange)                (Green)

  🟥 Cancelled           (all cancellable from any stage)
  (Red)
```

## Database Structure

```
Firestore
├── users/
│   ├── {userId}/
│   │   ├── email: "user@example.com"
│   │   ├── displayName: "John Doe"
│   │   ├── createdAt: "2024-11-07T10:00:00Z"
│   │   └── orders/                    (subcollection)
│   │       ├── {orderId1}/
│   │       │   ├── orderId: "abc123"
│   │       │   ├── userId: "{userId}"
│   │       │   ├── fullName: "John Doe"
│   │       │   ├── trackingStage: "testing_in_progress"  ← NEW
│   │       │   ├── status: "confirmed"
│   │       │   ├── trackingHistory: [               ← NEW
│   │       │   │   {
│   │       │   │     stage: "pending",
│   │       │   │     label: "Order Placed",
│   │       │   │     description: "...",
│   │       │   │     completedAt: "2024-11-07T10:00:00Z"
│   │       │   │   },
│   │       │   │   {
│   │       │   │     stage: "out_for_lab",
│   │       │   │     label: "Out for Lab",
│   │       │   │     description: "...",
│   │       │   │     completedAt: "2024-11-09T14:30:00Z"
│   │       │   │   },
│   │       │   │   {
│   │       │   │     stage: "kit_reached_lab",
│   │       │   │     label: "Kit Reached Lab",
│   │       │   │     description: "...",
│   │       │   │     completedAt: "2024-11-12T11:00:00Z"
│   │       │   │   },
│   │       │   │   {
│   │       │   │     stage: "testing_in_progress",
│   │       │   │     label: "DNA Data Being Tested",
│   │       │   │     description: "...",
│   │       │   │     completedAt: null    (current stage)
│   │       │   │   }
│   │       │   ]
│   │       │   ├── createdAt: "2024-11-07T10:00:00Z"
│   │       │   ├── updatedAt: "2024-11-14T08:30:00Z"
│   │       │   └── ... (other order fields)
│   │       │
│   │       └── {orderId2}/
│   │           └── ... (another order)
│   │
│   └── {userId2}/
│       └── ... (another user)
```

## API Endpoint Flow

```
┌─────────────────────────────────────────────────────────────┐
│             API ENDPOINT INTERACTIONS                       │
└─────────────────────────────────────────────────────────────┘

1. CREATE ORDER
   ┌─────────────────────────────────────────────────┐
   │ POST /api/orders                                │
   ├─────────────────────────────────────────────────┤
   │ Request:                                        │
   │ {                                               │
   │   orderData: { fullName, age, ... },           │
   │   userInfo: { userId, userEmail, userName }    │
   │ }                                               │
   │                                                 │
   │ Response:                                       │
   │ {                                               │
   │   success: true,                                │
   │   orderId: "xyz789",                           │
   │   message: "Order saved successfully"          │
   │ }                                               │
   │                                                 │
   │ Side Effects:                                   │
   │ ✓ Creates order document                       │
   │ ✓ Sets trackingStage: "pending"               │
   │ ✓ Initializes trackingHistory                 │
   └─────────────────────────────────────────────────┘

2. VIEW ORDER DETAILS
   ┌─────────────────────────────────────────────────┐
   │ GET /api/orders/[orderId]                      │
   ├─────────────────────────────────────────────────┤
   │ Headers: x-user-id: {userId}                  │
   │                                                 │
   │ Response:                                       │
   │ {                                               │
   │   success: true,                                │
   │   data: {                                       │
   │     orderId: "xyz789",                         │
   │     trackingStage: "kit_reached_lab",         │
   │     trackingHistory: [ {...}, {...}, ... ],   │
   │     status: "confirmed",                      │
   │     ... (all order fields)                     │
   │   }                                             │
   │ }                                               │
   │                                                 │
   │ Displays: Timeline with all stages            │
   └─────────────────────────────────────────────────┘

3. UPDATE TRACKING STAGE
   ┌─────────────────────────────────────────────────┐
   │ PATCH /api/orders/[orderId]                    │
   ├─────────────────────────────────────────────────┤
   │ Headers: x-user-id: {userId}                  │
   │                                                 │
   │ Request:                                        │
   │ {                                               │
   │   trackingStage: "testing_in_progress",       │
   │   notes: "DNA analysis started"               │
   │ }                                               │
   │                                                 │
   │ Response:                                       │
   │ {                                               │
   │   success: true,                                │
   │   data: {                                       │
   │     orderId: "xyz789",                         │
   │     trackingStage: "testing_in_progress",    │
   │     trackingHistory: [ {...}, {...}, ... ],  │
   │     updatedAt: "2024-11-14T10:30:00Z"        │
   │   }                                             │
   │ }                                               │
   │                                                 │
   │ Side Effects:                                   │
   │ ✓ Adds to trackingHistory                     │
   │ ✓ Updates trackingStage                       │
   │ ✓ Records completedAt timestamp               │
   │ ✓ Auto-updates status if result_ready        │
   └─────────────────────────────────────────────────┘
```

## Progress Bar Calculation

```
Stage               Index    Progress %
─────────────────────────────────────────
pending               1        16%  ░░░░░░░░░░░░░░░░░░░░░░░░░░
out_for_lab           2        33%  ░░░░░░░░░░░░░░░░░░░░░░░░░░
kit_reached_lab       3        50%  ████████░░░░░░░░░░░░░░░░░░
testing_in_progress   4        67%  ███████████████░░░░░░░░░░░░
processing_result     5        83%  ██████████████████░░░░░░░░
result_ready          6       100%  ████████████████████████████
cancelled             -         0%  ░░░░░░░░░░░░░░░░░░░░░░░░░░
```

## Component Hierarchy

```
App
├── OrderTrackingPage
│   ├── Stats Cards (using status)
│   ├── Search Input
│   ├── Tabs (pending, confirmed, completed, cancelled)
│   └── Orders List
│       ├── Card
│       │   ├── OrderStatusBadge ← trackingStage | status
│       │   ├── Order Details
│       │   └── View Details Button
│       │
│       └── OrderDetailsModal
│           └── OrderStatusTimeline ← Full 5-stage timeline
│               ├── Stage Items
│               │   ├── Icon (Clock, Package, CheckCircle, etc.)
│               │   ├── Label
│               │   ├── Description
│               │   ├── Completion Date
│               │   └── Connector Line
│               └── Progress Bar
```

## Type System

```typescript
// Core Types
TrackingStage = 
  | 'pending'
  | 'out_for_lab'
  | 'kit_reached_lab'
  | 'testing_in_progress'
  | 'processing_result'
  | 'result_ready'
  | 'cancelled'

TrackingStageDetail = {
  stage: TrackingStage,
  label: string,
  description: string,
  completedAt?: string  // ISO timestamp
}

Order = {
  orderId: string,
  userId: string,
  trackingStage: TrackingStage,
  trackingHistory: TrackingStageDetail[],
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  createdAt: string,
  updatedAt: string,
  // ... other order fields
}
```

## Helper Functions

```
getProgressPercentage(stage)
  'pending' → 16
  'out_for_lab' → 33
  'kit_reached_lab' → 50
  'testing_in_progress' → 67
  'processing_result' → 83
  'result_ready' → 100
  'cancelled' → 0

getNextStage(stage)
  'pending' → 'out_for_lab'
  'out_for_lab' → 'kit_reached_lab'
  ... 
  'result_ready' → null

isValidStageTransition(from, to)
  ('pending', 'out_for_lab') → true
  ('result_ready', 'processing_result') → false
  ('testing_in_progress', 'cancelled') → true

getEstimatedDaysRemaining(stage)
  'pending' → 2
  'out_for_lab' → 5
  'kit_reached_lab' → 3
  'testing_in_progress' → 7
  'processing_result' → 3
  'result_ready' → 0
```

## Styling Reference

```
Color Scheme:

Yellow (Pending)
  Background: bg-yellow-100
  Text: text-yellow-800
  Border: border-yellow-300

Blue (Out for Lab)
  Background: bg-blue-100
  Text: text-blue-800
  Border: border-blue-300

Indigo (Kit Reached Lab)
  Background: bg-indigo-100
  Text: text-indigo-800
  Border: border-indigo-300

Purple (Testing in Progress)
  Background: bg-purple-100
  Text: text-purple-800
  Border: border-purple-300

Orange (Processing Result)
  Background: bg-orange-100
  Text: text-orange-800
  Border: border-orange-300

Green (Result Ready)
  Background: bg-green-100
  Text: text-green-800
  Border: border-green-300

Red (Cancelled)
  Background: bg-red-100
  Text: text-red-800
  Border: border-red-300
```

## User Journey Map

```
User Action          System Response         UI Update
─────────────────────────────────────────────────────────
1. Place Order    → Order Created            Timeline shows
                    trackingStage: pending    "Order Placed" ✓
                    
2. Admin Updates  → Stage changed to         Timeline shows
   Stage           "out_for_lab"             "Out for Lab"
                   trackingHistory updated   Badge updated
                   
3. User Checks    → Fetch order from DB      Timeline displays
   Status          with full history         all completed stages
                                            + current stage
                                            + progress bar

4. Continue       → Each update adds         Timeline grows
   Updates        to trackingHistory        with new stages
                   New timestamps recorded   Progress updates
                   
5. Result Ready   → Final stage reached      Timeline complete
                   status auto-updated       100% progress
                   to 'completed'           Badge shows "Ready"
```

This visual guide covers all aspects of the tracking system from database structure to user interface!
