'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface IconWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  asChild?: boolean;
}

export const IconWrapper = forwardRef<HTMLDivElement, IconWrapperProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('inline-flex', className)}
        suppressHydrationWarning
        {...props}
      >
        {children}
      </div>
    );
  }
);

IconWrapper.displayName = 'IconWrapper';