import api from './index.js'

export const getDocument = (id, config = {}) => api.get(`/documents/${id}`, { ...{ responseType: 'blob' }, ...config })
export const uploadDocument = (applicationId, formData) => {
  formData.append('application_id', applicationId)
  return api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export const deleteDocument = (id) => api.delete(`/documents/${id}`)
