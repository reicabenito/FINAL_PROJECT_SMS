// ptc-sms-frontend/src/pages/admin/AdminAnnouncements.jsx

import React, { useEffect, useState } from 'react';
import { Megaphone, Trash2, Edit } from 'lucide-react';
import '../../styles/AdminTable.css';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AdminAnnouncements = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Modal states ---
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: ''
  });

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
const formatDate = (datetime) => {
  if (!datetime) return "";
  return datetime.slice(0, 19); // take only YYYY-MM-DD HH:MM:SS
};


  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Delete announcement
  const handleDelete = async (announcement_id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await api.delete(`/announcements/${announcement_id}`);
      setAnnouncements(announcements.filter(a => a.announcement_id !== announcement_id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete announcement.');
    }
  };

  // Open modal to edit announcement
  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
  title: announcement.title,
  content: announcement.content,
  date: new Date(announcement.date_time).toISOString().slice(0,16) // "YYYY-MM-DDTHH:MM" for input
});

    setEditModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateAnnouncement = async () => {
  try {
    const formattedDate = new Date(formData.date).toISOString().slice(0, 19).replace("T", " ");

    await api.put(`/announcements/${editingAnnouncement.announcement_id}`, {
      title: formData.title,
      content: formData.content,
      date_time: formattedDate
    });

    setAnnouncements(prev =>
      prev.map(a =>
        a.announcement_id === editingAnnouncement.announcement_id
          ? { ...a, ...formData, date_time: formattedDate }
          : a
      )
    );

    setEditModalOpen(false);
    setEditingAnnouncement(null);
  } catch (err) {
    console.error('Update error:', err);
    alert('Failed to update announcement.');
  }
};


  return (
    <div className="admin-page">
      <div className="page-header-flex">
        <h1 className="page-title">Manage Announcements</h1>
        <button className="btn-primary" onClick={() => navigate('/admin/announcements/create')}>
          <Megaphone size={20} /> Post New Announcement
        </button>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <p>Loading...</p>
        ) : announcements.length === 0 ? (
          <p>No announcements found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Content</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a.announcement_id}>
                  <td>{a.announcement_id}</td>
                  <td>{a.title}</td>
                  <td>{a.content}</td>
<td>
  {a.date_time 
    ? new Date(a.date_time).toLocaleString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }) 
    : "No date set"}
</td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEdit(a)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn-icon btn-delete" onClick={() => handleDelete(a.announcement_id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- Edit Modal --- */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content edit-modal">
            <h2>Edit Announcement</h2>
            <label>
              Title:
              <input type="text" name="title" value={formData.title} onChange={handleFormChange} />
            </label>
            <label>
              Content:
              <textarea name="content" value={formData.content} onChange={handleFormChange} />
            </label>
            <label>
              Date:
              <input type="datetime-local" name="date" value={formData.date} onChange={handleFormChange} />
            </label>
            <div className="modal-buttons">
              <button className="btn-primary" onClick={handleUpdateAnnouncement}>Save</button>
              <button className="btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
