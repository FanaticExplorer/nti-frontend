import api from './index.js'

export const getDocument = (id, config = {}) => api.get(`/documents/${id}`, { ...{ responseType: 'blob' }, ...config })
export const uploadDocument = (formData) => api.post('/documents', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
