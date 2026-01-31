interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

export default function Skeleton({
    className = '',
    variant = 'text',
    width,
    height,
    animation = 'pulse',
}: SkeletonProps) {
    const variants = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    const animations = {
        pulse: 'animate-pulse',
        wave: 'animate-shimmer',
        none: '',
    };

    const defaultHeight = variant === 'text' ? 'h-4' : variant === 'circular' ? 'h-10 w-10' : 'h-20';

    return (
        <div
            className={`
        bg-gray-200 dark:bg-gray-700
        ${variants[variant]}
        ${animations[animation]}
        ${className}
        ${!width && !height ? defaultHeight : ''}
      `}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
            }}
        />
    );
}

// Card Skeleton
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
    return (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl">
            <Skeleton variant="text" className="h-6 w-3/4 mb-4" />
            <Skeleton variant="text" className="h-4 w-1/2 mb-6" />
            <div className="space-y-3">
                {Array.from({ length: lines }).map((_, i) => (
                    <Skeleton key={i} variant="text" className="h-4" width={`${100 - i * 15}%`} />
                ))}
            </div>
        </div>
    );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-gray-200 dark:border-gray-700">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-4">
                    <Skeleton
                        variant="text"
                        className="h-4"
                        width={i === 0 ? '80%' : i === columns - 1 ? '60%' : '70%'}
                    />
                </td>
            ))}
        </tr>
    );
}

// Exam Card Skeleton
export function ExamCardSkeleton() {
    return (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <Skeleton variant="text" className="h-6 w-3/4 mb-2" />
                    <Skeleton variant="text" className="h-4 w-1/2" />
                </div>
                <Skeleton variant="rectangular" className="h-8 w-20 rounded-full" />
            </div>
            <div className="flex gap-4 mb-4">
                <Skeleton variant="text" className="h-4 w-24" />
                <Skeleton variant="text" className="h-4 w-24" />
                <Skeleton variant="text" className="h-4 w-24" />
            </div>
            <Skeleton variant="rectangular" className="h-10 w-full rounded-xl" />
        </div>
    );
}

// Dashboard Stats Skeleton
export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Skeleton variant="circular" className="h-12 w-12" />
                        <Skeleton variant="text" className="h-4 w-16" />
                    </div>
                    <Skeleton variant="text" className="h-8 w-24 mb-1" />
                    <Skeleton variant="text" className="h-4 w-32" />
                </div>
            ))}
        </div>
    );
}
