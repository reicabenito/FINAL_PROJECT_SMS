// src/pages/admin/CreateEvent.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/Modal.css';
import '../../styles/AdminTable.css';
import '../../styles/CreatEvent.css';


const CreateEvent = () => {
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [status, setStatus] = useState('Active'); // default active
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [maxCapacity, setMaxCapacity] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !eventDate || !location) {
      setError('Title, Date, and Location are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/events', {
  title,
  description,
  date: eventDate,
  time, // add a time input field in your form
  location,
  organizer,
  status,
  max_capacity: maxCapacity ? Number(maxCapacity) : 0
});

      alert('Event created successfully!');
      navigate('/admin/events'); // redirect to ManageEvents
    } catch (err) {
      console.error('Create event error:', err);
      setError(err.response?.data?.error || 'Server error while creating event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <h1 className="page-title">Create New Event</h1>

      <form className="event-form" onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}

        <label>
          Title *
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            required
          />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event description"
          />
        </label>

        <label>
          Event Date *
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </label>

        <label>
          Location *
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Event location"
            required
          />
        </label>

        <label>
          Max Capacity *
          <input
           type="number" 
           value={maxCapacity} 
           onChange={(e) => setMaxCapacity(e.target.value)}

           placeholder="Max Capacity"
           
          />
        </label>

        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </label>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
