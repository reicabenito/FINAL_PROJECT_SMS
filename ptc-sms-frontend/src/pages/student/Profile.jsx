// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Hash, BookOpen, Building } from 'lucide-react';
import api from '../../services/api';
import '../../styles/StudentProfile.css';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        password: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');

    // Load profile from backend on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/user/profile');
                setUser(res.data);
                setForm({
                    full_name: res.data.full_name,
                    email: res.data.email,
                    password: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } catch (err) {
                console.error('Error fetching profile', err);
            }
        };
        fetchProfile();
    }, [setUser]);

    if (!user) return <div className="profile-container">Loading Profile...</div>;

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleUpdateProfile = async () => {
        try {
            if (form.newPassword && form.newPassword !== form.confirmPassword) {
                setMessage("New passwords do not match!");
                return;
            }

            const payload = {
                full_name: form.full_name,
                email: form.email,
                password: form.password,
                newPassword: form.newPassword
            };

            const res = await api.put('/user/update-profile', payload);
            setUser(res.data);
            setEditing(false);
            setMessage("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.error || "Error updating profile.");
        }
    };

    return (
        <div className="profile-container">
            <h1 className="profile-header">My Profile</h1>

            <div className="profile-card">
                <div className="profile-icon-large">
                    <User size={64} />
                </div>
                {editing ? (
                    <div className="edit-profile-form">
                        <label>Name</label>
                        <input type="text" name="full_name" value={form.full_name} onChange={handleChange} />

                        <label>Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} />

                        <label>Current Password</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange} />

                        <label>New Password</label>
                        <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} />

                        <label>Confirm New Password</label>
                        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />

                        {message && <p className="form-message">{message}</p>}

                        <button className="edit-profile-btn" onClick={handleUpdateProfile}>Save Changes</button>
                        <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                ) : (
                    <>
                        <h2 className="profile-name">{user.full_name}</h2>
                        <p className="profile-role">{user.role.toUpperCase()} Account</p>
                        
                        <div className="profile-details-grid">
                            <div className="detail-item">
                                <Hash size={20} className="detail-icon" />
                                <span className="detail-label">Student ID:</span>
                                <span className="detail-value">{user.student_id || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <Mail size={20} className="detail-icon" />
                                <span className="detail-label">Email:</span>
                                <span className="detail-value">{user.email}</span>
                            </div>
                            <div className="detail-item">
                                <BookOpen size={20} className="detail-icon" />
                                <span className="detail-label">Department:</span>
                                <span className="detail-value">{user.department || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <Building size={20} className="detail-icon" />
                                <span className="detail-label">College/Sector:</span>
                                <span className="detail-value">{user.college || 'N/A'}</span>
                            </div>
                        </div>

                        <button className="edit-profile-btn" onClick={() => setEditing(true)}>Edit Profile</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;
