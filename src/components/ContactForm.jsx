import React, { useState } from 'react';
import { Send, User, Mail, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import './ContactForm.css';

const ContactForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '', rating: 5 });
    const [loading, setLoading] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('https://pediatricsbackend-4hii.onrender.com/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Thank you for your feedback!');
                setFormData({ name: '', email: '', message: '', rating: 5 });
            } else {
                toast.error('Failed to send message.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-form-container">
            <div className="form-header">
                <h3>Feedback</h3>
            </div>
            <form onSubmit={handleSubmit} className="contact-form">

                {/* Star Rating Section */}
                <div className="form-group text-center">
                    <label className="form-label mb-2">Your Rating</label>
                    <div className="star-rating-wrapper">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`star-btn ${star <= (hoverRating || formData.rating) ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, rating: star })}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <div className="input-wrapper">
                        <User size={18} className="input-icon" />
                        <input
                            type="text"
                            className="form-input"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter your name"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-wrapper">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            className="form-input"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Name@example.com"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Message</label>
                    <div className="input-wrapper textarea-wrapper">
                        <MessageSquare size={18} className="input-icon textarea-icon" />
                        <textarea
                            className="form-input"
                            rows="4"
                            required
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Please share your Feedback?"
                        ></textarea>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary form-submit-btn" disabled={loading}>
                    {loading ? 'Sending...' : <><Send size={18} /> Send Message</>}
                </button>
            </form>
        </div>
    );
};

export default ContactForm;
