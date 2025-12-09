import React, { useState } from 'react';
import { formsAPI, adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SetReminderModal = ({ formId, customerName, onClose, onSuccess }) => {
    const [dateTime, setDateTime] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!dateTime) {
            setError('Please select a date and time');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Use appropriate API based on user role
            const api = isAdmin ? adminAPI : formsAPI;
            await api.setReminder(formId, {
                dateTime,
                message
            });

            alert('Reminder added successfully!');
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Set reminder error:', err);
            alert(err.response?.data?.message || 'Failed to add reminder');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '10px',
                    maxWidth: '500px',
                    width: '90%',
                    padding: '2rem',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
                    Set Reminder
                </h2>

                <p style={{ marginBottom: '1.5rem', color: '#7f8c8d' }}>
                    Customer: <strong>{customerName}</strong>
                </p>

                {error && (
                    <div style={{
                        padding: '0.75rem',
                        background: '#fee',
                        color: '#e74c3c',
                        borderRadius: '5px',
                        marginBottom: '1rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                            Date & Time *
                        </label>
                        <input
                            type="datetime-local"
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                            Message (Optional)
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Add a reminder message..."
                            rows="3"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#95a5a6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                fontSize: '1rem'
                            }}
                        >
                            {loading ? 'Setting...' : 'Set Reminder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SetReminderModal;
