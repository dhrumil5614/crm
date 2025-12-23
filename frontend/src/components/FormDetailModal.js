import React from 'react';
import RemarksSection from './RemarksSection';

const FormDetailModal = ({ form, onClose, onUpdate }) => {
  if (!form) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMonth = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '2rem',
        zIndex: 1000,
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '10px',
          maxWidth: '900px',
          width: '100%',
          padding: '2rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          marginTop: '2rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>{form.customerName || 'Form Details'}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className={`status-badge status-${form.status}`}>
                {form.status.toUpperCase()}
              </span>
              {form.progressStatus && (
                <span className={`priority-badge priority-medium`}>
                  {form.progressStatus}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Close
          </button>
        </div>

        {/* Form Details */}
        <div style={{ marginBottom: '2rem' }}>
          {/* Product & Source Section */}
          <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '0.75rem', borderBottom: '2px solid #4CAF50', paddingBottom: '0.5rem' }}>
              📋 Product & Source Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Month:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{formatMonth(form.month)}</p>
              </div>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Product:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.product || 'N/A'}</p>
              </div>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Main Source:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.mainSource || 'N/A'}</p>
              </div>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Lead ID / GL ID:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.leadId || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Customer Information Section */}
          <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '0.75rem', borderBottom: '2px solid #4CAF50', paddingBottom: '0.5rem' }}>
              👤 Customer Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Customer Name:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.customerName || 'N/A'}</p>
              </div>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Company Name:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.companyName || 'N/A'}</p>
              </div>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Mobile Number:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.mobileNumber || 'N/A'}</p>
              </div>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Alternate Number:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.alternateNumber || 'N/A'}</p>
              </div>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Business Type:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.businessType || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Location Information Section */}
          <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '0.75rem', borderBottom: '2px solid #4CAF50', paddingBottom: '0.5rem' }}>
              📍 Location Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>City:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.city || 'N/A'}</p>
              </div>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>State:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.state || 'N/A'}</p>
              </div>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Area Name:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.areaName || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Loan Details Section */}
          <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '0.75rem', borderBottom: '2px solid #4CAF50', paddingBottom: '0.5rem' }}>
              💰 Loan Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Loan Amount:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>
                  {form.loanAmount > 0 ? `₹${form.loanAmount.toLocaleString()}` : 'N/A'}
                </p>
              </div>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Property Type:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.propertyType || 'N/A'}</p>
              </div>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>In Future Month:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.inFutureMonth || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Agent Information Section */}
          <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '0.75rem', borderBottom: '2px solid #4CAF50', paddingBottom: '0.5rem' }}>
              👨‍💼 Agent Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Agent Name:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.agentName || 'N/A'}</p>
              </div>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Agent ID:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.agentId || 'N/A'}</p>
              </div>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Submitted By:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>
                  {form.userId?.name} ({form.userId?.email})
                </p>
              </div>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Submission Date:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>
                  {formatDate(form.submissionDate || form.createdAt)}
                </p>
              </div>
              <div>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Submission Time:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.submissionTime || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          {form.agentRemarks && (
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <h4 style={{ color: '#2c3e50', marginBottom: '0.75rem', borderBottom: '2px solid #4CAF50', paddingBottom: '0.5rem' }}>
                📝 Agent Remarks
              </h4>
              <p style={{
                margin: '0.5rem 0',
                color: '#2c3e50',
                background: 'white',
                padding: '0.75rem',
                borderRadius: '5px',
                whiteSpace: 'pre-wrap'
              }}>
                {form.agentRemarks}
              </p>
            </div>
          )}

          {/* Supervisor Information (if approved/rejected) */}
          {form.status !== 'pending' && form.supervisorName && (
            <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #ffc107' }}>
              <h4 style={{ color: '#2c3e50', marginBottom: '0.75rem', borderBottom: '2px solid #ffc107', paddingBottom: '0.5rem' }}>
                👔 Supervisor Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Supervisor Name:</strong>
                  <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.supervisorName}</p>
                </div>
                <div>
                  <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Supervisor ID:</strong>
                  <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.supervisorId}</p>
                </div>
                {form.asmName && (
                  <div>
                    <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>ASM Name:</strong>
                    <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.asmName}</p>
                  </div>
                )}
                {form.asmContactNo && (
                  <div>
                    <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>ASM Contact:</strong>
                    <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.asmContactNo}</p>
                  </div>
                )}
                {form.asmEmailId && (
                  <div>
                    <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>ASM Email:</strong>
                    <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.asmEmailId}</p>
                  </div>
                )}
              </div>
              {form.supervisorRemark && (
                <div style={{ marginTop: '0.75rem' }}>
                  <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Supervisor Remark:</strong>
                  <p style={{
                    margin: '0.25rem 0',
                    color: '#2c3e50',
                    background: 'white',
                    padding: '0.75rem',
                    borderRadius: '5px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {form.supervisorRemark}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Review Information */}
          {form.status !== 'pending' && (
            <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginTop: '1rem' }}>
              <h4 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Review Information</h4>

              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Reviewed by:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>
                  {form.reviewedBy?.name || 'N/A'}
                </p>
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Reviewed on:</strong>
                <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>
                  {form.reviewedAt ? formatDate(form.reviewedAt) : 'N/A'}
                </p>
              </div>

              {form.reviewComment && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Review Comment:</strong>
                  <p style={{
                    margin: '0.25rem 0',
                    color: '#2c3e50',
                    background: '#f8f9fa',
                    padding: '0.75rem',
                    borderRadius: '5px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {form.reviewComment}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Remarks Section */}
        <div style={{ borderTop: '2px solid #eee', paddingTop: '1rem' }}>
          <RemarksSection
            formId={form._id}
            onRemarkAdded={() => {
              if (onUpdate) onUpdate();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FormDetailModal;
