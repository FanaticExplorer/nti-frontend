import api from './index.js'

export const getMyApplications = (params) => api.get('/applications/my', { params })
export const getAllApplications = (params) => api.get('/applications', { params })
export const getApplication = (id) => api.get(`/applications/${id}`)
export const createApplication = (data) => api.post('/applications', data)
export const updateApplication = (id, data) => api.put(`/applications/${id}`, data)
export const submitApplication = (id) => api.post(`/applications/${id}/submit`)
export const changeApplicationStatus = (id, data) => api.patch(`/applications/${id}/status`, data)
export const getApplicationHistory = (id) => api.get(`/applications/${id}/history`)
