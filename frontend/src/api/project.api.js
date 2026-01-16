import axiosInstance from "../utils/axiosInstance";

export const projectAPI = {
  create: (projectData) => axiosInstance.post('/projects', projectData),
  getAll: () => axiosInstance.get('/projects'),
  getById: (id) => axiosInstance.get(`/projects/${id}`),
  getLogs: (id) => axiosInstance.get(`/projects/${id}/logs`),
  getDeployments: (id) => axiosInstance.get(`/projects/${id}/deployments`),
};