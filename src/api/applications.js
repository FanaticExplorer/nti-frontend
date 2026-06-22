import api from './index.js'

export const getMyApplications = (params, config = {}) => api.get('/applications/my', { params, ...config })
export const getAllApplications = (params, config = {}) => api.get('/applications', { params, ...config })
export const getApplication = (id, config = {}) => api.get(`/applications/${id}`, config)
export const createApplication = (data) => api.post('/applications', data)
export const updateApplication = (id, data) => api.put(`/applications/${id}`, data)
export const submitApplication = (id) => api.post(`/applications/${id}/submit`)
export const changeApplicationStatus = (id, data) => api.patch(`/applications/${id}/status`, data)
export const getApplicationHistory = (id, config = {}) => api.get(`/applications/${id}/history`, config)
export const getApplicationComments = (id, config = {}) => api.get(`/applications/${id}/comments`, config)
export const addApplicationComment = (id, data) => api.post(`/applications/${id}/comments`, data)
