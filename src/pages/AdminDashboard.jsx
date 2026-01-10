import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Clock, CheckCircle, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

import { io } from 'socket.io-client';

const AdminDashboard = () => {
    const { user, loading } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') {
                navigate('/login');
            } else {
                fetchAllAppointments();

                // Initialize Socket.io connection
                const socket = io('https://pediatricsbackend.onrender.com');

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
                    fetchAllAppointments();
                });

                // Cleanup on unmount
                return () => {
                    socket.disconnect();
                };
            }
        }
    }, [user, loading, navigate]);

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
            toast.error('Server error');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700'; // Using vanilla classes defined in CSS
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Modal States
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showModifyModal, setShowModifyModal] = useState(false);

    const [selectedAppt, setSelectedAppt] = useState(null);

    // Cancel Fields
    const [cancelReason, setCancelReason] = useState('');

    // Modify Fields
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
            } else {
                toast.error('Failed to reschedule');
            }
        } catch (err) {
            toast.error('Server error');
        }
    };

    if (loading || isLoading) return <div className="loading-screen">Loading Admin Panel...</div>;

    return (
        <div className="admin-dashboard container">
            <div className="admin-header">
                <div className="flex-row-center">
                    <h2>Doctor's Dashboard</h2>
                    <button onClick={fetchAllAppointments} className="btn-refresh" title="Refresh Data">
                        🔄
                    </button>
                </div>
                <div className="admin-stats">
                    <div className="stat-card">
                        <h3>{appointments.length}</h3>
                        <p>Total Bookings</p>
                    </div>
                    <div className="stat-card">
                        <h3>{appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length || 0}</h3>
                        <p>Today's Patients</p>
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
