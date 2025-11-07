'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { AdminUser } from '@/types/admin';

interface AdminContextType {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  loading: boolean;
  error: string | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Hardcoded admin UIDs - in production, use Firestore or custom claims
// For development: Set ADMIN_UIDS to empty array [] to allow ALL authenticated users as admin
// For production: Add specific admin UIDs to this array
const ADMIN_UIDS: string[] = []; // Empty = allow all authenticated users (development mode)

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useAuthState(auth);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (!user) {
          setAdminUser(null);
          setLoading(false);
          return;
        }

        // Check if user is admin
        // In development, allow any authenticated user
        const isAdminUser = ADMIN_UIDS.length === 0 || ADMIN_UIDS.includes(user.uid);
        
        if (isAdminUser) {
          setAdminUser({
            uid: user.uid,
            email: user.email || '',
            role: 'super_admin',
            createdAt: new Date(),
            permissions: ['view_users', 'view_orders', 'update_orders', 'publish_results', 'view_analytics'],
          });
        } else {
          setAdminUser(null);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check admin status');
        setAdminUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const value: AdminContextType = {
    isAdmin: adminUser !== null,
    adminUser,
    loading,
    error,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
