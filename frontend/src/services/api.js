import axios from 'axios'

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('ff_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Handle 401 errors globally
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('ff_token')
            localStorage.removeItem('ff_user')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

export default api
