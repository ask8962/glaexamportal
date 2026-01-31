interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function Badge({
    children,
    variant = 'default',
    size = 'md',
    className = '',
}: BadgeProps) {
    const variants = {
        default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
        success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
        danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    return (
        <span
            className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
        >
            {children}
        </span>
    );
}

// Status Badge specifically for exam status
export function StatusBadge({ isPublished }: { isPublished: boolean }) {
    return (
        <Badge variant={isPublished ? 'success' : 'warning'}>
            {isPublished ? 'Published' : 'Draft'}
        </Badge>
    );
}

// Score Badge with color based on percentage
export function ScoreBadge({ score, total }: { score: number; total: number }) {
    const percentage = total > 0 ? (score / total) * 100 : 0;

    let variant: BadgeProps['variant'] = 'danger';
    if (percentage >= 80) variant = 'success';
    else if (percentage >= 60) variant = 'info';
    else if (percentage >= 40) variant = 'warning';

    return (
        <Badge variant={variant} size="lg">
            {score}/{total} ({Math.round(percentage)}%)
        </Badge>
    );
}
