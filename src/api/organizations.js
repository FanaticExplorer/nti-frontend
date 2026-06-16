import api from './index.js'

export const getOrganizations = (params) => api.get('/organizations', { params })
export const getOrganization = (id) => api.get(`/organizations/${id}`)
export const updateOrganization = (id, data) => api.put(`/organizations/${id}`, data)
export const approveOrganization = (id) => api.patch(`/organizations/${id}/approve`)
export const addOrganizationMember = (id, data) => api.post(`/organizations/${id}/members`, data)
