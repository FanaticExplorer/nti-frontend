import api from './index.js'

export const getEvaluations = (applicationId) => api.get(`/evaluations/${applicationId}`)
