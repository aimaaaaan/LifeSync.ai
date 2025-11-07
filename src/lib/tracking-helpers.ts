/**
 * Order Tracking Helper Utilities
 * Provides functions for managing order tracking stages and history
 */

import { TrackingStage, TrackingStageDetail, Order } from '@/types/order';

/**
 * All valid DNA testing tracking stages in order
 */
export const TRACKING_STAGES: TrackingStage[] = [
  'pending',
  'out_for_lab',
  'kit_reached_lab',
  'testing_in_progress',
  'processing_result',
  'result_ready',
];

/**
 * Tracking stage descriptions for UI display
 */
export const STAGE_DESCRIPTIONS: Record<TrackingStage, { label: string; description: string }> = {
  pending: {
    label: 'Order Placed',
    description: 'Your DNA test kit order has been received',
  },
  out_for_lab: {
    label: 'Out for Lab',
    description: 'Your kit is on the way to our laboratory',
  },
  kit_reached_lab: {
    label: 'Kit Reached Lab',
    description: 'Your kit has arrived at our laboratory',
  },
  testing_in_progress: {
    label: 'DNA Data Being Tested',
    description: 'Your DNA sample is being analyzed in our lab',
  },
  processing_result: {
    label: 'Processing Your Result',
    description: 'Your test results are being processed and analyzed',
  },
  result_ready: {
    label: 'Result is Out',
    description: 'Your DNA test results are ready to view',
  },
  cancelled: {
    label: 'Order Cancelled',
    description: 'Your order has been cancelled',
  },
};

/**
 * Get the stage details for a tracking stage
 */
export const getStageDetails = (stage: TrackingStage) => {
  return STAGE_DESCRIPTIONS[stage] || { label: 'Unknown', description: 'Unknown stage' };
};

/**
 * Get the progress percentage for a current stage
 */
export const getProgressPercentage = (currentStage: TrackingStage): number => {
  if (currentStage === 'cancelled') return 0;
  if (currentStage === 'result_ready') return 100;

  const index = TRACKING_STAGES.indexOf(currentStage);
  if (index === -1) return 0;

  return Math.round(((index + 1) / TRACKING_STAGES.length) * 100);
};

/**
 * Get the next valid tracking stage
 */
export const getNextStage = (currentStage: TrackingStage): TrackingStage | null => {
  if (currentStage === 'result_ready' || currentStage === 'cancelled') return null;

  const index = TRACKING_STAGES.indexOf(currentStage);
  if (index === -1 || index >= TRACKING_STAGES.length - 1) return null;

  return TRACKING_STAGES[index + 1];
};

/**
 * Check if a stage transition is valid
 */
export const isValidStageTransition = (from: TrackingStage, to: TrackingStage): boolean => {
  // Can't transition from cancelled
  if (from === 'cancelled') return false;
  
  // Can transition to cancelled from any stage
  if (to === 'cancelled') return true;

  const fromIndex = TRACKING_STAGES.indexOf(from);
  const toIndex = TRACKING_STAGES.indexOf(to);

  if (fromIndex === -1 || toIndex === -1) return false;

  // Can only move forward or stay in the same stage
  return toIndex >= fromIndex;
};

/**
 * Get completion status of a stage for a given order
 */
export const isStageCompleted = (order: Order, stage: TrackingStage): boolean => {
  if (!order.trackingHistory || order.trackingHistory.length === 0) {
    return stage === 'pending' && order.trackingStage !== null;
  }

  return order.trackingHistory.some((h) => h.stage === stage);
};

/**
 * Get the completion date of a stage
 */
export const getStageCompletionDate = (order: Order, stage: TrackingStage): string | null => {
  if (!order.trackingHistory) return null;

  const entry = order.trackingHistory.find((h) => h.stage === stage);
  return entry?.completedAt || null;
};

/**
 * Calculate estimated days remaining based on stage
 */
export const getEstimatedDaysRemaining = (currentStage: TrackingStage): number => {
  const estimations: Record<TrackingStage, number> = {
    pending: 2,
    out_for_lab: 5,
    kit_reached_lab: 3,
    testing_in_progress: 7,
    processing_result: 3,
    result_ready: 0,
    cancelled: 0,
  };

  return estimations[currentStage] || 0;
};

/**
 * Format stage history for display
 */
export const formatStageHistory = (history: TrackingStageDetail[]) => {
  return history
    .sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateA - dateB;
    })
    .map((entry) => ({
      ...entry,
      details: getStageDetails(entry.stage),
    }));
};
