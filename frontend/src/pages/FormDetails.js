import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SetReminderModal from '../components/SetReminderModal';
import { formsAPI } from '../services/api';

const FormDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [remarks, setRemarks] = useState([]);
    const [newRemark, setNewRemark] = useState('');
    const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
    const [showReminderModal, setShowReminderModal] = useState(false);

    useEffect(() => {
        fetchFormDetails();
        fetchRemarks();
    }, [id]);

    const fetchFormDetails = async () => {
        try {
            const response = await formsAPI.getById(id);
            setForm(response.data.form);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch form details');
        } finally {
            setLoading(false);
        }
    };

    const fetchRemarks = async () => {
        try {
            const { startDate, endDate } = dateFilter;
            const params = {};
            if (startDate && endDate) {
                params.startDate = startDate;
                params.endDate = endDate;
            }
            const response = await formsAPI.getRemarks(id, params);
            setRemarks(response.data.data);
        } catch (err) {
            console.error('Failed to fetch remarks', err);
        }
    };

    const handleAddRemark = async (e) => {
        e.preventDefault();
        if (!newRemark.trim()) return;

        try {
            await formsAPI.addRemark(id, { message: newRemark });
            setNewRemark('');
            fetchRemarks();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add remark');
        }
    };

    const handleExport = async () => {
        try {
            const response = await formsAPI.exportForm(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `form-${id}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Failed to export form');
        }
    };

    const handleDateFilterChange = (e) => {
        setDateFilter({ ...dateFilter, [e.target.name]: e.target.value });
    };

    const applyDateFilter = () => {
        fetchRemarks();
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-error">{error}</div>;
    if (!form) return <div>Form not found</div>;

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="dashboard">
                    <div className="dashboard-header">
                        <h2>Form Details</h2>
                        <button onClick={() => navigate(-1)}>Back</button>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3>{form.customerName}</h3>
                            <span className={`status-badge status-${form.status}`}>
                                {form.status.toUpperCase()}
                            </span>
                        </div>
                        <div className="card-content">
                            <p><strong>Mobile:</strong> {form.mobileNumber}</p>
                            <p><strong>Loan Type:</strong> {form.loanType}</p>
                            <p><strong>Interested:</strong> {form.interestedStatus}</p>
                            <p><strong>Agent:</strong> {form.agentName}</p>
                            <p><strong>Date:</strong> {new Date(form.submissionDate).toLocaleDateString()}</p>

                            <div style={{ marginTop: '1rem' }}>
                                <button onClick={handleExport} className="btn-primary" style={{ marginRight: '0.5rem' }}>
                                    Export to Excel
                                </button>
                                <button
                                    onClick={() => setShowReminderModal(true)}
                                    style={{ background: '#f39c12', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Set Reminder
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3>Remarks</h3>

                        <div className="filter-section" style={{ margin: '1rem 0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input
                                type="date"
                                name="startDate"
                                value={dateFilter.startDate}
                                onChange={handleDateFilterChange}
                            />
                            <span>to</span>
                            <input
                                type="date"
                                name="endDate"
                                value={dateFilter.endDate}
                                onChange={handleDateFilterChange}
                            />
                            <button onClick={applyDateFilter}>Filter</button>
                            <button onClick={() => {
                                setDateFilter({ startDate: '', endDate: '' });
                                fetchRemarks(); // Reset filter
                            }}>Reset</button>
                        </div>

                        <div className="remarks-list" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem' }}>
                            {remarks.length === 0 ? (
                                <p>No remarks found.</p>
                            ) : (
                                remarks.map((remark, index) => (
                                    <div key={index} style={{
                                        padding: '0.5rem',
                                        borderBottom: '1px solid #eee',
                                        backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
                                            <span>{remark.senderName} ({remark.senderRole})</span>
                                            <span>{new Date(remark.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p style={{ margin: '0.5rem 0' }}>{remark.message}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handleAddRemark}>
                            <textarea
                                value={newRemark}
                                onChange={(e) => setNewRemark(e.target.value)}
                                placeholder="Add a remark..."
                                style={{ width: '100%', minHeight: '80px', padding: '0.5rem' }}
                            />
                            <button type="submit" disabled={!newRemark.trim()} style={{ marginTop: '0.5rem' }}>
                                Add Remark
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Set Reminder Modal */}
            {showReminderModal && (
                <SetReminderModal
                    formId={id}
                    customerName={form.customerName}
                    onClose={() => setShowReminderModal(false)}
                    onSuccess={() => {
                        setShowReminderModal(false);
                        fetchFormDetails();
                    }}
                />
            )}
        </>
    );
};

export default FormDetails;
