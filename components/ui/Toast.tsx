'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export default function Toast() {
    return (
        <HotToaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: '#1f2937',
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
                },
                success: {
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
}

// Toast utility functions
import toast from 'react-hot-toast';

export const showToast = {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    loading: (message: string) => toast.loading(message),
    dismiss: (id?: string) => (id ? toast.dismiss(id) : toast.dismiss()),
    promise: <T,>(
        promise: Promise<T>,
        messages: { loading: string; success: string; error: string }
    ) => toast.promise(promise, messages),
};
