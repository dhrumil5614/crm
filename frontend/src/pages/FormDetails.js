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

    const formatMonth = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
                        <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <h3 style={{ margin: 0 }}>{form.customerName}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span className={`status-badge status-${form.status}`}>
                                        {form.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="card-content">
                            {/* Product & Source */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#666' }}>
                                    Product & Source
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <div><strong>Month:</strong> {formatMonth(form.month)}</div>
                                    <div><strong>Product:</strong> {form.product || 'N/A'}</div>
                                    <div><strong>Main Source:</strong> {form.mainSource || 'N/A'}</div>
                                    <div><strong>Lead ID:</strong> {form.leadId || 'N/A'}</div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#666' }}>
                                    Customer Information
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <div><strong>Company:</strong> {form.companyName || 'N/A'}</div>
                                    <div><strong>Mobile:</strong> {form.mobileNumber || 'N/A'}</div>
                                    <div><strong>Alt Number:</strong> {form.alternateNumber || 'N/A'}</div>
                                    <div><strong>Business Type:</strong> {form.businessType || 'N/A'}</div>
                                </div>
                            </div>

                            {/* Location */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#666' }}>
                                    Location
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <div><strong>City:</strong> {form.city || 'N/A'}</div>
                                    <div><strong>State:</strong> {form.state || 'N/A'}</div>
                                    <div><strong>Area:</strong> {form.areaName || 'N/A'}</div>
                                </div>
                            </div>

                            {/* Loan Details */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#666' }}>
                                    Loan Details
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <div><strong>Amount:</strong> {form.loanAmount ? `₹${form.loanAmount.toLocaleString()}` : 'N/A'}</div>
                                    <div><strong>Property Type:</strong> {form.propertyType || 'N/A'}</div>
                                </div>
                            </div>

                            {/* Admin / Lead Tracking Details - Visible for reference */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#666' }}>
                                    Lead Tracking & Admin Details
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <div><strong>Campaign:</strong> {form.campaign || 'N/A'}</div>
                                    <div><strong>Vertical:</strong> {form.leadCreatedVertical || 'N/A'}</div>
                                    <div><strong>Data Date:</strong> {form.dataReceivedDate ? new Date(form.dataReceivedDate).toLocaleDateString() : 'N/A'}</div>
                                    <div><strong>Assigned To:</strong> {form.assignedName || 'N/A'}</div>
                                    <div><strong>ASM Mobile:</strong> {form.asmMobileNumber || 'N/A'}</div>
                                    <div><strong>Admin Date:</strong> {form.adminDate ? new Date(form.adminDate).toLocaleDateString() : 'N/A'}</div>
                                    <div><strong>Best Dispo:</strong> {form.bestDispo || 'N/A'}</div>
                                    <div><strong>Lead Status:</strong> {form.leadStatus || 'N/A'}</div>
                                    <div><strong>Lead Category:</strong> {form.leadCategory || 'N/A'}</div>
                                    <div><strong>ASM Status:</strong> {form.asmStatus || 'N/A'}</div>
                                    <div><strong>ASM Remark:</strong> {form.asmRemark || 'N/A'}</div>
                                    <div><strong>In Future Month:</strong> {form.inFutureMonth || 'N/A'}</div>
                                </div>
                            </div>

                            {/* Agent Remarks */}
                            {form.agentRemarks && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#666' }}>
                                        Agent Remarks
                                    </h4>
                                    <p style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '4px' }}>{form.agentRemarks}</p>
                                </div>
                            )}

                            {/* Submission Info */}
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee', color: '#888', fontSize: '0.9rem' }}>
                                <p>Submitted by {form.agentName} on {new Date(form.submissionDate).toLocaleString()}</p>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                <button onClick={handleExport} className="btn-primary">
                                    Export to Excel
                                </button>
                                <button
                                    onClick={() => setShowReminderModal(true)}
                                    style={{ background: '#f39c12', color: 'white', padding: '0.7rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Set Reminder
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3>Remarks History</h3>

                        <div className="filter-section" style={{ margin: '1rem 0', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={dateFilter.startDate}
                                    onChange={handleDateFilterChange}
                                    style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                                <span>to</span>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={dateFilter.endDate}
                                    onChange={handleDateFilterChange}
                                    style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={applyDateFilter} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Filter</button>
                                <button onClick={() => {
                                    setDateFilter({ startDate: '', endDate: '' });
                                    fetchRemarks(); // Reset filter
                                }} style={{ padding: '0.5rem 1rem', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
                            </div>
                        </div>

                        <div className="remarks-list" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem' }}>
                            {remarks.length === 0 ? (
                                <p>No remarks found.</p>
                            ) : (
                                remarks.map((remark, index) => (
                                    <div key={index} style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid #eee',
                                        backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>{remark.senderName} ({remark.senderRole})</span>
                                            <span>{new Date(remark.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p style={{ margin: 0, color: '#333' }}>{remark.message}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handleAddRemark} style={{ marginTop: '1.5rem' }}>
                            <textarea
                                value={newRemark}
                                onChange={(e) => setNewRemark(e.target.value)}
                                placeholder="Add a new remark..."
                                style={{ width: '100%', minHeight: '100px', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
                            />
                            <button type="submit" disabled={!newRemark.trim()} className="btn-primary" style={{ marginTop: '1rem' }}>
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
