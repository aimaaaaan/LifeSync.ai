'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { adminUpdateOrderStage } from '@/lib/firestore';
import { TrackingStage } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Order {
  orderId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  status: string;
  trackingStage?: string;
  createdAt: string;
}

interface OrderStatusUpdateModalProps {
  isOpen: boolean;
  order: Order;
  onClose: () => void;
}

const TRACKING_STAGES: TrackingStage[] = [
  'pending',
  'out_for_lab',
  'kit_reached_lab',
  'testing_in_progress',
  'processing_result',
  'result_ready',
  'cancelled',
];

const STAGE_LABELS: Record<TrackingStage, string> = {
  pending: 'Order Placed',
  out_for_lab: 'Out for Lab',
  kit_reached_lab: 'Kit Reached Lab',
  testing_in_progress: 'Testing in Progress',
  processing_result: 'Processing Result',
  result_ready: 'Result Ready',
  cancelled: 'Cancelled',
};

export default function OrderStatusUpdateModal({
  isOpen,
  order,
  onClose,
}: OrderStatusUpdateModalProps) {
  const [user] = useAuthState(auth);
  const [selectedStage, setSelectedStage] = useState<TrackingStage>(
    (order.trackingStage as TrackingStage) || 'pending'
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      await adminUpdateOrderStage(order.userId, order.orderId, selectedStage, user.email);
      
      toast({
        title: 'Success',
        description: `Order updated to ${STAGE_LABELS[selectedStage]}`,
      });
      
      // Close modal and trigger refresh
      onClose();
      
      // Force a small delay to ensure database write is complete
      // Then trigger a refresh on the parent component
      setTimeout(() => {
        // This will trigger the admin dashboard to refresh
        window.dispatchEvent(new Event('orderUpdated'));
      }, 500);
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Update the tracking stage for order {order.orderId.slice(-8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Order ID</Label>
            <div className="text-sm font-mono text-gray-600">{order.orderId}</div>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">User Email</Label>
            <div className="text-sm text-gray-600">{order.userEmail}</div>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">Current Stage</Label>
            <div className="text-sm text-gray-600">
              {STAGE_LABELS[(order.trackingStage as TrackingStage) || 'pending']}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stage" className="text-sm font-medium">
              New Tracking Stage
            </Label>
            <Select value={selectedStage} onValueChange={(value) => setSelectedStage(value as TrackingStage)}>
              <SelectTrigger id="stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRACKING_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {STAGE_LABELS[stage]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading} className="gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Stage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
