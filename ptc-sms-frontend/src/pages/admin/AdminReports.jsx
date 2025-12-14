// src/pages/admin/AdminReports.jsx
import React, { useState, useEffect } from 'react';
import { Download, BarChart2, Calendar, Users } from 'lucide-react';
import '../../styles/AdminTable.css';
import '../../styles/AdminDashboard.css'; // General admin styles
import api from '../../services/api';

const AdminReports = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);


  // --- Fetch Event Participation Data ---
  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Call the admin-only endpoint that returns event participation data
        const response = await api.get('/reports/event-participation');
        setReportData(response.data);    
       } catch (err) {
        setError('Failed to fetch event participation reports. Make sure your JWT and Admin role are correct.');
        console.error("Error fetching report:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  // --- Utility Function ---
  const formatDateTime = (datetimeString) => {
    if (!datetimeString) return 'N/A';
    const date = new Date(datetimeString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };
const handleViewParticipants = async (eventId) => {
  try {
    const response = await api.get(`/reports/event-participants/${eventId}`);
    setParticipants(response.data);
    setSelectedEvent(eventId);
    setShowModal(true);
  } catch (err) {
    console.error(err);
    alert("Failed to load participants");
  }
};



  // --- Calculate Participation Rate ---
  const calcParticipationRate = (participants, maxCapacity) => {
    if (!maxCapacity || maxCapacity === 0) return '0%';
    return ((participants / maxCapacity) * 100).toFixed(0) + '%';
  };
  
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';

  const headers = ['Event Name', 'Date & Time', 'Participants', 'Max Capacity', 'Participation Rate'];

  const rows = data.map(event => [
    event.event_name,
    formatDateTime(event.date_time),
    event.participants,
    event.max_capacity,
    calcParticipationRate(event.participants, event.max_capacity)
  ]);

  return [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
};

  // --- Can be Export AS A FILE ---
  const handleExport = () => {
  const csv = convertToCSV(reportData);
  if (!csv) {
    alert('No data to export!');
    return;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'event_participation_report.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  if (loading) return <div className="admin-page">Loading Event Participation Reports...</div>;
  if (error) return <div className="admin-page error-message">{error}</div>;

  return (
    <div className="admin-page">
      <div className="page-header-flex">
        <h1 className="page-title"><BarChart2 size={24} /> Event Participation Report</h1>
        <button className="btn-secondary" onClick={handleExport}>
          <Download size={20} /> Export to CSV
        </button>
      </div>

      <p className="admin-subtitle">Shows the number of participants, max capacity, and participation rate per event.</p>

      <div className="admin-table-container">
        <table className="data-table detailed-report">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Date & Time</th>
              <th className="count-col">Participants</th>
              <th className="count-col">Max Capacity</th>
              <th className="count-col">Participation Rate</th>
            </tr>
          </thead>
          <tbody>
  {reportData.map((event) => {
  console.log(event); // <-- check if participants exists
  return (
    <tr key={event.event_id}>
      <td>{event.event_name}</td>
      <td>{formatDateTime(event.date_time)}</td>
      <td className="count-col">
        <button onClick={() => handleViewParticipants(event.event_id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0
          }}
          title="View Participants"
        >
          <Users size={16} style={{ marginRight: '5px' }} /> 
          {event.participants ?? 0} {/* fallback to 0 */}
        </button>
      </td>
      <td className="count-col">{event.max_capacity}</td>
      <td className="count-col">{calcParticipationRate(event.participants, event.max_capacity)}</td>
    </tr>
  )
})}
</tbody>

        </table>

        {showModal && (
  <div className="modal-reports-overlay">
    <div className="modal-reports">
      <h2>Participants</h2>

      {participants.length === 0 ? (
        <p>No participants registered for this event.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Registered At</th>
            </tr>
          </thead>
          <tbody>
            {participants.map(p => (
              <tr key={p.attendance_id}>
                <td>{p.full_name}</td>
                <td>{p.email}</td>
                <td>{new Date(p.register_time).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        className="btn-reports-secondary"
        onClick={() => setShowModal(false)}>Close
      </button>
    </div>
  </div>
)}

      </div>

      {reportData.length === 0 && (
        <div className="no-events">No events found to generate a participation report.</div>
      )}
    </div>
  );
};

export default AdminReports;
