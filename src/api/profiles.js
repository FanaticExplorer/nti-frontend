import api from './index.js'

export const getMyProfile = (config = {}) => api.get('/profiles/me', config)
export const createProfile = (data) => api.post('/profiles', data)
export const updateMyProfile = (data) => api.put('/profiles/me', data)
