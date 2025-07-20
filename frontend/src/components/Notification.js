import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
}

// Notification CSS (add to your global CSS)
// .notification {
//   position: fixed;
//   top: 32px;
//   right: 32px;
//   z-index: 9999;
//   background: #fff;
//   color: #222;
//   padding: 16px 28px;
//   border-radius: 10px;
//   box-shadow: 0 4px 24px #2d7be555;
//   font-size: 1.08rem;
//   font-weight: 600;
//   animation: fadeIn 0.3s;
// }
// .notification-success { border-left: 6px solid #27ae60; }
// .notification-error { border-left: 6px solid #e74c3c; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: none; } }
