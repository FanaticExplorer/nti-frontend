import api from './index.js'

export const getStats = (config = {}) => api.get('/admin/stats', config)
export const getAuditLog = (params, config = {}) => api.get('/admin/audit-log', { params, ...config })
export const exportApplications = (format = 'csv', config = {}) => api.get('/admin/export/applications', { params: { format }, responseType: 'blob', ...config })
