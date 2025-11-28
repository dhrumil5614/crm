import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FormDetailModal from '../components/FormDetailModal';
import { formsAPI } from '../services/api';

const History = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
  }, [filter]);

  const fetchForms = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await formsAPI.getAll(filter);
      setForms(response.data.forms);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch forms');
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form?')) {
      return;
    }

    try {
      await formsAPI.delete(id);
      fetchForms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete form');
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
            <h2>My Entries</h2>
            <button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>

          <div className="dashboard-nav">
            <button onClick={() => setFilter('')}>
              All ({forms.length})
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
              <h3>Loading your entries...</h3>
            </div>
          ) : forms.length === 0 ? (
            <div className="empty-state">
              <h3>No entries found</h3>
              <p>You haven't submitted any forms yet.</p>
              <button onClick={() => navigate('/new-entry')} style={{ marginTop: '1rem' }}>
                Create New Entry
              </button>
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

                <div className="card-actions">
                  <button
                    className="btn-primary"
                    onClick={() => navigate(`/forms/${form._id}`)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    View Details & Remarks
                  </button>
                  {form.status === 'pending' && (
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(form._id)}
                    >
                      Delete
                    </button>
                  )}
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
          onUpdate={() => fetchForms()}
        />
      )}
    </>
  );
};

export default History;
