import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FormDetailModal from '../components/FormDetailModal';
import SetReminderModal from '../components/SetReminderModal';
import StatusDropdown from '../components/StatusDropdown';
import { adminAPI, formsAPI } from '../services/api'; // Added formsAPI for updates

const AdminPending = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [reminderForm, setReminderForm] = useState(null);
  const [supervisorData, setSupervisorData] = useState({});
  const [expandedForms, setExpandedForms] = useState({});

  // Dropdown Arrays
  const campaigns = ['CEF', 'EEF', 'One Loan', 'REF', 'SBF', 'UBL'];
  const leadStatuses = ['Closed', 'follow up', 'open', 'Win'];
  const leadCategories = ['closed', 'follow up', 'Win'];
  const asmStatuses = [
    'already Sanctioned / Disbursed', 'ASM Visit Done- Documents Pending', 'Case Disbursed', 'Case Logged In',
    'Case Rejected - Credit Manager', 'Case Sanctioned', 'Competitor offer taken', 'Customer Not Contactable',
    'Customer Put on Hold Post Login', 'Follow Ups', 'High Charges', 'Low Turn Over', 'Machine not Finalised',
    'Meeting Fixed', 'No Revert from ASM', 'Not Doable', 'Not Interested', 'On Hold-Post Sanction',
    'Will take in future'
  ];

  // Generate Future Months Logic
  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push(label);
    }
    return options;
  };
  const monthOptions = generateMonthOptions();

  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingForms();
  }, []);

  const fetchPendingForms = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminAPI.getPendingForms();
      const fetchedForms = response.data.forms;
      setForms(fetchedForms);

      // Initialize supervisorData with existing form data (or defaults)
      const initialData = {};
      fetchedForms.forEach(form => {
        initialData[form._id] = {
          campaign: form.campaign || '',
          leadCreatedVertical: form.leadCreatedVertical || '',
          dataReceivedDate: form.dataReceivedDate ? new Date(form.dataReceivedDate).toISOString().split('T')[0] : '',
          assignedName: form.assignedName || '',
          asmMobileNumber: form.asmMobileNumber || '',
          asmEmailId: form.asmEmailId || '',
          adminDate: form.adminDate ? new Date(form.adminDate).toISOString().split('T')[0] : '',
          bestDispo: form.bestDispo || 'Lead Generated',
          leadStatus: form.leadStatus || '',
          leadCategory: form.leadCategory || '',
          asmStatus: form.asmStatus || '',
          asmRemark: form.asmRemark || '',
          inFutureMonth: form.inFutureMonth || '',
          asmName: form.asmName || '',
          asmContactNo: form.asmContactNo || '',
          city: form.city || '',
          areaName: form.areaName || '',
          supervisorRemark: form.supervisorRemark || ''
        };
      });
      setSupervisorData(initialData);

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
      // First update the fields using the new generic update route
      await formsAPI.updateForm(id, supervisorData[id]);

      // Then approve using existing approval flow (which might set reviewedBy, etc.)
      const approvalData = {
        reviewComment: 'Approved',
        ...supervisorData[id] // Send it again just in case approval logic needs it
      };
      await adminAPI.approveForm(id, approvalData);

      fetchPendingForms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve form');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this form?')) {
      return;
    }

    try {
      // First update fields
      await formsAPI.updateForm(id, supervisorData[id]);

      const rejectionData = {
        reviewComment: 'Rejected',
        ...supervisorData[id]
      };
      await adminAPI.rejectForm(id, rejectionData);
      fetchPendingForms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject form');
    }
  };

  const handleDataChange = (id, field, value) => {
    setSupervisorData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
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
                      Mobile: {form.mobileNumber || 'N/A'} | Product: {form.product || 'N/A'}
                      {form.loanAmount > 0 && <span> | Loan Amount: ₹{form.loanAmount.toLocaleString()}</span>}
                    </div>
                    <div className="card-meta">
                      Company: {form.companyName || 'N/A'} | Business Type: {form.businessType || 'N/A'}
                    </div>
                    <div className="card-meta">
                      Lead ID: {form.leadId || 'N/A'} | Source: {form.mainSource || 'N/A'}
                    </div>
                    <div className="card-meta">
                      Location: {form.city || 'N/A'}, {form.state || 'N/A'}
                    </div>
                    <div className="card-meta">
                      Agent: {form.agentName || 'N/A'} | Date: {formatDate(form.submissionDate || form.createdAt)}
                    </div>
                  </div>
                  <span className={`status-badge status-${form.status}`}>
                    {form.status.toUpperCase()}
                  </span>
                </div>

                <div className="card-content">
                  <div style={{ marginBottom: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '5px' }}>
                    <strong>Agent Remarks:</strong>
                    <p style={{ marginTop: '0.5rem' }}>{form.agentRemarks || 'No remarks provided'}</p>
                  </div>

                  {/* --- ADMIN INPUT SECTION --- */}
                  <div style={{ marginTop: '1.5rem', borderTop: '2px solid #eee', paddingTop: '1.5rem' }}>
                    <h4 style={{ marginBottom: '1rem', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem', display: 'inline-block' }}>
                      Admin / Supervisor Details
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>

                      {/* Campaign */}
                      <div className="form-group">
                        <label>Campaign</label>
                        <select
                          value={supervisorData[form._id]?.campaign || ''}
                          onChange={(e) => handleDataChange(form._id, 'campaign', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem' }}
                        >
                          <option value="">Select Campaign</option>
                          {campaigns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      {/* Lead Created Vertical */}
                      <div className="form-group">
                        <label>Lead Created Vertical</label>
                        <input
                          type="text"
                          value={supervisorData[form._id]?.leadCreatedVertical || ''}
                          onChange={(e) => handleDataChange(form._id, 'leadCreatedVertical', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem' }}
                        />
                      </div>

                      {/* Data Received Date */}
                      <div className="form-group">
                        <label>Data Received Date</label>
                        <input
                          type="date"
                          value={supervisorData[form._id]?.dataReceivedDate || ''}
                          onChange={(e) => handleDataChange(form._id, 'dataReceivedDate', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem' }}
                        />
                      </div>

                      {/* Assigned Name */}
                      <div className="form-group">
                        <label>Assigned Name</label>
                        <input
                          type="text"
                          value={supervisorData[form._id]?.assignedName || ''}
                          onChange={(e) => handleDataChange(form._id, 'assignedName', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem' }}
                        />
                      </div>

                      {/* ASM Details */}
                      <div className="form-group">
                        <label>ASM Name</label>
                        <input type="text" value={supervisorData[form._id]?.asmName || ''} onChange={(e) => handleDataChange(form._id, 'asmName', e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
                      </div>
                      <div className="form-group">
                        <label>ASM Mobile Number</label>
                        <input type="text" value={supervisorData[form._id]?.asmMobileNumber || ''} onChange={(e) => handleDataChange(form._id, 'asmMobileNumber', e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
                      </div>
                      <div className="form-group">
                        <label>ASM Email ID</label>
                        <input type="email" value={supervisorData[form._id]?.asmEmailId || ''} onChange={(e) => handleDataChange(form._id, 'asmEmailId', e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
                      </div>

                      {/* Admin Date */}
                      <div className="form-group">
                        <label>Date</label>
                        <input
                          type="date"
                          value={supervisorData[form._id]?.adminDate || ''}
                          onChange={(e) => handleDataChange(form._id, 'adminDate', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem' }}
                        />
                      </div>

                      {/* Best Dispo (Disabled Fixed Value) */}
                      <div className="form-group">
                        <label>Best Dispo</label>
                        <input
                          type="text"
                          value="Lead Generated"
                          disabled
                          style={{ width: '100%', padding: '0.5rem', background: '#eee' }}
                        />
                      </div>

                      {/* Status */}
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={supervisorData[form._id]?.leadStatus || ''}
                          onChange={(e) => handleDataChange(form._id, 'leadStatus', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem' }}
                        >
                          <option value="">Select Status</option>
                          {leadStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      {/* Category */}
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          value={supervisorData[form._id]?.leadCategory || ''}
                          onChange={(e) => handleDataChange(form._id, 'leadCategory', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem' }}
                        >
                          <option value="">Select Category</option>
                          {leadCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      {/* ASM Status */}
                      <div className="form-group">
                        <label>ASM Status</label>
                        <select
                          value={supervisorData[form._id]?.asmStatus || ''}
                          onChange={(e) => handleDataChange(form._id, 'asmStatus', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem' }}
                        >
                          <option value="">Select ASM Status</option>
                          {asmStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      {/* In Future Month */}
                      <div className="form-group">
                        <label>In Future Month</label>
                        <select
                          value={supervisorData[form._id]?.inFutureMonth || ''}
                          onChange={(e) => handleDataChange(form._id, 'inFutureMonth', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem' }}
                        >
                          <option value="">Select Month</option>
                          {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>

                      {/* ASM Remark */}
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>ASM Remark</label>
                        <textarea
                          value={supervisorData[form._id]?.asmRemark || ''}
                          onChange={(e) => handleDataChange(form._id, 'asmRemark', e.target.value)}
                          placeholder="Enter ASM remark"
                          rows="2"
                          style={{ width: '100%', padding: '0.5rem' }}
                        />
                      </div>

                      {/* Supervisor Remark */}
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Supervisor Remark</label>
                        <textarea
                          value={supervisorData[form._id]?.supervisorRemark || ''}
                          onChange={(e) => handleDataChange(form._id, 'supervisorRemark', e.target.value)}
                          placeholder="Enter supervisor remark"
                          rows="2"
                          style={{ width: '100%', padding: '0.5rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="card-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                      style={{ background: '#667eea', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                      onClick={() => setSelectedForm(form)}
                    >
                      View Full Details
                    </button>
                    <button
                      className="btn-success"
                      style={{ padding: '0.75rem 1.5rem' }}
                      onClick={() => handleApprove(form._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-danger"
                      style={{ padding: '0.75rem 1.5rem' }}
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
    </>
  );
};

export default AdminPending;
