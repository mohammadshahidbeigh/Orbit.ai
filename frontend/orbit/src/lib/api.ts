import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include user email in headers
api.interceptors.request.use(async (config) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    config.headers['x-user-email'] = user.email;
  }
  return config;
});

export default api;

export const universitiesAPI = {
  getAll: (params?: any) => api.get('/api/universities', { params }),
  getById: (id: number) => api.get(`/api/universities/${id}`),
  compare: (ids: number[]) => api.get('/api/universities/compare', { params: { ids: ids.join(',') } }),
  getPeerStats: (id: number) => api.get(`/api/universities/${id}/peer-stats`),
  calculatePeerStats: () => api.post('/api/universities/calculate-peer-stats'),
  seedSamplePeerStats: () => api.post('/api/universities/seed-sample-peer-stats'),
};

export const userUniversitiesAPI = {
  getAll: () => api.get('/api/user-universities'),
  add: (data: any) => api.post('/api/user-universities', data),
  update: (id: number, data: any) => api.put(`/api/user-universities/${id}`, data),
  delete: (id: number) => api.delete(`/api/user-universities/${id}`),
  getComparisonData: () => api.get('/api/user-universities/compare'),
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

export const assessmentAPI = {
  submitAssessment: (data: any) => api.post('/api/assessments/assess', data),
  getAssessmentHistory: () => api.get('/api/assessments/history'),
  getRecommendations: (assessmentId: string) => api.get(`/api/assessments/recommendations/${assessmentId}`),
  updateWeights: (assessmentId: string, weights: any) => api.put(`/api/assessments/${assessmentId}/weights`, { weights }),
};

