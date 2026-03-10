import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const benchmarkApi = {
  getAll: (filters?: any) => api.get('/benchmarks', { params: filters }).then(r => r.data),
  getById: (id: string) => api.get(`/benchmarks/${id}`).then(r => r.data),
  create: (data: any) => api.post('/benchmarks', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/benchmarks/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/benchmarks/${id}`).then(r => r.data),
  compare: (ids: string[]) => api.post('/benchmarks/compare', { benchmarkIds: ids }).then(r => r.data),
  generateReport: (id: string) => api.post(`/benchmarks/${id}/reports/teardown`).then(r => r.data),
};

export const projectApi = {
  getAll: () => api.get('/projects').then(r => r.data),
  getById: (id: string) => api.get(`/projects/${id}`).then(r => r.data),
  create: (data: any) => api.post('/projects', data).then(r => r.data),
};

export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }).then(r => r.data),
  register: (data: any) => api.post('/auth/register', data).then(r => r.data),
};

export default api;