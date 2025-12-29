import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const AdminUserManagement = () => {
    const { createUser } = useAuth();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });

    // UI State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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
                role: 'user'
            });
        } else {
            setMessage({ type: 'error', text: result.message });
        }
        setLoading(false);
    };

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
                    <div className="card-header">
                        <h2 className="card-title">Create New User</h2>
                    </div>

                    <div className="card-content">
                        {message.text && (
                            <div className={`alert alert-${message.type}`} style={{ marginBottom: '1rem' }}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
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
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <option value="user">Standard User</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{ width: '100%', marginTop: '1rem' }}
                            >
                                {loading ? 'Creating...' : 'Create User'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminUserManagement;
