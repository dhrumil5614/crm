import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ReminderList from '../components/ReminderList';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="dashboard">
          <div className="dashboard-header">
            <h2>Welcome, {user?.name}!</h2>
          </div>

          {/* Reminders Section */}
          <ReminderList />

          <div className="dashboard-nav">
            {!isAdmin && (
              <>
                <button onClick={() => navigate('/new-entry')}>
                  Create New Entry
                </button>
                <button onClick={() => navigate('/history')}>
                  View My Entries
                </button>
              </>
            )}

            {isAdmin && (
              <>
                <button onClick={() => navigate('/admin/pending')}>
                  Pending Approvals
                </button>
                <button onClick={() => navigate('/admin/all-forms')}>
                  All Forms
                </button>
                <button onClick={() => navigate('/new-entry')}>
                  Create New Entry
                </button>
                <button onClick={() => navigate('/history')}>
                  View My Entries
                </button>
              </>
            )}
          </div>

          <div className="card">
            <h3>Quick Guide</h3>
            <div className="card-content">
              {!isAdmin ? (
                <ul>
                  <li><strong>Create New Entry:</strong> Submit a new form for approval</li>
                  <li><strong>View My Entries:</strong> See your submitted forms with their approval status</li>
                  <li>Forms can be Pending, Approved, or Rejected</li>
                </ul>
              ) : (
                <ul>
                  <li><strong>Pending Approvals:</strong> Review and approve/reject submitted forms</li>
                  <li><strong>All Forms:</strong> View all forms in the system</li>
                  <li><strong>Create New Entry:</strong> Submit your own forms</li>
                  <li><strong>View My Entries:</strong> See your personally submitted forms</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
