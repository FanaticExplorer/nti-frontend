import api from './index.js'

export const getMyTeams = (config = {}) => api.get('/teams/my', config)
export const getTeam = (id, config = {}) => api.get(`/teams/${id}`, config)
export const createTeam = (data) => api.post('/teams', data)
export const inviteTeamMember = (id, email) => api.post(`/teams/${id}/invite?email=${encodeURIComponent(email)}`)
export const removeTeamMember = (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`)
