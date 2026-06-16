import api from './index.js'

export const getCalls = (params) => api.get('/calls', { params })
export const getCall = (id) => api.get(`/calls/${id}`)
export const createCall = (data) => api.post('/calls', data)
export const updateCall = (id, data) => api.put(`/calls/${id}`, data)
export const changeCallStatus = (id, data) => api.patch(`/calls/${id}/status`, data)
