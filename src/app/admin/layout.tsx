'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    // Check if admin is authenticated
    const adminSession = localStorage.getItem('adminSession');
    
    if (!adminSession) {
      // Not authenticated, redirect to login
      router.push('/admin/login');
      return;
    }

    try {
      const session = JSON.parse(adminSession);
      if (!session.authenticated) {
        router.push('/admin/login');
      }
    } catch (err) {
      router.push('/admin/login');
    }
  }, [router]);

  return <>{children}</>;
}
