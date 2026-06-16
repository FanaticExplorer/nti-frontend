import api from './index.js'

export const getPrograms = (params, config = {}) => api.get('/programs', { params, ...config })
export const getProgram = (id, config = {}) => api.get(`/programs/${id}`, config)
export const createProgram = (data) => api.post('/programs', data)
export const updateProgram = (id, data) => api.put(`/programs/${id}`, data)
