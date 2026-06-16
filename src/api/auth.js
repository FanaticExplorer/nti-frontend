import api from './index.js'

export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)
export const refreshToken = (token) => api.post('/auth/refresh', { refresh_token: token })
export const getMe = (config = {}) => api.get('/auth/me')
export const forgotPassword = (email) => api.post('/auth/forgot-password', { ...{ email }, ...config })
export const resetPassword = (data) => api.post('/auth/reset-password', data)
export const verifyEmail = (token) => api.post('/auth/verify-email', { token })
