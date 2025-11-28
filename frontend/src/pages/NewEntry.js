import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { formsAPI } from '../services/api';

const NewEntry = () => {
  const [formData, setFormData] = useState({
    mobileNumber: '',
    customerName: '',
    loanType: 'Other',
    interestedStatus: 'No',
    agentRemarks: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await formsAPI.create(formData);
      setSuccess('Form submitted successfully and is pending approval!');
      setFormData({
        mobileNumber: '',
        customerName: '',
        loanType: 'Other',
        interestedStatus: 'No',
        agentRemarks: '',
      });

      setTimeout(() => {
        navigate('/history');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit form');
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="dashboard">
          <div className="dashboard-header">
            <h2>Create New Entry</h2>
            <button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>

          <div className="card">
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="mobileNumber">Mobile Number *</label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  required
                  placeholder="Enter customer mobile number"
                  pattern="[0-9]{10}"
                  maxLength="10"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customerName">Customer Name *</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  placeholder="Enter customer name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="loanType">Loan Type *</label>
                <select
                  id="loanType"
                  name="loanType"
                  value={formData.loanType}
                  onChange={handleChange}
                  required
                >
                  <option value="Home Loan">Home Loan</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Car Loan">Car Loan</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Education Loan">Education Loan</option>
                  <option value="Gold Loan">Gold Loan</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="interestedStatus">Interested Status *</label>
                <select
                  id="interestedStatus"
                  name="interestedStatus"
                  value={formData.interestedStatus}
                  onChange={handleChange}
                  required
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="agentRemarks">Agent Remarks</label>
                <textarea
                  id="agentRemarks"
                  name="agentRemarks"
                  value={formData.agentRemarks}
                  onChange={handleChange}
                  placeholder="Enter any additional remarks"
                  rows="4"
                />
              </div>

              <div className="form-group" style={{ padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '1rem' }}>
                <small style={{ color: '#666' }}>
                  <strong>Note:</strong> Date and Time will be automatically recorded. Agent Name and ID will be auto-generated from your login.
                </small>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewEntry;
