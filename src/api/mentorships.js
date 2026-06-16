import api from './index.js'

export const getMyMentorships = () => api.get('/mentorships/my')
export const getMentorship = (id) => api.get(`/mentorships/${id}`)
export const createMentorship = (data) => api.post('/mentorships', data)
export const getMentorshipLogs = (id) => api.get(`/mentorships/${id}/logs`)
export const addMentorshipLog = (id, data) => api.post(`/mentorships/${id}/logs`, data)
