import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, User, XCircle, ArrowLeft, Activity, Syringe, Ruler, Weight, Bell, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import HealthCard from '../components/HealthCard';
import VaccinationTracker from '../components/VaccinationTracker';
import './Dashboard.css';

// Mock Data Removed

const Dashboard = () => {
    const { user, loading, updateUser } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChildIndex, setSelectedChildIndex] = useState(0);
    const navigate = useNavigate();

    // Reminder State
    const [remindedApps, setRemindedApps] = useState(new Set());
    const [activeAlert, setActiveAlert] = useState(null);

    const children = user?.children || [];
    const selectedChild = children[selectedChildIndex];

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        } else if (user) {
            fetchAppointments();
        }

        const interval = setInterval(checkReminders, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [user, loading, navigate, appointments]);

    const checkReminders = () => {
        if (!appointments || appointments.length === 0) return;

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // Find upcoming appointment today
        const upcoming = appointments.find(app =>
            app.status === 'booked' &&
            app.date === todayStr &&
            !remindedApps.has(app._id)
        );

        if (upcoming) {
            const [h, m] = upcoming.time.split(':');
            const appTime = new Date();
            appTime.setHours(parseInt(h), parseInt(m), 0, 0);

            const diff = (appTime - now) / (1000 * 60); // Difference in minutes

            // Trigger if within 20 mins AND not passed
            if (diff > 0 && diff <= 20) {
                setActiveAlert({
                    id: upcoming._id,
                    time: formatTime(upcoming.time),
                    patient: upcoming.patientName
                });
                setRemindedApps(prev => new Set(prev).add(upcoming._id));

                // Also show browser notification if supported/allowed (optional enhancement)
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("Appointment Reminder", { body: `Your appointment is in ${Math.ceil(diff)} minutes!` });
                }
            }
        }
    };

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://pediatricsbackend-4hii.onrender.com/api/appointments/my-appointments', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setAppointments(data);
            }
        } catch (err) {
            toast.error('Failed to fetch appointments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://pediatricsbackend-4hii.onrender.com/api/appointments/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                toast.success('Appointment cancelled successfully');
                fetchAppointments(); // Re-fetch to sync with server
            } else {
                const data = await res.json();
                toast.error(data.msg || 'Failed to cancel');
            }
        } catch (err) {
            toast.error('Server error');
        }
    };

    const [queueData, setQueueData] = useState([]);

    const fetchQueueData = async () => {
        try {
            const res = await fetch('https://pediatricsbackend-4hii.onrender.com/api/appointments/today-public');
            const data = await res.json();
            setQueueData(data);
        } catch (err) {
            console.error("Failed to fetch queue data", err);
        }
    };

    useEffect(() => {
        fetchQueueData();
        const interval = setInterval(fetchQueueData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    // Calculate Queue Stats for the logged-in user
    const getQueueStats = () => {
        // Find my appointment today (Use local date to match booking date)
        const d = new Date();
        const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        const myAppt = appointments.find(a =>
            a.status === 'booked' &&
            a.date === todayStr
        );

        if (!myAppt) return null;

        // Find my position in the public queue using _id
        const myIndex = queueData.findIndex(q => q._id === myAppt._id);
        if (myIndex === -1) return null;

        const myToken = myIndex + 1;

        // Find current token (first non-completed/cancelled in sorted list)
        const currentTokenIndex = queueData.findIndex(q => q.status !== 'completed' && q.status !== 'cancelled');
        const currentToken = currentTokenIndex !== -1 ? currentTokenIndex + 1 : '-';

        const peopleAhead = queueData.slice(0, myIndex).filter(q =>
            q.status === 'booked' || q.status === 'checked-in' || q.status === 'in-progress'
        ).length;

        const estWaitTime = peopleAhead * 15; // 15 mins per patient approx

        return { myToken, peopleAhead, estWaitTime, currentToken };
    };

    const queueStats = getQueueStats();

    const formatTime = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    const [historyFilter, setHistoryFilter] = useState('This Year');

    const getFilteredHistory = () => {
        if (!appointments) return [];
        const now = new Date();
        const currentYear = now.getFullYear();

        return appointments.filter(a => {
            const appDate = new Date(a.date);
            const isCompleted = a.status === 'completed' || new Date(a.date) < new Date().setHours(0, 0, 0, 0);
            if (!isCompleted) return false;

            if (historyFilter === 'This Year') {
                return appDate.getFullYear() === currentYear;
            } else if (historyFilter === 'Last Year') {
                return appDate.getFullYear() === currentYear - 1;
            } else if (historyFilter === 'All Time') {
                return true;
            }
            return false;
        });
    };

    if (loading || isLoading) return <div className="loading-screen">Loading...</div>;

    return (
        <div className="dashboard-page container">
            <Link to="/" className="btn btn-outline btn-sm btn-box" style={{ marginBottom: '2rem', alignSelf: 'flex-start' }}>
                <ArrowLeft size={16} /> Back to Home
            </Link>

            <div className="dashboard-header">
                {/* REMINDER ALERT BOX */}
                {activeAlert && (
                    <div className="reminder-alert-box fade-in-up" style={{
                        background: '#fff7ed', borderLeft: '4px solid #f97316',
                        padding: '1rem', marginBottom: '1.5rem', borderRadius: '0.5rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ background: '#ffedd5', padding: '0.5rem', borderRadius: '50%', color: '#ea580c' }}>
                                <Bell size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, color: '#9a3412' }}>Upcoming Appointment</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#c2410c' }}>
                                    Your visit for <strong>{activeAlert.patient}</strong> is at <strong>{activeAlert.time}</strong>.(~20 mins)
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveAlert(null)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9a3412' }}
                        >
                            <XCircle size={20} />
                        </button>
                    </div>
                )}

                <div className="header-actions">
                    <h2>Parent Dashboard</h2>
                    <Link to="/notifications" className="btn-icon-circle">
                        <Bell size={24} />
                    </Link>
                </div>

                {queueStats && (
                    <div className="queue-card fade-in-up" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: 'white', padding: '1.5rem', borderRadius: '1.5rem', boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)' }}>Live Queue Status</h3>
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Updates in real-time</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: '600' }}>
                                Your Token: #{queueStats.myToken}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>#{queueStats.currentToken}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>Current Token</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{queueStats.peopleAhead}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>People Ahead</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{queueStats.estWaitTime}<span style={{ fontSize: '1rem' }}>m</span></div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>Est. Wait Time</div>
                            </div>
                        </div>
                    </div>
                )}

                {children.length > 0 ? (
                    <div className="child-selector-container">

                        <p>Managing health profile for:</p>
                        <div className="child-list-scroll">
                            {children.map((child, index) => (
                                <button
                                    key={child._id || index}
                                    className={`child-profile-pill ${selectedChildIndex === index ? 'active' : ''}`}
                                    onClick={() => setSelectedChildIndex(index)}
                                >
                                    <div className="child-avatar-pill">
                                        {getInitials(child.name)}
                                    </div>
                                    <span className="scrolling-name">{child.name.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>

                    </div>
                ) : (
                    <div className="no-child-alert" onClick={() => navigate('/profile', { state: { activeTab: 'children', openAddChild: true } })} style={{ cursor: 'pointer' }}>
                        <p>No children profiles added yet. <span style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Add now</span></p>
                    </div>
                )}
            </div>

            {/* CHILD WELLNESS PROFILE */}
            {selectedChild ? (
                <div className="wellness-section">
                    <div className="section-intro">
                        <h3>Digital Health Card</h3>
                        <p className="text-muted-sm">Official clinic identity for {selectedChild.name} {selectedChild.lastName || ''}</p>
                    </div>

                    <div className="health-card-wrapper fade-in-up">
                        <HealthCard
                            child={selectedChild}
                            parentName={user.name}
                            parentPhone={user.phone}
                        />
                    </div>

                    <div className="stats-grid mt-4">
                        <div className="stat-card">
                            <div className="stat-icon bg-green">
                                <Weight size={20} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Weight</span>
                                <span className="stat-value">{selectedChild.weight ? `${selectedChild.weight} kg` : '--'}</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon bg-purple">
                                <Ruler size={20} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Height</span>
                                <span className="stat-value">{selectedChild.height ? `${selectedChild.height} cm` : '--'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="empty-state-card">
                    <p>Add child details to see wellness profile.</p>
                    <Link to="/profile" className="btn btn-primary btn-sm">Add Child</Link>
                </div>
            )}

            {/* VACCINATION TRACKER */}
            {selectedChild && (
                <VaccinationTracker
                    child={selectedChild}
                    onUpdate={(updatedChildren) => {
                        const updatedUser = { ...user, children: updatedChildren };
                        updateUser(updatedUser);
                        toast.success('Vaccination status updated');
                    }}
                />
            )}

            {/* Notification section removed as per user request */}

            {/* UPCOMING APPOINTMENTS */}
            <div className="appointments-section">
                <h3><Calendar size={20} /> Upcoming Appointments</h3>
                {appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled' && new Date(a.date) >= new Date().setHours(0, 0, 0, 0)).length === 0 ? (
                    <div className="empty-dashboard">
                        <p>No upcoming appointments.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/#book-appointment')}>
                            Book Now
                        </button>
                    </div>
                ) : (
                    <div className="cards-grid">
                        {appointments
                            .filter(a => a.status !== 'completed' && a.status !== 'cancelled' && new Date(a.date) >= new Date().setHours(0, 0, 0, 0))
                            .map(app => (
                                <div key={app._id} className="appointment-card">
                                    <div className="card-header">
                                        <div className="card-date-strip">
                                            <Calendar size={16} className="text-primary" />
                                            <span>{app.date}</span>
                                        </div>
                                        <div className="app-status badge-booked">{app.status}</div>
                                    </div>

                                    <div className="card-body">
                                        <div className="patient-info-row">
                                            <span className="patient-name">{app.patientName}</span>
                                            <div className="patient-meta">
                                                <User size={12} /> {app.patientAge} yrs
                                            </div>
                                        </div>

                                        <div className="time-row">
                                            <Clock size={16} className="text-primary" />
                                            <span>{formatTime(app.time)}</span>
                                        </div>

                                        <div className="card-actions">
                                            <button
                                                className="btn-modern btn-primary-soft"
                                                onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=Pediatric+CMS+Clinic', '_blank')}
                                            >
                                                <MapPin size={16} /> Get Directions
                                            </button>
                                            <button
                                                className="btn-modern btn-danger-soft"
                                                onClick={() => handleCancel(app._id)}
                                            >
                                                <XCircle size={16} /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>

            {/* PAST & COMPLETED HISTORY */}
            <div className="appointments-section history-section" style={{ marginTop: '4rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}><Clock size={20} /> Visit History</h3>
                    <select
                        className="form-select-sm"
                        value={historyFilter}
                        onChange={(e) => setHistoryFilter(e.target.value)}
                        style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.9rem',
                            outline: 'none',
                            background: 'white',
                            color: '#475569',
                            cursor: 'pointer'
                        }}
                    >
                        <option>This Year</option>
                        <option>Last Year</option>
                        <option>All Time</option>
                    </select>
                </div>

                <div className="history-list">
                    {getFilteredHistory().length === 0 ? <p className="text-muted">No past visits found.</p> :
                        getFilteredHistory().map(app => (
                            <div key={app._id} className="history-item-row fade-in-up">
                                <div className="history-date-box">
                                    <span className="h-day">{new Date(app.date).getDate()}</span>
                                    <span className="h-month">{new Date(app.date).toLocaleString('default', { month: 'short' })}</span>
                                </div>
                                <div className="history-info">
                                    <div className="h-patient">{app.patientName}</div>
                                    <div className="h-meta">{formatTime(app.time)} • {app.category}</div>
                                </div>
                                <div className="history-status">
                                    {app.status === 'completed' ?
                                        <span className="status-pill success">Visited <Activity size={12} /></span> :
                                        <span className="status-pill neutral">{app.status}</span>
                                    }
                                </div>
                            </div>
                        ))
                    }
                </div>
                {/* PATIENT STORIES / TOPICS */}

            </div >
        </div>
    );
};

export default Dashboard;
