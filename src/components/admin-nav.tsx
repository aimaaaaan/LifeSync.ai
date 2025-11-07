'use client';

import { useAdmin } from '@/contexts/admin-context';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import Link from 'next/link';

export const AdminNav: React.FC = () => {
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return null;
  }

  return (
    <Button
      variant="outline"
      className="border-purple-600 text-purple-600 hover:bg-purple-50 flex items-center gap-2"
      asChild
    >
      <Link href="/admin">
        <Settings className="h-4 w-4" />
        Admin
      </Link>
    </Button>
  );
};

export default AdminNav;
