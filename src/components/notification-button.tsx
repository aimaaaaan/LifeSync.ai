'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '@/contexts/notification-context';
import { Bell, Check, Trash2, Package, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'status_update':
      return <Package className="h-4 w-4 text-blue-500" />;
    case 'result_ready':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'status_update':
      return 'bg-blue-50 border-blue-200';
    case 'result_ready':
      return 'bg-green-50 border-green-200';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200';
    case 'error':
      return 'bg-red-50 border-red-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export const NotificationButton: React.FC = () => {
  const { notifications, unreadCount, markAsRead, removeNotification, markAllAsRead, clearNotifications } =
    useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleRemoveNotification = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    removeNotification(notificationId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            variant="destructive"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <Card className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto shadow-lg z-50 border border-gray-200">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-red-600 hover:text-red-700"
                  onClick={clearNotifications}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    notif.read ? 'bg-white' : 'bg-blue-50'
                  } hover:bg-gray-50`}
                  onClick={() => handleNotificationClick(notif.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="mt-1 shrink-0">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <Badge className="ml-2 h-2 w-2 p-0 bg-blue-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(notif.timestamp, 'MMM dd, HH:mm')}
                      </p>

                      {/* Result Ready Special Action */}
                      {notif.type === 'result_ready' && notif.resultData && (
                        <Link
                          href={`/result/${notif.orderId}`}
                          className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                        >
                          View Results →
                        </Link>
                      )}
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={(e) => handleRemoveNotification(e, notif.id)}
                    >
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-3 text-center">
              <Link
                href="/order-tracking"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View All Orders →
              </Link>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default NotificationButton;
