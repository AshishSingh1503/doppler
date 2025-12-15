import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

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
};

export const projectAPI = {
  create: (projectData) => api.post('/projects', projectData),
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  getLogs: (id) => api.get(`/projects/${id}/logs`),
  getDeployments: (id) => api.get(`/projects/${id}/deployments`),
};

export const githubAPI = {
  getRepos: () => api.get('/github/repos'),
  authCallback: (code) => api.post('/auth/github/callback', { code }),
};

export default api;
