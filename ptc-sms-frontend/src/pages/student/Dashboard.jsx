import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, Bell, Calendar } from 'lucide-react';
import api from '../../services/api';

import StudentCheckIn from '../../components/StudentCheckIn';
import '../../styles/StudentDashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [participationRate, setParticipationRate] = useState(0);
    const [eventsAttended, setEventsAttended] = useState(0);
    const [announcements, setAnnouncements] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("You are not logged in");
            setLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            try {
                // Fetch registered events
                const eventsRes = await api.get('/student/registered-events', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEvents(eventsRes.data);

                // Fetch announcements
                const announcementsRes = await api.get('/student/announcements', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAnnouncements(announcementsRes.data);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="dashboard-container">Loading Dashboard...</div>;
    if (error) return <div className="dashboard-container error-message">{error}</div>;

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-welcome">Welcome back, {user.full_name}!</h1>
            <p className="dashboard-subtitle">Your quick summary and action items.</p>

            <div className="dashboard-grid">
                {/* 1. Primary Action: QR Check-in */}
                <div className="dashboard-section section-checkin">
                    <StudentCheckIn />
                </div>

                {/* 2. Participation Summary */}
                <div className="dashboard-section section-stats">
                    <h2 className="section-title"><TrendingUp size={20} /> My Participation Summary</h2>
                    <div className="stat-card-small">
                        <div
                            className="circular-progress"
                            style={{
                                background: `conic-gradient(#10b981 ${participationRate}%, #374151 0%)`
                            }}
                        >
                            <span className="progress-value">{participationRate}%</span>
                        </div>
                        <p className="stat-label">Overall Engagement Score</p>
                    </div>
                    <div className="stat-note">
                        <Calendar size={16} /> Attended {eventsAttended} Events this semester.
                    </div>

                    <div className="events-bar-summary">
                        <h3>Registered Events:</h3>
                        {events.length === 0 ? (
                            <p>No registered events yet.</p>
                        ) : (
                            <ul className="events-bar-list">
                                {events.map((ev) => (
                                    <li key={ev.id} className="event-bar-item">
                                        <span className="event-name">{ev.title}</span>
                                        <div className="event-bar">
                                            <div
                                                className="event-progress"
                                                style={{ width: `${ev.attendancePercentage || 0}%` }}
                                            ></div>
                                        </div>
                                        <span className="event-percent">{ev.attendancePercentage || 0}%</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* 3. Announcements */}
                <div className="dashboard-section section-announcements">
                    <h2 className="section-title"><Bell size={20} /> Latest Announcements</h2>
                    {announcements.length === 0 ? (
                        <p>No announcements at the moment.</p>
                    ) : (
                        <ul className="announcement-list">
                            {announcements.map((ann) => (
                                <li key={ann.announcement_id}>
                                    <strong>{ann.title}</strong> <em>({new Date(ann.created_at).toLocaleDateString()})</em>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
