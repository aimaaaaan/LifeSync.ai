/**
 * Firebase Firestore Service Layer
 * Handles all Firestore operations for orders
 * 
 * Database Structure:
 * Firestore
 * └── users/
 *     ├── {userId}/
 *     │   ├── email: string
 *     │   ├── displayName: string
 *     │   ├── createdAt: timestamp
 *     │   └── orders/ (subcollection)
 *     │       ├── {orderId}/
 *     │       │   ├── order data...
 *     │       │   └── timestamps
 *     │       └── {orderId}/
 *     │           └── order data...
 *     └── {userId}/
 *         └── orders/ (subcollection)
 */

import {
  initializeApp,
  getApps,
  FirebaseApp,
} from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  Query,
  QueryConstraint,
  Timestamp,
  writeBatch,
  setDoc,
  collectionGroup,
  arrayUnion,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Order, OrderFormData, OrderSubmissionResponse, TrackingStage, TrackingStageDetail } from '@/types/order';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuBu4XiyFzlvdWsFTfaB-Jbt-AIHqP0Os",
  authDomain: "lifesync-4d5da.firebaseapp.com",
  projectId: "lifesync-4d5da",
  storageBucket: "lifesync-4d5da.firebasestorage.app",
  messagingSenderId: "855268479053",
  appId: "1:855268479053:web:03bb38d3cf69ca387d0c04",
  measurementId: "G-ZK07PCTZ2Z"
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/**
 * Initialize Firebase app and Firestore
 */
export const initializeFirebaseApp = () => {
  if (db) {
    return db;
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);
  return db;
};

/**
 * Get Firestore instance
 */
export const getFirestoreDb = (): Firestore => {
  if (!db) {
    return initializeFirebaseApp();
  }
  return db;
};

/**
 * Create or update user profile document
 * @param userId - User ID from Firebase Auth
 * @param userEmail - User email
 * @param userName - User display name
 */
export const createUserProfile = async (
  userId: string,
  userEmail: string,
  userName: string
): Promise<boolean> => {
  try {
    const db = getFirestoreDb();
    const userRef = doc(db, 'users', userId);
    
    // Get existing user doc to check if exists
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Create new user document only if it doesn't exist
      await setDoc(userRef, {
        email: userEmail,
        displayName: userName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
};

/**
 * Initialize tracking history for a new order
 * @returns Initial tracking history
 */
export const initializeTrackingHistory = (): TrackingStageDetail[] => {
  const now = new Date().toISOString();
  return [
    {
      stage: 'pending',
      label: 'Order Placed',
      description: 'Your DNA test kit order has been received',
      completedAt: now,
    },
  ];
};

/**
 * Get tracking stage configuration
 */
export const getTrackingStageConfig = (stage: TrackingStage) => {
  const stageConfig: Record<TrackingStage, { label: string; description: string }> = {
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

  return stageConfig[stage] || { label: 'Unknown', description: 'Unknown stage' };
};

/**
 * Save order to user's orders subcollection
 * @param userId - User ID from Firebase Auth
 * @param userEmail - User email from Firebase Auth
 * @param userName - User display name
 * @param orderData - Complete order form data
 * @returns Order submission response with order ID
 */
export const saveOrderToFirestore = async (
  userId: string,
  userEmail: string,
  userName: string,
  orderData: OrderFormData
): Promise<OrderSubmissionResponse> => {
  try {
    const db = getFirestoreDb();
    const now = new Date().toISOString();

    // First, ensure user profile exists
    await createUserProfile(userId, userEmail, userName);

    // Create order document with metadata and tracking
    const orderDocument = {
      ...orderData,
      // Metadata
      userId,
      userEmail,
      userName,
      createdAt: now,
      updatedAt: now,
      status: 'pending' as const,
      trackingStage: 'pending' as TrackingStage,
      trackingHistory: initializeTrackingHistory(),
      notes: '',
    };

    // Add to user's orders subcollection
    const userOrdersRef = collection(db, 'users', userId, 'orders');
    const docRef = await addDoc(userOrdersRef, orderDocument);

    return {
      success: true,
      orderId: docRef.id,
      message: 'Order saved successfully',
      timestamp: now,
    };
  } catch (error) {
    console.error('Error saving order to Firestore:', error);
    return {
      success: false,
      message: 'Failed to save order',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get order by ID from user's orders
 * @param userId - User ID
 * @param orderId - Firestore order document ID
 * @returns Order document or null
 */
export const getOrderById = async (
  userId: string,
  orderId: string
): Promise<Order | null> => {
  try {
    const db = getFirestoreDb();
    const orderRef = doc(db, 'users', userId, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists()) {
      return {
        orderId: orderSnap.id,
        ...orderSnap.data(),
      } as Order;
    }

    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

/**
 * Get all orders for a user from their orders subcollection
 * @param userId - User ID from Firebase Auth
 * @param orderLimit - Number of orders to fetch (default: 50)
 * @returns Array of orders
 */
export const getUserOrders = async (
  userId: string,
  orderLimit: number = 50
): Promise<Order[]> => {
  try {
    const db = getFirestoreDb();
    const userOrdersRef = collection(db, 'users', userId, 'orders');

    // Try with orderBy first (requires index)
    try {
      const q = query(
        userOrdersRef,
        orderBy('createdAt', 'desc'),
        limit(orderLimit)
      );

      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];

      querySnapshot.forEach((doc) => {
        orders.push({
          orderId: doc.id,
          ...doc.data(),
        } as Order);
      });

      return orders;
    } catch (indexError: any) {
      // If index error, fall back to simple query without ordering
      console.warn('Index not available, fetching without order:', indexError);
      
      const q = query(userOrdersRef, limit(orderLimit));
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];

      querySnapshot.forEach((doc) => {
        orders.push({
          orderId: doc.id,
          ...doc.data(),
        } as Order);
      });

      // Sort by createdAt in memory
      return orders.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    }
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
};

/**
 * Get orders by status for a user
 * @param userId - User ID
 * @param status - Order status
 * @param orderLimit - Number of orders to fetch (default: 50)
 * @returns Array of orders
 */
export const getUserOrdersByStatus = async (
  userId: string,
  status: string,
  orderLimit: number = 50
): Promise<Order[]> => {
  try {
    const db = getFirestoreDb();
    const userOrdersRef = collection(db, 'users', userId, 'orders');

    const q = query(
      userOrdersRef,
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      limit(orderLimit)
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        orderId: doc.id,
        ...doc.data(),
      } as Order);
    });

    return orders;
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    return [];
  }
};

/**
 * Update order status (user's order)
 * @param userId - User ID
 * @param orderId - Order document ID
 * @param status - New status
 * @param notes - Optional notes
 * @returns Success flag
 */
export const updateOrderStatus = async (
  userId: string,
  orderId: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  notes?: string
): Promise<boolean> => {
  try {
    const db = getFirestoreDb();
    const orderRef = doc(db, 'users', userId, 'orders', orderId);

    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    await updateDoc(orderRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

/**
 * Update order tracking stage
 * @param userId - User ID
 * @param orderId - Order document ID
 * @param stage - New tracking stage
 * @param notes - Optional notes
 * @returns Success flag
 */
export const updateOrderTrackingStage = async (
  userId: string,
  orderId: string,
  stage: TrackingStage,
  notes?: string
): Promise<boolean> => {
  try {
    const db = getFirestoreDb();
    const orderRef = doc(db, 'users', userId, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      console.error('Order not found');
      return false;
    }

    const orderData = orderSnap.data() as Order;
    const now = new Date().toISOString();
    const stageConfig = getTrackingStageConfig(stage);

    // Add new stage to history
    const newHistoryEntry: TrackingStageDetail = {
      stage,
      label: stageConfig.label,
      description: stageConfig.description,
      completedAt: now,
    };

    const updatedHistory = [...(orderData.trackingHistory || []), newHistoryEntry];

    // Determine overall order status based on tracking stage
    let overallStatus = orderData.status;
    if (stage === 'result_ready') {
      overallStatus = 'completed';
    } else if (stage !== 'cancelled' && overallStatus === 'pending') {
      overallStatus = 'confirmed';
    }

    const updateData: any = {
      trackingStage: stage,
      trackingHistory: updatedHistory,
      status: overallStatus,
      updatedAt: now,
    };

    if (notes) {
      updateData.notes = notes;
    }

    await updateDoc(orderRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating order tracking stage:', error);
    return false;
  }
};

/**
 * Delete order (user or admin)
 * @param userId - User ID
 * @param orderId - Order document ID
 * @returns Success flag
 */
export const deleteOrder = async (
  userId: string,
  orderId: string
): Promise<boolean> => {
  try {
    const db = getFirestoreDb();
    const orderRef = doc(db, 'users', userId, 'orders', orderId);
    await deleteDoc(orderRef);
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    return false;
  }
};

/**
 * Get orders count by status for a user
 * @param userId - User ID
 * @returns Object with counts for each status
 */
export const getUserOrdersCounts = async (userId: string): Promise<{
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}> => {
  try {
    const db = getFirestoreDb();
    const userOrdersRef = collection(db, 'users', userId, 'orders');

    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
    const counts = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const status of statuses) {
      const q = query(
        userOrdersRef,
        where('status', '==', status)
      );
      const querySnapshot = await getDocs(q);
      counts[status] = querySnapshot.size;
    }

    return counts;
  } catch (error) {
    console.error('Error getting user orders counts:', error);
    return {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
  }
};

/**
 * Export order data as JSON
 * @param userId - User ID
 * @param orderId - Order document ID
 * @returns JSON string or null
 */
export const exportOrderAsJson = async (
  userId: string,
  orderId: string
): Promise<string | null> => {
  try {
    const order = await getOrderById(userId, orderId);
    if (!order) return null;
    return JSON.stringify(order, null, 2);
  } catch (error) {
    console.error('Error exporting order:', error);
    return null;
  }
};

/**
 * Backup all user orders
 * @param userId - User ID
 * @returns JSON string of all user orders
 */
export const backupUserOrders = async (userId: string): Promise<string> => {
  try {
    const orders = await getUserOrders(userId, 1000);
    return JSON.stringify({
      userId,
      backupDate: new Date().toISOString(),
      totalOrders: orders.length,
      orders,
    }, null, 2);
  } catch (error) {
    console.error('Error backing up orders:', error);
    return '';
  }
};

/**
 * Get user profile
 * @param userId - User ID
 * @returns User profile or null
 */
export const getUserProfile = async (userId: string): Promise<any | null> => {
  try {
    const db = getFirestoreDb();
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return {
        userId,
        ...userSnap.data(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Get all users (admin function - use with caution)
 * @param userLimit - Number of users to fetch (default: 100)
 * @returns Array of user profiles
 */
export const getAllUsers = async (userLimit: number = 100): Promise<any[]> => {
  try {
    const db = getFirestoreDb();
    const usersRef = collection(db, 'users');

    const q = query(
      usersRef,
      orderBy('createdAt', 'desc'),
      limit(userLimit)
    );

    const querySnapshot = await getDocs(q);
    const users: any[] = [];

    querySnapshot.forEach((doc) => {
      users.push({
        userId: doc.id,
        ...doc.data(),
      });
    });

    return users;
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

/**
 * Get user's total orders count
 * @param userId - User ID
 * @returns Total number of orders
 */
export const getUserOrdersCount = async (userId: string): Promise<number> => {
  try {
    const db = getFirestoreDb();
    const userOrdersRef = collection(db, 'users', userId, 'orders');
    const querySnapshot = await getDocs(userOrdersRef);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting user orders count:', error);
    return 0;
  }
};

/**
 * ADMIN FUNCTIONS - Use with caution and proper authorization
 */

/**
 * Get all orders across all users (admin function)
 * @param orderLimit - Number of orders to fetch
 * @returns Array of all orders with user info
 */
export const getAllOrders = async (orderLimit: number = 100): Promise<any[]> => {
  try {
    const db = getFirestoreDb();
    const ordersRef = collectionGroup(db, 'orders');

    // Fetch without orderBy to avoid index requirement
    const q = query(
      ordersRef,
      limit(orderLimit)
    );

    const querySnapshot = await getDocs(q);
    const orders: any[] = [];

    querySnapshot.forEach((doc) => {
      const pathParts = doc.ref.path.split('/');
      const userId = pathParts[1];

      orders.push({
        orderId: doc.id,
        userId: userId,
        createdAt: doc.data().createdAt || new Date().toISOString(),
        ...doc.data(),
      });
    });

    // Sort in memory (descending by createdAt)
    orders.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return orders;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
};

/**
 * Get all orders for admin dashboard with pagination
 * @param pageSize - Number of orders per page
 * @param offset - Number of orders to skip
 * @returns Array of orders
 */
export const getAdminOrders = async (pageSize: number = 50, offset: number = 0): Promise<any[]> => {
  try {
    const db = getFirestoreDb();
    const ordersRef = collectionGroup(db, 'orders');

    // Fetch without orderBy to avoid index requirement
    const q = query(
      ordersRef,
      // Fetch more to account for sorting after pagination
      limit(pageSize + offset + 100)
    );

    const querySnapshot = await getDocs(q);
    const orders: any[] = [];

    querySnapshot.forEach((doc) => {
      const pathParts = doc.ref.path.split('/');
      const userId = pathParts[1];

      orders.push({
        orderId: doc.id,
        userId: userId,
        createdAt: doc.data().createdAt || new Date().toISOString(),
        ...doc.data(),
      });
    });

    // Sort in memory (descending by createdAt)
    orders.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return orders.slice(offset, offset + pageSize);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return [];
  }
};

/**
 * Update order tracking stage as admin
 * @param userId - User ID
 * @param orderId - Order ID
 * @param newStage - New tracking stage
 * @param adminEmail - Admin's email for logging
 */
export const adminUpdateOrderStage = async (
  userId: string,
  orderId: string,
  newStage: TrackingStage,
  adminEmail: string
): Promise<void> => {
  try {
    const db = getFirestoreDb();
    const orderRef = doc(db, 'users', userId, 'orders', orderId);

    const stageDetail: TrackingStageDetail = {
      stage: newStage,
      label: getTrackingStageLabel(newStage),
      description: getTrackingStageDescription(newStage),
      completedAt: new Date().toISOString(),
    };

    await updateDoc(orderRef, {
      trackingStage: newStage,
      trackingHistory: arrayUnion(stageDetail),
      status: mapStageToStatus(newStage),
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: adminEmail,
    });

    // Log admin action
    await logAdminAction(userId, orderId, 'status_update', `Updated to: ${newStage}`, adminEmail);
  } catch (error) {
    console.error('Error updating order stage as admin:', error);
    throw error;
  }
};

/**
 * Publish results for an order (move to result_ready stage)
 * @param userId - User ID
 * @param orderId - Order ID
 * @param resultData - Result data to store
 * @param adminEmail - Admin's email
 */
export const adminPublishResults = async (
  userId: string,
  orderId: string,
  resultData: any,
  adminEmail: string
): Promise<void> => {
  try {
    const db = getFirestoreDb();
    const orderRef = doc(db, 'users', userId, 'orders', orderId);

    const stageDetail: TrackingStageDetail = {
      stage: 'result_ready',
      label: 'Result Ready',
      description: 'Your DNA test results are ready for review',
      completedAt: new Date().toISOString(),
    };

    await updateDoc(orderRef, {
      trackingStage: 'result_ready',
      trackingHistory: arrayUnion(stageDetail),
      status: 'completed',
      resultData: resultData || {},
      resultPublishedAt: new Date().toISOString(),
      resultPublishedBy: adminEmail,
      updatedAt: new Date().toISOString(),
    });

    // Log admin action
    await logAdminAction(userId, orderId, 'result_publish', 'Published results', adminEmail);
  } catch (error) {
    console.error('Error publishing results:', error);
    throw error;
  }
};

/**
 * Get dashboard statistics
 */
export const getAdminStats = async (): Promise<{
  totalUsers: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
}> => {
  try {
    const db = getFirestoreDb();

    // Get total users
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    const totalUsers = usersSnapshot.size;

    // Get total orders
    const ordersRef = collectionGroup(db, 'orders');
    const ordersSnapshot = await getDocs(ordersRef);
    const totalOrders = ordersSnapshot.size;

    let completedOrders = 0;
    let pendingOrders = 0;

    ordersSnapshot.forEach((doc) => {
      const status = doc.data().status;
      if (status === 'completed' || status === 'result_ready') {
        completedOrders++;
      } else if (status === 'pending' || status === 'confirmed') {
        pendingOrders++;
      }
    });

    return {
      totalUsers,
      totalOrders,
      completedOrders,
      pendingOrders,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalUsers: 0,
      totalOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
    };
  }
};

/**
 * Log admin actions for audit trail
 */
const logAdminAction = async (
  userId: string,
  orderId: string,
  action: string,
  description: string,
  adminEmail: string
): Promise<void> => {
  try {
    const db = getFirestoreDb();
    const logsRef = collection(db, 'admin_logs');

    await addDoc(logsRef, {
      userId,
      orderId,
      action,
      description,
      adminEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

/**
 * Helper: Map tracking stage to order status
 */
const mapStageToStatus = (stage: TrackingStage): string => {
  if (stage === 'cancelled') return 'cancelled';
  if (stage === 'result_ready') return 'completed';
  if (stage === 'pending') return 'pending';
  return 'confirmed';
};

/**
 * Helper: Get stage label
 */
const getTrackingStageLabel = (stage: TrackingStage): string => {
  const labels: Record<TrackingStage, string> = {
    pending: 'Order Placed',
    out_for_lab: 'Out for Lab',
    kit_reached_lab: 'Kit Reached Lab',
    testing_in_progress: 'Testing in Progress',
    processing_result: 'Processing Result',
    result_ready: 'Result Ready',
    cancelled: 'Cancelled',
  };
  return labels[stage] || stage;
};

/**
 * Helper: Get stage description
 */
const getTrackingStageDescription = (stage: TrackingStage): string => {
  const descriptions: Record<TrackingStage, string> = {
    pending: 'Your order has been placed',
    out_for_lab: 'Your kit is on its way to the lab',
    kit_reached_lab: 'Your kit has arrived at the testing facility',
    testing_in_progress: 'DNA analysis is in progress',
    processing_result: 'Your results are being processed',
    result_ready: 'Your results are ready for review',
    cancelled: 'Order has been cancelled',
  };
  return descriptions[stage] || '';
};

// Import arrayUnion for array operations at the top of the file (already imported in the main imports)

/**
 * NOTIFICATION STORAGE FUNCTIONS
 * Store and retrieve user notifications from Firestore
 */

/**
 * Save a notification to Firestore for a specific user
 * @param userId - User ID
 * @param notification - Notification object
 */
export const saveNotificationToFirestore = async (
  userId: string,
  notification: {
    id: string;
    orderId: string;
    type: string;
    title: string;
    message: string;
    timestamp: string; // ISO string
    read: boolean;
    resultData?: any;
  }
): Promise<void> => {
  try {
    const db = getFirestoreDb();
    const notificationsRef = doc(db, 'users', userId, 'notifications', notification.id);

    await setDoc(notificationsRef, {
      ...notification,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving notification to Firestore:', error);
    // Don't throw - notifications should not block order operations
  }
};

/**
 * Get all notifications for a user from Firestore
 * @param userId - User ID
 * @returns Array of notifications
 */
export const getUserNotifications = async (userId: string): Promise<any[]> => {
  try {
    const db = getFirestoreDb();
    const notificationsRef = collection(db, 'users', userId, 'notifications');

    // Query ordered by timestamp, newest first
    const q = query(notificationsRef, orderBy('timestamp', 'desc'), limit(100));

    const querySnapshot = await getDocs(q);
    const notifications: any[] = [];

    querySnapshot.forEach((doc) => {
      notifications.push({
        ...doc.data(),
        id: doc.id,
      });
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications from Firestore:', error);
    return [];
  }
};

/**
 * Mark a notification as read in Firestore
 * @param userId - User ID
 * @param notificationId - Notification ID
 */
export const markNotificationAsRead = async (userId: string, notificationId: string): Promise<void> => {
  try {
    const db = getFirestoreDb();
    const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);

    await updateDoc(notificationRef, {
      read: true,
      readAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

/**
 * Mark all notifications as read for a user
 * @param userId - User ID
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const db = getFirestoreDb();
    const notificationsRef = collection(db, 'users', userId, 'notifications');

    const q = query(notificationsRef, where('read', '==', false));
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        readAt: new Date().toISOString(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

/**
 * Delete a notification from Firestore
 * @param userId - User ID
 * @param notificationId - Notification ID
 */
export const deleteNotificationFromFirestore = async (userId: string, notificationId: string): Promise<void> => {
  try {
    const db = getFirestoreDb();
    const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);

    await deleteDoc(notificationRef);
  } catch (error) {
    console.error('Error deleting notification from Firestore:', error);
  }
};

/**
 * Clear all notifications for a user
 * @param userId - User ID
 */
export const clearAllNotificationsForUser = async (userId: string): Promise<void> => {
  try {
    const db = getFirestoreDb();
    const notificationsRef = collection(db, 'users', userId, 'notifications');

    const querySnapshot = await getDocs(notificationsRef);

    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error clearing notifications from Firestore:', error);
  }
};

/**
 * REPORT STORAGE FUNCTIONS
 * Store and retrieve health/DNA analysis reports from Firestore
 */

/**
 * Save a generated report to Firestore
 * @param userId - User ID
 * @param report - Report object
 */
export const saveReportToFirestore = async (userId: string, report: any): Promise<string> => {
  try {
    const db = getFirestoreDb();
    const reportId = report.reportId || `report-${Date.now()}`;
    const reportsRef = doc(db, 'users', userId, 'reports', reportId);

    const reportDoc = {
      ...report,
      savedAt: new Date().toISOString(),
    };

    await setDoc(reportsRef, reportDoc);
    return reportId;
  } catch (error) {
    console.error('Error saving report to Firestore:', error);
    throw error;
  }
};

/**
 * Get a specific report for a user
 * @param userId - User ID
 * @param reportId - Report ID
 */
export const getReportById = async (userId: string, reportId: string): Promise<any | null> => {
  try {
    const db = getFirestoreDb();
    const reportRef = doc(db, 'users', userId, 'reports', reportId);
    const reportSnap = await getDoc(reportRef);

    if (reportSnap.exists()) {
      return {
        ...reportSnap.data(),
        id: reportSnap.id,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching report:', error);
    return null;
  }
};

/**
 * Get all reports for a user
 * @param userId - User ID
 */
export const getUserReports = async (userId: string): Promise<any[]> => {
  try {
    const db = getFirestoreDb();
    const reportsRef = collection(db, 'users', userId, 'reports');

    const q = query(reportsRef, orderBy('generatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const reports: any[] = [];

    querySnapshot.forEach((doc) => {
      reports.push({
        ...doc.data(),
        id: doc.id,
      });
    });

    return reports;
  } catch (error) {
    console.error('Error fetching user reports:', error);
    return [];
  }
};

/**
 * Get report by order ID (finds the report associated with an order)
 * @param userId - User ID
 * @param orderId - Order ID
 */
export const getReportByOrderId = async (userId: string, orderId: string): Promise<any | null> => {
  try {
    const db = getFirestoreDb();
    const reportsRef = collection(db, 'users', userId, 'reports');

    const q = query(reportsRef, where('orderId', '==', orderId), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size > 0) {
      const doc = querySnapshot.docs[0];
      return {
        ...doc.data(),
        id: doc.id,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching report by order ID:', error);
    return null;
  }
};

/**
 * Update report status (e.g., from generating to completed)
 * @param userId - User ID
 * @param reportId - Report ID
 * @param status - New status
 */
export const updateReportStatus = async (
  userId: string,
  reportId: string,
  status: 'generating' | 'completed' | 'failed',
  errorMessage?: string
): Promise<void> => {
  try {
    const db = getFirestoreDb();
    const reportRef = doc(db, 'users', userId, 'reports', reportId);

    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (errorMessage) {
      updateData.error = errorMessage;
    }

    await updateDoc(reportRef, updateData);
  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
};

/**
 * Delete a report
 * @param userId - User ID
 * @param reportId - Report ID
 */
export const deleteReport = async (userId: string, reportId: string): Promise<void> => {
  try {
    const db = getFirestoreDb();
    const reportRef = doc(db, 'users', userId, 'reports', reportId);
    await deleteDoc(reportRef);
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

