import api from './index.js'

export const getDocument = (id) => api.get(`/documents/${id}`, { responseType: 'blob' })
export const uploadDocument = (formData) => api.post('/documents', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
