'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

/**
 * Navigation helper component that shows "Track Your Order" link
 * when user has submitted orders
 */
export const TrackOrderNav: React.FC = () => {
  const [user] = useAuthState(auth);
  const [hasOrders, setHasOrders] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserOrders = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/orders', {
          method: 'GET',
          headers: {
            'x-user-id': user.uid,
            'x-user-email': user.email || '',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHasOrders(data.data && data.data.length > 0);
        }
      } catch (error) {
        console.error('Error checking orders:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserOrders();
  }, [user?.uid, user?.email]);

  // Don't render if user not logged in or loading
  if (!user || loading) {
    return null;
  }

  // Only show if user has orders
  if (!hasOrders) {
    return null;
  }

  return (
    <Button 
      variant="outline" 
      className="border-green-600 text-green-600 hover:bg-green-50 flex items-center gap-2" 
      asChild
    >
      <a href="/order-tracking">
        <Package className="h-4 w-4" />
        Track Order
      </a>
    </Button>
  );
};
