import api from './index.js'

export const getOrganizations = (params, config = {}) => api.get('/organizations', { params, ...config })
export const getOrganization = (id, config = {}) => api.get(`/organizations/${id}`, config)
export const createOrganization = (data) => api.post('/organizations', data)
export const updateOrganization = (id, data) => api.put(`/organizations/${id}`, data)
export const approveOrganization = (id) => api.patch(`/organizations/${id}/approve`)
export const addOrganizationMember = (id, data) => api.post(`/organizations/${id}/members`, data)
export const getOrganizationMembers = (id, config = {}) => api.get(`/organizations/${id}/members`, config)
export const updateOrganizationMember = (orgId, userId, data) => api.patch(`/organizations/${orgId}/members/${userId}`, data)
export const removeOrganizationMember = (orgId, userId) => api.delete(`/organizations/${orgId}/members/${userId}`)
