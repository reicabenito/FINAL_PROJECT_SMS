// src/pages/admin/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import { Trash2, PlusCircle, RotateCcw, RefreshCcw, KeyRound } from 'lucide-react';
import '../../styles/AdminTable.css';
import api from '../../services/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [newUserData, setNewUserData] = useState({
    full_name: '',
    email: '',
    student_id: '',
    department: '',
    role: 'student'
  });

  // Handle form changes
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({ ...prev, [name]: value }));
  };

  // Handle create student
  const handleAddUser = async () => {
    if (!newUserData.full_name || !newUserData.email || !newUserData.student_id) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      await api.post('/admin/users', newUserData);

      alert("Student account created successfully! Login credentials were emailed automatically.");

      setAddModalOpen(false);
      setNewUserData({
        full_name: '',
        email: '',
        student_id: '',
        department: '',
        role: 'student'
      });

      fetchUsers();
    } catch (err) {
      console.error("Add user error:", err);
      alert("Failed to create user. Check console.");
    }
  };

  // Fetch user list
 // Fetch user list
const fetchUsers = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await api.get('/admin/users');

    // FILTER ONLY STUDENTS
    const studentsOnly = response.data.filter(user => user.role === 'student');

    setUsers(studentsOnly);
  } catch (err) {
    console.error("Error fetching users:", err);
    setError("Failed to load users.");
  } finally {
    setLoading(false);
  }
};






  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  const handleDelete = async (userId, fullName) => {
    if (!window.confirm(`Delete user "${fullName}"?`)) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      alert(`${fullName} deleted successfully.`);
      fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      alert("Failed to delete user.");
    }
  };

  // Reset password
  const handleResetPassword = async (userId, fullName) => {
    if (!window.confirm(`Reset password for ${fullName}?`)) return;

    try {
      const response = await api.put(`/admin/users/${userId}/reset-password`);
      alert(
        `Temporary password for ${fullName}:\n${response.data.tempPassword}\n\nIt was also automatically emailed to the student.`
      );
    } catch (err) {
      console.error("Reset password error:", err);
      alert("Failed to reset password.");
    }
  };

  if (loading) return <div className="admin-page">Loading users...</div>;
  if (error) return <div className="admin-page error-message">{error}</div>;

  return (
    <div className="admin-page">
      <div className="page-header-flex">
        <h1 className="page-title">Manage System Accounts</h1>
        <button className="btn-primary" onClick={() => setAddModalOpen(true)}>
          <PlusCircle size={20} /> Add New User
        </button>
      </div>

      <div className="admin-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.student_id || "N/A"}</td>
                <td>{user.full_name}</td>
                <td>{user.department || "N/A"}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge status-${user.role}`}>
                    {user.role.toUpperCase()}
                  </span>
                </td>

                <td className="action-cell">
  {/* Reset Password */}
  <button
    onClick={() => handleResetPassword(user.user_id, user.full_name)}
    className="btn-icon btn-edit"
    title="Reset Password"
  >
    <KeyRound size={18} />
  </button>

  {/* Delete */}
  <button
    onClick={() => handleDelete(user.user_id, user.full_name)}
    className="btn-icon btn-delete"
    title="Delete User"
  >
    <Trash2 size={18} />
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="btn-secondary" onClick={fetchUsers} style={{ marginTop: "1rem" }}>
        <RefreshCcw size={16} /> Refresh Data
      </button>

      {/* Add Student Modal */}
      {addModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content edit-modal">
            <h2>Create New Student Account</h2>

            <label>
              Full Name:
              <input type="text" name="full_name" value={newUserData.full_name} onChange={handleNewUserChange} />
            </label>

            <label>
              Email:
              <input type="email" name="email" value={newUserData.email} onChange={handleNewUserChange} />
            </label>

            <label>
              Student ID:
              <input type="text" name="student_id" value={newUserData.student_id} onChange={handleNewUserChange} />
            </label>

            <label>
              Department:
              <input type="text" name="department" value={newUserData.department} onChange={handleNewUserChange} />
            </label>

            <p style={{ marginTop: "0.3rem", fontSize: "0.85rem", color: "#555" }}>
              The system will automatically generate a password and send credentials to the student's email.
            </p>

            <div className="modal-buttons">
              <button className="btn-primary" onClick={handleAddUser}>Create Account</button>
              <button className="btn-secondary" onClick={() => setAddModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
