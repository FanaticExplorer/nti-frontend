import api from './index.js'

export const sendContactMessage = (data) => api.post('/content/contact', data)
export const getContactMessages = (params, config = {}) => api.get('/content/contact-messages', { params, ...config })
export const markContactMessageRead = (id) => api.patch(`/content/contact-messages/${id}/read`)
