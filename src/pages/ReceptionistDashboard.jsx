import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, Users, FileText, Activity, Search,
    UserPlus, Clock, Plus, Phone, Trash2
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
        children: [{ name: '', age: '', gender: 'Male' }] // Ensure children array exists
    });

    const handleAddChild = () => {
        setRegData({
            ...regData,
            children: [...regData.children, { name: '', age: '', gender: 'Male' }]
        });
    };

    const handleRemoveChild = (index) => {
        const updatedChildren = regData.children.filter((_, i) => i !== index);
        setRegData({ ...regData, children: updatedChildren });
    };

    const handleChildChange = (index, field, value) => {
        const updatedChildren = regData.children.map((child, i) => {
            if (i === index) return { ...child, [field]: value };
            return child;
        });
        setRegData({ ...regData, children: updatedChildren });
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
    const [rescheduleData, setRescheduleData] = useState({
        id: null,
        date: '',
        time: '',
        message: ''
    });
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);

    // Filter Logic
    const [filterMode, setFilterMode] = useState('today'); // today, yesterday, history, custom
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterCategory, setFilterCategory] = useState('All');

    const getFilteredAppointments = () => {
        if (!Array.isArray(appointments)) return [];

        return appointments.filter(app => {
            // Date Filter
            let dateMatch = false;
            if (filterMode === 'history') dateMatch = true;
            else dateMatch = app.date === selectedDate;

            // Category Filter
            let categoryMatch = false;
            if (filterCategory === 'All') categoryMatch = true;
            else categoryMatch = app.category === filterCategory;

            return dateMatch && categoryMatch;
        });
    };

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
            console.log("User Data:", res.data); // Debugging
            console.log("Appointments Data:", res.data); // Debugging
        } catch (err) {
            console.error(err);
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
                    <div className="stat-card" onClick={() => { setActiveTab('appointments'); setFilterMode('today'); }}>
                        <div className="icon-wrapper" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h3>{appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}</h3>
                            <p>Today's Total</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
                            <Activity size={20} />
                        </div>
                        <div>
                            <h3>{appointments.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'completed').length}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div className="stat-card" style={{ minWidth: '200px' }}>
                        <div className="icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
                            <Clock size={20} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Next Patient</p>
                            {(() => {
                                const now = new Date();
                                const todayStr = now.toISOString().split('T')[0];
                                const nextAppt = appointments
                                    .filter(a => a.date === todayStr && a.status !== 'completed' && a.status !== 'cancelled')
                                    .sort((a, b) => a.time.localeCompare(b.time))[0];

                                return nextAppt ? (
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                        {nextAppt.time} - {nextAppt.patientName}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>No pending visits</div>
                                );
                            })()}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h3>Schedule</h3>

                        {/* Date Filters */}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                                className={`btn btn-sm ${filterMode === 'today' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => { setFilterMode('today'); setSelectedDate(new Date().toISOString().split('T')[0]); }}
                            >
                                Today
                            </button>
                            <button
                                className={`btn btn-sm ${filterMode === 'yesterday' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => {
                                    const y = new Date();
                                    y.setDate(y.getDate() - 1);
                                    setFilterMode('yesterday');
                                    setSelectedDate(y.toISOString().split('T')[0]);
                                }}
                            >
                                Yesterday
                            </button>
                            <button
                                className={`btn btn-sm ${filterMode === 'history' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setFilterMode('history')}
                            >
                                All History
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.25rem 0.5rem', background: 'white' }}>
                                <Calendar size={14} color="#64748b" style={{ marginRight: '0.5rem' }} />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setFilterMode('custom');
                                    }}
                                    style={{ border: 'none', outline: 'none', fontSize: '0.85rem', color: '#334155' }}
                                />
                            </div>

                            {/* Category Filter */}
                            <select
                                className="form-select-sm"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    padding: '0.25rem 0.5rem',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="All">All Types</option>
                                <option value="General Checkup">General Checkup</option>
                                <option value="Vaccination">Vaccination</option>
                                <option value="Newborn Care">Newborn Care</option>
                                <option value="Emergency">Emergency</option>
                            </select>

                            <button className="btn btn-sm btn-outline" onClick={fetchAppointments} title="Refresh Data">
                                <Activity size={14} />
                            </button>
                        </div>
                    </div>

                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Patient</th>
                                <th>Parent / Guardian</th>
                                <th>Doctor</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getFilteredAppointments().length > 0 ? (
                                getFilteredAppointments().map(app => (
                                    <tr key={app._id}>
                                        <td>
                                            <div style={{ fontWeight: '600', color: '#334155' }}>{app.time}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(app.date).toLocaleDateString()}</div>
                                        </td>
                                        <td>
                                            <strong style={{ color: '#1e293b' }}>{app.patientName}</strong>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.patientAge} yrs • {app._id.slice(-4)}</div>
                                        </td>
                                        <td>
                                            {app.userId ? (
                                                <div>
                                                    <div style={{ fontWeight: '500', color: '#334155' }}>{app.userId.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Phone size={10} /> {app.userId.phone || 'N/A'}
                                                        {console.log(app, "sss")}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Walk-in / Unregistered</span>
                                            )}
                                        </td>
                                        <td>Dr. Sai Manohar</td>
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
                                                {app.status !== 'completed' && (
                                                    <button
                                                        className="btn btn-sm btn-outline"
                                                        onClick={() => openRescheduleModal(app)}
                                                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                                                    >
                                                        Reschedule
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                        No appointments found for this filter.
                                    </td>
                                </tr>
                            )}
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
                            <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="form-group-modern">
                                    <label>Parent Name</label>
                                    <input
                                        type="text" className="modern-input" required
                                        value={regData.parentName}
                                        onChange={e => setRegData({ ...regData, parentName: e.target.value })}
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="form-group-modern">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel" className="modern-input" required
                                        value={regData.parentPhone}
                                        onChange={e => setRegData({ ...regData, parentPhone: e.target.value })}
                                        placeholder="Mobile Number"
                                    />
                                </div>
                            </div>

                            <div className="section-divider" style={{ borderTop: '1px solid #e2e8f0', margin: '1rem 0', paddingTop: '1rem' }}>
                                <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    Children Details
                                    <button type="button" className="btn btn-sm btn-outline" onClick={handleAddChild}>
                                        <Plus size={16} /> Add Another Child
                                    </button>
                                </h4>

                                <div key={index} className="child-form-card" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>Child {index + 1}</span>
                                        {regData.children.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn-icon-danger"
                                                onClick={() => handleRemoveChild(index)}
                                                title="Remove Child"
                                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group-modern" style={{ gridColumn: '1 / -1' }}>
                                            <label>Child Name</label>
                                            <input
                                                type="text" className="modern-input" required
                                                value={child.name}
                                                onChange={e => handleChildChange(index, 'name', e.target.value)}
                                                placeholder="Child's Full Name"
                                            />
                                        </div>
                                        <div className="form-group-modern">
                                            <label>Age</label>
                                            <input
                                                type="number" className="modern-input" required
                                                value={child.age}
                                                onChange={e => handleChildChange(index, 'age', e.target.value)}
                                                placeholder="Age"
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
                                        <div className="form-group-modern">
                                            <label>Blood Group</label>
                                            <select
                                                className="modern-input"
                                                value={child.bloodGroup}
                                                onChange={e => handleChildChange(index, 'bloodGroup', e.target.value)}
                                            >
                                                <option value="">Select Blood Group </option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                ))}
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', fontSize: '1rem' }}>
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
