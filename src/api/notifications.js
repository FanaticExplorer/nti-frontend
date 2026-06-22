import api from './index.js'

export const getNotifications = (params, config = {}) => api.get('/notifications', { params, ...config })
export const getUnreadCount = (config = {}) => api.get('/notifications/unread-count', config)
export const toggleNotificationRead = (id) => api.patch(`/notifications/${id}/read`)
export const markAllRead = () => api.patch('/notifications/read-all')
