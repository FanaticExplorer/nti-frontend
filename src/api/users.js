import api from './index.js'

export const getUsers = (params) => api.get('/users', { params })
export const getUser = (id) => api.get(`/users/${id}`)
export const changeUserRole = (id, data) => api.patch(`/users/${id}/role`, data)
export const deactivateUser = (id) => api.patch(`/users/${id}/deactivate`)
