import api from './index.js'

export const getMyTeams = () => api.get('/teams/my')
export const getTeam = (id) => api.get(`/teams/${id}`)
export const createTeam = (data) => api.post('/teams', data)
export const inviteTeamMember = (id, data) => api.post(`/teams/${id}/invite`, data)
export const removeTeamMember = (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`)
