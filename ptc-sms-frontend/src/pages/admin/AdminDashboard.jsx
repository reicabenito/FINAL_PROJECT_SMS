// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/AdminDashboard.css';

// Recharts for bar chart
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth(); // user context
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    participationRate: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [participationData, setParticipationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Fetch dashboard stats
        const statsRes = await api.get('/reports/stats');
        setStats(statsRes.data);

        // 2️⃣ Fetch recent events
        const eventsRes = await api.get('/admin/events/all');
        setRecentEvents(eventsRes.data.slice(0, 5)); // show last 5 events

        // 3️⃣ Fetch participation data
        const participationRes = await api.get('/reports/event-participation');
        setParticipationData(participationRes.data.map(event => ({
          name: event.event_name,
          participants: event.participants
        })));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="admin-dashboard">Loading Dashboard Data...</div>;
  if (error) return <div className="admin-dashboard error-message">{error}</div>;

  return (
    <div className="admin-dashboard">
      {/* 1️⃣ Welcome Message */}
      <h1 className="admin-welcome-title">
        Welcome, {user?.role === 'admin' ? 'Admin' : user.full_name}!
      </h1>
      <p className="admin-subtitle">System Overview and Latest Activities</p>

      {/* 2️⃣ Stats Cards */}
      <div className="stats-cards-grid">
        <div className="stat-card">
          <Users size={32} className="stat-icon icon-users" />
          <div className="stat-info">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{stats.totalStudents}</span>
          </div>
        </div>

        <div className="stat-card">
          <Calendar size={32} className="stat-icon icon-events" />
          <div className="stat-info">
            <span className="stat-label">Total Events</span>
            <span className="stat-value">{stats.totalEvents}</span>
          </div>
        </div>

        <div className="stat-card">
          <Calendar size={32} className="stat-icon icon-upcoming" />
          <div className="stat-info">
            <span className="stat-label">Upcoming Events</span>
            <span className="stat-value">{stats.upcomingEvents}</span>
          </div>
        </div>

        <div className="stat-card">
          <TrendingUp size={32} className="stat-icon icon-rate" />
          <div className="stat-info">
            <span className="stat-label">Participation Rate</span>
            <span className="stat-value">{stats.participationRate}%</span>
          </div>
        </div>
      </div>

      {/* 3️⃣ Dashboard Panels */}
      <div className="dashboard-panels-grid">

        {/* Recent Activity */}
        <section className="dashboard-panel">
          <h2 className="panel-title">Recent Activity</h2>
          <div className="activity-list">
            {recentEvents.length === 0 ? (
              <p>No recent events posted.</p>
            ) : (
              recentEvents.map(event => (
                <div key={event.event_id} className="activity-item">
                  <span className="activity-badge badge-event">Event</span>
                  <p className="activity-details">{event.title}</p>
                  <Link to="/admin/events" className="activity-link">
                    {new Date(event.event_date).toLocaleString()} <ChevronRight size={16} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Participation Trends */}
        <section className="dashboard-panel">
          <h2 className="panel-title">Participation Trends</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={participationData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="participants" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
          <Link to="/admin/reports" className="btn-view-reports">View Full Reports</Link>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
