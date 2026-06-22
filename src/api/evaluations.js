import api from './index.js'

export const getEvaluations = (applicationId, config = {}) => api.get(`/evaluations/${applicationId}`, config)
export const createEvaluation = (data) => api.post('/evaluations', data)
export const updateEvaluation = (id, data) => api.put(`/evaluations/${id}`, data)
