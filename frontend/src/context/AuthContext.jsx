import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_BASE = 'http://127.0.0.1:8000'

// Role-based page permissions
export const ROLE_PAGES = {
    admin: ['/', '/fleet', '/dispatch', '/maintenance', '/expenses', '/drivers', '/analytics'],
    manager: ['/', '/fleet', '/maintenance', '/expenses', '/drivers', '/analytics'],
    dispatcher: ['/', '/fleet', '/dispatch'],
    driver: ['/', '/expenses'],
}

// Role display labels
export const ROLE_LABELS = {
    admin: 'Administrator',
    manager: 'Fleet Manager',
    dispatcher: 'Dispatcher',
    driver: 'Driver',
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    // Restore session from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('ff_token')
        const savedUser = localStorage.getItem('ff_user')
        if (savedToken && savedUser) {
            setToken(savedToken)
            setUser(JSON.parse(savedUser))
            // Set default axios header
            axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
        }
        setLoading(false)
    }, [])

    const login = async (username, password) => {
        const res = await axios.post(`${API_BASE}/api/auth/login`, { username, password })
        const { access_token, user: userData } = res.data
        setToken(access_token)
        setUser(userData)
        localStorage.setItem('ff_token', access_token)
        localStorage.setItem('ff_user', JSON.stringify(userData))
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
        return userData
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('ff_token')
        localStorage.removeItem('ff_user')
        delete axios.defaults.headers.common['Authorization']
    }

    const isAuthenticated = !!token && !!user

    // Check if user has access to a specific path
    const hasAccess = (path) => {
        if (!user) return false
        const allowedPages = ROLE_PAGES[user.role] || []
        return allowedPages.includes(path)
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated, hasAccess }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
