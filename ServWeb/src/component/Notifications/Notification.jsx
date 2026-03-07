import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Bell, Info, CreditCard, MessageSquare, Briefcase } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
// Using ONLY your specified endpoints
import { markNotificationAsRead } from "../../api/AccountApi";
import "./Notification.css";

const Notification = ({ notifications, setNotifications }) => {
  
  const getIcon = (title) => {
    const t = (title || "").toLowerCase();
    if (t.includes('wallet') || t.includes('purchase') || t.includes('pay') || t.includes('points')) 
        return <CreditCard className="text-green-500" size={18} />;
    if (t.includes('message') || t.includes('chat')) 
        return <MessageSquare className="text-blue-500" size={18} />;
    if (t.includes('booking')) 
        return <Briefcase className="text-purple-500" size={18} />;
    return <Info className="text-gray-500" size={18} />;
  };

  const handleReadClick = async (id, isRead) => {
    if (isRead) return;
    try {
      // Calling: api.patch(`/Notification/markread/${id}`)
      await markNotificationAsRead(id); 
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Menu as="div" className="notification-menu-container">
      <Menu.Button className="notification-bell-btn">
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="unread-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1 scale-95"
        enterTo="opacity-100 translate-y-0 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0 scale-100"
        leaveTo="opacity-0 translate-y-1 scale-95"
      >
        <Menu.Items className="notification-dropdown">
          <div className="notification-header">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
          </div>

          <div className="notification-list-container custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Menu.Item key={n.id}>
                  {({ active }) => (
                    <div 
                      onClick={() => handleReadClick(n.id, n.isRead)}
                      className={`notification-item ${active ? 'active' : ''} ${!n.isRead ? 'unread' : ''}`}
                    >
                      <div className="icon-box">{getIcon(n.title)}</div>
                      
                      <div className="content-box">
                        <p className="notif-title">{n.title}</p>
                        <p className="notif-message">{n.message}</p>
                        <p className="notif-time">
                          {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : 'Just now'}
                        </p>
                      </div>

                      <div className="action-box">
                        {!n.isRead && <div className="unread-dot" />}
                      </div>
                    </div>
                  )}
                </Menu.Item>
              ))
            )}
          </div>

          <div className="notification-footer">
            <button className="view-all-btn">VIEW ALL HISTORY</button>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default Notification;