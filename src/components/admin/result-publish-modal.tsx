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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { adminPublishResults } from '@/lib/firestore';
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

interface ResultPublishModalProps {
  isOpen: boolean;
  order: Order;
  onClose: () => void;
}

export default function ResultPublishModal({
  isOpen,
  order,
  onClose,
}: ResultPublishModalProps) {
  const [user] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    overallRisk: 'moderate',
    summary: 'Your genetic analysis is complete. Please review the findings below.',
    risks: '',
  });

  const handlePublish = async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);

      const resultData = {
        overallRisk: formData.overallRisk,
        summary: formData.summary,
        geneticRisks: formData.risks
          .split('\n')
          .map((r) => r.trim())
          .filter((r) => r.length > 0),
        publishedAt: new Date().toISOString(),
        publishedBy: user.email,
      };

      await adminPublishResults(order.userId, order.orderId, resultData, user.email);

      toast({
        title: 'Success',
        description: 'Results published successfully. User will receive notification.',
      });

      onClose();
    } catch (error) {
      console.error('Error publishing results:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish results',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publish Test Results</DialogTitle>
          <DialogDescription>
            Publish DNA test results for order {order.orderId.slice(-8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Order ID</Label>
            <div className="text-sm font-mono text-gray-600">{order.orderId}</div>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">User</Label>
            <div className="text-sm text-gray-600">
              {order.userName} ({order.userEmail})
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="risk" className="text-sm font-medium">
              Overall Risk Level
            </Label>
            <select
              id="risk"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              value={formData.overallRisk}
              onChange={(e) => setFormData({ ...formData, overallRisk: e.target.value })}
            >
              <option value="low">Low Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="summary" className="text-sm font-medium">
              Result Summary
            </Label>
            <Textarea
              id="summary"
              placeholder="Enter a summary of the genetic analysis..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="h-24"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="risks" className="text-sm font-medium">
              Key Findings (one per line)
            </Label>
            <Textarea
              id="risks"
              placeholder="Carrier status for Cystic Fibrosis identified&#10;Moderate risk for Type 2 Diabetes&#10;Protective variant for Lactose Tolerance detected"
              value={formData.risks}
              onChange={(e) => setFormData({ ...formData, risks: e.target.value })}
              className="h-24 font-mono text-xs"
            />
            <p className="text-xs text-gray-500">
              Enter each finding on a new line. These will appear in the results notification.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handlePublish} 
            disabled={isLoading}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Publish Results
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
