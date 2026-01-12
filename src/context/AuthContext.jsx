import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Production URL (Render)
    const BASE_URL = 'https://pediatricsbackend-4hii.onrender.com';

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Optimistic UI: Load from storage first if available
                    const savedUser = JSON.parse(localStorage.getItem('user'));
                    if (savedUser) setUser(savedUser);

                    // Then verify with server for fresh data
                    // Add timestamp to prevent caching
                    const res = await fetch(`${BASE_URL}/api/auth/me?t=${new Date().getTime()}`, {
                        headers: { 'x-auth-token': token }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        // Only update if data is different or if it was the initial load
                        if (JSON.stringify(data) !== JSON.stringify(savedUser)) {
                            setUser(data);
                            localStorage.setItem('user', JSON.stringify(data));
                            // Only show toast if data actually changed significantly (avoid spam)
                            // But for now, let's log it to verify
                            console.log("Profile synced with server");
                        } else {
                            setUser(data); // Ensure state is consistency
                        }
                    } else {
                        // If token invalid, clear everything
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                } catch (error) {
                    console.error("Auth check failed", error);
                    // Don't clear immediately on network error, keep stale data
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Login failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const register = async (name, email, password, phone, otp) => {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone, otp }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Registration failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const sendOtp = async (phone) => {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Failed to send OTP');
            return { success: true, message: data.msg };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const updateUser = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading, sendOtp }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
