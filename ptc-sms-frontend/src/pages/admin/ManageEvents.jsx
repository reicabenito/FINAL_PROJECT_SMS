import React, { useState, useEffect } from 'react';
import { Edit, Trash2, PlusCircle, Users, QrCode } from 'lucide-react';
import '../../styles/AdminTable.css';
import api from '../../services/api';
// Assuming QRCodeDisplay is not used, as we are displaying the image directly in modal, but keeping the import
import QRCodeDisplay from '../../components/QRCodeDisplay'; 
import { useNavigate } from 'react-router-dom';

const initialNewEventState = {
  eventName: '',
  date: '',
  time: '',
  location: '',
  maxCapacity: '',
  description: '',
  status: 'Active', 
};

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    // Resolve with the Base64 string part after 'data:image/...;base64,'
    reader.onload = () => resolve(reader.result.split(',')[1]); 
    reader.onerror = error => reject(error);
  });

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();

  const [newEvent, setNewEvent] = useState(initialNewEventState);
  const [isCreating, setIsCreating] = useState(false);
  
  // State for displaying the QR image
  const [activeEvent, setActiveEvent] = useState(null); 
  const [qrLoading, setQrLoading] = useState(false);

  // State for the QR upload modal
  const [showQrUpload, setShowQrUpload] = useState(false);
  const [qrTargetEvent, setQrTargetEvent] = useState(null);

  
  // --- Data Fetching ---

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      // NOTE: This endpoint should return a reference (like a filename or true) 
      // in event.qr_image if an image exists, NOT the full base64 string.
      const response = await api.get('/admin/events/all');
      setEvents(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch events list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQrCodeData = async (event) => {
    setQrLoading(true);
    try {
      // New backend endpoint to fetch ONLY the QR image data (Base64)
      const response = await api.get(`/events/${event.event_id}/qr`);
      
      const base64Data = response.data.qr_image; // Assuming backend returns { qr_image: "base64data" }

      // Update the specific event in the main state with the full base64 data for display
      setEvents(prevEvents =>
        prevEvents.map(ev =>
          ev.event_id === event.event_id
            ? { ...ev, qr_image: base64Data } 
            : ev
        )
      );
      
      // Set the active event to open and display the modal
      setActiveEvent({ ...event, qr_image: base64Data });

    } catch (err) {
      console.error('Failed to fetch QR image:', err);
      alert('Failed to retrieve QR image.');
      setActiveEvent(null); // Close modal on failure
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // --- QR Handlers ---

  const handleQrClick = (event) => {
    if (event.qr_image) {
      // If the event has a qr_image reference, fetch the data and display modal
      fetchQrCodeData(event);
    } else {
      // Otherwise, open upload dialog
      setQrTargetEvent(event);
      setShowQrUpload(true);
    }
  };

  const handleUploadQr = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("qr_image", file);

      // Upload to backend
      await api.put(`/events/${qrTargetEvent.event_id}/qr`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("QR image successfully uploaded!");

      // 💥 CRUCIAL FIX: Re-fetch events to get the database-synced state
      await fetchEvents();

      setShowQrUpload(false);
      setQrTargetEvent(null); // Reset target
      
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    }
  };

  const handleDeleteQr = async (event) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;

    try {
      await api.delete(`/events/${event.event_id}/qr`);

      // Update state locally (remove the qr_image reference)
      setEvents(prevEvents =>
        prevEvents.map(ev =>
          ev.event_id === event.event_id ? { ...ev, qr_image: null } : ev
        )
      );

      setActiveEvent(null); // Close modal
      alert("Photo successfully deleted!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete photo.");
    }
  };


  // --- Event Management Handlers ---

  const handleNewEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: name === "maxCapacity" ? Number(value) : value
    }));
  };

  const handleCreateNewEvent = async (e) => {
    e.preventDefault();
    setIsCreating(true); 

    const payload = {
      title: newEvent.eventName,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      organizer: 'Admin',
      status: newEvent.status || 'Active',
      max_capacity: newEvent.maxCapacity || 0
    };

    try {
      await api.post('/events', payload);
      alert('Event created successfully!');
      setNewEvent(initialNewEventState); // reset form
      await fetchEvents();
    } catch (err) {
      console.error('Create event error:', err);
      alert('Failed to create event: ' + err.response?.data?.error || err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to delete event: ${eventTitle}?`)) return;

    try {
      await api.delete(`/admin/events/${eventId}`);
      alert(`Event "${eventTitle}" successfully deleted.`);
      fetchEvents();
    } catch (err) {
      alert(`Failed to delete event: ${err.response?.data?.error || 'Server error.'}`);
      console.error(err);
    }
  };

  const handleEdit = (event) => {
    // API returns event_date as 'YYYY-MM-DD HH:MM:SS'
    const [datePart, timePart] = (event.event_date || "").split(' '); 

    setEditEvent({
      ...event,
      // API payload uses 'title' for event name, frontend form uses 'eventName'
      title: event.title || event.eventName || "",
      date: datePart || "",
      time: timePart ? timePart.slice(0, 5) : "00:00", // Format to HH:MM
    });
  };
  
  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const payload = {
        title: editEvent.title || "",
        description: editEvent.description || "",
        date: editEvent.date,
        time: editEvent.time,
        location: editEvent.location || "",
        status: editEvent.status || "Active",
        max_capacity: editEvent.max_capacity ? Number(editEvent.max_capacity) : 0,
      };

      await api.put(`/events/${editEvent.event_id}`, payload);
      alert("Event updated successfully!");
      setEditEvent(null);
      await fetchEvents(); // refresh table
    } catch (err) {
      console.error("Update event error:", err.response || err);
      alert("Failed to update event: " + (err.response?.data?.error || err.message));
    } finally {
      setIsUpdating(false);
    }
  };

  // The generateQrToken and handleRefreshQr functions are not used/needed based on the logic provided
  // const generateQrToken = () => { ... };
  // const handleRefreshQr = () => { ... };

  if (loading) return <div className="admin-page">Loading event data...</div>;
  if (error) return <div className="admin-page error-message">{error}</div>;

  return (
    <div className="admin-page">
      <h1 className="page-title">Manage Events</h1>
      {/* --- Create New Event Section --- */}
      <div className="create-event-section-wrapper">
        <h2>Create New Event</h2>
        <form className="create-event-form" onSubmit={handleCreateNewEvent}>
          <div className="form-row">
            <label>
              Event Name:
              <input
                type="text"
                name="eventName"
                value={newEvent.eventName || ''}
                onChange={handleNewEventChange}
                placeholder="AIIMStiem"
                required
              />
            </label>
            <label>
              Date:
              <input
                type="date"
                name="date"
                value={newEvent.date || ''}
                onChange={handleNewEventChange}
                required
              />
            </label>
            <label>
              Time:
              <input
                type="time"
                name="time"
                value={newEvent.time || ''}
                onChange={handleNewEventChange}
                required
              />
            </label>
            <label>
              Status:
              <select
                name="status"
                value={newEvent.status || 'Active'}
                onChange={handleNewEventChange}
                required
              >
                <option value="Active">Active</option>
                <option value="TBA">TBA</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>Location:
              <input
                type="text"
                name="location"
                value={newEvent.location || ''}
                onChange={handleNewEventChange}
                required
              />
            </label>
          </div>

          <div className="form-row-full">
            <label className="label-half">
              Max Capacity:
              <input
                type="number"
                name="maxCapacity"
                value={newEvent.maxCapacity || ''}
                onChange={handleNewEventChange}
              />
            </label>
            <label className="label-half">
              Description:
              <textarea
                name="description"
                value={newEvent.description || ''}
                onChange={handleNewEventChange}
                placeholder="Detailed description of the event..."
              />
            </label>
          </div>

          <label>
            Event Image (Students Only):
            <input
              type="file"
              accept="image/*"
              name="image"
              // NOTE: This file input is currently ignored by handleCreateNewEvent (which uses JSON payload)
              // If you need to upload event image on creation, you must change handleCreateNewEvent to use FormData.
              onChange={(e) => setNewEvent(prev => ({ ...prev, image: e.target.files[0] }))}
            />
          </label>

          <button type="submit" className="btn-primary create-btn" disabled={isCreating}>
            <PlusCircle size={20} /> {isCreating ? 'Creating...' : 'Create New Event'}
          </button>
        </form>
      </div>

      <hr />

      {/* --- Modals for Upload and Edit --- */}
      
      {showQrUpload && qrTargetEvent && (
        <div className="modal-overlay" onClick={() => setShowQrUpload(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Upload QR for **{qrTargetEvent.title}**</h3>
            <input type="file" accept="image/*" onChange={handleUploadQr} />
            <button onClick={() => setShowQrUpload(false)}>Close</button>
          </div>
        </div>
      )}

      {editEvent && (
        <div className="modal-overlay" onClick={() => setEditEvent(null)}>
          <div className="modal-content edit-modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Event</h2>
            <form onSubmit={handleUpdateEvent} className="edit-event-form">

              <div className="form-group">
                <label>Event Name:</label>
                <input
                  type="text"
                  value={editEvent.title || ''}
                  onChange={e => setEditEvent({ ...editEvent, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={editEvent.date}
                  onChange={e => setEditEvent({ ...editEvent, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Time:</label>
                <input
                  type="time"
                  value={editEvent.time}
                  onChange={e => setEditEvent({ ...editEvent, time: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  value={editEvent.location || ''}
                  onChange={e => setEditEvent({ ...editEvent, location: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status:</label>
                <select
                  value={editEvent.status || 'Active'}
                  onChange={e => setEditEvent({ ...editEvent, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                  <option value="TBA">TBA</option>
                </select>
              </div>

              <div className="form-group">
                <label>Max Capacity:</label>
                <input type="number" value={editEvent.max_capacity || ''}
                  onChange={e => setEditEvent({ ...editEvent, max_capacity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={editEvent.description || ''}
                  onChange={e => setEditEvent({ ...editEvent, description: e.target.value })}
                />
              </div>

              <div className="edit-actions">
                <button type="button" onClick={() => setEditEvent(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- Main Event List Table --- */}

      <div className="page-header-flex">
        <h1 className="page-title">List of Current Events</h1>
      </div>
      
      <div className="admin-table-container">
        <div className="filter-row">
          <span>Filter by Status: **All**</span>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Event Name</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.event_id}>
                <td>{event.event_id}</td>
                <td>{event.title}</td>
                <td>{new Date(event.event_date).toLocaleDateString()}</td>
                <td><span className={`status-badge status-${event.status.toLowerCase()}`}>{event.status}</span></td>
                <td className="action-cell">
                  {event.status === 'Active' && (
                    <button 
                      onClick={() => handleQrClick(event)} 
                      className="btn-icon btn-qr" 
                      title={event.qr_image ? "View QR Code" : "Upload QR Code"}
                    >
                      <QrCode size={18} />
                    </button>
                  )}

                  <button onClick={() => handleEdit(event)} className="btn-icon btn-edit" title="Edit Event">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(event.event_id, event.title)} className="btn-icon btn-delete" title="Delete Event">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* --- QR Code Display/Delete Modal --- */}

      {activeEvent && (
        <div className="modal-overlay" onClick={() => setActiveEvent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{activeEvent.title} - Uploaded QR</h3>
            {qrLoading ? (
              <p>Loading QR image...</p>
            ) : activeEvent.qr_image ? (
              <img
                // The `activeEvent.qr_image` is the base64 string fetched from the server
                src={`data:image/png;base64,${activeEvent.qr_image}`}
                alt="Uploaded QR"
                style={{ width: "200px", height: "200px", marginBottom: "15px" }}
              />
            ) : (
              <p>QR Image not found.</p>
            )}
            <div className="modal-buttons">
              <button onClick={() => setActiveEvent(null)} className="btn-secondary">Close</button>
              <button onClick={() => handleDeleteQr(activeEvent)} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;