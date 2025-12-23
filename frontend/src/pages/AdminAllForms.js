import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FormDetailModal from '../components/FormDetailModal';
import SetReminderModal from '../components/SetReminderModal';
import ReminderActionModal from '../components/ReminderActionModal';
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
  const [actionReminder, setActionReminder] = useState(null);
  const [expandedForms, setExpandedForms] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateRangeError, setDateRangeError] = useState('');

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

  const handleExportDateRange = async () => {
    setDateRangeError('');

    // Validate dates
    if (!startDate || !endDate) {
      setDateRangeError('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setDateRangeError('Start date must be before or equal to end date');
      return;
    }

    try {
      const response = await adminAPI.exportAllForms(startDate, endDate);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `forms-${startDate}-to-${endDate}-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to export forms';
      setDateRangeError(errorMsg);
      console.error(err);
    }
  };

  const handleClearDateRange = () => {
    setStartDate('');
    setEndDate('');
    setDateRangeError('');
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="dashboard">
          <div className="dashboard-header">
            <h2>All Forms</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {/* <button onClick={handleExportAll} style={{ background: '#27ae60' }}>
                Export All Forms
              </button> */}
              <button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Date Range Export Section */}
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Export by Date Range</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#34495e', fontWeight: '500' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#34495e', fontWeight: '500' }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleExportDateRange}
                  className="btn-primary"
                  style={{ padding: '0.75rem 1.5rem', width: 'auto' }}
                >
                  Export
                </button>
                <button
                  onClick={handleClearDateRange}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
            {dateRangeError && (
              <div className="alert alert-error" style={{ marginTop: '1rem', marginBottom: '0' }}>
                {dateRangeError}
              </div>
            )}
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
                        activeReminders.push({ ...form.reminder, isLegacy: true });
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
                              onClick={() => setActionReminder({ reminder, formId: form._id, isLegacy: reminder.isLegacy })}
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
                        <strong>Mobile:</strong> {form.mobileNumber || 'N/A'} | <strong>Product:</strong> {form.product || 'N/A'}
                        {form.loanAmount > 0 && <span> | <strong>Loan Amount:</strong> ₹{form.loanAmount.toLocaleString()}</span>}
                      </div>
                      <div className="card-meta" style={{ marginBottom: '0.5rem' }}>
                        <strong>Company:</strong> {form.companyName || 'N/A'} | <strong>Business Type:</strong> {form.businessType || 'N/A'}
                      </div>
                      <div className="card-meta" style={{ marginBottom: '0.5rem' }}>
                        <strong>Lead ID:</strong> {form.leadId || 'N/A'} | <strong>Source:</strong> {form.mainSource || 'N/A'}
                      </div>
                      <div className="card-meta" style={{ marginBottom: '0.5rem' }}>
                        <strong>Location:</strong> {form.city || 'N/A'}, {form.state || 'N/A'}
                        {form.propertyType && <span> | <strong>Status:</strong> {form.propertyType}</span>}
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

                      {/* --- ADMIN LEAD TRACKING DETAILS --- */}
                      {form.status !== 'pending' && (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#eef2f7', borderRadius: '4px' }}>
                          <h4 style={{ marginBottom: '0.5rem', color: '#2c3e50' }}>Lead Tracking Details:</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                            <div><strong>Campaign:</strong> {form.campaign || 'N/A'}</div>
                            <div><strong>Vertical:</strong> {form.leadCreatedVertical || 'N/A'}</div>
                            <div><strong>Data Date:</strong> {form.dataReceivedDate ? formatDate(form.dataReceivedDate) : 'N/A'}</div>
                            <div><strong>Assigned To:</strong> {form.assignedName || 'N/A'}</div>
                            <div><strong>ASM Mobile:</strong> {form.asmMobileNumber || 'N/A'}</div>
                            <div><strong>Admin Date:</strong> {form.adminDate ? formatDate(form.adminDate) : 'N/A'}</div>
                            <div><strong>Best Dispo:</strong> {form.bestDispo || 'N/A'}</div>
                            <div><strong>Status:</strong> {form.leadStatus || 'N/A'}</div>
                            <div><strong>Category:</strong> {form.leadCategory || 'N/A'}</div>
                            <div><strong>ASM Status:</strong> {form.asmStatus || 'N/A'}</div>
                            <div><strong>ASM Remark:</strong> {form.asmRemark || 'N/A'}</div>
                            <div><strong>In Future Month:</strong> {form.inFutureMonth || 'N/A'}</div>
                          </div>
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
                        className="btn-primary"
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

      {/* Reminder Action Modal */}
      {actionReminder && (
        <ReminderActionModal
          reminder={actionReminder.reminder}
          formId={actionReminder.formId}
          isLegacy={actionReminder.isLegacy}
          onClose={() => setActionReminder(null)}
          onUpdate={() => {
            setActionReminder(null);
            fetchForms();
          }}
        />
      )}
    </>
  );
};

export default AdminAllForms;
