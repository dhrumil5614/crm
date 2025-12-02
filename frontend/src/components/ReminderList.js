import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formsAPI } from '../services/api';

const ReminderList = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const response = await formsAPI.getReminders();
            setReminders(response.data.reminders || []);
        } catch (err) {
            setError('Failed to load reminders');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleComplete = async (id) => {
        try {
            await formsAPI.markReminderComplete(id);
            // Refresh reminders to get updated sort order
            fetchReminders();
        } catch (err) {
            alert('Failed to update reminder');
            console.error(err);
        }
    };

    const handleViewForm = (id) => {
        navigate(`/forms/${id}`);
    };

    const isOverdue = (dateTime) => {
        return new Date(dateTime) < new Date();
    };

    const isToday = (dateTime) => {
        const today = new Date();
        const reminderDate = new Date(dateTime);
        return today.toDateString() === reminderDate.toDateString();
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getReminderStyle = (reminder) => {
        if (reminder.reminder.isCompleted) {
            return {
                backgroundColor: '#f5f5f5',
                borderLeft: '4px solid #95a5a6',
                opacity: 0.7
            };
        }
        if (isOverdue(reminder.reminder.dateTime)) {
            return {
                backgroundColor: '#fee',
                borderLeft: '4px solid #e74c3c'
            };
        }
        if (isToday(reminder.reminder.dateTime)) {
            return {
                backgroundColor: '#fffbea',
                borderLeft: '4px solid #f39c12'
            };
        }
        return {
            backgroundColor: '#eafaf1',
            borderLeft: '4px solid #27ae60'
        };
    };

    if (loading) {
        return (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
                <p>Loading reminders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '1rem', color: '#e74c3c' }}>
                <p>{error}</p>
            </div>
        );
    }

    if (reminders.length === 0) {
        return null; // Don't show anything if no reminders
    }

    return (
        <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
                📅 Reminders & Notifications ({reminders.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {reminders.map((reminder) => (
                    <div
                        key={reminder._id}
                        style={{
                            ...getReminderStyle(reminder),
                            padding: '1rem',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {/* Checkbox */}
                        <input
                            type="checkbox"
                            checked={reminder.reminder.isCompleted}
                            onChange={() => handleToggleComplete(reminder._id)}
                            style={{
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer'
                            }}
                        />

                        {/* Reminder Content */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                {/* Indicator */}
                                {!reminder.reminder.isCompleted && (
                                    <span style={{ fontSize: '1.2rem' }}>
                                        {isOverdue(reminder.reminder.dateTime) ? '🔴' : isToday(reminder.reminder.dateTime) ? '🟡' : '🟢'}
                                    </span>
                                )}

                                {/* Date/Time */}
                                <strong style={{
                                    color: '#2c3e50',
                                    textDecoration: reminder.reminder.isCompleted ? 'line-through' : 'none'
                                }}>
                                    {formatDateTime(reminder.reminder.dateTime)}
                                </strong>

                                {/* Customer Name */}
                                <span style={{ color: '#7f8c8d' }}>
                                    - {reminder.customerName}
                                </span>
                            </div>

                            {/* Message */}
                            {reminder.reminder.message && (
                                <p style={{
                                    margin: '0.25rem 0 0 0',
                                    color: '#34495e',
                                    fontSize: '0.9rem',
                                    textDecoration: reminder.reminder.isCompleted ? 'line-through' : 'none'
                                }}>
                                    {reminder.reminder.message}
                                </p>
                            )}
                        </div>

                        {/* View Form Button */}
                        <button
                            onClick={() => handleViewForm(reminder._id)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            View Form
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReminderList;
