import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { formsAPI } from '../services/api';
import './NewEntry.css';

const NewEntry = () => {
  const [formData, setFormData] = useState({
    product: 'Business Loan',
    mainSource: 'Call centre',
    customerName: '',
    leadId: '',
    companyName: '',
    mobileNumber: '',
    alternateNumber: '',
    loanAmount: '',
    city: '',
    state: '',
    inFutureMonth: '',
    agentRemarks: '',
    businessType: '',
    propertyType: ''
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
      setSuccess('Form submitted successfully!');

      // Reset form
      setFormData({
        product: 'Business Loan',
        mainSource: 'Call centre',
        customerName: '',
        leadId: '',
        companyName: '',
        mobileNumber: '',
        alternateNumber: '',
        loanAmount: '',
        city: '',
        state: '',
        inFutureMonth: '',
        agentRemarks: '',
        businessType: '',
        propertyType: ''
      });

      setTimeout(() => {
        navigate('/history');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit form');
    }

    setLoading(false);
  };

  // Generate future month options (current month + next 11 months)
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
      const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthYear = futureDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push(monthYear);
    }

    return months;
  };

  // Property Type options
  const propertyTypeOptions = [
    'already Sanctioned / Disbursed',
    'ASM Visit Done- Documents Pending',
    'Case Disbursed',
    'Case Logged In',
    'Case Rejected - Credit Manager',
    'Case Sanctioned',
    'Competitor offer taken',
    'Customer Not Contactable',
    'Customer Put on Hold Post Login',
    'Follow Ups',
    'High Charges',
    'Low Turn Over',
    'Machine not Finalised',
    'Meeting Fixed',
    'No Revert from ASM',
    'Not Doable',
    'Not Interested',
    'On Hold-Post Sanction',
    'Will take in future'
  ];

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="dashboard">
          <div className="dashboard-header">
            <h2>Create New Entry</h2>
            <button onClick={() => navigate('/dashboard')} className="btn-back">
              ← Back to Dashboard
            </button>
          </div>

          <div className="card new-entry-card">
            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <span className="alert-icon">✓</span>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="new-entry-form">

              {/* Product & Source Section */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-icon">📋</span>
                  Product & Source Information
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="product">Product Type *</label>
                    <select
                      id="product"
                      name="product"
                      value={formData.product}
                      onChange={handleChange}
                      required
                      className="form-select"
                    >
                      <option value="Business Loan">Business Loan</option>
                      <option value="Machine Loan">Machine Loan</option>
                      <option value="Solar Loan">Solar Loan</option>
                      <option value="One loan">One loan</option>
                      <option value="UBL">UBL</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="mainSource">Main Source</label>
                    <input
                      type="text"
                      id="mainSource"
                      name="mainSource"
                      value={formData.mainSource}
                      onChange={handleChange}
                      placeholder="Main source"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Information Section */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-icon">👤</span>
                  Customer Information
                </h3>
                <div className="form-row">
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
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="companyName">Company Name</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Enter company name"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="leadId">Lead ID / GL ID</label>
                    <input
                      type="text"
                      id="leadId"
                      name="leadId"
                      value={formData.leadId}
                      onChange={handleChange}
                      placeholder="Enter lead ID or GL ID"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="businessType">Business Type</label>
                    <input
                      type="text"
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      placeholder="Enter business type"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-icon">📞</span>
                  Contact Information
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="mobileNumber">Contact Number *</label>
                    <input
                      type="tel"
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      required
                      placeholder="Enter contact number"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="alternateNumber">Alternate Number</label>
                    <input
                      type="tel"
                      id="alternateNumber"
                      name="alternateNumber"
                      value={formData.alternateNumber}
                      onChange={handleChange}
                      placeholder="Enter alternate number"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-icon">📍</span>
                  Location Information
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Enter state"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Loan Details Section */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-icon">💰</span>
                  Loan Details
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="loanAmount">Loan Amount</label>
                    <input
                      type="number"
                      id="loanAmount"
                      name="loanAmount"
                      value={formData.loanAmount}
                      onChange={handleChange}
                      placeholder="Enter loan amount"
                      min="0"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="propertyType">Property Type / Status</label>
                    <select
                      id="propertyType"
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Select property type / status</option>
                      {propertyTypeOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="inFutureMonth">In Future Month</label>
                    <select
                      id="inFutureMonth"
                      name="inFutureMonth"
                      value={formData.inFutureMonth}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Select future month</option>
                      {generateMonthOptions().map((month) => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    {/* Empty space for alignment */}
                  </div>
                </div>
              </div>

              {/* Remarks Section */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-icon">📝</span>
                  Additional Information
                </h3>
                <div className="form-group full-width">
                  <label htmlFor="agentRemarks">Remarks</label>
                  <textarea
                    id="agentRemarks"
                    name="agentRemarks"
                    value={formData.agentRemarks}
                    onChange={handleChange}
                    placeholder="Enter any additional remarks or notes..."
                    rows="4"
                    className="form-textarea"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="info-box">
                <span className="info-icon">ℹ️</span>
                <div className="info-text">
                  <strong>Note:</strong> Month, Date and Time will be automatically recorded.
                  Agent Name and ID will be auto-generated from your login.
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span className="submit-icon">✓</span>
                      Submit Entry
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewEntry;
