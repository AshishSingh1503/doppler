import axiosInstance from '../utils/axiosInstance';

const API_URL =process.env.REACT_APP_API_URL || "http://localhost:5000";

export const authAPI = {
  login: async(credentials) => await axiosInstance.post('/api/auth/login', credentials),
  register: async(userData) => await axiosInstance.post('/api/auth/register', userData),
  logout: async() => await axiosInstance.post('/api/auth/logout', {}),

  // GitHub OAuth
  githubLogin: () => {
    window.location.href =
      `${API_URL}/api/auth/github`;
  },
};
