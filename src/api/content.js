import api from './index.js'

export const getNews = (params) => api.get('/content/news', { params })
export const getNewsArticle = (slug) => api.get(`/content/news/${slug}`)
export const createNews = (data) => api.post('/content/news', data)
export const updateNews = (id, data) => api.put(`/content/news/${id}`, data)
export const getPages = (params) => api.get('/content/pages', { params })
export const createPage = (data) => api.post('/content/pages', data)
export const updatePage = (id, data) => api.put(`/content/pages/${id}`, data)
