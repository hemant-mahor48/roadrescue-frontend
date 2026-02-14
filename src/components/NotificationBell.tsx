import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const { notifications, unreadCount, markAllAsRead, deleteNotification } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    if (type.includes('MECHANIC_ASSIGNED') || type.includes('REQUEST_ACCEPTED')) {
      return '✅';
    }
    if (type.includes('NEW_REQUEST')) {
      return '🚗';
    }
    if (type.includes('SEARCHING')) {
      return '🔍';
    }
    if (type.includes('COMPLETED')) {
      return '🎉';
    }
    return '🔔';
  };

  const getNotificationColor = (type: string) => {
    if (type.includes('MECHANIC_ASSIGNED') || type.includes('REQUEST_ACCEPTED')) {
      return 'bg-green-500/10 border-green-500/30';
    }
    if (type.includes('NEW_REQUEST')) {
      return 'bg-primary-500/10 border-primary-500/30';
    }
    if (type.includes('SEARCHING')) {
      return 'bg-blue-500/10 border-blue-500/30';
    }
    return 'bg-dark-700/50 border-dark-600';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-dark-800 transition-colors"
      >
        <Bell className="w-6 h-6 text-dark-300 hover:text-white transition-colors" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-96 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl z-[9999] fixed md:absolute"
            style={{
              top: 'auto',
              bottom: 'auto',
              right: 'auto',
              left: 'auto',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-700">
              <h3 className="text-lg font-bold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-500 hover:text-primary-400 transition-colors flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-dark-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-dark-700">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-4 hover:bg-dark-700/50 transition-colors group ${
                        !notification.read ? 'bg-dark-700/30' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                          <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-white truncate">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-sm text-dark-300 mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-dark-500">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </p>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="flex-shrink-0 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-500 hover:text-red-400 transition-all"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;