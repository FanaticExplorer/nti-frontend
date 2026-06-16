import api from './index.js'

export const getCalls = (params, config = {}) => api.get('/calls', { params, ...config })
export const getCall = (id, config = {}) => api.get(`/calls/${id}`, config)
export const createCall = (data) => api.post('/calls', data)
export const updateCall = (id, data) => api.put(`/calls/${id}`, data)
export const changeCallStatus = (id, data) => api.patch(`/calls/${id}/status`, data)
