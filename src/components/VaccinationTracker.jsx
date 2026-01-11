import React, { useState } from 'react';
import { CheckCircle, Circle, Syringe, Calendar, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const VACCINE_SCHEDULE = [
    { age: 'Birth', vaccines: ['BCG', 'OPV 0', 'Hep-B 1'] },
    { age: '6 Weeks', vaccines: ['DTwP 1', 'IPV 1', 'Hep-B 2', 'Hib 1', 'Rotavirus 1', 'PCV 1'] },
    { age: '10 Weeks', vaccines: ['DTwP 2', 'IPV 2', 'Hib 2', 'Rotavirus 2', 'PCV 2'] },
    { age: '14 Weeks', vaccines: ['DTwP 3', 'IPV 3', 'Hib 3', 'Rotavirus 3', 'PCV 3'] },
    { age: '6 Months', vaccines: ['OPV 1', 'Hep-B 3'] },
    { age: '9 Months', vaccines: ['MMR 1'] },
    { age: '9-12 Months', vaccines: ['Typhoid Conjugate'] },
    { age: '15 Months', vaccines: ['MMR 2', 'Varicella 1', 'PCV Booster'] },
    { age: '16-18 Months', vaccines: ['DTwP B1', 'IPV B1', 'Hib B1'] },
    { age: '18 Months', vaccines: ['Hep-A 1'] },
    { age: '2 Years', vaccines: ['Typhoid Booster'] },
    { age: '4-6 Years', vaccines: ['DTwP B2', 'OPV 3', 'Varicella 2', 'MMR 3'] },
];

const VaccinationTracker = ({ child, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [expandedAge, setExpandedAge] = useState(null); // Accordion state

    const isVaccineCompleted = (vaccineName) => {
        return child.vaccinations?.some(v => v.name === vaccineName && v.status === 'completed');
    };

    // Calculate Progress
    const totalVaccines = VACCINE_SCHEDULE.reduce((acc, slot) => acc + slot.vaccines.length, 0);
    const completedVaccines = child.vaccinations?.filter(v => v.status === 'completed').length || 0;
    const progressPercentage = Math.round((completedVaccines / totalVaccines) * 100);

    const toggleVaccine = async (vaccineName) => {
        if (loading) return;
        setLoading(true);

        const currentStatus = isVaccineCompleted(vaccineName);
        const newStatus = currentStatus ? 'pending' : 'completed';

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(
                `${import.meta.env.VITE_API_URL || 'https://pediatricsbackend-4hii.onrender.com'}/api/auth/child/${child._id}/vaccine`,
                { vaccineName, status: newStatus, dateGiven: new Date() },
                { headers: { 'x-auth-token': token } }
            );

            if (onUpdate) onUpdate(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update vaccination');
        } finally {
            setLoading(false);
        }
    };

    const toggleAccordion = (index) => {
        setExpandedAge(expandedAge === index ? null : index);
    };

    return (
        <div className="vaccine-tracker-container fade-in-up">
            <div className="tracker-header-premium">
                <div className="header-icon-box">
                    <ShieldCheck size={28} color="white" />
                </div>
                <div className="header-text">
                    <h3>Immunization Shield</h3>
                    <p>Standard Vaccination Schedule</p>
                </div>
                <div className="progress-circle">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                        <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="circle"
                            strokeDasharray={`${progressPercentage}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" className="percentage">{progressPercentage}%</text>
                    </svg>
                </div>
            </div>

            <div className="timeline-cards">
                {VACCINE_SCHEDULE.map((slot, index) => {
                    const allDone = slot.vaccines.every(v => isVaccineCompleted(v));
                    const isExpanded = expandedAge === index; // Only expand if clicked

                    return (
                        <div key={index} className={`timeline-card ${allDone ? 'all-done' : ''}`}>
                            <div className="card-header" onClick={() => toggleAccordion(index)}>
                                <div className="age-badge">{slot.age}</div>
                                <div className="status-indicator">
                                    {allDone ? <span className="text-green-600 flex items-center gap-1 text-xs font-bold"><CheckCircle size={14} /> Completed</span> : <span className="text-gray-400 text-xs">{slot.vaccines.length} Vaccines</span>}
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="vaccine-list">
                                    {slot.vaccines.map(v => {
                                        const completed = isVaccineCompleted(v);
                                        return (
                                            <div
                                                key={v}
                                                className={`vaccine-row ${completed ? 'completed' : ''}`}
                                                onClick={() => toggleVaccine(v)}
                                            >
                                                <div className="vaccine-info">
                                                    <span className="vaccine-name">{v}</span>
                                                </div>
                                                <div className={`checkbox-custom ${completed ? 'checked' : ''}`}>
                                                    {completed && <CheckCircle size={16} color="white" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <style>{`
                .vaccine-tracker-container {
                    background: white;
                    border-radius: 1.5rem;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
                    margin-top: 2rem;
                    overflow: hidden;
                    border: 1px solid #f3f4f6;
                }
                .tracker-header-premium {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    padding: 1.5rem;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .header-icon-box {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 0.75rem;
                    border-radius: 1rem;
                    backdrop-filter: blur(5px);
                }
                .header-text h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: white;
                }
                .header-text p {
                    margin: 0;
                    font-size: 0.85rem;
                    opacity: 0.9;
                }
                .progress-circle {
                    margin-left: auto;
                    width: 50px;
                    height: 50px;
                }
                .circular-chart {
                    display: block;
                    margin: 0 auto;
                    max-width: 100%;
                    max-height: 100%;
                }
                .circle-bg {
                    fill: none;
                    stroke: rgba(255,255,255,0.2);
                    stroke-width: 3.8;
                }
                .circle {
                    fill: none;
                    stroke: #4ade80;
                    stroke-width: 2.8;
                    stroke-linecap: round;
                    animation: progress 1s ease-out forwards;
                }
                .percentage {
                    fill: white;
                    font-family: sans-serif;
                    font-weight: bold;
                    font-size: 0.5em;
                    text-anchor: middle;
                }

                .timeline-cards {
                    padding: 1.5rem;
                    display: grid;
                    gap: 1rem;
                    background: #f9fafb;
                }
                .timeline-card {
                    background: white;
                    border-radius: 1rem;
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                    transition: all 0.2s;
                }
                .timeline-card:hover {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .timeline-card.all-done {
                    border-color: #dcfce7;
                    background: #f0fdf4;
                }
                .card-header {
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                }
                .age-badge {
                    background: #eff6ff;
                    color: #3b82f6;
                    padding: 0.25rem 0.75rem;
                    border-radius: 2rem;
                    font-weight: 600;
                    font-size: 0.85rem;
                }
                .all-done .age-badge {
                    background: #dcfce7;
                    color: #166534;
                }
                .status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #9ca3af;
                }

                .vaccine-list {
                    background: white;
                    border-top: 1px solid #f3f4f6;
                    padding: 0.5rem 0;
                }
                .vaccine-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.75rem 1.5rem;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .vaccine-row:hover {
                    background: #f9fafb;
                }
                .vaccine-name {
                    font-weight: 500;
                    color: #374151;
                    font-size: 0.95rem;
                }
                .vaccine-row.completed .vaccine-name {
                    color: #059669;
                    text-decoration: line-through; 
                    opacity: 0.7;
                }

                .checkbox-custom {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #d1d5db;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .checkbox-custom.checked {
                    background: #10b981;
                    border-color: #10b981;
                }
            `}</style>
        </div>
    );
};

export default VaccinationTracker;
