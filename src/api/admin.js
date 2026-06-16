import api from './index.js'

export const getStats = () => api.get('/admin/stats')
export const getAuditLog = (params) => api.get('/admin/audit-log', { params })
export const exportApplications = () => api.get('/admin/export/applications', { responseType: 'blob' })
