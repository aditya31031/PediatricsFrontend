import React, { useState, useEffect } from 'react';
import DateSelector from './DateSelector';
import TimeSlotGrid from './TimeSlotGrid';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Stethoscope, Syringe, Baby, AlertCircle } from 'lucide-react';
import './Booking.css';

const BookingContainer = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [patientDetails, setPatientDetails] = useState({ name: '', age: '' });
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    // Auto-hide manual input by default
    useEffect(() => {
        setShowManualInput(false);
    }, [user]);

    const categories = [
        { id: 'General Checkup', label: 'General Checkup', icon: <Stethoscope size={20} /> },
        { id: 'Vaccination', label: 'Vaccination', icon: <Syringe size={20} /> },
        { id: 'Newborn Care', label: 'Newborn Care', icon: <Baby size={20} /> },
        { id: 'Emergency', label: 'Emergency', icon: <AlertCircle size={20} /> },
    ];

    // Fetch booked slots when date changes
    useEffect(() => {
        if (selectedDate) {
            fetchBookedSlots(selectedDate);
        }
        // eslint-disable-next-line
    }, [selectedDate]);

    const fetchBookedSlots = async (date) => {
        try {
            const res = await fetch(`https://pediatricsbackend-4hii.onrender.com/api/appointments?date=${date}`);
            const data = await res.json();
            const times = data.map(app => app.time);
            setBookedSlots(times);
        } catch (err) {
            console.error("Error fetching slots", err);
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to book an appointment');
            navigate('/login');
            return;
        }
        if (!selectedDate || !selectedTime) {
            toast.error('Please select a date and time.');
            return;
        }
        if (!selectedCategory) {
            toast.error('Please select a reason for visit.');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Booking appointment...');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://pediatricsbackend-4hii.onrender.com/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    patientName: patientDetails.name,
                    patientAge: patientDetails.age,
                    date: selectedDate,
                    time: selectedTime,
                    category: selectedCategory,
                    userId: user.id
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Appointment booked successfully!', { id: toastId });
                setBookedSlots([...bookedSlots, selectedTime]);
                setSelectedTime(null);
                setSelectedCategory('');
                setPatientDetails({ name: '', age: '' });
            } else {
                toast.error(data.msg || 'Booking failed', { id: toastId });
            }
        } catch (err) {
            toast.error('Server error', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="booking-container" id="book-appointment">
            <h2 className="text-center section-header">Book an Appointment</h2>

            <div className="booking-layout">
                <div className="booking-left">
                    <DateSelector selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                </div>

                <div className="booking-right">
                    {selectedDate ? (
                        <>
                            <TimeSlotGrid
                                selectedTime={selectedTime}
                                onTimeSelect={setSelectedTime}
                                bookedSlots={bookedSlots}
                            />

                            {selectedTime && (
                                <div className="booking-form card">
                                    {user ? (
                                        <>
                                            {/* Category Selector */}
                                            <div className="form-group">
                                                <label className="form-label">Reason for Visit</label>
                                                <div className="category-grid">
                                                    {categories.map(cat => (
                                                        <div
                                                            key={cat.id}
                                                            className={`category-card ${selectedCategory === cat.id ? 'selected' : ''}`}
                                                            onClick={() => setSelectedCategory(cat.id)}
                                                        >
                                                            <div className="cat-icon">{cat.icon}</div>
                                                            <span>{cat.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <h4>Patient Details</h4>

                                            {/* Child Selector */}
                                            {user.children && user.children.length > 0 ? (
                                                <div className="form-group">
                                                    <label className="form-label">Select Patient</label>
                                                    <select
                                                        className="form-input"
                                                        onChange={(e) => {
                                                            const childId = e.target.value;
                                                            if (childId === 'manual') {
                                                                setPatientDetails({ name: '', age: '' });
                                                                setShowManualInput(true);
                                                            } else {
                                                                const child = user.children.find(c => c._id === childId) || user.children[childId];
                                                                if (child) {
                                                                    setPatientDetails({ name: child.name, age: child.age });
                                                                    setShowManualInput(false);
                                                                }
                                                            }
                                                        }}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>-- Choose a Child --</option>
                                                        {user.children.map((child, idx) => (
                                                            <option key={child._id || idx} value={child._id || idx}>
                                                                {child.name} ({child.age} yrs)
                                                            </option>
                                                        ))}

                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="alert-box-info" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', color: '#1e40af' }}>
                                                    <p style={{ margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Baby size={18} />
                                                        <strong>No children profiles found.</strong>
                                                    </p>
                                                    <button
                                                        className="btn btn-link"
                                                        onClick={() => navigate('/profile', { state: { activeTab: 'children', openAddChild: true } })}
                                                        style={{ padding: 0, marginTop: '0.25rem', fontSize: '0.9rem', textDecoration: 'underline' }}
                                                    >
                                                        Add your baby details first to book faster!
                                                    </button>
                                                </div>
                                            )}

                                            <form onSubmit={handleBook}>
                                                {showManualInput && (
                                                    <div className="manual-inputs fade-in">
                                                        <div className="form-group">
                                                            <label className="form-label">Patient Name</label>
                                                            <input
                                                                type="text"
                                                                className="form-input"
                                                                value={patientDetails.name}
                                                                onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
                                                                required
                                                                placeholder="e.g. Rahul Sharma"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="form-label">Patient Age</label>
                                                            <input
                                                                type="number"
                                                                className="form-input"
                                                                value={patientDetails.age}
                                                                onChange={(e) => setPatientDetails({ ...patientDetails, age: e.target.value })}
                                                                required
                                                                placeholder="e.g. 5"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                                    {loading ? 'Booking...' : 'Confirm Appointment'}
                                                </button>
                                            </form>
                                        </>
                                    ) : (
                                        <div className="login-prompt text-center" style={{ padding: '2rem' }}>
                                            <h4 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>Login to Complete Booking</h4>
                                            <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                                                Please login or register to confirm your appointment for <strong>{selectedTime}</strong>.
                                            </p>
                                            <button
                                                className="btn btn-primary w-100"
                                                onClick={() => navigate('/login')}
                                            >
                                                Login / Register
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <p>Please select a date to view available slots.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingContainer;
