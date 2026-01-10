import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Bell, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('https://pediatricsbackend-4hii.onrender.com/api/notifications', {
                    headers: { 'x-auth-token': token }
                });
                setNotifications(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`https://pediatricsbackend-4hii.onrender.com/api/notifications/${id}/read`, {}, {
                headers: { 'x-auth-token': token }
            });
            // Update local state
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, read: true } : n
            ));
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-green" size={20} />;
            case 'warning': return <AlertTriangle className="text-orange" size={20} />;
            case 'error': return <XCircle className="text-red" size={20} />;
            default: return <Info className="text-blue" size={20} />;
        }
    };

    return (
        <div className="notifications-page">
            <div className="notifications-container">
                <div className="notifications-header">
                    <Link to="/dashboard" className="btn-back">
                        <ArrowLeft size={18} /> Back
                    </Link>
                    <h1>Notifications</h1>
                </div>

                <div className="notifications-list fade-in-up">
                    {loading ? (
                        <p>Loading...</p>
                    ) : notifications.length === 0 ? (
                        <div className="empty-state">
                            <Bell size={48} className="text-gray" />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div
                                key={notification._id}
                                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                onClick={() => !notification.read && markAsRead(notification._id)}
                            >
                                <div className="notification-icon">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="notification-content">
                                    <p className="notification-message">{notification.message}</p>
                                    <span className="notification-date">
                                        {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                                {!notification.read && <div className="unread-dot"></div>}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
