'use client';

import React, { useEffect, useState } from 'react';
import { useNotification } from '@/contexts/notification-context';
import { Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const PopupNotification: React.FC = () => {
  const { notifications, removeNotification, markAsRead } = useNotification();
  const [visibleNotification, setVisibleNotification] = useState<string | null>(null);

  // Show result_ready notifications as popup
  useEffect(() => {
    const resultNotif = notifications.find((n) => n.type === 'result_ready' && !n.read);
    if (resultNotif && visibleNotification !== resultNotif.id) {
      setVisibleNotification(resultNotif.id);
    }
  }, [notifications, visibleNotification]);

  if (!visibleNotification) return null;

  const notification = notifications.find((n) => n.id === visibleNotification);
  if (!notification) return null;

  const handleClose = () => {
    removeNotification(notification.id);
    setVisibleNotification(null);
  };

  const handleViewResults = () => {
    markAsRead(notification.id);
  };

  return (
    <div className="fixed top-4 right-4 z-9999 max-w-sm w-full mx-4 animate-in slide-in-from-top-5 duration-300">
      <div className="bg-white rounded-lg shadow-2xl border border-green-200 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-green-50 to-emerald-50 border-b border-green-200 px-6 py-4 flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {notification.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="shrink-0 text-gray-400 hover:text-gray-600 ml-4"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        {notification.resultData && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-700 mb-4">
              Your DNA test results are ready! Click below to view your comprehensive genetic report.
            </p>
            <div className="space-y-2">
              {notification.resultData.geneticRisks && notification.resultData.geneticRisks.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Key Findings:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {notification.resultData.geneticRisks.slice(0, 3).map((risk, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex gap-3 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
          >
            Close
          </Button>
          <Link href={`/result/${notification.orderId}`} onClick={handleViewResults}>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-2">
              View Results
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PopupNotification;
