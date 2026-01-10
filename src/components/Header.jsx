import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, User, LogOut, LogIn, Calendar, Bell, X, Hospital } from 'lucide-react';
import { io } from 'socket.io-client';
import './Header.css';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);
    const userMenuRef = useRef(null);

    // Fetch Notifications
    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://pediatricsbackend.onrender.com/api/notifications', {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length); // Assuming 'read' property exists
            }
        } catch (err) {
            console.error('Failed to fetch notifications in Header');
        }
    };

    // Mark as Read
    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`https://pediatricsbackend.onrender.com/api/notifications/${id}`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            // Update local state
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark read');
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();

            const socket = io('https://pediatricsbackend.onrender.com');
            socket.on(`notification:${user.id}`, (newNotif) => {
                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            // Close dropdown if clicked outside
            const handleClickOutside = (event) => {
                if (notifRef.current && !notifRef.current.contains(event.target)) {
                    setShowNotifDropdown(false);
                }
                if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                    setShowUserDropdown(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                socket.disconnect();
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleNotifications = () => {
        setShowNotifDropdown(!showNotifDropdown);
    };

    return (
        <header className="header">
            <div className="container header-content">
                <div className="brand-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                        <div className="logo-icon">
                            <Stethoscope size={24} color="white" />
                        </div>
                        <div className="brand-text">
                            <h1>Dr. Sai Manohar</h1>
                            <p>
                                Pediatrician Clinic
                                {user && user.role === 'admin' && <span className="admin-badge-header">Doctor Panel</span>}
                            </p>
                        </div>
                    </Link>
                    <Link to="/" className="home-icon-link" aria-label="Go to Home">
                        <Hospital size={22} className="text-primary" style={{ color: 'var(--primary-color)' }} />
                    </Link>
                </div>

                <nav className="nav-menu">
                    {user ? (
                        <>
                            {/* NOTIFICATION BELL */}
                            <div className="notif-container" ref={notifRef}>
                                <button className="btn-icon-header" onClick={toggleNotifications}>
                                    <Bell size={20} />
                                    {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                                </button>

                                {showNotifDropdown && (
                                    <div className="notif-dropdown">
                                        <div className="notif-header">
                                            <h4>Notifications</h4>
                                            <button onClick={() => setShowNotifDropdown(false)} className="btn-close-notif">
                                                <X size={14} />
                                            </button>
                                        </div>
                                        <div className="notif-body">
                                            {notifications.length === 0 ? (
                                                <p className="no-notif-msg">No new notifications</p>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div key={notif._id} className={`notif-item ${notif.read ? 'read' : 'unread'}`} onClick={() => !notif.read && markAsRead(notif._id)}>
                                                        <div className="notif-content-small">
                                                            <strong>{notif.title}</strong>
                                                            <p>{notif.message}</p>
                                                            <span className="notif-time-small">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        {!notif.read && <div className="unread-dot"></div>}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <Link to="/notifications" className="view-all-link" onClick={() => setShowNotifDropdown(false)}>
                                            View All Messages
                                        </Link>
                                    </div>
                                )}
                            </div>


                            
                            {user.role !== 'admin' && (
                                <Link to="/dashboard" className="btn btn-outline btn-sm btn-box mobile-booking-btn">
                                    <Calendar size={16} />
                                    <span className="mobile-hidden">Booking</span>
                                </Link>
                            )}

                            {/* Desktop: Welcome Text & Logout */}
                            <div className="desktop-user-actions mobile-hidden">
                                <Link to="/profile" className="user-welcome" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <User size={18} className="icon-mr" />
                                    <span>{user.name}</span>
                                </Link>
                                <button onClick={handleLogout} className="btn btn-outline btn-sm btn-box">
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>

                            {/* Mobile: User Dropdown */}
                            <div className="user-menu-container desktop-hidden" ref={userMenuRef}>
                                <button className="btn-icon-header user-menu-btn" onClick={() => setShowUserDropdown(!showUserDropdown)}>
                                    <div className="user-avatar-small">
                                        <User size={18} />
                                    </div>
                                </button>

                                {showUserDropdown && (
                                    <div className="user-dropdown-menu">
                                        <Link to="/profile" className="dropdown-item" onClick={() => setShowUserDropdown(false)}>
                                            <User size={16} />
                                            <span>Profile</span>
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button onClick={handleLogout} className="dropdown-item text-danger">
                                            <LogOut size={16} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline btn-sm btn-box">
                                <LogIn size={18} />
                                Login
                            </Link>
                            <Link to="/#book-appointment" className="btn btn-primary mobile-hidden">
                                <Calendar size={18} />
                                Book Now
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header >
    );
};

export default Header;
