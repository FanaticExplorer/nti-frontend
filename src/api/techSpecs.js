import api from './index.js'

export const getTechSpecs = (params, config = {}) => api.get('/tech-specs', { params, ...config })
export const getTechSpec = (id, config = {}) => api.get(`/tech-specs/${id}`, config)
export const createTechSpec = (data) => api.post('/tech-specs', data)
export const updateTechSpec = (id, data) => api.patch(`/tech-specs/${id}`, data)
export const changeTechSpecStatus = (id, data) => api.patch(`/tech-specs/${id}/status`, data)
export const deleteTechSpec = (id) => api.delete(`/tech-specs/${id}`)
export const getTechSpecBacklog = (params, config = {}) => api.get('/tech-specs/backlog', { params, ...config })
export const getFirmTechSpecDashboard = (config = {}) => api.get('/tech-specs/firm/dashboard', config)
