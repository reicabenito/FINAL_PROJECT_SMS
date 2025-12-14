import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/Modal.css';
import '../../styles/AdminTable.css';
import '../../styles/CreatEvent.css';
import '../../styles/CreateAnnouncement.css';

const CreateAnnouncement = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [dateTime, setDateTime] = useState('');   // 🔥 NEW
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!title || !content || !dateTime) {
    setError('Title, Content, and Date & Time are required.');
    return;
  }

  // Convert datetime-local to MySQL DATETIME format
  const formattedDate = dateTime.replace('T', ' ') + ':00'; // 2025-06-26T05:00 → 2025-06-26 05:00:00

  try {
    await api.post('/announcements', {
      title,
      content,
      priority,
      date_time: formattedDate
    });

    alert('Announcement created successfully!');
    navigate('/admin/announcements');
  } catch (err) {
    console.error(err);
    setError('Error creating announcement.');
  }
};





  return (
    <div className="admin-page">
      <h1 className="page-title">Create New Announcement</h1>

      <form className="event-form" onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}

        <label>
          Title *
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label>
          Content *
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </label>

        <label>
          Date & Time *
  <input
    type="datetime-local"
    value={dateTime}
    onChange={(e) => setDateTime(e.target.value)}
    required
          />
        </label>

        <label>
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>
        </label>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Posting...' : 'Post Announcement'}
        </button>
      </form>
    </div>
  );
};

export default CreateAnnouncement;
