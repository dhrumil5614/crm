import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

const AdminUserManagement = () => {
    const { createUser } = useAuth();

    // Users List State
    const [users, setUsers] = useState([]);

    // Form State (Create)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        campaign: 'New Sales'
    });

    // Edit State
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({
        role: 'user',
        campaign: 'New Sales'
    });

    // UI State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await adminAPI.getUsers();
            setUsers(res.data.users);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEditChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };

    const startEdit = (user) => {
        setEditingUser(user);
        setEditFormData({
            role: user.role,
            campaign: user.campaign || 'New Sales',
            password: '', // New password field
            mustChangePassword: user.mustChangePassword || false
        });
        // Clear create form messages
        setMessage({ type: '', text: '' });
    };

    const cancelEdit = () => {
        setEditingUser(null);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.updateUser(editingUser._id, editFormData);
            setMessage({ type: 'success', text: 'User updated successfully' });
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) {
            return;
        }
        try {
            await adminAPI.deleteUser(user._id);
            setMessage({ type: 'success', text: 'User deleted successfully' });
            fetchUsers();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Delete failed' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (formData.password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            setLoading(false);
            return;
        }

        const result = await createUser(formData);

        if (result.success) {
            setMessage({ type: 'success', text: `User ${formData.name} created successfully! Email sent to ${formData.email}.` });
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'user',
                campaign: 'New Sales'
            });
            fetchUsers();
        } else {
            setMessage({ type: 'error', text: result.message });
        }
        setLoading(false);
    };

    return (
        <>
            <Navbar />
            <div className="container">
                {/* Create User Card */}
                <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
                    <div className="card-header">
                        <h2 className="card-title">Create New User</h2>
                    </div>

                    <div className="card-content">
                        {message.text && (
                            <div className={`alert alert-${message.type}`} style={{ marginBottom: '1rem' }}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="user@example.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min. 6 characters"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="form-control"
                                >
                                    <option value="user">Standard User</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Campaign</label>
                                <select
                                    name="campaign"
                                    value={formData.campaign || 'New Sales'}
                                    onChange={handleChange}
                                    className="form-control"
                                >
                                    <option value="New Sales">New Sales (Default)</option>
                                    <option value="CP sign Up">CP Sign Up</option>
                                    <option value="LG Retail">LG Retail</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{ gridColumn: 'span 2' }}
                            >
                                {loading ? 'Creating...' : 'Create User'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Users List Card */}
                <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
                    <div className="card-header">
                        <h2 className="card-title">Manage Users ({users.length})</h2>
                    </div>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Campaign</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>{user.campaign || '-'}</td>
                                        <td>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => startEdit(user)}
                                                style={{ marginRight: '0.5rem' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeleteUser(user)}
                                                style={{ background: '#e74c3c', color: 'white', border: 'none' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit User Modal */}
                {editingUser && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div className="card" style={{ width: '400px', padding: '1rem' }}>
                            <h3>Edit {editingUser.name}</h3>
                            <form onSubmit={handleUpdateUser}>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        name="role"
                                        value={editFormData.role}
                                        onChange={handleEditChange}
                                        className="form-control"
                                    >
                                        <option value="user">Standard User</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Campaign</label>
                                    <select
                                        name="campaign"
                                        value={editFormData.campaign}
                                        onChange={handleEditChange}
                                        className="form-control"
                                    >
                                        <option value="New Sales">New Sales</option>
                                        <option value="CP sign Up">CP Sign Up</option>
                                        <option value="LG Retail">LG Retail</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>New Password (Optional)</label>
                                    <input
                                        type="text" // Visible text so admin can see what they are setting
                                        name="password"
                                        value={editFormData.password}
                                        onChange={handleEditChange}
                                        placeholder="Set new password"
                                        minLength="6"
                                        className="form-control"
                                    />
                                    <small style={{ color: '#666' }}>Leave empty to keep current password</small>
                                </div>
                                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        name="mustChangePassword"
                                        checked={editFormData.mustChangePassword}
                                        onChange={(e) => setEditFormData({ ...editFormData, mustChangePassword: e.target.checked })}
                                        id="forcePswChange"
                                    />
                                    <label htmlFor="forcePswChange" style={{ marginBottom: 0 }}>Force Password Change on Next Login</label>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn btn-primary">Update</button>
                                    <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminUserManagement;
