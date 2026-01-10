import React, { useEffect, useState } from 'react';
import BookingContainer from '../components/Booking/BookingContainer';
import ContactForm from '../components/ContactForm';
import Gallery from '../components/Gallery';
import { Calendar, ShieldCheck, HeartPulse, Stethoscope, Baby, Syringe, Star, Quote, ChevronDown, ChevronUp } from 'lucide-react';
import './Home.css';

const heroImg = '/hero_image.png'; // Updated to use copied file

const doctorImg = '/doctor_profile.png'; // Will copy this soon

const testimonials = [
    {
        name: "Anil Kumar C",
        verified: true,
        date: "4 months ago",
        tags: ["Treatment satisfaction"],
        text: "Not giving proper guidance from front end employee,i went client as my son having 104 degree fever but without checking kid temperature doctor given medicine, after asking y temperature not checked then they are given thermameter. Disappointed with the doctor he is not giving time to explain the health condition",
        recommend: false
    },
    {
        name: "Naveen S Murthy", verified: true, date: "4 years ago", tags: ["Doctor friendliness", "Explanation of the health issue", "Treatment satisfaction", "Value for money", "Wait time"],
        text: "Dr. Sai Manohar is a great person first and also a great Doctor. Firstly he clearly and politely explains in as many words as required and gives precise treatment. His WhatsApp and on call suggestions are accurate so far for us from past 7 years. He never demands us to visit him unless a physical examination is needed. He is a humble person and maintains a humble staff.",
        recommend: true
    },
    {
        name: "Swati Sharma", verified: true, date: "a year ago", tags: ["Doctor friendliness", "Explanation of the health issue", "Treatment satisfaction", "Value for money"],
        text: "I'm so grateful to have found such a fantastic pediatrician for my child! ... but also incredibly patient and kind. He takes the time to explain everything clearly and answer all my questions thoroughly, which puts him at ease as a parent. Overall, I can't recommend Dr Sai highly enough.",
        recommend: true
    },
    {
        name: "Verified Patient", verified: true, date: "8 years ago", tags: ["Explanation of the health issue (Hoped for better)"],
        text: "I had a really bad experience on my first visit. Firstly the receptionist he is not at all professional n impolite... Secondly the Doctor came in to look at my daughter problem, I felt he is little pleasant and unfriendly for kiddos might be because he is in hurry... Finally a shrink to pocket, they charged me 900rs for 5 min.",
        recommend: false
    },
    {
        name: "Ganapati V. S.", verified: true, date: "8 years ago", tags: ["Explanation of the health issue", "Treatment satisfaction", "Doctor friendliness", "Value for money"],
        text: "We have been going for treatment for my daughter to Dr. Sai Manohar since last 3 years. He never immediately gives Antibiotics for viral cough/fever but starts with other medicines by which it normally cures. Contrary to what has been written here he charges reasonable fees. There will always be heavy rush which itself indicates that he is very popular.",
        recommend: true
    },
    {
        name: "Sathyaveer V Raghavan", verified: true, date: "8 years ago", tags: ["Explanation of the health issue", "Treatment satisfaction", "Doctor friendliness"],
        text: "We have been visiting Dr. Sai Manohar for over two years now. He is an excellent doctor, both recommending grandma's remedies when necessary, and also being updated with the Pediatric advances. No matter how much tension I go with, he puts me at ease, and also explains the cause of symptoms.",
        recommend: true
    },
    {
        name: "Katherine", verified: true, date: "9 years ago", tags: [],
        text: "She is 10 years and I haven't found any doctor as efficient as him. Since his clinic is far, I had tried some other nearby doctors but every time i ended up going back to Dr.Sai Manohar. He listens to the problems, he answers all your questions. He is very busy these days and hence its difficult to get appointments at your preferred timing.",
        recommend: true
    },
    {
        name: "Swati Bajaj", verified: true, date: "9 years ago", tags: [],
        text: "My little one is just 4 months old and got stomach infection. Initially I was sceptical regarding my visit to dr sai manohar after reading the reviews. But i would recommend this doctor to everyone. He listens to all your problems and then prescribes medicine. One suggestion. If you take an appointment prior to your visit, your waiting time will be less.",
        recommend: true
    },
    {
        name: "Padma G Rajan", verified: true, date: "7 years ago", tags: ["Doctor friendliness", "Explanation of the health issue", "Treatment satisfaction", "Value for money"],
        text: "I have been going to the doctor from almost 11plus years. He is obviously busy now that his work load hasn’t increased but his hold on his area is perfect. Thanks to him .. my children have had a happy healthy childhood. All my relatives and friends coming from abroad have also made a quick trip to his place.",
        recommend: true
    },
    {
        name: "Raksha Hegde", verified: true, date: "a year ago", tags: ["Doctor friendliness"],
        text: "Doctor Sai Manohar is a great human being and a expert in his field. He has a healing magical touch and prescribes the right treatment for our kids. My kid is 16 yrs old but we still prefer and wait for hours to let only Dr Sai Manohar see him. He undercharges than the market. He gives the same attention and is very humble to all classes of people.",
        recommend: true
    }
];

const Home = () => {
    const [showAll, setShowAll] = useState(false);
    const [realReviews, setRealReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch('https://pediatricsbackend-4hii.onrender.com/api/reviews');
                const data = await res.json();
                setRealReviews(data);
            } catch (err) {
                console.error("Error fetching reviews", err);
            }
        };
        fetchReviews();
    }, []);

    const scrollToBooking = () => {
        document.getElementById('book-appointment').scrollIntoView({ behavior: 'smooth' });
    };

    // Format real reviews to match testimonial structure
    const formattedRealReviews = realReviews.map(review => ({
        name: review.name,
        verified: true,
        date: new Date(review.date).toLocaleDateString(),
        tags: ["Patient Feedback"],
        text: review.message,
        rating: review.rating || 5 // Include rating
    }));

    const allTestimonials = [...formattedRealReviews, ...testimonials];
    const displayedTestimonials = showAll ? allTestimonials : allTestimonials.slice(0, 3);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container hero-content">
                    <div className="hero-text fade-in">
                        <div className="badge">
                            <ShieldCheck size={16} /> Trusted Pediatric Care
                        </div>
                        <h1>Expert Healthcare for<br /> <span className="highlight-text">Your Child's Future</span></h1>
                        <p>Dr. Sai Manohar provides compassionate, evidence-based pediatric services in a modern, child-friendly environment. Schedule your consultation today.</p>

                        <div className="hero-actions">
                            <button className="btn btn-primary" onClick={scrollToBooking}>
                                <Calendar size={18} /> Book Appointment
                            </button>
                            <button className="btn btn-outline" onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}>
                                <HeartPulse size={18} /> Our Services
                            </button>
                        </div>

                        <div className="stats-row">
                            <div className="stat">
                                <strong>10k+</strong>
                                <span>Happy Kids</span>
                            </div>
                            <div className="stat">
                                <strong>15+</strong>
                                <span>Years Exp.</span>
                            </div>
                            <div className="stat">
                                <strong>4.9</strong>
                                <span>Rating</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-image">
                        <img src={heroImg} alt="Modern Clinic Waiting Area" className="hero-img-real" />
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="services-section" id="services">
                <div className="container">
                    <div className="section-head text-center">
                        <h2>Comprehensive Services</h2>
                        <p>We provide holistic care for your child from infancy throughout adolescence.</p>
                    </div>

                    <div className="services-grid">
                        <div className="service-card">
                            <div className="service-icon"><Stethoscope size={24} /></div>
                            <h3>General Checkup</h3>
                            <p>Routine health examinations to monitor growth and development milestones.</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon"><Syringe size={24} /></div>
                            <h3>Vaccinations</h3>
                            <p>Complete immunization schedule tracking and safe administration.</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon"><Baby size={24} /></div>
                            <h3>Newborn Care</h3>
                            <p>Specialized attention for neonates including screening and feeding support.</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon"><HeartPulse size={24} /></div>
                            <h3>Emergency Care</h3>
                            <p>Priority attention for acute illnesses, fevers, and minor injuries.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Doctor Section */}
            <section className="about-section">
                <div className="container about-content">
                    <div className="about-img desktop-only">
                        <img src={doctorImg} alt="Dr. Sai Manohar" className="doctor-img" />
                    </div>
                    <div className="about-text">
                        <h2>Meet Dr. Sai Manohar</h2>
                        <p className="subtitle">MBBS, MD (Pediatrics) | 15+ Years Experience</p>
                        <p>Dr. Sai Manohar is a renowned pediatrician dedicated to the well-being of children. With over a decade of experience in top hospitals, he brings expertise in pediatric intensive care and developmental pediatrics.</p>
                        <p>He believes in a holistic approach to medicine, focusing not just on treating illness but on preventive care and family education.</p>
                        <ul className="achievements-list">
                            <li><Star size={16} fill="#fbbf24" color="#fbbf24" /> Gold Medalist in Pediatrics</li>
                            <li><Star size={16} fill="#fbbf24" color="#fbbf24" /> Member of Indian Academy of Pediatrics</li>
                            <li><Star size={16} fill="#fbbf24" color="#fbbf24" /> 10,000+ Successful Consultations</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Clinic Gallery Section */}
            <section className="gallery-section">
                <div className="container">
                    <div className="section-head text-center">
                        <h2>Our Clinic Tour</h2>
                        <p>A safe, hygienic, and child-friendly environment.</p>
                    </div>
                    <Gallery />
                </div>
            </section>





            {/* Booking Section - Moved slightly up for better conversion */}
            <section className="booking-section container" id="book-appointment">
                <BookingContainer />
            </section>

            {/* Contact & Location Section */}
            <section className="contact-section">
                <div className="container contact-content">
                    <div className="contact-left">
                        <ContactForm />
                    </div>
                    <div className="contact-right">
                        <div className="location-card">
                            <h2>Visit Us</h2>
                            <p className="location-desc">Easily accessible in the heart of HSR Layout.</p>

                            <div className="address-details">
                                <div className="detail-item">
                                    <div className="icon-box"><ShieldCheck size={18} /></div>
                                    <div>
                                        <strong>Sai Manohar Children's Clinic</strong>
                                        <p>HSR Layout, Bangalore</p>
                                    </div>
                                </div>
                            </div>

                            <a
                                href="https://www.google.com/maps/search/?api=1&query=Sai+Manohar+Children's+Clinic+HSR+Layout"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-map"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                Get Directions
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="container">
                    <div className="section-head text-center">
                        <h2>Patient Stories for Dr. Sai Manohar</h2>
                        <div className="stories-tags">
                            {['Children\'s Health', 'Fever', 'Paediatric care', 'PediatricVaccinations', 'Vaccination/Immunization', 'Childhood Infections'].map((topic, index) => (
                                <span key={index} className="story-tag">{topic}</span>
                            ))}
                        </div>
                    </div>

                    <div className="testimonials-grid">
                        {displayedTestimonials.map((review, i) => {
                            const initial = review.name.charAt(0).toUpperCase();
                            return (
                                <div key={i} className="testimonial-card">
                                    <div className="review-header">
                                        <div className="reviewer-profile">
                                            <div className="avatar-circle">{initial}</div>
                                            <div className="reviewer-info">
                                                <div className="name-row">
                                                    <strong>{review.name}</strong>
                                                    {review.verified && <span className="verified-badge">Verified</span>}
                                                </div>
                                                <span className="review-date">{review.date}</span>
                                            </div>
                                        </div>
                                        {/* Google Icon for trust if needed, or just keep simple */}
                                    </div>

                                    <div className="quote-badge">
                                        <Quote className="quote-icon-bg" size={24} />
                                    </div>

                                    {/* Star Rating Display */}
                                    {review.rating ? (
                                        <div className="rating-row mb-2" style={{ display: 'flex', gap: '2px' }}>
                                            {[...Array(5)].map((_, idx) => (
                                                <Star
                                                    key={idx}
                                                    size={16}
                                                    fill={idx < review.rating ? "#fbbf24" : "#e2e8f0"}
                                                    color={idx < review.rating ? "#fbbf24" : "#e2e8f0"}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        review.recommend !== undefined && (
                                            <div className={`recommend-row ${review.recommend ? 'yes' : 'no'}`}>
                                                {review.recommend ?
                                                    <><span className="thumb-icon">👍</span> Recommends</> :
                                                    <><span className="thumb-icon">👎</span> Does Not Recommend</>
                                                }
                                            </div>
                                        )
                                    )}

                                    {review.tags && review.tags.length > 0 && (
                                        <div className="review-tags">
                                            {review.tags.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className="review-tag-pill">{tag}</span>
                                            ))}
                                            {review.tags.length > 3 && <span className="more-tags">+{review.tags.length - 3} more</span>}
                                        </div>
                                    )}

                                    <p className="review-text">"{review.text.length > 150 ? review.text.substring(0, 150) + '...' : review.text}"</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center mt-5">
                        <button
                            className="btn btn-outline show-more-btn"
                            onClick={() => setShowAll(!showAll)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {showAll ? (
                                <>Show Less <ChevronUp size={18} /></>
                            ) : (
                                <>Show More <ChevronDown size={18} /></>
                            )}
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
