import axios from 'axios';

const API_URL =process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),

  // 🔐 GitHub OAuth
  githubLogin: () => {
    window.location.href =
      `${API_URL.replace('/api', '')}/api/auth/github`;
  },
};

export const projectAPI = {
  create: (projectData) => api.post('/projects', projectData),
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  getLogs: (id) => api.get(`/projects/${id}/logs`),
  getDeployments: (id) => api.get(`/projects/${id}/deployments`),
};

export default api;
