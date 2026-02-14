import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../store";
import { webSocketService, Notification } from "../services/websocket";
import toast from "react-hot-toast";

export const useNotification = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const handleNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Toast UI
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-dark-800 shadow-lg rounded-xl pointer-events-auto flex border border-primary-500/30`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                {notification.type.includes("MECHANIC_ASSIGNED") ? (
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                ) : notification.type.includes("NEW_REQUEST") ? (
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <span className="text-2xl">🚗</span>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-2xl">🔔</span>
                  </div>
                )}
              </div>

              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-dark-300">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>

          <div className="flex border-l border-dark-700">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full p-4 flex items-center justify-center text-sm font-medium text-primary-500 hover:text-primary-400 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "top-right",
      }
    );
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.id && user?.role) {
      console.log("🔌 Connecting to WebSocket...", {
        userId: user.id,
        role: user.role,
      });

      const userType =
        user.role === "MECHANIC" ? "MECHANIC" : "CUSTOMER";

      webSocketService.connect(user.id, userType);

      const destination = `/queue/notifications/${userType.toLowerCase()}/${user.id}`;

      webSocketService.subscribe(destination, handleNotification);

      return () => {
        webSocketService.unsubscribe(destination, handleNotification);
        webSocketService.disconnect();
      };
    }
  }, [isAuthenticated, user?.id, user?.role, handleNotification]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
  };
};