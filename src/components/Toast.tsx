'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' }

type ToastContextType = {
    toast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const toast = useCallback((message: string, type: Toast['type'] = 'info') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
    }, [])

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 animate-in slide-in-from-right ${
                            t.type === 'success' ? 'bg-emerald-600 text-white' :
                            t.type === 'error' ? 'bg-red-600 text-white' :
                            'bg-blue-600 text-white'
                        }`}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
