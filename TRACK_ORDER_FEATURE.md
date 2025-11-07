# Track Your Order Feature - Implementation Guide

## Overview

Users who have submitted orders now see a "Track Your Order" button in the navbar on all pages. This allows them to quickly navigate to their order tracking page to see the 5-stage tracking timeline.

## Features

✅ **Smart Navigation Link**
- Only appears when user is logged in AND has submitted orders
- Appears in navbar on all pages: home, order form, and order confirmation
- Green-colored button with Package icon for visual distinction
- Automatically hidden when user has no orders

✅ **Real-Time Order Detection**
- Checks if user has submitted orders on component mount
- Uses user ID and email from Firebase auth
- Fetches from `/api/orders` endpoint
- Gracefully handles network errors

✅ **User-Friendly**
- Clear label: "Track Order"
- Package icon for visual recognition
- Mobile and desktop responsive
- Placed strategically in navbar before auth button

## Files Modified

### 1. **New Component** - `/src/components/track-order-nav.tsx`
Smart navigation component that:
- Checks if user is authenticated
- Fetches user's orders from API
- Shows "Track Order" button if orders exist
- Returns null (hidden) if no orders or not logged in

### 2. **Updated Pages** - Added TrackOrderNav component to:
- `/src/app/page.tsx` - Home page navbar
- `/src/app/order/page.tsx` - Order form page navbar  
- `/src/app/order/confirmation/page.tsx` - Order confirmation page navbar

## How It Works

### User Journey

```
1. User visits home page (logged in)
   ↓
2. TrackOrderNav component mounts
   ↓
3. Component checks if user is authenticated
   ↓
4. If yes → Fetches orders from API
   ↓
5. If orders exist → Shows "Track Order" button
   ↓
6. User clicks "Track Order"
   ↓
7. Navigates to /order-tracking page
   ↓
8. Sees 5-stage timeline with tracking status
```

### Component Logic

```typescript
export const TrackOrderNav: React.FC = () => {
  const [user] = useAuthState(auth);
  const [hasOrders, setHasOrders] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check if user exists
    if (!user?.uid) return;

    // 2. Fetch orders from API
    const response = await fetch('/api/orders', {
      headers: {
        'x-user-id': user.uid,
        'x-user-email': user.email
      }
    });

    // 3. Set hasOrders based on response
    if (response.ok) {
      const data = await response.json();
      setHasOrders(data.data?.length > 0);
    }
  }, [user?.uid, user?.email]);

  // 4. Only render if user exists AND has orders
  if (!user || loading) return null;
  if (!hasOrders) return null;

  // 5. Return "Track Order" button
  return <Button>Track Order</Button>;
};
```

## Code Examples

### Integrating Into Your Page

```tsx
import { TrackOrderNav } from '@/components/track-order-nav';

export default function YourPage() {
  return (
    <header>
      <nav>
        <a href="#about">About</a>
        <a href="#product">Product</a>
        <TrackOrderNav />  {/* Add here */}
        <AuthButton />
      </nav>
    </header>
  );
}
```

### What Gets Rendered

```tsx
// When user is NOT logged in or has NO orders:
// <nothing> - component returns null

// When user IS logged in AND HAS orders:
<Button 
  variant="outline" 
  className="border-green-600 text-green-600 hover:bg-green-50" 
  asChild
>
  <a href="/order-tracking">
    <Package className="h-4 w-4" />
    Track Order
  </a>
</Button>
```

## Styling

### Button Style
- **Variant**: outline
- **Colors**: Green (#16a34a)
- **Icon**: Package (Lucide)
- **Hover**: Light green background

### Placement in Navbar

```
┌────────────────────────────────────────────┐
│ LifeCare.ai | About | Product | Reporting │
│                                    ┌──────┐│
│              Track Order [📦] Register Kit│
│                                    └──────┘│
│                              [Login/Logout]│
└────────────────────────────────────────────┘
```

## API Integration

### Endpoint Used
```
GET /api/orders
Headers:
  x-user-id: {userId}
  x-user-email: {userEmail}
```

### Expected Response
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": [
    {
      "orderId": "abc123",
      "trackingStage": "pending",
      "status": "confirmed",
      // ... order data
    },
    // ... more orders
  ],
  "total": 1
}
```

### Error Handling
- If API call fails: Button hidden (fails gracefully)
- If no data returned: Button hidden
- If empty array: Button hidden
- If network error: Component continues to check

## User Experience

### Scenario 1: First-Time Visitor
- User visits homepage (not logged in)
- TrackOrderNav returns `null`
- Button not visible
- User sees normal navbar

### Scenario 2: Logged In, No Orders
- User logs in but hasn't placed order
- API returns empty array
- Button hidden
- User can place order via "Register Kit" button

### Scenario 3: Logged In, Has Orders ✅
- User logs in after placing order
- API returns orders array
- **"Track Order" button visible** ✅
- User can click to see tracking timeline

### Scenario 4: Place New Order
- User clicks "Register Kit" → Order form
- Completes form → Confirmation page
- Confirmation page also has TrackOrderNav
- After submission, user can click "Track Order"

## Testing

### Test Cases

#### Test 1: Component Visibility
```
Given: User NOT logged in
When: Visit any page
Then: "Track Order" button should NOT be visible
```

#### Test 2: Order Detection
```
Given: User IS logged in
And: User HAS submitted orders
When: Page loads
Then: "Track Order" button SHOULD be visible
```

#### Test 3: No Orders
```
Given: User IS logged in
And: User has NO submitted orders
When: Page loads
Then: "Track Order" button should NOT be visible
```

#### Test 4: Navigation
```
Given: "Track Order" button is visible
When: User clicks button
Then: Navigate to /order-tracking page
```

#### Test 5: Button Styling
```
Given: "Track Order" button visible
When: View on different devices
Then: Button styling should be consistent
And: Icon should display correctly
```

### Manual Testing Steps

1. **Without Orders**
   - Sign in with test account (no orders)
   - Visit home page
   - Verify "Track Order" NOT visible
   
2. **After Placing Order**
   - Complete order form
   - Submit order
   - Verify on confirmation page "Track Order" is visible
   - Click button → Should go to `/order-tracking`
   
3. **Returning User**
   - Sign out and back in
   - Visit home page
   - Verify "Track Order" button still visible
   
4. **Mobile View**
   - Test on mobile device
   - Verify button appears in navbar
   - Verify clickable and navigates correctly

## Performance Considerations

- ✅ **Minimal API Calls**: Only called once per mount
- ✅ **No Infinite Loops**: Proper dependency array in useEffect
- ✅ **Graceful Degradation**: Returns null if not needed (minimal DOM)
- ✅ **Error Handling**: Network errors don't break the page
- ✅ **Loading State**: Shows nothing during loading (smooth UX)

## Future Enhancements

1. **Badge with Count**
   ```tsx
   <Badge className="ml-1 bg-green-600 text-white">3</Badge>
   ```
   Show number of active orders

2. **Order Notifications**
   - Show badge when tracking stage updates
   - Display quick status in tooltip

3. **Mobile Menu**
   - Add to mobile sidebar menu
   - Make accessible on small screens

4. **Direct Order Status**
   - Show current stage in dropdown menu
   - Link to specific order

5. **Animated Badge**
   - Pulse animation when new status available
   - Draw attention to order updates

## Troubleshooting

### "Track Order" Button Not Showing

**Problem**: Button not visible even after placing order

**Solutions**:
1. Clear browser cache and refresh
2. Verify user is logged in (check auth state)
3. Check API response in browser Network tab
4. Verify order exists in Firestore (`users/{userId}/orders`)
5. Check browser console for errors

### Button Shows But Doesn't Navigate

**Problem**: Click button but nothing happens

**Solutions**:
1. Verify `/order-tracking` page exists
2. Check user authentication on tracking page
3. Verify route is configured in Next.js
4. Check browser console for errors

### Multiple Orders

**Problem**: User has multiple orders but button only appears once

**Solution**: This is correct behavior - button links to tracking page showing all orders

## Files Reference

| File | Purpose |
|------|---------|
| `/src/components/track-order-nav.tsx` | New component (45 lines) |
| `/src/app/page.tsx` | Updated with import and navbar placement |
| `/src/app/order/page.tsx` | Updated with import and navbar placement |
| `/src/app/order/confirmation/page.tsx` | Updated with import and navbar placement |

## Summary

The "Track Your Order" feature:
- ✅ Shows in navbar only when needed
- ✅ Intelligently checks if user has orders
- ✅ Provides quick access to tracking page
- ✅ Improves user experience with clear status tracking
- ✅ Maintains clean UI for new users
- ✅ Gracefully handles all edge cases

Users can now easily track their DNA test kit journey through all 5 stages! 🎉
