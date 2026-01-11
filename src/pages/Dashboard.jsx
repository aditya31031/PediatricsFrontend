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
    }, [user, loading, navigate]);

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

    if (loading || isLoading) return <div className="loading-screen">Loading...</div>;

    return (
        <div className="dashboard-page container">
            <Link to="/" className="btn btn-outline btn-sm btn-box" style={{ marginBottom: '2rem', alignSelf: 'flex-start' }}>
                <ArrowLeft size={16} /> Back to Home
            </Link>

            <div className="dashboard-header">
                <div className="header-actions">
                    <h2>Parent Dashboard</h2>
                    <Link to="/notifications" className="btn-icon-circle">
                        <Bell size={24} />
                    </Link>
                </div>

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
                                            <span>{app.time}</span>
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
            <div className="appointments-section history-section" style={{ marginTop: '3rem' }}>
                <h3><Clock size={20} /> Visit History</h3>
                <div className="cards-grid">
                    {appointments
                        .filter(a => a.status === 'completed' || new Date(a.date) < new Date().setHours(0, 0, 0, 0))
                        .length === 0 ? <p className="text-muted">No past visits.</p> :
                        appointments
                            .filter(a => a.status === 'completed' || new Date(a.date) < new Date().setHours(0, 0, 0, 0))
                            .map(app => (
                                <div key={app._id} className={`appointment-card visit-history-card ${app.status === 'completed' ? 'visited' : ''}`}>
                                    <div className="card-header" style={{ background: app.status === 'completed' ? '#f0fdf4' : '#f8fafc', borderBottomColor: app.status === 'completed' ? '#dcfce7' : '#f1f5f9' }}>
                                        <div className="card-date-strip">
                                            <Calendar size={16} color={app.status === 'completed' ? '#166534' : '#64748b'} />
                                            <span>{app.date}</span>
                                        </div>
                                        <div className="app-status"
                                            style={{
                                                background: app.status === 'completed' ? '#dcfce7' : '#e5e7eb',
                                                color: app.status === 'completed' ? '#166534' : '#374151'
                                            }}>
                                            {app.status === 'completed' ? 'Visited ✅' : app.status}
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="patient-info-row">
                                            <span className="patient-name">{app.patientName}</span>
                                        </div>

                                        <div className="time-row">
                                            <Clock size={16} color="#94a3b8" />
                                            <span>{app.time}</span>
                                            <span style={{ margin: '0 0.5rem', color: '#cbd5e1' }}>|</span>
                                            <Activity size={16} color="#94a3b8" />
                                            <span>{app.category}</span>
                                        </div>

                                        <div className="card-actions">
                                            <button
                                                className="btn-modern btn-primary-soft"
                                                style={{ width: '100%' }}
                                                onClick={() => navigate('/#book-appointment')}
                                            >
                                                Book Again
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                    }
                </div>
            </div>
            {/* PATIENT STORIES / TOPICS */}

        </div >
    );
};

export default Dashboard;
