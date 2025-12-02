import React, { useState } from 'react';
import { formsAPI } from '../services/api';

const StatusDropdown = ({ formId, currentStatus, onUpdate }) => {
    const [status, setStatus] = useState(currentStatus || 'Active');
    const [updating, setUpdating] = useState(false);

    const statuses = ['Active', 'Loss', 'Meeting', 'Communication', 'Login'];

    const statusColors = {
        'Active': '#27ae60',
        'Loss': '#e74c3c',
        'Meeting': '#3498db',
        'Communication': '#f39c12',
        'Login': '#9b59b6'
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        setUpdating(true);

        try {
            await formsAPI.updateProgressStatus(formId, newStatus);
            if (onUpdate) onUpdate(newStatus);
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status');
            // Revert on error
            setStatus(currentStatus);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <select
            value={status}
            onChange={handleStatusChange}
            disabled={updating}
            style={{
                padding: '0.5rem 0.75rem',
                border: '2px solid ' + statusColors[status],
                borderRadius: '5px',
                backgroundColor: statusColors[status] + '20',
                color: statusColors[status],
                fontWeight: 'bold',
                cursor: updating ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.3s ease'
            }}
        >
            {statuses.map((s) => (
                <option key={s} value={s}>
                    {s}
                </option>
            ))}
        </select>
    );
};

export default StatusDropdown;
