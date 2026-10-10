import api from './axios';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin-login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Applications ─────────────────────────────────────────────────────────────
export const applicationAPI = {
  submit: (formData) => api.post('/applications', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  submitJson: (data) => api.post('/applications', data),
  getMy: () => api.get('/applications/my'),
  getById: (id) => api.get(`/applications/${id}`),
  getAllAdmin: (params) => api.get('/applications/admin/all', { params }),
  updateStatus: (id, data) => api.patch(`/applications/admin/${id}/status`, data),
};

// ─── Global Search ────────────────────────────────────────────────────────────
export const searchAPI = {
  search: (params) => api.get('/search', { params }),
};

// ─── Translations (Backend i18n) ──────────────────────────────────────────────
export const translationAPI = {
  getByLang: (lang) => api.get(`/translations/${lang}`),
  getAll: (params) => api.get('/translations', { params }),
};

// ─── Branches ─────────────────────────────────────────────────────────────────
export const branchAPI = {
  getAll: (params) => api.get('/branches', { params }),
  getById: (id) => api.get(`/branches/${id}`),
  create: (data) => api.post('/branches', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/branches/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/branches/${id}`),
  getCount: () => api.get('/branches/count'),
};

// ─── Teachers ─────────────────────────────────────────────────────────────────
export const teacherAPI = {
  getAll: (params) => api.get('/teachers', { params }),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/teachers/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/teachers/${id}`),
  getCount: () => api.get('/teachers/count'),
};

// ─── Students ─────────────────────────────────────────────────────────────────
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/students/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/students/${id}`),
  getCount: () => api.get('/students/count'),
};

// ─── News ─────────────────────────────────────────────────────────────────────
export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  getAllAdmin: (params) => api.get('/news/admin/all', { params }),
  getById: (id) => api.get(`/news/${id}`),
  create: (data) => api.post('/news', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/news/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/news/${id}`),
  getCount: () => api.get('/news/count'),
};

// ─── Events ───────────────────────────────────────────────────────────────────
export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getAllAdmin: (params) => api.get('/events/admin/all', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/events/${id}`),
  getCount: () => api.get('/events/count'),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getActivities: (params) => api.get('/admin/activities', { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  getMedia: () => api.get('/admin/media'),
  uploadMedia: (formData) => api.post('/admin/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteMedia: (filename) => api.delete(`/admin/media/${filename}`),
};

// ─── Achievements ─────────────────────────────────────────────────────────────
export const achievementAPI = {
  getAll: (params) => api.get('/achievements', { params }),
  getById: (id) => api.get(`/achievements/${id}`),
  create: (data) => api.post('/achievements', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/achievements/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/achievements/${id}`),
  getCount: () => api.get('/achievements/count'),
};

// ─── Projects & Startups ──────────────────────────────────────────────────────
export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/projects/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/projects/${id}`),
  getCount: () => api.get('/projects/count'),
};

// ─── Student Results (Legacy Alias to Achievements) ───────────────────────────
export const resultAPI = {
  getAll: (params) => api.get('/achievements', { params }),
  getById: (id) => api.get(`/achievements/${id}`),
  create: (data) => api.post('/achievements', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/achievements/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/achievements/${id}`),
};

// ─── Languages (Dynamic Languages Management) ─────────────────────────────────
export const languageAPI = {
  getAll: (params) => api.get('/languages', { params }),
  getByCode: (code) => api.get(`/languages/${code}`),
  create: (data) => api.post('/languages', data),
  update: (code, data) => api.put(`/languages/${code}`, data),
  toggle: (code) => api.patch(`/languages/${code}/toggle`),
  delete: (code) => api.delete(`/languages/${code}`),
};

// ─── NIS AI AGENT ─────────────────────────────────────────────────────────────
export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
};


