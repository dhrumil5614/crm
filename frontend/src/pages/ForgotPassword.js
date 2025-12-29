import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP (admin), 3: New Password (admin)
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [resetToken, setResetToken] = useState('');

    const { forgotPassword, verifyResetOtp, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const result = await forgotPassword(formData.email);

        if (result.success) {
            setMessage(result.message);
            setIsAdmin(result.isAdmin);

            if (result.isAdmin) {
                setStep(2); // Admin: go to OTP step
            }
            // User: stay on same page with message
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await verifyResetOtp(formData.email, formData.otp);

        if (result.success) {
            setResetToken(result.resetToken);
            localStorage.setItem('token', result.resetToken); // Temporary token for reset
            setMessage(result.message);
            setStep(3); // Go to new password step
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const result = await resetPassword(formData.newPassword);

        if (result.success) {
            localStorage.removeItem('token'); // Clear temp token
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Forgot Password</h2>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="alert alert-success">
                        {message}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleEmailSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Processing...' : 'Submit'}
                        </button>

                        <div className="auth-switch" style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <Link to="/login">Back to Login</Link>
                        </div>
                    </form>
                )}

                {step === 2 && isAdmin && (
                    <form onSubmit={handleOtpSubmit}>
                        <div className="form-group">
                            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                                Enter the 6-digit code sent to <strong>{formData.email}</strong>
                            </p>
                            <label htmlFor="otp">Verification Code</label>
                            <input
                                type="text"
                                id="otp"
                                name="otp"
                                value={formData.otp}
                                onChange={handleChange}
                                required
                                placeholder="******"
                                maxLength="6"
                                style={{ letterSpacing: '2px', textAlign: 'center', fontSize: '1.2rem' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </form>
                )}

                {step === 3 && isAdmin && (
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                placeholder="Enter new password (min. 6 characters)"
                                minLength="6"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="Confirm new password"
                                minLength="6"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
