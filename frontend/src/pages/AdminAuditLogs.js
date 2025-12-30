import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalLogs, setTotalLogs] = useState(0);

    // Filters
    const [actionFilter, setActionFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [resourceFilter, setResourceFilter] = useState('');

    const { user } = useAuth();

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line
    }, [page, actionFilter, resourceFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page,
                    limit: 20,
                    action: actionFilter,
                    resource: resourceFilter
                }
            };

            // In real app, use the API service wrapper
            const response = await axios.get('http://localhost:5001/api/audit', config);

            setLogs(response.data.data);
            setTotalPages(response.data.totalPages);
            setTotalLogs(response.data.total);
        } catch (error) {
            console.error('Error fetching logs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        if (e.target.name === 'action') setActionFilter(e.target.value);
        if (e.target.name === 'resource') setResourceFilter(e.target.value);
        setPage(1); // Reset to page 1 on filter
    };

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="header-flex">
                    <h1>🛡️ Security Audit Logs</h1>
                    <button className="btn btn-secondary" onClick={fetchLogs}>
                        Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Action Type</label>
                            <select
                                className="form-control"
                                name="action"
                                value={actionFilter}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Actions</option>
                                <option value="LOGIN_SUCCESS">Login Success</option>
                                <option value="LOGIN_FAILED">Login Failed</option>
                                <option value="CREATE_LEAD">Create Lead</option>
                                <option value="UPDATE_LEAD">Update Lead</option>
                                <option value="ADD_REMARK">Add Remark</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Resource</label>
                            <select
                                className="form-control"
                                name="resource"
                                value={resourceFilter}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Resources</option>
                                <option value="Auth">Auth</option>
                                <option value="Form">Form/Lead</option>
                                <option value="User">User</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="card">
                    <div className="card-header">
                        <h3>Total Logs: {totalLogs}</h3>
                    </div>

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Action</th>
                                    <th>User</th>
                                    <th>Resource</th>
                                    <th>Status</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading logs...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No logs found</td></tr>
                                ) : (
                                    logs.map(log => (
                                        <tr key={log._id}>
                                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                                            <td>
                                                <span className={`badge ${log.action.includes('DELETE') ? 'badge-danger' :
                                                        log.action.includes('FAILED') ? 'badge-danger' :
                                                            'badge-primary'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td>
                                                {log.user ? (
                                                    <>
                                                        <div><strong>{log.user.name}</strong></div>
                                                        <small>{log.user.email}</small>
                                                    </>
                                                ) : 'System / Unknown'}
                                            </td>
                                            <td>{log.resource}</td>
                                            <td>
                                                <span style={{
                                                    color: log.status === 'SUCCESS' ? 'green' : 'red',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td>
                                                <details>
                                                    <summary>View JSON</summary>
                                                    <pre style={{ fontSize: '0.8rem', marginTop: '5px', maxHeight: '100px', overflow: 'auto' }}>
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </pre>
                                                </details>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button
                            className="btn btn-secondary"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Previous
                        </button>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            Page {page} of {totalPages || 1}
                        </span>
                        <button
                            className="btn btn-secondary"
                            disabled={page === totalPages || totalPages === 0}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminAuditLogs;
