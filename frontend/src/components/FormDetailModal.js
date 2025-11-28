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
            <h2 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>{form.title}</h2>
            <span className={`status-badge status-${form.status}`}>
              {form.status.toUpperCase()}
            </span>
            <span className={`priority-badge priority-${form.priority.toLowerCase()}`}>
              {form.priority}
            </span>
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
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Category:</strong>
            <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>{form.category}</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Description:</strong>
            <p style={{ margin: '0.25rem 0', color: '#2c3e50', whiteSpace: 'pre-wrap' }}>
              {form.description}
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Submitted by:</strong>
            <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>
              {form.userId?.name} ({form.userId?.email})
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Submitted on:</strong>
            <p style={{ margin: '0.25rem 0', color: '#2c3e50' }}>
              {formatDate(form.createdAt)}
            </p>
          </div>

          {form.status !== 'pending' && (
            <>
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
            </>
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
