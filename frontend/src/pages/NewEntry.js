import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { formsAPI } from '../services/api';
import './NewEntry.css';

const NewEntry = () => {
  const { user } = useAuth(); // Get user for campaign
  const campaign = user?.campaign || 'New Sales'; // Default to New Sales

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

  // Reset form when campaign changes (optional, but good practice)
  useEffect(() => {
    // We could set different defaults here based on campaign
    if (campaign === 'CP sign Up') {
      setFormData(prev => ({ ...prev, product: 'Partner Onboarding', mainSource: 'Web Signup' }));
    } else if (campaign === 'LG Retail') {
      setFormData(prev => ({ ...prev, product: 'Retail Finance', mainSource: 'Store Walk-in' }));
    }
  }, [campaign]);

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
      // Append campaign to remarks or a new field if backend supported it
      // For now, we utilize the existing Form schema. 
      // We can prepend the campaign to Agent Remarks for clarity if needed, 
      // or just trust the admin knows the user's campaign.

      const submissionData = {
        ...formData,
        agentRemarks: `[Campaign: ${campaign}] ${formData.agentRemarks}`
      };

      await formsAPI.create(submissionData);
      setSuccess('Form submitted successfully!');

      // Reset form
      setFormData({
        product: '',
        mainSource: '',
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
            <h2>Create New Entry <span className="badge badge-primary" style={{ fontSize: '0.8rem', verticalAlign: 'middle', marginLeft: '10px' }}>{campaign}</span></h2>
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

              {/* === CAMPAIGN SPECIFIC LAYOUTS === */}

              {/* === LAYOUT 1: NEW SALES (DEFAULT) === */}
              {campaign === 'New Sales' && (
                <>
                  <div className="form-section">
                    <h3 className="section-title"><span className="section-icon">📋</span>Product & Source</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="product">Product Type *</label>
                        <select id="product" name="product" value={formData.product} onChange={handleChange} required className="form-select">
                          <option value="Business Loan">Business Loan</option>
                          <option value="Machine Loan">Machine Loan</option>
                          <option value="Solar Loan">Solar Loan</option>
                          <option value="One loan">One loan</option>
                          <option value="UBL">UBL</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="mainSource">Main Source</label>
                        <input type="text" id="mainSource" name="mainSource" value={formData.mainSource} onChange={handleChange} className="form-input" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* === LAYOUT 2: CP SIGN UP === */}
              {campaign === 'CP sign Up' && (
                <div className="form-section" style={{ borderLeft: '4px solid #11998e' }}>
                  <h3 className="section-title"><span className="section-icon">🤝</span>Channel Partner Registration</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Partner Name *</label>
                      <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required className="form-input" placeholder="Partner Name" />
                    </div>
                    <div className="form-group">
                      <label>Company/Agency Name</label>
                      <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="form-input" placeholder="Agency Name" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Partner Type</label>
                      <select name="businessType" value={formData.businessType} onChange={handleChange} className="form-select">
                        <option value="">Select Type</option>
                        <option value="DSA">DSA</option>
                        <option value="Connector">Connector</option>
                        <option value="Chartered Accountant">Chartered Accountant</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* === LAYOUT 3: LG RETAIL === */}
              {campaign === 'LG Retail' && (
                <div className="form-section" style={{ borderLeft: '4px solid #ff9966' }}>
                  <h3 className="section-title"><span className="section-icon">🏪</span>Retail Finance Application</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Customer Name *</label>
                      <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required className="form-input" />
                    </div>
                    <div className="form-group">
                      <label>Store Location</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} className="form-input" placeholder="Store City" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Product Purchased</label>
                      <input type="text" name="product" value={formData.product} onChange={handleChange} className="form-input" placeholder="e.g. TV, Fridge" />
                    </div>
                    <div className="form-group">
                      <label>Loan Amount (Finance Value)</label>
                      <input type="number" name="loanAmount" value={formData.loanAmount} onChange={handleChange} className="form-input" />
                    </div>
                  </div>
                </div>
              )}

              {/* === COMMON FIELDS (Contact & Remarks) === */}
              <div className="form-section">
                <h3 className="section-title"><span className="section-icon">📞</span>Contact Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="mobileNumber">Mobile Number *</label>
                    <input type="tel" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required pattern="[0-9]{10}" maxLength="10" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="alternateNumber">Alternate Number</label>
                    <input type="tel" id="alternateNumber" name="alternateNumber" value={formData.alternateNumber} onChange={handleChange} pattern="[0-9]{10}" maxLength="10" className="form-input" />
                  </div>
                </div>
              </div>

              {/* Common Remarks - Always shown */}
              <div className="form-section">
                <h3 className="section-title"><span className="section-icon">📝</span>Remarks</h3>
                <div className="form-group full-width">
                  <textarea name="agentRemarks" value={formData.agentRemarks} onChange={handleChange} rows="3" className="form-textarea" placeholder="Additional notes..." />
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
                  {loading ? 'Submitting...' : `Submit ${campaign} Entry`}
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
