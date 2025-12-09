import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import FormDetailModal from '../components/FormDetailModal';
import SetReminderModal from '../components/SetReminderModal';
import StatusDropdown from '../components/StatusDropdown';
import { formsAPI } from '../services/api';

const History = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [reminderForm, setReminderForm] = useState(null);
  const [expandedForms, setExpandedForms] = useState({});
  const { isAdmin } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
  }, [filter]);

  const fetchForms = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await formsAPI.getAll(filter);

      // Sort forms: those with reminders first (by reminder date), then by creation date
      const sortedForms = (response.data.forms || []).sort((a, b) => {
        // Helper to get earliest active reminder
        const getEarliestReminder = (form) => {
          const activeReminders = [];

          // Check new reminders array
          if (form.reminders && form.reminders.length > 0) {
            form.reminders.forEach(r => {
              if (!r.isCompleted) activeReminders.push(new Date(r.dateTime));
            });
          }
          // Check legacy reminder
          else if (form.reminder?.isSet && !form.reminder?.isCompleted) {
            activeReminders.push(new Date(form.reminder.dateTime));
          }

          return activeReminders.length > 0 ? Math.min(...activeReminders) : null;
        };

        const aEarliest = getEarliestReminder(a);
        const bEarliest = getEarliestReminder(b);

        // If both have reminders, sort by earliest reminder date
        if (aEarliest && bEarliest) {
          return aEarliest - bEarliest;
        }

        // Forms with reminders come first
        if (aEarliest) return -1;
        if (bEarliest) return 1;

        // Otherwise sort by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setForms(sortedForms);
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

  const toggleExpand = (formId) => {
    setExpandedForms(prev => ({
      ...prev,
      [formId]: !prev[formId]
    }));
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
            <button
              onClick={() => navigate('/new-entry')}
            // style={{
            //   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            //   color: 'white',
            //   border: 'none'
            // }}
            >
              Create New Entry
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin/all-forms')}
              // style={{
              //   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              //   color: 'white',
              //   border: 'none'
              // }}
              >
                All Forms
              </button>
            )}
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
                    <h3 className="card-title" style={{ margin: 0 }}>
                      {form.customerName || 'N/A'}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={(e) => e.stopPropagation()}>
                    {/* Reminder Badges - Beautiful design on the right */}
                    {(() => {
                      // Get all active reminders
                      const activeReminders = [];

                      // Check new reminders array
                      if (form.reminders && form.reminders.length > 0) {
                        form.reminders.forEach(r => {
                          if (!r.isCompleted) activeReminders.push(r);
                        });
                      }
                      // Check legacy reminder
                      else if (form.reminder?.isSet && !form.reminder?.isCompleted) {
                        activeReminders.push(form.reminder);
                      }

                      if (activeReminders.length === 0) return null;

                      // Sort by date (earliest first)
                      activeReminders.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

                      // Show up to 2 badges, then a count
                      const displayReminders = activeReminders.slice(0, 2);
                      const remainingCount = activeReminders.length - displayReminders.length;

                      return (
                        <>
                          {displayReminders.map((reminder, index) => (
                            <div
                              key={index}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.4rem 0.8rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '20px',
                                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                                animation: 'pulse 2s infinite',
                                cursor: 'pointer'
                              }}
                              title="Click to view/edit reminder"
                              onClick={() => setReminderForm(form)}
                            >
                              <span style={{ fontSize: '1rem', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}>🔔</span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                                <span style={{
                                  fontSize: '0.7rem',
                                  fontWeight: '600',
                                  color: 'white',
                                  lineHeight: '1',
                                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                }}>
                                  {new Date(reminder.dateTime).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                                <span style={{
                                  fontSize: '0.65rem',
                                  fontWeight: '500',
                                  color: 'rgba(255,255,255,0.9)',
                                  lineHeight: '1',
                                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                }}>
                                  {new Date(reminder.dateTime).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </span>
                              </div>
                            </div>
                          ))}
                          {remainingCount > 0 && (
                            <div
                              style={{
                                padding: '0.4rem 0.6rem',
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                borderRadius: '50%',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                boxShadow: '0 2px 6px rgba(245, 87, 108, 0.3)',
                                cursor: 'pointer'
                              }}
                              title={`${remainingCount} more reminder${remainingCount > 1 ? 's' : ''}`}
                              onClick={() => setReminderForm(form)}
                            >
                              +{remainingCount}
                            </div>
                          )}
                        </>
                      );
                    })()}
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

                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-primary"
                        onClick={() => navigate(`/forms/${form._id}`)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        View Details & Remarks
                      </button>
                      <button
                        style={{ background: '#f39c12', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}
                        onClick={() => setReminderForm(form)}
                      >
                        Set Reminder
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
          onUpdate={() => fetchForms()}
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

export default History;
