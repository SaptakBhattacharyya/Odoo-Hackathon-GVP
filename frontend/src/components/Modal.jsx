import { useEffect, useRef } from 'react'

export default function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
    const ref = useRef()

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        if (open) document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open, onClose])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div ref={ref} className={`relative bg-white rounded-2xl shadow-2xl ${width} w-full mx-4 max-h-[85vh] overflow-y-auto animate-modal`}>
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">close</span>
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    )
}
