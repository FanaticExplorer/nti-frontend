import api from './index.js'

export const getNews = (params, config = {}) => api.get('/content/news', { params, ...config })
export const getNewsArticle = (slug, config = {}) => api.get(`/content/news/${slug}`, config)
export const createNews = (data) => api.post('/content/news', data)
export const updateNews = (id, data) => api.put(`/content/news/${id}`, data)
export const getPages = (params, config = {}) => api.get('/content/pages', { params, ...config })
export const createPage = (data) => api.post('/content/pages', data)
export const updatePage = (id, data) => api.put(`/content/pages/${id}`, data)
