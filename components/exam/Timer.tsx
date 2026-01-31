'use client';

interface TimerProps {
    seconds: number;
    onComplete?: () => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showWarning?: boolean;
    warningThreshold?: number;
}

import { useEffect, useState, useCallback } from 'react';
import { formatTimeHMS } from '@/lib/utils';

export default function Timer({
    seconds: initialSeconds,
    onComplete,
    className = '',
    size = 'md',
    showWarning = true,
    warningThreshold = 300, // 5 minutes
}: TimerProps) {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isComplete, setIsComplete] = useState(false);

    const handleComplete = useCallback(() => {
        setIsComplete(true);
        onComplete?.();
    }, [onComplete]);

    useEffect(() => {
        if (seconds <= 0) {
            handleComplete();
            return;
        }

        const interval = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [handleComplete, seconds]);

    const isWarning = showWarning && seconds <= warningThreshold && seconds > 0;
    const isCritical = seconds <= 60;

    const sizes = {
        sm: 'text-lg px-3 py-1.5',
        md: 'text-xl px-4 py-2',
        lg: 'text-2xl px-5 py-3',
    };

    return (
        <div
            className={`
        inline-flex items-center gap-2 rounded-xl font-mono font-bold
        ${sizes[size]}
        ${isCritical
                    ? 'bg-red-500/10 text-red-500 animate-pulse'
                    : isWarning
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400'
                }
        ${className}
      `}
        >
            <svg
                className={`w-5 h-5 ${isCritical ? 'animate-bounce' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            {formatTimeHMS(seconds)}
        </div>
    );
}
