import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Clock, CheckCircle, Edit, Trash2, Users, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './AdminDashboard.css';

import { io } from 'socket.io-client';

const AdminDashboard = () => {
    const { user, loading } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({ totalPatients: 0, trendData: [], reasonData: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('Month'); // Week, Month, Year
    const navigate = useNavigate();

    // Chart Colors
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') {
                navigate('/login');
            } else {
                fetchInitialData();

                // Initialize Socket.io connection
                const socket = io(import.meta.env.VITE_API_URL || 'https://pediatricsbackend-4hii.onrender.com');

                // Listen for real-time updates
                socket.on('appointments:updated', (data) => {
                    if (data?.type === 'create') {
                        toast.success(`New Session: ${data.appointment.patientName}`, {
                            icon: '🆕',
                            duration: 5000
                        });
                    } else if (data?.type === 'delete') {
                        toast('Appointment Cancelled', { icon: '🗑️' });
                    } else {
                        toast.success('Schedule Updated');
                    }
                    fetchAllAppointments(); // Refresh list
                    fetchStats(); // Refresh stats
                });

                // Cleanup on unmount
                return () => {
                    socket.disconnect();
                };
            }
        }
    }, [user, loading, navigate]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        await Promise.all([fetchAllAppointments(), fetchStats()]);
        setIsLoading(false);
    };

    const fetchAllAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://pediatricsbackend-4hii.onrender.com/api/appointments/all', {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setAppointments(data);
            } else {
                toast.error('Failed to load appointments');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://pediatricsbackend-4hii.onrender.com/api/admin/stats', {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error("Stats fetch error:", err);
            toast.error('Failed to load analytics');
        }
    };

    // Filter Logic for Graph
    const getFilteredTrendData = () => {
        const { trendData } = stats;
        if (!trendData || trendData.length === 0) return [];

        const now = new Date();
        let startDate = new Date();

        if (filter === 'Week') {
            startDate.setDate(now.getDate() - 7);
        } else if (filter === 'Month') {
            startDate.setMonth(now.getMonth() - 1);
        } else if (filter === 'Year') {
            startDate.setFullYear(now.getFullYear() - 1);
        }

        return trendData.filter(item => new Date(item.date) >= startDate);
    };

    // Modal States
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showModifyModal, setShowModifyModal] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [modifyDate, setModifyDate] = useState('');
    const [modifyTime, setModifyTime] = useState('');
    const [modifyMessage, setModifyMessage] = useState('');

    const openCancelModal = (appt) => {
        setSelectedAppt(appt);
        setCancelReason('');
        setShowCancelModal(true);
    };

    const openModifyModal = (appt) => {
        setSelectedAppt(appt);
        setModifyDate(appt.date);
        setModifyTime(appt.time);
        setModifyMessage('');
        setShowModifyModal(true);
    };

    const handleConfirmCancel = async () => {
        if (!selectedAppt) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://pediatricsbackend-4hii.onrender.com/api/appointments/${selectedAppt._id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                toast.success('Appointment cancelled & notification sent');
                setShowCancelModal(false);
                fetchAllAppointments();
                fetchStats();
            } else {
                toast.error('Failed to cancel');
            }
        } catch (err) {
            toast.error('Server error');
        }
    };

    const handleConfirmModify = async () => {
        if (!selectedAppt) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://pediatricsbackend-4hii.onrender.com/api/appointments/${selectedAppt._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    date: modifyDate,
                    time: modifyTime,
                    message: modifyMessage
                })
            });

            if (res.ok) {
                toast.success('Appointment rescheduled & notification sent');
                setShowModifyModal(false);
                fetchAllAppointments();
                fetchStats();
            } else {
                toast.error('Failed to reschedule');
            }
        } catch (err) {
            toast.error('Server error');
        }
    };

    if (loading || isLoading) return <div className="loading-screen">Loading Admin Panel...</div>;

    const filteredData = getFilteredTrendData();

    return (
        <div className="admin-dashboard container">
            <div className="admin-header">
                <div className="flex-row-center">
                    <h2>Doctor's Dashboard</h2>
                    <button onClick={fetchInitialData} className="btn-refresh" title="Refresh Data">
                        🔄
                    </button>
                </div>
            </div>

            {/* HEADLINE STATS */}
            <div className="admin-stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon-bg"><Users size={24} /></div>
                    <div>
                        <h3>{stats.totalPatients}</h3>
                        <p>Total Patients</p>
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon-bg"><CheckCircle size={24} /></div>
                    <div>
                        <h3>{appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length || 0}</h3>
                        <p>Today's Patients</p>
                    </div>
                </div>
                <div className="stat-card info">
                    <div className="stat-icon-bg"><Calendar size={24} /></div>
                    <div>
                        <h3>{appointments.length}</h3>
                        <p>Total Bookings</p>
                    </div>
                </div>
            </div>

            {/* ANALYTICS SECTION */}
            <div className="analytics-section">

                {/* TREND CHART */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3><BarChart2 size={18} /> Visit Trends</h3>
                        <div className="chart-filters">
                            {['Week', 'Month', 'Year'].map(f => (
                                <button
                                    key={f}
                                    className={`filter-btn ${filter === f ? 'active' : ''}`}
                                    onClick={() => setFilter(f)}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <LineChart data={filteredData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                                <YAxis allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [value, 'Visits']}
                                    labelFormatter={(label) => new Date(label).toDateString()}
                                />
                                <Line type="monotone" dataKey="visits" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* REASONS PIE CHART */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Visit Reasons</h3>
                    </div>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={stats.reasonData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.reasonData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="appointments-table-container">
                <h3>All Appointments</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Patient</th>
                            <th>Age</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map(app => (
                            <tr key={app._id}>
                                <td>{app.date}</td>
                                <td>{app.time}</td>
                                <td>{app.patientName}</td>
                                <td>{app.patientAge}</td>
                                <td>
                                    <span className="category-badge">{app.category || 'Unspecified'}</span>
                                </td>
                                <td>
                                    <span className={`status-badge ${app.status || 'confirmed'}`}>{app.status || 'Confirmed'}</span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => openModifyModal(app)}
                                            className="btn-icon-action btn-edit"
                                            title="Modify Schedule"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => openCancelModal(app)}
                                            className="btn-icon-action btn-delete"
                                            title="Cancel Appointment"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CANCELLATION MODAL */}
            {showCancelModal && selectedAppt && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Cancel Appointment</h3>
                            <button className="btn-icon" onClick={() => setShowCancelModal(false)}><Clock size={16} /> Close</button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Patient Name</label>
                            <input type="text" className="form-input" value={selectedAppt.patientName} disabled />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Reason for Cancellation</label>
                            <textarea
                                className="form-textarea"
                                rows="3"
                                placeholder="e.g. Doctor is unavailable..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowCancelModal(false)}>Close</button>
                            <button className="btn-danger" onClick={handleConfirmCancel}>Send Notification & Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODIFY MODAL */}
            {showModifyModal && selectedAppt && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Modify Schedule</h3>
                            <button className="btn-icon" onClick={() => setShowModifyModal(false)}><Clock size={16} /> Close</button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Patient Name</label>
                            <input type="text" className="form-input" value={selectedAppt.patientName} disabled />
                        </div>

                        <div className="form-group">
                            <label className="form-label">New Date</label>
                            <input
                                type="date"
                                className="form-date"
                                value={modifyDate}
                                onChange={(e) => setModifyDate(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">New Time</label>
                            <input
                                type="time"
                                className="form-input"
                                value={modifyTime}
                                onChange={(e) => setModifyTime(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Message to Patient (Optional)</label>
                            <textarea
                                className="form-textarea"
                                rows="2"
                                placeholder="e.g. Apologies for the delay..."
                                value={modifyMessage}
                                onChange={(e) => setModifyMessage(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowModifyModal(false)}>Close</button>
                            <button className="btn-primary" onClick={handleConfirmModify}>Update Schedule</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
