import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { Bell, Check, Checks } from '@phosphor-icons/react';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await API.get('/notifications');
            setNotifications(data.data || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (err) {
            console.error(err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await API.put(`/notifications/${id}/read`);
            setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await API.put('/notifications/read-all');
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleClick = (notif) => {
        if (!notif.read) markAsRead(notif._id);
        if (notif.link) {
            navigate(notif.link);
            setOpen(false);
        }
    };

    const formatTime = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div ref={wrapperRef} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-dark-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute top-full mt-2 right-0 glass z-50 w-80 max-h-96 overflow-hidden">
                    <div className="flex items-center justify-between p-3 border-b border-primary-100/50 bg-gradient-to-r from-primary-50/50 to-orange-50/50">
                        <h3 className="font-semibold text-dark-900 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                <Checks className="w-3.5 h-3.5" /> Mark all read
                            </button>
                        )}
                    </div>
                    <div className="overflow-y-auto max-h-72">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-dark-400 text-sm">No notifications</div>
                        ) : (
                            notifications.map((notif) => (
                                <button
                                    key={notif._id}
                                    onClick={() => handleClick(notif)}
                                    className={`w-full text-left px-4 py-3 border-b border-dark-50 last:border-0 hover:bg-accent-50 transition-colors ${!notif.read ? 'bg-primary-50/50' : ''}`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.read ? 'bg-accent-500' : 'bg-transparent'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-dark-800 leading-snug">{notif.message}</p>
                                            <p className="text-xs text-dark-400 mt-1">{formatTime(notif.createdAt)}</p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
