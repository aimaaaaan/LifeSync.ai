'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminSession = localStorage.getItem('adminSession');
    
    if (!adminSession) {
      // Not logged in, redirect to login
      router.push('/admin/login');
    } else {
      // Logged in, redirect to dashboard
      router.push('/admin/dashboard');
    }
  }, [router]);

  return null;
}
