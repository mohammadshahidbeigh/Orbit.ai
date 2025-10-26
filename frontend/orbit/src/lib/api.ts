import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

export const universitiesAPI = {
  getAll: (params?: any) => api.get('/api/universities', { params }),
  getById: (id: number) => api.get(`/api/universities/${id}`),
  compare: (ids: number[]) => api.get('/api/universities/compare', { params: { ids: ids.join(',') } }),
  getPeerStats: (id: number) => api.get(`/api/universities/${id}/peer-stats`),
};

export const userUniversitiesAPI = {
  getAll: () => api.get('/api/user-universities'),
  add: (data: any) => api.post('/api/user-universities', data),
  update: (id: number, data: any) => api.put(`/api/user-universities/${id}`, data),
  delete: (id: number) => api.delete(`/api/user-universities/${id}`),
};

export const tasksAPI = {
  getAll: (params?: any) => api.get('/api/tasks', { params }),
  getTimeline: () => api.get('/api/tasks/timeline'),
  getKanban: (params?: any) => api.get('/api/tasks/kanban', { params }),
  create: (data: any) => api.post('/api/tasks', data),
  update: (id: number, data: any) => api.put(`/api/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/api/tasks/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
};

