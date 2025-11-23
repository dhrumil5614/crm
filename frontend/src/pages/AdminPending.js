import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { adminAPI } from '../services/api';

const AdminPending = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewComment, setReviewComment] = useState({});

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
      await adminAPI.approveForm(id, reviewComment[id] || 'Approved');
      fetchPendingForms();
      setReviewComment({ ...reviewComment, [id]: '' });
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
      await adminAPI.rejectForm(id, comment);
      fetchPendingForms();
      setReviewComment({ ...reviewComment, [id]: '' });
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
            <h2>Pending Approvals</h2>
            <button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
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
                    <h3 className="card-title">{form.title}</h3>
                    <div className="card-meta">
                      Submitted by: {form.userId?.name} ({form.userId?.email})
                    </div>
                    <div className="card-meta">
                      Category: {form.category}
                      <span className={`priority-badge priority-${form.priority.toLowerCase()}`}>
                        {form.priority}
                      </span>
                    </div>
                    <div className="card-meta">
                      Submitted: {formatDate(form.createdAt)}
                    </div>
                  </div>
                  <span className={`status-badge status-${form.status}`}>
                    {form.status.toUpperCase()}
                  </span>
                </div>

                <div className="card-content">
                  <p>{form.description}</p>
                </div>

                <div className="review-section">
                  <h4>Review Comment:</h4>
                  <textarea
                    placeholder="Add a comment (required for rejection, optional for approval)"
                    value={reviewComment[form._id] || ''}
                    onChange={(e) => handleCommentChange(form._id, e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                  />

                  <div className="card-actions">
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
    </>
  );
};

export default AdminPending;
