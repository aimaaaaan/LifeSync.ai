'use client';

import { Order } from '@/types/order';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { OrderStatusBadge } from './order-status-badge';
import { OrderStatusTimeline } from './order-status-timeline';

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  open,
  onOpenChange,
}) => {
  if (!order) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Order Details
            <OrderStatusBadge 
              trackingStage={order.trackingStage}
              status={order.status}
              className="ml-auto" 
            />
          </DialogTitle>
          <DialogDescription>Order ID: {order.orderId}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timeline">Order Status</TabsTrigger>
            <TabsTrigger value="details">Full Details</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            <OrderStatusTimeline order={order} />
          </TabsContent>

          <TabsContent value="details" className="mt-6 space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Contact Information
              </h3>
              <div className="grid gap-3">
                <div>
                  <p className="text-xs text-gray-600">Full Name</p>
                  <p className="text-sm font-medium">{order.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Mobile Number</p>
                  <p className="text-sm font-medium">{order.mobileNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="text-sm font-medium">{order.userEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Address</p>
                  <p className="text-sm font-medium">{order.completeAddress}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Test Scheduling */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Test Scheduling
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-600">Preferred Date</p>
                  <p className="text-sm font-medium">{order.preferredTestDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Preferred Time</p>
                  <p className="text-sm font-medium">{order.preferredTestTime}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Health Information */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Health Information
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-600">Age</p>
                  <p className="text-sm font-medium">{order.age || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Gender</p>
                  <p className="text-sm font-medium">{order.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Blood Group</p>
                  <p className="text-sm font-medium">{order.bloodGroup || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Height</p>
                  <p className="text-sm font-medium">{order.height || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Weight</p>
                  <p className="text-sm font-medium">{order.weight || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Ethnicity</p>
                  <p className="text-sm font-medium">{order.ethnicity || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Lifestyle */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Lifestyle
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-600">Smoking</p>
                  <p className="text-sm font-medium">{order.smoking || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Alcohol</p>
                  <p className="text-sm font-medium">{order.alcohol || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Exercise</p>
                  <p className="text-sm font-medium">{order.exercise || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Sleep Quality</p>
                  <p className="text-sm font-medium">{order.sleepQuality || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Stress Level</p>
                  <p className="text-sm font-medium">{order.stressLevel || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Dietary Preferences</p>
                  <p className="text-sm font-medium">
                    {order.dietaryPreferences || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Medical History */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Medical History
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-600">Current Medications</p>
                  <p className="text-sm font-medium">
                    {order.takingMedications || 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Medications Details</p>
                  <p className="text-sm font-medium">
                    {order.medications || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Allergies</p>
                  <p className="text-sm font-medium">
                    {order.hasAllergies || 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Allergies Details</p>
                  <p className="text-sm font-medium">{order.allergies || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Test Information */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Test Information
              </h3>
              <div className="grid gap-3">
                <div>
                  <p className="text-xs text-gray-600">Sample Type</p>
                  <p className="text-sm font-medium">{order.sampleType || 'N/A'}</p>
                </div>
                {order.motivations && order.motivations.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600">Motivations</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {order.motivations.map((motivation, index) => (
                        <Badge key={index} variant="outline">
                          {motivation}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {order.otherMotivation && (
                  <div>
                    <p className="text-xs text-gray-600">Other Motivation</p>
                    <p className="text-sm font-medium">{order.otherMotivation}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Order Metadata */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Order Information
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-600">Order ID</p>
                  <p className="text-sm font-mono font-medium">{order.orderId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">User ID</p>
                  <p className="text-sm font-mono font-medium">{order.userId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Created</p>
                  <p className="text-sm font-medium">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Last Updated</p>
                  <p className="text-sm font-medium">
                    {formatDate(order.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {order.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-700">
                    Notes
                  </h3>
                  <p className="text-sm text-gray-700">{order.notes}</p>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
