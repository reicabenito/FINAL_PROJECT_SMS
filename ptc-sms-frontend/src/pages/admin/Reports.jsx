// src/pages/admin/Reports.jsx
import React from 'react';
import { FileText, Download } from 'lucide-react'; 
import '../../styles/AdminTable.css'; // Use shared admin styles

const Reports = () => {
  return (
    <div className="admin-page">
      <div className="page-header-flex">
        <h1 className="page-title">System Reports and Analytics</h1>
        <button className="btn-primary" onClick={() => alert('Generating PDF report...')}>
          <Download size={20} /> Export All Data
        </button>
      </div>
      
      <div className="admin-table-container" style={{ padding: '2rem' }}>
        <p>This page features key analytics and report generation tools.</p>
        <ul style={{ marginTop: '1rem', listStyle: 'disc', marginLeft: '2rem' }}>
            <li>Student Engagement (Chart)</li>
            <li>Event Popularity (Chart)</li>
            <li>Report Generation:</li>
            <li style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                <FileText size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Attendance Report by Event
            </li>
            <li style={{ marginLeft: '1rem' }}>
                <FileText size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Participation Summary by Department
            </li>
        </ul>
        <div style={{ padding: '2rem', border: '1px dashed #4b5563', textAlign: 'center', marginTop: '1.5rem' }}>
            Data Visualization Placeholder (Charts and Graphs)
        </div>
      </div>
    </div>
  );
};

export default Reports; 