import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FormDetailModal from '../components/FormDetailModal';
import SetReminderModal from '../components/SetReminderModal';
import { adminAPI } from '../services/api';

const AdminPending = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [reminderForm, setReminderForm] = useState(null);
  const [reviewComment, setReviewComment] = useState({});
  const [supervisorData, setSupervisorData] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingForms();
  }, []);

  const fetchPendingForms = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminAPI.getPendingForms();
      setForms(response.data.forms);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending forms');
    }

    setLoading(false);
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this form?')) {
      return;
    }

    try {
      const data = {
        reviewComment: reviewComment[id] || 'Approved',
        ...supervisorData[id]
      };
      await adminAPI.approveForm(id, data);
      fetchPendingForms();
      setReviewComment({ ...reviewComment, [id]: '' });
      setSupervisorData({ ...supervisorData, [id]: {} });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve form');
    }
  };

  const handleReject = async (id) => {
    const comment = reviewComment[id];
    if (!comment || comment.trim() === '') {
      alert('Please provide a reason for rejection');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this form?')) {
      return;
    }

    try {
      const data = {
        reviewComment: comment,
        ...supervisorData[id]
      };
      await adminAPI.rejectForm(id, data);
      fetchPendingForms();
      setReviewComment({ ...reviewComment, [id]: '' });
      setSupervisorData({ ...supervisorData, [id]: {} });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject form');
    }
  };

  const handleCommentChange = (id, value) => {
    setReviewComment({
      ...reviewComment,
      [id]: value,
    });
  };

  const handleSupervisorDataChange = (id, field, value) => {
    setSupervisorData({
      ...supervisorData,
      [id]: {
        ...supervisorData[id],
        [field]: value,
      },
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExportAll = async () => {
    try {
      const response = await adminAPI.exportAllForms();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `all-forms-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export forms');
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="dashboard">
          <div className="dashboard-header">
            <h2>Pending Approvals</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleExportAll} style={{ background: '#27ae60' }}>
                Export All Forms
              </button>
              <button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading">
              <h3>Loading pending forms...</h3>
            </div>
          ) : forms.length === 0 ? (
            <div className="empty-state">
              <h3>No pending forms</h3>
              <p>All forms have been reviewed.</p>
            </div>
          ) : (
            forms.map((form) => (
              <div key={form._id} className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{form.customerName || 'N/A'}</h3>
                    <div className="card-meta">
                      Mobile: {form.mobileNumber || 'N/A'} | Loan Type: {form.loanType || 'N/A'}
                      <span className={`priority-badge priority-${form.interestedStatus?.toLowerCase() === 'yes' ? 'high' : 'low'}`}>
                        {form.interestedStatus || 'N/A'}
                      </span>
                    </div>
                    <div className="card-meta">
                      Agent: {form.agentName || 'N/A'} (ID: {form.agentId || 'N/A'})
                    </div>
                    <div className="card-meta">
                      Date: {form.submissionDate ? formatDate(form.submissionDate) : formatDate(form.createdAt)} | Time: {form.submissionTime || 'N/A'}
                    </div>
                    <div className="card-meta">
                      Submitted by: {form.userId?.name} ({form.userId?.email})
                    </div>
                  </div>
                  <span className={`status-badge status-${form.status}`}>
                    {form.status.toUpperCase()}
                  </span>
                </div>

                <div className="card-content">
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Agent Remarks:</strong>
                    <p>{form.agentRemarks || 'No remarks provided'}</p>
                  </div>
                </div>

                <div className="review-section">
                  <h4>Review Comment:</h4>
                  <textarea
                    placeholder="Add a comment (required for rejection, optional for approval)"
                    value={reviewComment[form._id] || ''}
                    onChange={(e) => handleCommentChange(form._id, e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                  />

                  <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Supervisor Information:</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor={`asmName-${form._id}`}>ASM Name</label>
                      <input
                        type="text"
                        id={`asmName-${form._id}`}
                        value={supervisorData[form._id]?.asmName || ''}
                        onChange={(e) => handleSupervisorDataChange(form._id, 'asmName', e.target.value)}
                        placeholder="Enter ASM name"
                        style={{ width: '100%', padding: '0.5rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`asmContactNo-${form._id}`}>ASM Contact No</label>
                      <input
                        type="tel"
                        id={`asmContactNo-${form._id}`}
                        value={supervisorData[form._id]?.asmContactNo || ''}
                        onChange={(e) => handleSupervisorDataChange(form._id, 'asmContactNo', e.target.value)}
                        placeholder="Enter ASM contact number"
                        style={{ width: '100%', padding: '0.5rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`asmEmailId-${form._id}`}>ASM Email ID</label>
                      <input
                        type="email"
                        id={`asmEmailId-${form._id}`}
                        value={supervisorData[form._id]?.asmEmailId || ''}
                        onChange={(e) => handleSupervisorDataChange(form._id, 'asmEmailId', e.target.value)}
                        placeholder="Enter ASM email"
                        style={{ width: '100%', padding: '0.5rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`city-${form._id}`}>City</label>
                      <input
                        type="text"
                        id={`city-${form._id}`}
                        value={supervisorData[form._id]?.city || ''}
                        onChange={(e) => handleSupervisorDataChange(form._id, 'city', e.target.value)}
                        placeholder="Enter city"
                        style={{ width: '100%', padding: '0.5rem' }}
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label htmlFor={`areaName-${form._id}`}>Area Name</label>
                      <input
                        type="text"
                        id={`areaName-${form._id}`}
                        value={supervisorData[form._id]?.areaName || ''}
                        onChange={(e) => handleSupervisorDataChange(form._id, 'areaName', e.target.value)}
                        placeholder="Enter area name"
                        style={{ width: '100%', padding: '0.5rem' }}
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label htmlFor={`supervisorRemark-${form._id}`}>Supervisor Remark</label>
                      <textarea
                        id={`supervisorRemark-${form._id}`}
                        value={supervisorData[form._id]?.supervisorRemark || ''}
                        onChange={(e) => handleSupervisorDataChange(form._id, 'supervisorRemark', e.target.value)}
                        placeholder="Enter supervisor remark"
                        rows="3"
                        style={{ width: '100%', padding: '0.5rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#e8f4f8', borderRadius: '4px', marginBottom: '1rem' }}>
                    <small style={{ color: '#666' }}>
                      <strong>Note:</strong> Supervisor Name and ID will be auto-generated from your login.
                    </small>
                  </div>

                  <div className="card-actions">
                    <button
                      style={{ background: '#667eea' }}
                      className="btn-success"
                      onClick={() => setSelectedForm(form)}
                    >
                      View Details & Remarks
                    </button>
                    <button
                      style={{ background: '#f39c12' }}
                      onClick={() => setReminderForm(form)}
                    >
                      Set Reminder
                    </button>
                    <button
                      className="btn-success"
                      onClick={() => handleApprove(form._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleReject(form._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Form Detail Modal */}
      {selectedForm && (
        <FormDetailModal
          form={selectedForm}
          onClose={() => setSelectedForm(null)}
          onUpdate={() => fetchPendingForms()}
        />
      )}

      {/* Set Reminder Modal */}
      {reminderForm && (
        <SetReminderModal
          formId={reminderForm._id}
          customerName={reminderForm.customerName}
          onClose={() => setReminderForm(null)}
          onSuccess={() => {
            setReminderForm(null);
            fetchPendingForms();
          }}
        />
      )}
    </>
  );
};

export default AdminPending;
