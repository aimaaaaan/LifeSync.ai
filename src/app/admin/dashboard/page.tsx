'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/admin-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Package,
  CheckCircle2,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Edit2,
  Send,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { format } from 'date-fns';
import { getAdminOrders, getAdminStats } from '@/lib/firestore';
import OrderStatusUpdateModal from '@/components/admin/order-status-update-modal';

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
}

interface Order {
  orderId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  status: string;
  trackingStage?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isAdmin, adminUser, loading: adminLoading } = useAdmin();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, adminLoading, router]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set default stats on error
        setStats({
          totalUsers: 0,
          totalOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const data = await getAdminOrders(100, 0);
        console.log('Admin orders loaded:', data.length);
        setOrders(data || []);
        setFilteredOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
        setFilteredOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    if (isAdmin) {
      fetchOrders();
    }

    // Listen for order updates from admin actions
    const handleOrderUpdated = () => {
      console.log('Order updated event received, refreshing...');
      fetchOrders();
    };

    window.addEventListener('orderUpdated', handleOrderUpdated);

    return () => {
      window.removeEventListener('orderUpdated', handleOrderUpdated);
    };
  }, [isAdmin]);

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderId.toLowerCase().includes(term) ||
          order.userEmail?.toLowerCase().includes(term) ||
          order.userName?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Filter by tracking stage
    if (stageFilter !== 'all') {
      filtered = filtered.filter((order) => order.trackingStage === stageFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, stageFilter]);

  const handleUpdateOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsUpdateModalOpen(true);
  };

  const handlePublishResult = (order: Order) => {
    // Navigate to report generation page
    router.push(`/admin/report/${order.orderId}`);
  };

  const handleRefresh = async () => {
    try {
      const data = await getAdminOrders(100, 0);
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Error refreshing orders:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    router.push('/admin/login');
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {adminUser?.email}</p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push('/')}
            >
              Back to Home
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalOrders || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.completedOrders || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.pendingOrders || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Orders Management
              </CardTitle>
              <Button size="sm" onClick={handleRefresh} variant="outline">
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by Order ID, Email, or Name"
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="out_for_lab">Out for Lab</SelectItem>
                    <SelectItem value="kit_reached_lab">Kit Reached Lab</SelectItem>
                    <SelectItem value="testing_in_progress">Testing in Progress</SelectItem>
                    <SelectItem value="processing_result">Processing Result</SelectItem>
                    <SelectItem value="result_ready">Result Ready</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-gray-600">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            </div>

            {/* Table */}
            {ordersLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No orders found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>User Email</TableHead>
                      <TableHead>User Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tracking Stage</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.orderId}>
                        <TableCell className="font-medium font-mono text-sm">
                          {order.orderId.slice(-8)}
                        </TableCell>
                        <TableCell className="text-sm">{order.userEmail}</TableCell>
                        <TableCell className="text-sm">{order.userName}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              order.status === 'completed'
                                ? 'border-green-300 bg-green-50 text-green-700'
                                : order.status === 'cancelled'
                                  ? 'border-red-300 bg-red-50 text-red-700'
                                  : 'border-yellow-300 bg-yellow-50 text-yellow-700'
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {order.trackingStage || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => handleUpdateOrder(order)}
                            >
                              <Edit2 className="h-3 w-3" />
                              Update
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => handlePublishResult(order)}
                            >
                              <Send className="h-3 w-3" />
                              Publish
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      {selectedOrder && (
        <>
          <OrderStatusUpdateModal
            isOpen={isUpdateModalOpen}
            order={selectedOrder}
            onClose={() => {
              setIsUpdateModalOpen(false);
              setSelectedOrder(null);
              handleRefresh();
            }}
          />
        </>
      )}
    </div>
  );
}
