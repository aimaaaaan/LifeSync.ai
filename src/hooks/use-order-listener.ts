'use client';

import { useEffect, useState } from 'react';
import { Order } from '@/types/order';
import { getUserOrders } from '@/lib/firestore';

/**
 * Hook that listens to user's orders and provides real-time updates
 * Uses polling as Firebase Realtime Database is not available
 */
export const useOrderListener = (userId?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!userId) return;

    let isActive = true;
    let pollInterval: NodeJS.Timeout | null = null;

    const fetchOrders = async () => {
      try {
        const fetchedOrders = await getUserOrders(userId);
        if (isActive) {
          setOrders(fetchedOrders);
        }
      } catch (error) {
        console.error('Error fetching orders in listener:', error);
      }
    };

    // Initial fetch
    fetchOrders();

    // Poll every 10 seconds for order updates (for faster notification detection)
    pollInterval = setInterval(fetchOrders, 10000);

    return () => {
      isActive = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [userId]);

  return orders;
};
