import { Navigate } from 'react-router-dom'
import { useAuth, ROLE_LABELS } from '../context/AuthContext'

export default function ProtectedRoute({ children, requiredPath }) {
    const { user, hasAccess } = useAuth()

    if (!hasAccess(requiredPath)) {
        return (
            <div className="flex flex-col items-center justify-center py-20 fade-in">
                <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-red-400 text-[40px]">lock</span>
                </div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Access Restricted</h2>
                <p className="text-[var(--color-text-secondary)] text-sm mb-1">
                    Your role <strong className="text-[var(--color-text-primary)]">({ROLE_LABELS[user?.role]})</strong> does not have access to this page.
                </p>
                <p className="text-xs text-slate-400 mb-6">Contact your administrator to request access.</p>
                <a
                    href="/"
                    className="px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                    Go to Dashboard
                </a>
            </div>
        )
    }

    return children
}
