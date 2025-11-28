import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

  // Remarks endpoints
  addRemark: (formId, message) => api.post(`/forms/${formId}/remarks`, { message }),
  getRemarks: (formId, startDate, endDate) => {
    let url = `/forms/${formId}/remarks`;
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return api.get(url);
  },

  // Excel export endpoint
  exportToExcel: (formId) => {
    return api.get(`/forms/${formId}/export`, {
      responseType: 'blob',
    });
  },
};

// Admin API
export const adminAPI = {
  getAllForms: (status) => api.get(`/admin/forms${status ? `?status=${status}` : ''}`),
  getPendingForms: () => api.get('/admin/forms/pending'),
  approveForm: (id, reviewComment) => api.put(`/admin/forms/${id}/approve`, { reviewComment }),
  rejectForm: (id, reviewComment) => api.put(`/admin/forms/${id}/reject`, { reviewComment }),
  getStats: () => api.get('/admin/stats'),
};

export default api;
