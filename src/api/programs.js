import api from './index.js'

export const getPrograms = (params) => api.get('/programs', { params })
export const getProgram = (id) => api.get(`/programs/${id}`)
export const createProgram = (data) => api.post('/programs', data)
export const updateProgram = (id, data) => api.put(`/programs/${id}`, data)
