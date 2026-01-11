import React, { useState } from 'react';
import './HealthCard.css';
import { Shield, QrCode, Phone, Droplet, Plus, Check, X } from 'lucide-react';

const HealthCard = ({ child, parentName, parentPhone, onUpdateChild }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [bgValue, setBgValue] = useState('');

    if (!child) return null;

    const formattedId = child._id ? child._id.substring(child._id.length - 6).toUpperCase() : 'PENDING';

    const handleStartEdit = () => {
        setBgValue(child.bloodGroup || '');
        setIsEditing(true);
    };

    const handleSave = () => {
        if (bgValue && onUpdateChild) {
            onUpdateChild(child._id, { bloodGroup: bgValue });
        }
        setIsEditing(false);
    };

    return (
        <div className="health-card-container">
            <div className="health-card-professional">
                {/* Header */}
                <div className="card-pro-header">
                    <div className="clinic-logo-block">
                        <Shield className="logo-icon" size={24} />
                        <div className="clinic-text">
                            <span className="clinic-name">Sai Manohar</span>
                            <span className="clinic-subtitle">Children's Clinic</span>
                        </div>
                    </div>
                    <div className="card-chip-visual">
                        <img src="https://raw.githubusercontent.com/dasShounak/freeUseImages/main/chip.png" alt="sim-chip" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="card-pro-body">
                    <div className="patient-grid">
                        <div className="patient-photo-placeholder">
                            {child.photo ? (
                                <img
                                    src={child.photo}
                                    alt={child.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                child.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="patient-details">
                            <div className="detail-group primary">
                                <label>Patient Name</label>
                                <h3>{child.name} {child.lastName || ''}</h3>
                            </div>
                            <div className="detail-row-grid">
                                <div className="detail-group">
                                    <label>Age / Gender</label>
                                    <span>{child.age} Yrs / {child.gender === 'Male' ? 'M' : 'F'}</span>
                                </div>
                                <div className="detail-group">
                                    <label>Blood Type</label>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <select
                                                value={bgValue}
                                                onChange={e => setBgValue(e.target.value)}
                                                style={{
                                                    padding: '0.2rem', borderRadius: '0.2rem',
                                                    border: '1px solid #cbd5e1', fontSize: '0.8rem',
                                                    width: '60px'
                                                }}
                                            >
                                                <option value="">Select</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                            </select>
                                            <button onClick={handleSave} style={{ border: 'none', background: '#22c55e', color: 'white', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}>
                                                <Check size={14} />
                                            </button>
                                            <button onClick={() => setIsEditing(false)} style={{ border: 'none', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span
                                            className="blood-tag"
                                            onClick={handleStartEdit}
                                            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                            title="Click to edit"
                                        >
                                            {child.bloodGroup || <><Plus size={10} /> Add</>}
                                        </span>
                                    )}
                                </div>
                                <div className="detail-group">
                                    <label>Patient ID</label>
                                    <span className="id-text">#{formattedId}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="card-pro-footer">
                    <div className="emergency-contact">
                        <label>Emergency Contact (Guardian)</label>
                        <span className="ec-value">{parentName} • {parentPhone || 'N/A'}</span>
                    </div>
                    <div className="qr-section">
                        <QrCode size={32} color="white" stroke="black" opacity={0.8} />
                    </div>
                </div>

                {/* Decorative Background */}
                <div className="world-map-bg"></div>
            </div>
        </div>
    );
};

export default HealthCard;
