'use client';

import { Order } from '@/types/order';
import { Card } from '@/components/ui/card';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Package, 
  Microscope, 
  Zap,
  ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface OrderStatusTimelineProps {
  order: Order;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  order,
}) => {
  // Complete tracking stage progression for DNA testing
  const allStages = [
    {
      key: 'pending',
      label: 'Order Placed',
      description: 'Your DNA test kit order has been received',
      icon: Clock,
    },
    {
      key: 'out_for_lab',
      label: 'Out for Lab',
      description: 'Your kit is on the way to our laboratory',
      icon: Package,
    },
    {
      key: 'kit_reached_lab',
      label: 'Kit Reached Lab',
      description: 'Your kit has arrived at our laboratory',
      icon: CheckCircle2,
    },
    {
      key: 'testing_in_progress',
      label: 'DNA Data Being Tested',
      description: 'Your DNA sample is being analyzed in our lab',
      icon: Microscope,
    },
    {
      key: 'processing_result',
      label: 'Processing Your Result',
      description: 'Your test results are being processed and analyzed',
      icon: Zap,
    },
    {
      key: 'result_ready',
      label: 'Result is Out',
      description: 'Your DNA test results are ready to view',
      icon: CheckCircle2,
    },
  ];

  const cancelledStage = {
    key: 'cancelled',
    label: 'Order Cancelled',
    description: 'Your order has been cancelled',
    icon: XCircle,
  };

  // Use tracking stage if available, otherwise fall back to status
  const currentStage = order.trackingStage || order.status;
  const isCancelled = currentStage === 'cancelled';
  const displayStages = isCancelled ? [cancelledStage] : allStages;

  // Get tracking history, ensuring it's populated
  const trackingHistory = order.trackingHistory || [];

  // Find completion index
  const getStageIndex = (stage: string) => {
    return displayStages.findIndex((s) => s.key === stage);
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <Card className="p-6">
      <h3 className="mb-6 text-lg font-semibold">Order Progress Timeline</h3>

      <div className="space-y-6">
        {displayStages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          // Find the completion date for this stage in history
          const historyEntry = trackingHistory.find((h) => h.stage === stage.key);
          const completionDate = historyEntry?.completedAt
            ? format(new Date(historyEntry.completedAt), 'MMM dd, yyyy hh:mm a')
            : null;

          const Icon = stage.icon;

          return (
            <div key={stage.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 shrink-0',
                    isCompleted || isCurrent
                      ? 'border-green-500 bg-green-50 text-green-600'
                      : 'border-gray-300 bg-gray-50 text-gray-400'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {index < displayStages.length - 1 && (
                  <div
                    className={cn(
                      'mt-2 h-12 w-0.5',
                      isCompleted
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    )}
                  />
                )}
              </div>

              <div className="flex-1 pt-1 pb-2">
                <div
                  className={cn(
                    'font-semibold',
                    isCompleted || isCurrent
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  )}
                >
                  {stage.label}
                  {isCurrent && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      <span className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                {completionDate && (
                  <p className="mt-2 text-xs text-gray-500 font-medium">
                    ✓ Completed: {completionDate}
                  </p>
                )}
                {isCurrent && (
                  <p className="mt-2 text-xs text-blue-600 font-medium">
                    → Expected to complete soon
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-semibold text-gray-900">
            {isCancelled ? '0%' : `${Math.round(((currentIndex + 1) / (displayStages.length)) * 100)}%`}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
            style={{
              width: isCancelled ? '0%' : `${Math.round(((currentIndex + 1) / (displayStages.length)) * 100)}%`,
            }}
          />
        </div>
      </div>
    </Card>
  );
};
