import api from './index.js'

export const getMilestones = (applicationId, config = {}) => api.get(`/milestones/${applicationId}`, config)
export const createMilestone = (data) => api.post('/milestones', data)
export const updateMilestoneStatus = (id, data) => api.patch(`/milestones/${id}/status`, data)
