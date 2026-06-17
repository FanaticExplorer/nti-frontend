import api from './index.js'

export const getDocument = (id, config = {}) => api.get(`/documents/${id}`, { ...{ responseType: 'blob' }, ...config })
export const uploadDocument = (applicationId, formData) => api.post(`/documents?application_id=${applicationId}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
