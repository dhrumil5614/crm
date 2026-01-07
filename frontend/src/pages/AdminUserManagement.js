import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import './AdminUserManagement.css'; // Import the new styles

const AdminUserManagement = () => {
    const { createUser } = useAuth();

    // Users List State
    const [users, setUsers] = useState([]);

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Form State (Create)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        campaign: 'New Sales'
    });

    // Form State (Edit)
    const [editFormData, setEditFormData] = useState({
        role: 'user',
        campaign: 'New Sales',
        password: '',
        mustChangePassword: false
    });

    // UI State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getUsers();
            setUsers(res.data.users);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setEditFormData({ ...editFormData, [e.target.name]: value });
    };

    const openCreateModal = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'user',
            campaign: 'New Sales'
        });
        setMessage({ type: '', text: '' });
        setIsCreateModalOpen(true);
    };

    const startEdit = (user) => {
        setEditingUser(user);
        setEditFormData({
            role: user.role,
            campaign: user.campaign || 'New Sales',
            password: '',
            mustChangePassword: user.mustChangePassword || false
        });
        setMessage({ type: '', text: '' });
    };

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setEditingUser(null);
        setMessage({ type: '', text: '' });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.updateUser(editingUser._id, editFormData);
            // Show success via alert for simplicity
            alert('User updated successfully');
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed');
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) {
            return;
        }
        try {
            await adminAPI.deleteUser(user._id);
            fetchUsers(); // Auto refresh
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        const result = await createUser(formData);

        if (result.success) {
            alert(`User ${formData.name} created successfully!`);
            closeModals();
            fetchUsers();
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    // Helper for initials
    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
    };

    return (
        <div className="admin-user-page">
            <Navbar />
            <div className="admin-user-container">
                {/* Header Section */}
                <div className="page-header">
                    <h1 className="page-title">Team Management</h1>
                    <button className="add-user-btn" onClick={openCreateModal}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Member
                    </button>
                </div>

                {/* Users Grid */}
                {loading && users.length === 0 ? (
                    <div className="loading-skeleton"></div>
                ) : (
                    <div className="users-grid">
                        {users.map(user => (
                            <div className="user-card" key={user._id}>
                                <div className="user-card-header">
                                    <div className="user-avatar-placeholder">
                                        {getInitials(user.name)}
                                    </div>
                                    <span className={`role-badge ${user.role}`}>
                                        {user.role}
                                    </span>
                                </div>

                                <div className="user-info">
                                    <h3>{user.name}</h3>
                                    <span className="user-email">{user.email}</span>
                                    {user.campaign && (
                                        <div className="campaign-tag">
                                            {user.campaign}
                                        </div>
                                    )}
                                </div>

                                <div className="card-actions">
                                    <button
                                        className="btn-icon-text btn-edit"
                                        onClick={() => startEdit(user)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-icon-text btn-delete"
                                        onClick={() => handleDeleteUser(user)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') closeModals() }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Add New Team Member</h2>
                            <button className="close-btn" onClick={closeModals}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="modal-body">
                                {message.text && (
                                    <div className={`toast-message toast-${message.type}`}>
                                        {message.text}
                                    </div>
                                )}
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>Full Name</label>
                                        <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                                    </div>
                                    <div className="input-group">
                                        <label>Email Address</label>
                                        <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
                                    </div>
                                    <div className="input-group">
                                        <label>Initial Password</label>
                                        <input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
                                    </div>
                                    <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label>Role</label>
                                            <select name="role" className="select-field" value={formData.role} onChange={handleChange}>
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label>Campaign</label>
                                            <select name="campaign" className="select-field" value={formData.campaign} onChange={handleChange}>
                                                <option value="New Sales">New Sales</option>
                                                <option value="CP sign Up">CP Sign Up</option>
                                                <option value="LG Retail">LG Retail</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModals}>Cancel</button>
                                <button type="submit" className="btn-submit">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') closeModals() }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Edit Member</h2>
                            <button className="close-btn" onClick={closeModals}>&times;</button>
                        </div>
                        <form onSubmit={handleUpdateUser}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label>Role</label>
                                            <select name="role" className="select-field" value={editFormData.role} onChange={handleEditChange}>
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label>Campaign</label>
                                            <select name="campaign" className="select-field" value={editFormData.campaign} onChange={handleEditChange}>
                                                <option value="New Sales">New Sales</option>
                                                <option value="CP sign Up">CP Sign Up</option>
                                                <option value="LG Retail">LG Retail</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ margin: '0.5rem 0', borderTop: '1px solid #e2e8f0' }}></div>

                                    <div className="input-group">
                                        <label>New Password (Optional)</label>
                                        <input type="text" name="password" className="input-field" value={editFormData.password} onChange={handleEditChange} placeholder="Set new password to reset" />
                                        <span className="helper-text">Leave blank to keep existing password</span>
                                    </div>

                                    <div className="checkbox-group">
                                        <input
                                            type="checkbox"
                                            id="forcePswChange"
                                            name="mustChangePassword"
                                            className="checkbox-visual"
                                            checked={editFormData.mustChangePassword}
                                            onChange={handleEditChange}
                                        />
                                        <label htmlFor="forcePswChange" style={{ marginBottom: 0, cursor: 'pointer' }}>
                                            Force password change on next login
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModals}>Cancel</button>
                                <button type="submit" className="btn-submit">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;
