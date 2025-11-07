/**
 * Admin Management Types
 */

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'super_admin';
  createdAt: Date;
  permissions: string[];
}

export interface UserStats {
  totalUsers: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue?: number;
}

export interface OrderWithUser {
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  trackingStage?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    age?: string;
    gender?: string;
    [key: string]: any;
  };
}

export interface AdminAction {
  id: string;
  adminId: string;
  adminEmail: string;
  action: 'status_update' | 'result_publish' | 'user_verification' | 'order_cancellation';
  orderId?: string;
  userId?: string;
  description: string;
  timestamp: Date;
}
