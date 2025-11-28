import React, { useState, useEffect } from 'react';
import { formsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RemarksSection = ({ formId, onRemarkAdded }) => {
  const [remarks, setRemarks] = useState([]);
  const [newRemark, setNewRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchRemarks();
  }, [formId]);

  const fetchRemarks = async (filterStartDate = '', filterEndDate = '') => {
    try {
      const response = await formsAPI.getRemarks(formId, filterStartDate, filterEndDate);
      setRemarks(response.data.remarks || []);
    } catch (err) {
      console.error('Failed to fetch remarks:', err);
    }
  };

  const handleSubmitRemark = async (e) => {
    e.preventDefault();
    if (!newRemark.trim()) {
      setError('Please enter a remark');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await formsAPI.addRemark(formId, newRemark);
      setSuccess('Remark added successfully!');
      setNewRemark('');

      // Update remarks list
      if (response.data.form && response.data.form.remarks) {
        setRemarks(response.data.form.remarks);
      } else {
        await fetchRemarks();
      }

      if (onRemarkAdded) {
        onRemarkAdded();
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add remark');
    }

    setLoading(false);
  };

  const handleFilterRemarks = () => {
    fetchRemarks(startDate, endDate);
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    fetchRemarks();
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await formsAPI.exportToExcel(formId);

      // Create a blob from the response
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Form_${formId}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download Excel file');
      console.error(err);
    }
  };

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
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Remarks & Discussion</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '0.5rem 1rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {showFilters ? 'Hide Filters' : 'Filter by Date'}
          </button>
          <button
            onClick={handleDownloadExcel}
            style={{
              padding: '0.5rem 1rem',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Download Excel
          </button>
        </div>
      </div>

      {showFilters && (
        <div style={{
          background: '#f8f9fa',
          padding: '1rem',
          borderRadius: '5px',
          marginBottom: '1rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Start Date:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ddd' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              End Date:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ddd' }}
            />
          </div>
          <button
            onClick={handleFilterRemarks}
            style={{
              padding: '0.5rem 1rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Apply Filter
          </button>
          <button
            onClick={handleClearFilters}
            style={{
              padding: '0.5rem 1rem',
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          {success}
        </div>
      )}

      {/* Add New Remark Form */}
      <form onSubmit={handleSubmitRemark} style={{ marginBottom: '1.5rem' }}>
        <textarea
          value={newRemark}
          onChange={(e) => setNewRemark(e.target.value)}
          placeholder="Add a remark or comment..."
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '5px',
            border: '1px solid #ddd',
            minHeight: '80px',
            resize: 'vertical',
            marginBottom: '0.5rem',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.5rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Adding...' : 'Add Remark'}
        </button>
      </form>

      {/* Remarks List */}
      <div>
        <h4 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
          All Remarks ({remarks.length}) - Sorted by Newest First
        </h4>

        {remarks.length === 0 ? (
          <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '2rem' }}>
            No remarks yet. Be the first to add one!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {remarks.map((remark, index) => (
              <div
                key={remark._id || index}
                style={{
                  background: remark.userId?._id === user?.id ? '#e3f2fd' : '#f5f5f5',
                  padding: '1rem',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${remark.userId?._id === user?.id ? '#2196f3' : '#95a5a6'}`,
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#7f8c8d'
                }}>
                  <div>
                    <strong style={{ color: '#2c3e50' }}>
                      {remark.userId?.name || 'Unknown User'}
                    </strong>
                    {' '}
                    <span style={{
                      background: remark.userId?.role === 'admin' ? '#e74c3c' : '#3498db',
                      color: 'white',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '3px',
                      fontSize: '0.75rem',
                      marginLeft: '0.5rem'
                    }}>
                      {remark.userId?.role?.toUpperCase() || 'USER'}
                    </span>
                  </div>
                  <span>{formatDate(remark.createdAt)}</span>
                </div>
                <p style={{
                  margin: 0,
                  color: '#34495e',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {remark.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemarksSection;
