'use client';

import { Fragment, ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
}: ModalProps) {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <Fragment>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 overflow-y-auto"
                onClick={handleBackdropClick}
            >
                <div className="flex min-h-full items-center justify-center p-4">
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        aria-hidden="true"
                    />

                    {/* Modal Panel */}
                    <div
                        className={`
              relative w-full ${sizes[size]}
              bg-white/90 dark:bg-gray-800/90
              backdrop-blur-xl
              rounded-2xl
              shadow-2xl
              border border-white/20 dark:border-gray-700/50
              transform transition-all
              animate-in fade-in zoom-in-95 duration-200
            `}
                    >
                        {/* Header */}
                        {(title || showCloseButton) && (
                            <div className="flex items-center justify-between p-6 pb-0">
                                {title && (
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {title}
                                    </h2>
                                )}
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="ml-auto p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-6">{children}</div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}

// Confirm Modal for delete actions
interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
    variant = 'danger',
}: ConfirmModalProps) {
    const variantColors = {
        danger: 'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600',
        warning: 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
        info: 'from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                    {cancelText}
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-xl bg-gradient-to-r ${variantColors[variant]} text-white transition-all disabled:opacity-50 flex items-center gap-2`}
                >
                    {isLoading && (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                    )}
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
}
