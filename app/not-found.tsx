import Link from 'next/link';
import { Button, Card } from '@/components/ui';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 p-4">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
            </div>

            <Card variant="glass" className="max-w-md w-full text-center relative z-10">
                <div className="text-8xl font-bold gradient-text mb-4">404</div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Page Not Found
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <div className="flex gap-3 justify-center">
                    <Link href="/">
                        <Button variant="secondary">Go Home</Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
