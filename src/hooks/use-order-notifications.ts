'use client';

import { useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useNotification } from '@/contexts/notification-context';
import { useOrderListener } from './use-order-listener';

/**
 * Hook that monitors user's orders for tracking stage changes
 * and triggers notifications
 */
export const useOrderNotifications = () => {
  const [user] = useAuthState(auth);
  const { addNotification } = useNotification();
  const previousStagesRef = useRef<Map<string, string>>(new Map());

  const orders = useOrderListener(user?.uid);

  useEffect(() => {
    if (!orders || orders.length === 0) return;

    orders.forEach((order) => {
      const previousStage = previousStagesRef.current.get(order.orderId);
      const currentStage = order.trackingStage || order.status;

      // If stage changed, create notification
      if (previousStage && previousStage !== currentStage) {
        let title = 'Order Status Updated';
        let message = `Your order ${order.orderId.slice(-6)} status has been updated`;
        let resultData: any = undefined;

        if (currentStage === 'result_ready') {
          title = 'Results Ready! 🎉';
          message = `Your DNA test results are ready for review. Click to view your comprehensive genetic report.`;
          resultData = {
            summary: 'Your genetic analysis is complete',
            geneticRisks: [
              'Carrier status identified',
              'Moderate genetic predisposition detected',
            ],
          };
        } else if (currentStage === 'out_for_lab') {
          message = 'Your kit is on its way to the lab';
        } else if (currentStage === 'kit_reached_lab') {
          message = 'Your kit has arrived at the testing facility';
        } else if (currentStage === 'testing_in_progress') {
          message = 'DNA analysis is now in progress';
        } else if (currentStage === 'processing_result') {
          message = 'Your results are being analyzed and compiled';
        }

        addNotification({
          orderId: order.orderId,
          type: currentStage === 'result_ready' ? 'result_ready' : 'status_update',
          title,
          message,
          resultData,
        });

        // Update reference
        previousStagesRef.current.set(order.orderId, currentStage);
      } else if (!previousStage) {
        // First time seeing this order, just record the stage
        previousStagesRef.current.set(order.orderId, currentStage);
      }
    });
  }, [orders, addNotification]);

  return orders;
};
