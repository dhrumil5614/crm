import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { user, changePassword } = useAuth();
    const navigate = useNavigate();

    const isForced = user?.mustChangePassword;

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const result = await changePassword(
            isForced ? null : formData.currentPassword,
            formData.newPassword
        );

        if (result.success) {
            setMessage('Password changed successfully! Redirecting...');
            setTimeout(() => navigate('/dashboard'), 2000);
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <>
            {!isForced && <Navbar />}
            <div className="container">
                <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
                    <div className="card-header">
                        <h2 className="card-title">
                            {isForced ? '⚠️ Password Change Required' : 'Change Password'}
                        </h2>
                    </div>

                    <div className="card-content">
                        {isForced && (
                            <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
                                You must change your password before accessing the system.
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {!isForced && (
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        placeholder="Enter current password"
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Enter new password (min. 6 characters)"
                                    minLength="6"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm new password"
                                    minLength="6"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{ width: '100%', marginTop: '1rem' }}
                            >
                                {loading ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChangePassword;
