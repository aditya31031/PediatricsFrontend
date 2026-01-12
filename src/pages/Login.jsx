import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Stethoscope, Activity } from 'lucide-react';
import './Auth.css';
import Footer from '../components/Footer';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(formData.email, formData.password);
        if (result.success) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } else {
            setError(result.error || 'Login failed');
        }
    };

    return (
        <div className="login-split-wrapper">
            {/* Left Side: Animated Image & Content */}
            <div className="login-image-side">
                <div className="login-bg-animate"></div>
                <div className="login-image-overlay">
                    <div className="overlay-content-top">
                        <div className="brand-logo-glass">
                            <Stethoscope size={28} color="white" />
                        </div>
                        <span className="brand-name-glass">Dr. Sai Manohar</span>
                    </div>

                    <div className="overlay-content-bottom">
                        <div className="feature-pill">
                            <Activity size={16} />
                            <span>#1 Pediatric Care</span>
                        </div>
                        <h1>Modern healthcare<br />for your family.</h1>
                        <p className="hero-desc">Experience the future of medical management with our secure patient portal.</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="login-form-side">
                <div className="login-form-container fade-in-up1">
                    <div className="mobile-header">
                        <div className="brand-logo-mobile">
                            <Stethoscope size={24} color="white" />
                        </div>
                    </div>

                    <div className="form-header-attractive">
                        <h2>Welcome Back!</h2>
                    </div>

                    {error && <div className="attractive-alert-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="attractive-form">
                        <div className="attractive-group">
                            <label>Email Address</label>
                            <div className="attractive-input-wrapper">
                                <Mail size={20} className="attractive-icon" />
                                <input
                                    type="email"
                                    className="attractive-input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div className="attractive-group">
                            <label>Password</label>
                            <div className="attractive-input-wrapper">
                                <Lock size={20} className="attractive-icon" />
                                <input
                                    type="password"
                                    className="attractive-input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <div className="attractive-options">
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </div>

                        <button type="submit" className="btn-attractive">
                            Sign In <ArrowRight size={20} />
                        </button>
                    </form>

                    <div className="attractive-footer">
                        <p>New here? <Link to="/register">Create an account</Link></p>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;
