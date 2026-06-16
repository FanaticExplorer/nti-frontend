import api from './index.js'

export const getMilestones = (applicationId) => api.get(`/milestones/${applicationId}`)
export const createMilestone = (data) => api.post('/milestones', data)
export const updateMilestoneStatus = (id, data) => api.patch(`/milestones/${id}/status`, data)
