'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Notification, NotificationContextType } from '@/types/notification';
import { 
  saveNotificationToFirestore, 
  getUserNotifications, 
  markNotificationAsRead as markNotificationAsReadInFirestore,
  deleteNotificationFromFirestore 
} from '@/lib/firestore';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user] = useAuthState(auth);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  // Load notifications from Firestore when user logs in
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.uid) {
        setNotifications([]);
        setIsLoadingNotifications(false);
        return;
      }

      try {
        setIsLoadingNotifications(true);
        
        // Try to load from Firestore first
        const firestoreNotifications = await getUserNotifications(user.uid);
        
        if (firestoreNotifications.length > 0) {
          // Convert Firestore data to Notification objects
          const hydrated = firestoreNotifications.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }));
          setNotifications(hydrated);
          
          // Update localStorage cache with user-specific key
          localStorage.setItem(
            `notifications_${user.uid}`,
            JSON.stringify(firestoreNotifications)
          );
        } else {
          // If no Firestore notifications, try localStorage cache
          try {
            const stored = localStorage.getItem(`notifications_${user.uid}`);
            if (stored) {
              const parsed = JSON.parse(stored);
              const hydrated = parsed.map((n: any) => ({
                ...n,
                timestamp: new Date(n.timestamp),
              }));
              setNotifications(hydrated);
            } else {
              setNotifications([]);
            }
          } catch (error) {
            console.error('Failed to load notifications from localStorage:', error);
            setNotifications([]);
          }
        }
      } catch (error) {
        console.error('Failed to load notifications from Firestore:', error);
        
        // Fallback to localStorage
        try {
          const stored = localStorage.getItem(`notifications_${user.uid}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            const hydrated = parsed.map((n: any) => ({
              ...n,
              timestamp: new Date(n.timestamp),
            }));
            setNotifications(hydrated);
          }
        } catch (err) {
          console.error('Failed to load notifications from localStorage:', err);
        }
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    loadNotifications();
  }, [user?.uid]);

  // Save notifications to localStorage whenever they change (as cache)
  useEffect(() => {
    if (!user?.uid || notifications.length === 0) return;

    try {
      const toStore = notifications.map(n => ({
        ...n,
        timestamp: n.timestamp instanceof Date ? n.timestamp.toISOString() : n.timestamp,
      }));
      localStorage.setItem(`notifications_${user.uid}`, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to save notifications to localStorage:', error);
    }
  }, [notifications, user?.uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Save to Firestore if user is logged in
      if (user?.uid) {
        const toStore = {
          ...newNotification,
          timestamp: newNotification.timestamp.toISOString(),
        };
        saveNotificationToFirestore(user.uid, toStore);
      }

      // Auto-remove after 10 seconds for non-result notifications
      if (notification.type !== 'result_ready') {
        setTimeout(() => {
          removeNotification(newNotification.id);
        }, 10000);
      }
    },
    [user?.uid]
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    // Update in Firestore if user is logged in
    if (user?.uid) {
      markNotificationAsReadInFirestore(user.uid, id);
    }
  }, [user?.uid]);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // Update all in Firestore if user is logged in
    if (user?.uid) {
      notifications.forEach((notification) => {
        if (!notification.read) {
          markNotificationAsReadInFirestore(user.uid, notification.id);
        }
      });
    }
  }, [user?.uid, notifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
