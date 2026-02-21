import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
    }, [])

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div className="fixed top-4 right-4 z-[100] space-y-2">
                {toasts.map(t => (
                    <div key={t.id} className={`toast-in flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${t.type === 'success' ? 'bg-emerald-600 text-white' :
                            t.type === 'error' ? 'bg-red-600 text-white' :
                                'bg-blue-600 text-white'
                        }`}>
                        <span className="material-symbols-outlined text-[18px]">
                            {t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}
                        </span>
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    return useContext(ToastContext)
}
