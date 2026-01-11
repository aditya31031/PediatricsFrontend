import React from 'react';
import './HealthCard.css';
import { Shield, QrCode, Phone, Droplet } from 'lucide-react';

const HealthCard = ({ child, parentName, parentPhone }) => {
    if (!child) return null;

    const formattedId = child._id ? child._id.substring(child._id.length - 6).toUpperCase() : 'PENDING';

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
                                <h3>{child.name}</h3>
                            </div>
                            <div className="detail-row-grid">
                                <div className="detail-group">
                                    <label>Age / Gender</label>
                                    <span>{child.age} Yrs / {child.gender === 'Male' ? 'M' : 'F'}</span>
                                </div>
                                <div className="detail-group">
                                    <label>Blood Type</label>
                                    <span className="blood-tag">{child.bloodGroup || 'N/A'}</span>
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
                        <QrCode size={32} color="white" opacity={0.8} />
                    </div>
                </div>

                {/* Decorative Background */}
                <div className="world-map-bg"></div>
            </div>
        </div>
    );
};

export default HealthCard;
