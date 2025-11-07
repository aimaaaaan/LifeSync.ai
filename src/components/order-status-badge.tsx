'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, XCircle, Package, Microscope, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrackingStage } from '@/types/order';

interface OrderStatusBadgeProps {
  trackingStage?: TrackingStage;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  trackingStage,
  status,
  className,
}) => {
  // Priority: use trackingStage if available, fallback to status
  const displayStage = trackingStage || status;

  const stageBadgeConfig: Record<TrackingStage | string, {
    label: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = {
    pending: {
      label: 'Order Placed',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: Clock,
    },
    out_for_lab: {
      label: 'Out for Lab',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Package,
    },
    kit_reached_lab: {
      label: 'Kit Reached Lab',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      icon: CheckCircle2,
    },
    testing_in_progress: {
      label: 'Testing in Progress',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: Microscope,
    },
    processing_result: {
      label: 'Processing Result',
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: Zap,
    },
    result_ready: {
      label: 'Result Ready',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: CheckCircle2,
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: XCircle,
    },
    confirmed: {
      label: 'Confirmed',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: CheckCircle2,
    },
    completed: {
      label: 'Completed',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: CheckCircle2,
    },
  };

  const config = stageBadgeConfig[displayStage as string] || {
    label: 'Unknown',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: AlertCircle,
  };

  const Icon = config.icon;

  return (
    <Badge className={cn('flex items-center gap-2', config.color, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};
