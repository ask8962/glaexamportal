import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'solid';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    onClick?: () => void;
}

export default function Card({
    children,
    className = '',
    variant = 'glass',
    hover = false,
    padding = 'md',
    onClick,
}: CardProps) {
    const variants = {
        default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        glass:
            'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-xl',
        solid: 'bg-white dark:bg-gray-800 shadow-lg',
    };

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const hoverStyles = hover
        ? 'transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-purple-500/30 cursor-pointer'
        : '';

    return (
        <div
            className={`
        rounded-2xl
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverStyles}
        ${className}
      `}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

// Card Header Component
interface CardHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
    return (
        <div className="flex items-start justify-between mb-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                {subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

// Card Content Component
export function CardContent({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return <div className={className}>{children}</div>;
}

// Card Footer Component
export function CardFooter({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}
        >
            {children}
        </div>
    );
}
