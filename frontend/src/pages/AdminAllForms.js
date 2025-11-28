import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FormDetailModal from '../components/FormDetailModal';
import { adminAPI } from '../services/api';

const AdminAllForms = () => {
  const [forms, setForms] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);

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

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="dashboard">
          <div className="dashboard-header">
            <h2>All Forms</h2>
            <button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
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
                </div>

                {form.status !== 'pending' && form.reviewComment && (
                  <div className="review-section">
                    <h4>Review Comment:</h4>
                    <p>{form.reviewComment}</p>
                    <div className="card-meta">
                      Reviewed by: {form.reviewedBy?.name} on {formatDate(form.reviewedAt)}
                    </div>
                  </div>
                )}

                <div className="card-actions" style={{ marginTop: '1rem' }}>
                  <button
                    className="btn-primary"
                    onClick={() => navigate(`/forms/${form._id}`)}
                  >
                    View Details & Remarks
                  </button>
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
          onUpdate={() => {
            fetchForms();
            fetchStats();
          }}
        />
      )}
    </>
  );
};

export default AdminAllForms;
