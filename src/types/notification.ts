/**
 * Notification Types
 */

export type NotificationType = 'status_update' | 'result_ready' | 'info' | 'warning' | 'error';

export interface Notification {
  id: string;
  orderId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  resultData?: {
    reportUrl?: string;
    summary?: string;
    geneticRisks?: string[];
  };
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}
