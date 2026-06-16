import api from './index.js'

export const getOrganizations = (params, config = {}) => api.get('/organizations', { params, ...config })
export const getOrganization = (id, config = {}) => api.get(`/organizations/${id}`, config)
export const updateOrganization = (id, data) => api.put(`/organizations/${id}`, data)
export const approveOrganization = (id) => api.patch(`/organizations/${id}/approve`)
export const addOrganizationMember = (id, data) => api.post(`/organizations/${id}/members`, data)
