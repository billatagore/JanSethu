import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.params = config.params || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: (token) => {
    return api.get('/api/auth/me', {
      params: { token },
    });
  },
};

// Problems API
export const problemsAPI = {
  list: (params) => api.get('/api/problems', { params }),
  create: (data) => api.post('/api/problems', data),
  getOne: (id) => api.get(`/api/problems/${id}`),
  vote: (id) => api.post(`/api/problems/${id}/vote`),
  removeVote: (id) => api.delete(`/api/problems/${id}/vote`),
  follow: (id) => api.post(`/api/problems/${id}/follow`),
  unfollow: (id) => api.delete(`/api/problems/${id}/follow`),
  analyze: (id) => api.post(`/api/problems/${id}/analyze`),
  getMatches: (id) => api.get(`/api/problems/${id}/matches`),
};

// Solutions API
export const solutionsAPI = {
  list: (problemId) => api.get(`/api/problems/${problemId}/solutions`),
  create: (problemId, data) => api.post(`/api/problems/${problemId}/solutions`, data),
  getOne: (problemId, solutionId) => api.get(`/api/problems/${problemId}/solutions/${solutionId}`),
};

// Teams API
export const teamsAPI = {
  create: (data) => api.post('/api/teams', data),
  getOne: (id) => api.get(`/api/teams/${id}`),
  join: (id, data) => api.post(`/api/teams/${id}/join`, data),
  getTasks: (id) => api.get(`/api/teams/${id}/tasks`),
  createTask: (id, data) => api.post(`/api/teams/${id}/tasks`, data),
  updateTask: (teamId, taskId, data) =>
    api.put(`/api/teams/${teamId}/tasks/${taskId}`, data),
};

// Comments API
export const commentsAPI = {
  create: (problemId, data) => api.post(`/api/comments/problems/${problemId}`, data),
  list: (problemId) => api.get(`/api/comments/problems/${problemId}`),
};

// Users API
export const usersAPI = {
  getProfile: (id) => api.get(`/api/users/${id}`),
  updateProfile: (id, data) => api.put(`/api/users/${id}`, data),
  getProblems: (id) => api.get(`/api/users/${id}/problems`),
  getSolutions: (id) => api.get(`/api/users/${id}/solutions`),
  getNotifications: (id) => api.get(`/api/users/${id}/notifications`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/api/analytics/dashboard'),
  getImpact: () => api.get('/api/analytics/impact'),
};

// Categories and SDGs API
export const dataAPI = {
  getCategories: () => api.get('/api/categories'),
  getSdgs: () => api.get('/api/sdgs'),
};

export default api;
