import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Forms API
export const formsAPI = {
  create: (data) => api.post('/forms', data),
  getAll: (status) => api.get(`/forms${status ? `?status=${status}` : ''}`),
  getById: (id) => api.get(`/forms/${id}`),
  delete: (id) => api.delete(`/forms/${id}`),
  addRemark: (id, data) => api.post(`/forms/${id}/remarks`, data),
  getRemarks: (id, params) => api.get(`/forms/${id}/remarks`, { params }),
  exportForm: (id) => api.get(`/forms/${id}/export`, { responseType: 'blob' }),
};

// Admin API
export const adminAPI = {
  getAllForms: (status) => api.get(`/admin/forms${status ? `?status=${status}` : ''}`),
  getPendingForms: () => api.get('/admin/forms/pending'),
  approveForm: (id, data) => api.put(`/admin/forms/${id}/approve`, data),
  rejectForm: (id, data) => api.put(`/admin/forms/${id}/reject`, data),
  getStats: () => api.get('/admin/stats'),
  exportAllForms: () => api.get('/admin/forms/export', { responseType: 'blob' }),
};

export default api;
