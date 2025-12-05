import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FormDetailModal from '../components/FormDetailModal';
import SetReminderModal from '../components/SetReminderModal';
import StatusDropdown from '../components/StatusDropdown';
import { adminAPI } from '../services/api';

const AdminAllForms = () => {
  const [forms, setForms] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [reminderForm, setReminderForm] = useState(null);
  const [expandedForms, setExpandedForms] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
    fetchStats();
  }, [filter]);

  const fetchForms = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminAPI.getAllForms(filter);
      setForms(response.data.forms);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch forms');
    }

    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
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

  const toggleExpand = (formId) => {
    setExpandedForms(prev => ({
      ...prev,
      [formId]: !prev[formId]
    }));
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
            <h2>All Forms</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleExportAll} style={{ background: '#27ae60' }}>
                Export All Forms
              </button>
              <button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </button>
            </div>
          </div>

          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Forms</h3>
                <p>{stats.total}</p>
              </div>
              <div className="stat-card">
                <h3>Pending</h3>
                <p>{stats.pending}</p>
              </div>
              <div className="stat-card">
                <h3>Approved</h3>
                <p>{stats.approved}</p>
              </div>
              <div className="stat-card">
                <h3>Rejected</h3>
                <p>{stats.rejected}</p>
              </div>
            </div>
          )}

          <div className="dashboard-nav">
            <button onClick={() => setFilter('')}>
              All
            </button>
            <button onClick={() => setFilter('pending')}>
              Pending
            </button>
            <button onClick={() => setFilter('approved')}>
              Approved
            </button>
            <button onClick={() => setFilter('rejected')}>
              Rejected
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading">
              <h3>Loading forms...</h3>
            </div>
          ) : forms.length === 0 ? (
            <div className="empty-state">
              <h3>No forms found</h3>
              <p>No forms match the selected filter.</p>
            </div>
          ) : (
            forms.map((form) => (
              <div key={form._id} className="card">
                {/* Collapsed Header - Always Visible */}
                <div
                  className="card-header"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => toggleExpand(form._id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    {/* Dropdown Arrow */}
                    <span style={{ fontSize: '1.2rem', transition: 'transform 0.3s', transform: expandedForms[form._id] ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                      ▶
                    </span>
                    <h3 className="card-title" style={{ margin: 0 }}>{form.customerName || 'N/A'}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={(e) => e.stopPropagation()}>
                    <StatusDropdown
                      formId={form._id}
                      currentStatus={form.progressStatus}
                      onUpdate={() => fetchForms()}
                    />
                    <span className={`status-badge status-${form.status}`}>
                      {form.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Expanded Content - Only Visible When Expanded */}
                {expandedForms[form._id] && (
                  <>
                    <div className="card-content" style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                      <div className="card-meta" style={{ marginBottom: '0.5rem' }}>
                        <strong>Mobile:</strong> {form.mobileNumber || 'N/A'} | <strong>Loan Type:</strong> {form.loanType || 'N/A'}
                        <span className={`priority-badge priority-${form.interestedStatus?.toLowerCase() === 'yes' ? 'high' : 'low'}`} style={{ marginLeft: '0.5rem' }}>
                          {form.interestedStatus || 'N/A'}
                        </span>
                      </div>
                      <div className="card-meta" style={{ marginBottom: '0.5rem' }}>
                        <strong>Agent:</strong> {form.agentName || 'N/A'} (ID: {form.agentId || 'N/A'})
                      </div>
                      <div className="card-meta" style={{ marginBottom: '0.5rem' }}>
                        <strong>Submitted By:</strong> {form.userId?.name || 'N/A'}
                      </div>
                      <div className="card-meta" style={{ marginBottom: '1rem' }}>
                        <strong>Date:</strong> {form.submissionDate ? formatDate(form.submissionDate) : formatDate(form.createdAt)} | <strong>Time:</strong> {form.submissionTime || 'N/A'}
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <strong>Agent Remarks:</strong>
                        <p style={{ margin: '0.5rem 0' }}>{form.agentRemarks || 'No remarks provided'}</p>
                      </div>

                      {form.status !== 'pending' && form.supervisorName && (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                          <h4>Supervisor Information:</h4>
                          <p><strong>Supervisor:</strong> {form.supervisorName} (ID: {form.supervisorId})</p>
                          {form.asmName && <p><strong>ASM Name:</strong> {form.asmName}</p>}
                          {form.asmContactNo && <p><strong>ASM Contact:</strong> {form.asmContactNo}</p>}
                          {form.asmEmailId && <p><strong>ASM Email:</strong> {form.asmEmailId}</p>}
                          {form.city && <p><strong>City:</strong> {form.city}</p>}
                          {form.areaName && <p><strong>Area:</strong> {form.areaName}</p>}
                          {form.supervisorRemark && <p><strong>Supervisor Remark:</strong> {form.supervisorRemark}</p>}
                        </div>
                      )}

                      {form.status !== 'pending' && form.reviewComment && (
                        <div className="review-section" style={{ marginTop: '1rem' }}>
                          <h4>Review Comment:</h4>
                          <p>{form.reviewComment}</p>
                          <div className="card-meta">
                            Reviewed by: {form.reviewedBy?.name} on {formatDate(form.reviewedAt)}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="card-actions" style={{ marginTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-primary"
                        onClick={() => navigate(`/forms/${form._id}`)}
                      >
                        View Details & Remarks
                      </button>
                      <button
                        style={{ background: '#f39c12', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => setReminderForm(form)}
                      >
                        Set Reminder
                      </button>
                    </div>
                  </>
                )}
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
          onUpdate={() => {
            fetchForms();
            fetchStats();
          }}
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
            fetchForms();
          }}
        />
      )}
    </>
  );
};

export default AdminAllForms;
