import api from './index.js'

export const getMyMentorships = (config = {}) => api.get('/mentorships/my', config)
export const getMentorship = (id, config = {}) => api.get(`/mentorships/${id}`, config)
export const createMentorship = (data) => api.post('/mentorships', data)
export const getMentorshipLogs = (id, config = {}) => api.get(`/mentorships/${id}/logs`, config)
export const addMentorshipLog = (id, data) => api.post(`/mentorships/${id}/logs`, data)
