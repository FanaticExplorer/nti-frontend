import api from './index.js'

export const sendContactMessage = (data) => api.post('/contact', data)
export const getContactMessages = (params, config = {}) => api.get('/admin/contact-messages', { params, ...config })
export const markContactMessageRead = (id) => api.patch(`/admin/contact-messages/${id}/read`)
