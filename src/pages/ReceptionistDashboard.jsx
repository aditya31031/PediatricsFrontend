import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, Users, FileText, Activity, Search,
    UserPlus, Clock, Plus, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminDashboard.css'; // Reusing Admin Styles for now
import axios from 'axios';

const ReceptionistDashboard = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('appointments'); // 'appointments', 'registration'
    const [appointments, setAppointments] = useState([]);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Search & Booking State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [bookingData, setBookingData] = useState({
        patientName: '',
        patientAge: '',
        date: '',
        time: '',
        category: 'General Checkup'
    });

    // Quick Register State
    const [regData, setRegData] = useState({
        parentName: '',
        parentPhone: '',
        childName: '',
        childAge: '',
        childGender: 'Male'
    });

    // Reschedule State
    const [rescheduleData, setRescheduleData] = useState({
        id: null,
        date: '',
        time: '',
        message: ''
    });
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'receptionist')) {
            // navigate('/'); // Commented out for dev/testing ease if needed
        }
        fetchAppointments();
    }, [user, loading]);

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/all`, {
                headers: { 'x-auth-token': token }
            });
            setAppointments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleQuickRegister = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/reception/quick-register`, regData, {
                headers: { 'x-auth-token': token }
            });
            toast.success('Patient Registered Successfully');
            setRegData({
                parentName: '',
                parentPhone: '',
                children: [{ name: '', age: '', gender: 'Male' }]
            });
            setActiveTab('appointments');
        } catch (err) {
            toast.error('Registration Failed');
        }
    };

    const handleSearch = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reception/users/search?q=${searchQuery}`, {
                headers: { 'x-auth-token': token }
            });
            if (Array.isArray(res.data)) {
                setSearchResults(res.data);
            } else {
                console.error("Search results is not an array:", res.data);
                setSearchResults([]);
                toast.error("Invalid response from server");
            }
        } catch (err) {
            console.error(err);
            toast.error("Search failed");
            setSearchResults([]);
        }
    };

    const handleBookAppointment = async () => {
        try {
            const token = localStorage.getItem('token');
            // Check if we need to implement "Book on behalf" endpoint or use existing
            // For now, we will use the user ID of the SELECTED PATIENT
            // But wait, the existing POST /api/appointments uses req.user.id from token (Receptionist)
            // We need to update backend to allow passing userId IF receptionist.

            // Assuming we updated backend (Step 3 in plan), let's try passing userId in body
            await axios.post(`${import.meta.env.VITE_API_URL}/api/appointments/staff-book`, {
                ...bookingData,
                userId: selectedPatient._id
            }, {
                headers: { 'x-auth-token': token }
            });

            toast.success('Appointment Booked');
            setShowBookingModal(false);
            fetchAppointments();
            setSelectedPatient(null);
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Booking Failed');
        }
    };

    const openRescheduleModal = (appt) => {
        setRescheduleData({
            id: appt._id,
            date: appt.date,
            time: appt.time,
            message: ''
        });
        setShowRescheduleModal(true);
    };

    const handleRescheduleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/appointments/${rescheduleData.id}`, {
                date: rescheduleData.date,
                time: rescheduleData.time,
                message: rescheduleData.message
            }, {
                headers: { 'x-auth-token': token }
            });
            toast.success('Appointment Rescheduled');
            setShowRescheduleModal(false);
            fetchAppointments();
        } catch (err) {
            toast.error('Reschedule Failed');
            console.error(err);
        }
    };

    return (
        <div className="admin-dashboard container">
            <div className="admin-header">
                <div>
                    <h2>Reception Desk</h2>
                    <p>Welcome, {user?.name}</p>
                </div>
                <div className="admin-stats">
                    <div className="stat-card" onClick={() => setActiveTab('appointments')}>
                        <Calendar size={20} />
                        <div>
                            <h3>{appointments.length}</h3>
                            <p>Today's Visits</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('appointments')}
                >
                    <Calendar size={18} style={{ marginRight: '8px' }} /> Schedule
                </button>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" onClick={() => { setShowBookingModal(true); setSelectedPatient(null); }}>
                        <Plus size={18} /> New Appointment
                    </button>
                    <button
                        className={`btn ${activeTab === 'registration' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('registration')}
                    >
                        <UserPlus size={18} /> Quick Register
                    </button>
                </div>
            </div>

            {/* APPOINTMENTS VIEW */}
            {activeTab === 'appointments' && (
                <div className="appointments-table-container fade-in-up">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Schedule</h3>
                        <button className="btn btn-sm btn-outline" onClick={fetchAppointments}>Refresh</button>
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(appointments) && appointments.map(app => (
                                <tr key={app._id}>
                                    <td>{app.time}</td>
                                    <td>
                                        <strong>{app.patientName}</strong>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>ID: {app._id.slice(-4)}</div>
                                    </td>
                                    <td>Dr. Aditi</td>
                                    <td><span className="category-badge">{app.category}</span></td>
                                    <td><span className={`status-badge ${app.status}`}>{app.status}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {app.status !== 'completed' && (
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={async () => {
                                                        if (!window.confirm('Mark this visit as completed?')) return;
                                                        try {
                                                            const token = localStorage.getItem('token');
                                                            await axios.put(`${import.meta.env.VITE_API_URL}/api/appointments/${app._id}/complete`, {}, {
                                                                headers: { 'x-auth-token': token }
                                                            });
                                                            toast.success('Marked as Completed');
                                                            fetchAppointments();
                                                        } catch (err) {
                                                            toast.error('Action Failed');
                                                        }
                                                    }}
                                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                                                    title="Mark Visited"
                                                >
                                                    <Activity size={12} /> Done
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={() => openRescheduleModal(app)}
                                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                                            >
                                                Reschedule
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* REGISTRATION VIEW */}
            {activeTab === 'registration' && (
                <div className="settings-card fade-in-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="card-header-clean">
                        <UserPlus size={24} className="text-primary" />
                        <h2>Quick Patient Registration</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleQuickRegister}>
                            <h4>Parent Details</h4>
                            <div className="form-group-modern">
                                <label>Parent Name</label>
                                <input
                                    type="text" className="modern-input" required
                                    value={regData.parentName}
                                    onChange={e => setRegData({ ...regData, parentName: e.target.value })}
                                />
                            </div>
                            <div className="form-group-modern">
                                <label>Phone Number</label>
                                <input
                                    type="tel" className="modern-input" required
                                    value={regData.parentPhone}
                                    onChange={e => setRegData({ ...regData, parentPhone: e.target.value })}
                                />
                            </div>

                            <h4 style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Children Details
                                <button type="button" className="btn btn-sm btn-outline" onClick={handleAddChild}>
                                    <Plus size={16} /> Add Child
                                </button>
                            </h4>

                            {regData.children.map((child, index) => (
                                <div key={index} className="child-form-group" style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#666' }}>Child {index + 1}</span>
                                        {regData.children.length > 1 && (
                                            <button type="button" className="btn-text text-danger" onClick={() => handleRemoveChild(index)}>Remove</button>
                                        )}
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Child Name</label>
                                        <input
                                            type="text" className="modern-input" required
                                            value={child.name}
                                            onChange={e => handleChildChange(index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group-modern">
                                            <label>Age</label>
                                            <input
                                                type="number" className="modern-input" required
                                                value={child.age}
                                                onChange={e => handleChildChange(index, 'age', e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group-modern">
                                            <label>Gender</label>
                                            <select
                                                className="modern-input"
                                                value={child.gender}
                                                onChange={e => handleChildChange(index, 'gender', e.target.value)}
                                            >
                                                <option>Male</option>
                                                <option>Female</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                Register & Create Profile
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* BOOKING MODAL */}
            {showBookingModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>New Appointment</h3>
                            <button className="btn-icon" onClick={() => setShowBookingModal(false)}>Close</button>
                        </div>
                        <div className="card-body">
                            {/* Step 1: Search Patient */}
                            {!selectedPatient ? (
                                <div>
                                    <div className="form-group-modern">
                                        <label>Search Patient (Name/Phone)</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                type="text" className="modern-input"
                                                placeholder="e.g. 98765..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                            />
                                            <button className="btn btn-primary" onClick={handleSearch}>
                                                <Search size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="search-results" style={{ marginTop: '1rem' }}>
                                        {Array.isArray(searchResults) && searchResults.map(u => (
                                            <div key={u._id} className="patient-card-mini" onClick={() => setSelectedPatient(u)}>
                                                <strong>{u.name}</strong>
                                                <span>{u.phone}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="selected-patient-banner">
                                        <strong>{selectedPatient.name}</strong>
                                        <button className="btn-text btn-sm" onClick={() => setSelectedPatient(null)}>Change</button>
                                    </div>

                                    <div className="form-group-modern">
                                        <label>Select Child</label>
                                        <select
                                            className="modern-input"
                                            value={bookingData.patientName}
                                            onChange={(e) => {
                                                const child = selectedPatient.children.find(c => c.name === e.target.value);
                                                setBookingData({
                                                    ...bookingData,
                                                    patientName: child.name,
                                                    patientAge: child.age
                                                });
                                            }}
                                        >
                                            <option value="">-- Select Child --</option>
                                            {selectedPatient.children.map(c => (
                                                <option key={c._id} value={c.name}>{c.name} ({c.age} yrs)</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group-modern">
                                        <label>Date</label>
                                        <input
                                            type="date" className="modern-input"
                                            value={bookingData.date}
                                            onChange={e => setBookingData({ ...bookingData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Time</label>
                                        <input
                                            type="time" className="modern-input"
                                            value={bookingData.time}
                                            onChange={e => setBookingData({ ...bookingData, time: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group-modern">
                                        <label>Reason</label>
                                        <select
                                            className="modern-input"
                                            value={bookingData.category}
                                            onChange={e => setBookingData({ ...bookingData, category: e.target.value })}
                                        >
                                            <option>General Checkup</option>
                                            <option>Vaccination</option>
                                            <option>Newborn Care</option>
                                            <option>Emergency</option>
                                        </select>
                                    </div>

                                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleBookAppointment}>
                                        Confirm Booking
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* RESCHEDULE MODAL */}
            {showRescheduleModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Reschedule Appointment</h3>
                            <button className="btn-icon" onClick={() => setShowRescheduleModal(false)}>Close</button>
                        </div>
                        <div className="card-body">
                            <div className="form-group-modern">
                                <label>New Date</label>
                                <input
                                    type="date" className="modern-input"
                                    value={rescheduleData.date}
                                    onChange={e => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                                />
                            </div>
                            <div className="form-group-modern">
                                <label>New Time</label>
                                <input
                                    type="time" className="modern-input"
                                    value={rescheduleData.time}
                                    onChange={e => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                                />
                            </div>
                            <div className="form-group-modern">
                                <label>Message (Optional)</label>
                                <input
                                    type="text" className="modern-input"
                                    placeholder="Reason for change..."
                                    value={rescheduleData.message}
                                    onChange={e => setRescheduleData({ ...rescheduleData, message: e.target.value })}
                                />
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleRescheduleSubmit}>
                                Confirm Reschedule
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ReceptionistDashboard;
