import React, { useState, useEffect } from 'react';
import { formsAPI } from '../services/api';

const ReminderActionModal = ({ reminder, formId, isLegacy, onClose, onUpdate }) => {
    const [status, setStatus] = useState(reminder.status || (reminder.isCompleted ? 'completed' : 'pending'));
    const [message, setMessage] = useState(reminder.message || '');
    const [newDate, setNewDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (status === 'rescheduled') {
            const current = new Date(reminder.dateTime);
            current.setDate(current.getDate() + 1);
            setNewDate(current.toISOString().slice(0, 16));
        }
    }, [status, reminder.dateTime]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLegacy || reminder.isLegacy) {
                if (status === 'rescheduled') {
                    await formsAPI.setReminder(formId, { dateTime: newDate, message: message });
                    await formsAPI.markReminderComplete(formId);
                } else if (status === 'completed') {
                    await formsAPI.markReminderComplete(formId);
                }
            } else {
                const updateData = { status, message };
                if (status === 'rescheduled') {
                    updateData.dateTime = newDate;
                }
                await formsAPI.updateReminderStatus(formId, reminder.reminderId || reminder._id, updateData);
            }
            onUpdate();
            onClose();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to update reminder';
            setError(errorMsg);
            console.error('Reminder update error:', err);
            console.error('Error details:', err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>✨ Update Reminder</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {error && <div className="alert alert-error">{error}</div>}

                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1.25rem',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        border: '1px solid #e9ecef'
                    }}>
                        <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#7f8c8d', marginBottom: '0.5rem', fontWeight: '600' }}>
                            Current Reminder
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>📅</span> {formatDate(reminder.dateTime)}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
                            Set by: <span style={{ color: '#2c3e50', fontWeight: '500' }}>{reminder.setByName || 'Unknown'}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="form-control" // Assuming form-control exists or I should add it, but inputs have styles in index.css under .form-group input/select
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '1rem',
                                    backgroundColor: 'white',
                                    cursor: 'pointer'
                                }}
                                disabled={reminder.isCompleted && reminder.status !== 'rescheduled' && !reminder.status}
                            >
                                <option value="pending">⏳ Pending</option>
                                <option value="completed">✅ Completed</option>
                                <option value="incomplete">❌ Incomplete</option>
                                <option value="rescheduled">📅 Reschedule</option>
                            </select>
                        </div>

                        {status === 'rescheduled' && (
                            <div className="form-group" style={{ animation: 'fadeIn 0.3s ease' }}>
                                <label>New Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '1rem'
                                    }}
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Message / Note</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows="3"
                                placeholder="Add a note or update message..."
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '1rem',
                                    resize: 'vertical',
                                    minHeight: '100px'
                                }}
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn-secondary">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    padding: '0.75rem 2rem',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                    transition: 'transform 0.2s',
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReminderActionModal;
