import api from './index.js'

export const getUsers = (params, config = {}) => api.get('/users', { params, ...config })
export const getUser = (id, config = {}) => api.get(`/users/${id}`, config)
export const changeUserRole = (id, data) => api.patch(`/users/${id}/role`, data)
export const deactivateUser = (id) => api.patch(`/users/${id}/deactivate`)
export const exportMyData = (config = {}) => api.get('/users/me/export', config)
export const deleteMyAccount = () => api.delete('/users/me')
