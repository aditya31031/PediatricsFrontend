import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
    ArrowLeft,
    User,
    Lock,
    Mail,
    Shield,
    CheckCircle,
    Phone,
    Baby,
    Plus,
    Trash2,
    Activity,
    Droplet,
    ChevronRight
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { user, updateUser } = useAuth();

    const location = useLocation();

    // UI State
    const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'children', 'security'
    const [activeProfile, setActiveProfile] = useState('me'); // 'me' or child_id

    // Check for deep link to tab
    useEffect(() => {
        if (location.state) {
            if (location.state.activeTab) {
                setActiveTab(location.state.activeTab);
            }
            if (location.state.openAddChild) {
                setShowAddChild(true);
            }
        }
    }, [location]);

    // Form States
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    // Children State
    const [children, setChildren] = useState([]);
    const [showAddChild, setShowAddChild] = useState(false);
    const [childData, setChildData] = useState({
        name: '',
        lastName: '',
        age: '',
        gender: 'Male',
        bloodGroup: '',
        weight: '',
        height: ''
    });

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name,
                email: user.email,
                phone: user.phone || ''
            });
            if (user.children) setChildren(user.children);
        }
    }, [user]);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('https://pediatricsbackend-4hii.onrender.com/api/auth/update-profile', profileData, {
                headers: { 'x-auth-token': token }
            });
            updateUser(res.data.user); // Update Context and LocalStorage
            toast.success('Profile updated successfully');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || 'Error updating profile');
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            return toast.error('New passwords do not match');
        }
        try {
            const token = localStorage.getItem('token');
            await axios.put('https://pediatricsbackend-4hii.onrender.com/api/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: { 'x-auth-token': token }
            });
            toast.success('Password updated successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            });
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || 'Error updating password');
        }
    };

    // Children Handlers
    const handleChildChange = (e) => {
        setChildData({ ...childData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) { // 5MB limit
                return toast.error('Image size too large. Max 5MB.');
            }
            // Store raw file for upload
            setChildData(prev => ({ ...prev, photoFile: file }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setChildData(prev => ({ ...prev, photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const addChild = async (e) => {
        e.preventDefault();
        console.log("Submitting Child Profile (V2 - FormData)..."); // Debug & Cache Bust
        try {
            const token = localStorage.getItem('token');

            const formData = new FormData();
            formData.append('name', childData.name);
            formData.append('lastName', childData.lastName || '');
            formData.append('age', childData.age);
            formData.append('gender', childData.gender);
            formData.append('bloodGroup', childData.bloodGroup);
            formData.append('weight', childData.weight);
            formData.append('height', childData.height);
            if (childData.photoFile) {
                formData.append('photo', childData.photoFile);
            }

            const res = await axios.post('https://pediatricsbackend-4hii.onrender.com/api/auth/add-child', formData, {
                headers: {
                    'x-auth-token': token
                }
            });
            updateUser(res.data); // Update AuthContext
            setChildren(res.data.children);
            setChildData({ name: '', lastName: '', age: '', gender: 'Male', bloodGroup: '', weight: '', height: '', photo: '', photoFile: null }); // Reset
            setShowAddChild(false);
            toast.success('Child added successfully');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || 'Error adding child');
        }
    };

    const deleteChild = async (id) => {
        if (!window.confirm('Are you sure you want to remove this profile?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`https://pediatricsbackend-4hii.onrender.com/api/auth/delete-child/${id}`, {
                headers: { 'x-auth-token': token }
            });
            updateUser(res.data); // Update AuthContext
            setChildren(res.data.children);
            toast.success('Child removed');
        } catch (err) {
            console.error(err);
            toast.error('Error removing child');
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-container-content">

                {/* Header Back Link */}
                <div className="profile-top-nav">
                    <Link to="/" className="btn btn-outline btn-sm btn-box" style={{ marginBottom: '2rem', alignSelf: 'flex-start' }}>
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                </div>

                <div className="profile-header-simple fade-in">
                    <div className="profile-avatar-simple">
                        {getInitials(user?.name)}
                    </div>
                    <div className="profile-info-simple">
                        <h1>{user?.name}</h1>
                        <p className="email-text">{user?.email}</p>
                    </div>
                </div>

                <div className="profile-split-layout fade-in-up">

                    {/* LEFT SIDEBAR NAVIGATION */}
                    <div className="profile-sidebar">
                        <div className="sidebar-menu">
                            <button
                                className={`sidebar-item ${activeTab === 'personal' ? 'active' : ''}`}
                                onClick={() => setActiveTab('personal')}
                            >
                                <User size={20} />
                                <span>Personal Information</span>
                                <ChevronRight size={16} className="chevron" />
                            </button>

                            <button
                                className={`sidebar-item ${activeTab === 'children' ? 'active' : ''}`}
                                onClick={() => setActiveTab('children')}
                            >
                                <Baby size={20} />
                                <span>My Children</span>
                                <span className="nav-badge">{children.length}</span>
                                <ChevronRight size={16} className="chevron" />
                            </button>

                            <button
                                className={`sidebar-item ${activeTab === 'security' ? 'active' : ''}`}
                                onClick={() => setActiveTab('security')}
                            >
                                <Lock size={20} />
                                <span>Security</span>
                                <ChevronRight size={16} className="chevron" />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT CONTENT AREA */}
                    <div className="profile-content-area">

                        {/* SECTION 1: Personal Details */}
                        {activeTab === 'personal' && (
                            <div className="settings-card fade-in">
                                <div className="card-header-clean">
                                    <div className="header-icon bg-blue-light">
                                        <User size={20} className="text-primary" />
                                    </div>
                                    <div>
                                        <h2>Personal Information</h2>
                                        <p>Update your personal details</p>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={updateProfile}>
                                        <div className="form-group-modern">
                                            <label>Full Name</label>
                                            <div className="input-with-icon">
                                                <User size={18} className="input-icon-inner" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="modern-input"
                                                    value={profileData.name}
                                                    onChange={handleProfileChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group-modern">
                                            <label>Email Address</label>
                                            <div className="input-with-icon">
                                                <Mail size={18} className="input-icon-inner" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    className="modern-input"
                                                    value={profileData.email}
                                                    onChange={handleProfileChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group-modern">
                                            <label>Phone Number</label>
                                            <div className="input-with-icon">
                                                <Phone size={18} className="input-icon-inner" />
                                                <input
                                                    type="tel"
                                                    className="modern-input"
                                                    value={profileData.phone || ''}
                                                    disabled={true}
                                                    style={{ opacity: 0.7, cursor: 'not-allowed', backgroundColor: '#f1f5f9' }}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-action-right">
                                            <button type="submit" className="btn btn-primary">
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* SECTION 2: Children Management */}
                        {activeTab === 'children' && (
                            <div className="settings-card fade-in">
                                <div className="card-header-clean">
                                    <div className="header-icon bg-green-light">
                                        <Baby size={20} className="text-green" />
                                    </div>
                                    <div className="header-text-flex">
                                        <div>
                                            <h2>My Children</h2>
                                            <p>Manage family health profiles</p>
                                        </div>
                                        <button
                                            className="btn-add-child"
                                            onClick={() => setShowAddChild(!showAddChild)}
                                        >
                                            <Plus size={16} /> Add Child
                                        </button>
                                    </div>
                                </div>

                                <div className="card-body">
                                    {/* Add Child Form */}
                                    {showAddChild && (
                                        <form onSubmit={addChild} className="add-child-form fade-in">
                                            <h4 className="form-sub-title">New Child Profile</h4>

                                            {/* Photo Upload */}
                                            <div className="profile-upload-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                <div
                                                    className="photo-preview"
                                                    style={{
                                                        width: '80px', height: '80px', borderRadius: '50%',
                                                        background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        overflow: 'hidden', border: '2px solid #cbd5e1', marginBottom: '0.5rem'
                                                    }}
                                                >
                                                    {childData.photo ? (
                                                        <img src={childData.photo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <User size={32} color="#94a3b8" />
                                                    )}
                                                </div>
                                                <label className="btn-text btn-sm" style={{ cursor: 'pointer', color: '#0ea5e9', fontWeight: '600' }}>
                                                    Upload Photo
                                                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                                </label>
                                            </div>

                                            <div className="child-form-grid">

                                                <div className="child-form-row two-col">
                                                    <div className="form-group-modern">
                                                        <label>First Name</label>
                                                        <div className="input-with-icon">
                                                            <User size={16} className="input-icon-inner" />
                                                            <input
                                                                type="text" name="name" required
                                                                className="modern-input" placeholder="First Name"
                                                                value={childData.name} onChange={handleChildChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="form-group-modern">
                                                        <label>Last Name (Optional)</label>
                                                        <div className="input-with-icon">
                                                            <User size={16} className="input-icon-inner" />
                                                            <input
                                                                type="text" name="lastName"
                                                                className="modern-input" placeholder="Last Name"
                                                                value={childData.lastName || ''} onChange={handleChildChange}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="form-group-modern">
                                                    <label>Age (Years)</label>
                                                    <div className="input-with-icon">
                                                        <Baby size={16} className="input-icon-inner" />
                                                        <input
                                                            type="number" name="age" required
                                                            className="modern-input" placeholder="e.g. 5"
                                                            value={childData.age} onChange={handleChildChange}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="form-group-modern">
                                                    <label>Gender</label>
                                                    <div className="input-with-icon">
                                                        <User size={16} className="input-icon-inner" />
                                                        <select
                                                            name="gender" className="modern-input"
                                                            value={childData.gender} onChange={handleChildChange}
                                                        >
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="form-group-modern">
                                                    <label>Blood Group</label>
                                                    <div className="input-with-icon">
                                                        <Droplet size={16} className="input-icon-inner" />
                                                        <input
                                                            type="text" name="bloodGroup"
                                                            className="modern-input" placeholder="e.g. O+"
                                                            value={childData.bloodGroup} onChange={handleChildChange}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="form-group-modern">
                                                    <label>Weight (kg)</label>
                                                    <div className="input-with-icon">
                                                        <Activity size={16} className="input-icon-inner" />
                                                        <input
                                                            type="text" name="weight"
                                                            className="modern-input" placeholder="e.g. 18"
                                                            value={childData.weight} onChange={handleChildChange}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="form-group-modern">
                                                    <label>Height (cm)</label>
                                                    <div className="input-with-icon">
                                                        <Activity size={16} className="input-icon-inner" />
                                                        <input
                                                            type="text" name="height"
                                                            className="modern-input" placeholder="e.g. 110"
                                                            value={childData.height} onChange={handleChildChange}
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="form-action-right">
                                                <button type="button" className="btn-text" onClick={() => setShowAddChild(false)} style={{ marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                                <button type="submit" className="btn btn-green">Save Profile</button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Children List */}
                                    <div className="children-list-grid">
                                        {children.length === 0 && !showAddChild ? (
                                            <div className="empty-state-small">
                                                <p>No children added yet.</p>
                                            </div>
                                        ) : (
                                            children.map(child => (
                                                <div key={child._id} className="child-card">
                                                    <div className="child-card-header">
                                                        <div className="child-avatar">
                                                            {child.photo ? (
                                                                <img src={child.photo} alt={child.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                                            ) : (
                                                                getInitials(child.name)
                                                            )}
                                                        </div>
                                                        <div className="child-info-head">
                                                            <h4>{child.name}</h4>
                                                            <span className="child-meta">{child.gender}, {child.age} yrs</span>
                                                        </div>
                                                        <button onClick={() => deleteChild(child._id)} className="btn-icon-danger">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="child-stats">
                                                        <div className="stat-item">
                                                            <Droplet size={14} className="text-red" />
                                                            <span>{child.bloodGroup || '--'}</span>
                                                        </div>
                                                        <div className="stat-item">
                                                            <Activity size={14} className="text-blue" />
                                                            <span>{child.weight ? `${child.weight}kg` : '--'}</span>
                                                        </div>
                                                        <div className="stat-item">
                                                            <span>{child.height ? `${child.height}cm` : '--'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION 3: Security */}
                        {activeTab === 'security' && (
                            <div className="settings-card fade-in">
                                <div className="card-header-clean">
                                    <div className="header-icon bg-purple-light">
                                        <Lock size={20} className="text-purple" />
                                    </div>
                                    <div>
                                        <h2>Security</h2>
                                        <p>Manage your password and account security</p>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={changePassword}>
                                        <div className="form-group-modern">
                                            <label>Current Password</label>
                                            <div className="input-with-icon">
                                                <Lock size={18} className="input-icon-inner" />
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    className="modern-input"
                                                    placeholder="••••••••"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row-split">
                                            <div className="form-group-modern">
                                                <label>New Password</label>
                                                <div className="input-with-icon">
                                                    <Lock size={18} className="input-icon-inner" />
                                                    <input
                                                        type="password"
                                                        name="newPassword"
                                                        className="modern-input"
                                                        placeholder="New password"
                                                        value={passwordData.newPassword}
                                                        onChange={handlePasswordChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group-modern">
                                                <label>Confirm Password</label>
                                                <div className="input-with-icon">
                                                    <CheckCircle size={18} className="input-icon-inner" />
                                                    <input
                                                        type="password"
                                                        name="confirmNewPassword"
                                                        className="modern-input"
                                                        placeholder="Confirm password"
                                                        value={passwordData.confirmNewPassword}
                                                        onChange={handlePasswordChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-action-right">
                                            <button type="submit" className="btn btn-outline">
                                                Update Password
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
