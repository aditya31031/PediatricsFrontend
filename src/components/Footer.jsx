import React from 'react';
import { Phone, MapPin, Clock, Heart } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-section">
                    <h3>Dr. Sai Manohar</h3>
                    <p className="tagline">Trusted pediatric care for a brighter future.</p>
                </div>
                <div className="footer-section">
                    <h4>Contact & Location</h4>
                    <p><Phone size={16} /> +91 98765 43210</p>
                    <p><MapPin size={16} /> Sahakaranagar, Bangalore</p>
                </div>
                <div className="footer-section">
                    <h4>Clinic Hours</h4>
                    <p><Clock size={16} /> Mon - Sat: 09:05 AM - 01:00 PM</p>
                    <p className="ml-icon">& 04:00 PM - 07:45 PM</p>
                    <p className="closed"><Clock size={16} /> Sunday: Closed</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>Made with <Heart size={14} fill="red" color="red" style={{ verticalAlign: 'middle' }} /> in Bangalore</p>
                <p>&copy; {new Date().getFullYear()} Dr. Sai Manohar Pediatrician Clinic.</p>
            </div>
        </footer>
    );
};

export default Footer;
