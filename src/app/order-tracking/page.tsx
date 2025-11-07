'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Order } from '@/types/order';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { OrderStatusTimeline } from '@/components/order-status-timeline';
import { OrderDetailsModal } from '@/components/order-details-modal';
import {
  Search,
  ArrowRight,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface OrderWithExpanded extends Order {
  expanded?: boolean;
}

export default function OrderTrackingPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.uid) return;

      try {
        setFetchLoading(true);
        setError(null);

        const response = await fetch('/api/orders', {
          method: 'GET',
          headers: {
            'x-user-id': user.uid,
            'x-user-email': user.email || '',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load orders'
        );
      } finally {
        setFetchLoading(false);
      }
    };

    fetchOrders();
  }, [user?.uid, user?.email]);

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by status tab
    if (activeTab !== 'all') {
      filtered = filtered.filter((order) => order.status === activeTab);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderId.toLowerCase().includes(term) ||
          order.fullName.toLowerCase().includes(term) ||
          order.mobileNumber.includes(term) ||
          order.userEmail.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [orders, activeTab, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      completed: orders.filter((o) => o.status === 'completed').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-2 flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Order Tracking
            </h1>
          </div>
          <p className="text-gray-600">
            Track and manage all your orders in one place
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="border-0 shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-200" />
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Pending
                  </p>
                  <p className="mt-1 text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Confirmed
                  </p>
                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {stats.confirmed}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-200" />
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Completed
                  </p>
                  <p className="mt-1 text-2xl font-bold text-green-600">
                    {stats.completed}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-200" />
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Cancelled
                  </p>
                  <p className="mt-1 text-2xl font-bold text-red-600">
                    {stats.cancelled}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-200" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by order ID, name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              All ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed ({stats.confirmed})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({stats.completed})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({stats.cancelled})
            </TabsTrigger>
          </TabsList>

          {/* Content for each tab */}
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(
            (tabName) => (
              <TabsContent key={tabName} value={tabName} className="mt-6">
                {fetchLoading ? (
                  // Loading skeleton
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="p-4">
                        <Skeleton className="h-20 w-full" />
                      </Card>
                    ))}
                  </div>
                ) : error ? (
                  // Error state
                  <Card className="border-red-200 bg-red-50 p-6">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-semibold text-red-900">{error}</p>
                        <p className="text-sm text-red-700">
                          Please try refreshing the page or contact support.
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : filteredOrders.length === 0 ? (
                  // Empty state
                  <Card className="border-dashed p-12 text-center">
                    <Package className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <p className="text-gray-600">
                      {searchTerm
                        ? 'No orders found matching your search'
                        : 'No orders yet. Start by placing your first order!'}
                    </p>
                    {!searchTerm && (
                      <Button asChild className="mt-4">
                        <a href="/order">Place an Order</a>
                      </Button>
                    )}
                  </Card>
                ) : (
                  // Orders list
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <Card
                        key={order.orderId}
                        className="overflow-hidden transition-all hover:shadow-md"
                      >
                        <div className="p-4 sm:p-6">
                          {/* Header */}
                          <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                            <div className="flex-1">
                            <div className="mb-2 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                                <p className="text-lg font-semibold text-gray-900">
                                  {order.fullName}
                                </p>
                                <OrderStatusBadge 
                                  trackingStage={order.trackingStage}
                                  status={order.status}
                                />
                              </div>
                              <p className="text-sm text-gray-600">
                                Order ID:{' '}
                                <span className="font-mono font-medium">
                                  {order.orderId}
                                </span>
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsModalOpen(true);
                              }}
                              className="w-full sm:w-auto"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </div>

                          {/* Body */}
                          <div className="mb-4 grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-xs text-gray-600">
                                Phone Number
                              </p>
                              <p className="mt-1 font-medium text-gray-900">
                                {order.mobileNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Email</p>
                              <p className="mt-1 font-medium text-gray-900">
                                {order.userEmail}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">
                                Test Date
                              </p>
                              <p className="mt-1 font-medium text-gray-900">
                                {order.preferredTestDate}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">
                                Created
                              </p>
                              <p className="mt-1 font-medium text-gray-900">
                                {format(
                                  new Date(order.createdAt),
                                  'MMM dd, yyyy'
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Address */}
                          <div className="mb-4">
                            <p className="text-xs text-gray-600">Address</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {order.completeAddress}
                            </p>
                          </div>

                          {/* Footer */}
                          <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center">
                            <div className="text-sm text-gray-600">
                              Last updated:{' '}
                              <span className="font-medium">
                                {format(
                                  new Date(order.updatedAt),
                                  'MMM dd, yyyy hh:mm a'
                                )}
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsModalOpen(true);
                              }}
                              className="w-full sm:w-auto"
                            >
                              Track Order
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            )
          )}
        </Tabs>
      </div>

      {/* Order Timeline Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setSelectedOrder(null);
            }
          }}
        />
      )}
    </div>
  );
}
