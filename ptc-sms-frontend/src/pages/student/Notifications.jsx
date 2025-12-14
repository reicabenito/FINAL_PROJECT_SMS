import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import '../../styles/StudentNotifications.css';

const iconMap = {
    info: CheckCircle,
    success: CheckCircle,
    warning: AlertCircle,
    error: AlertCircle
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error("Notification fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Mark all notifications as read
    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifications/mark-read');
            fetchNotifications();
        } catch (err) {
            console.error("Mark all read error:", err);
        }
    };

    // Mark a single notification as read when clicked
    const handleNotificationClick = async (id) => {
        try {
            await api.put(`/notifications/${id}/mark-read`); // create this endpoint if not exists
            fetchNotifications();
        } catch (err) {
            console.error("Mark single read error:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    if (loading) return <div>Loading notifications...</div>;

    return (
        <div className="notifications-page">
            <h1 className="notifications-title">My Notifications</h1>

            <div className="notifications-list">
                {notifications.map(n => {
                    // Use Clock for unread, CheckCircle for read, fallback to iconMap
                    const Icon = n.is_read ? CheckCircle : Clock;

                    return (
                        <div
                            key={n.id}
                            className={`notification-item ${n.is_read ? "read" : "unread"}`}
                            onClick={() => handleNotificationClick(n.id)}
                        >
                            <div className="notification-icon">
                                <Icon size={20} />
                            </div>

                            <div className="notification-content">
                                <p className="notification-message">{n.message}</p>
                                {n.details && (
                                    <p className="notification-details">{n.details}</p>
                                )}
                                <span className="notification-time">
                                    {new Date(n.created_at).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mark-read-container">
                <button onClick={handleMarkAllRead} className="mark-read-btn">
                    Mark All as Read
                </button>
            </div>
        </div>
    );
};

export default Notifications;
