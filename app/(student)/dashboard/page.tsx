'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, ThemeToggle } from '@/contexts/ThemeContext';
import { getPublishedExams, getResultsByUser, formatTimestamp, formatDuration, calculatePercentage } from '@/lib/db';
import { Exam, Result } from '@/types';
import { showToast } from '@/components/ui/Toast';

// --- Premium Components ---

function ZenCard({ children, className = '', glow = false }: { children: React.ReactNode, className?: string, glow?: boolean }) {
    return (
        <div className={`relative bg-white/5 dark:bg-white/5 light:bg-white backdrop-blur-2xl border border-white/10 dark:border-white/10 light:border-gray-200 rounded-3xl p-6 transition-all duration-300 group hover:-translate-y-1 ${glow ? 'hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] hover:border-violet-500/30' : 'hover:border-white/20 dark:hover:border-white/20 light:hover:border-gray-300'} ${className}`}>
            {children}
        </div>
    );
}

function ProgressRing({ percentage, size = 60, stroke = 4, color = 'text-violet-500' }: { percentage: number, size?: number, stroke?: number, color?: string }) {
    const radius = (size - stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    className="text-white/5 dark:text-white/5"
                    strokeWidth={stroke}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={`${color} transition-all duration-1000 ease-out`}
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <span className="absolute text-[10px] font-bold text-white dark:text-white">{percentage}%</span>
        </div>
    );
}

export default function StudentDashboard() {
    const { user, loading: authLoading, signOut } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const [exams, setExams] = useState<Exam[]>([]);
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
        if (user?.role === 'admin') router.push('/admin');
        if (user) loadData();
    }, [user, authLoading, router]);

    const loadData = async () => {
        try {
            const [examsData, resultsData] = await Promise.all([
                getPublishedExams(),
                getResultsByUser(user!.uid),
            ]);
            setExams(examsData);
            setResults(resultsData);
        } catch (error) {
            showToast.error('Failed to sync study data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    const attemptedExamIds = new Set(results.map((r) => r.examId));
    const availableExams = exams.filter((e) => !attemptedExamIds.has(e.id));
    const attemptedExams = exams.filter((e) => attemptedExamIds.has(e.id));

    const totalScore = results.reduce((acc, r) => acc + r.score, 0);
    const totalMaxScore = results.reduce((acc, r) => acc + r.totalMarks, 0);
    const averagePercentage = totalMaxScore > 0 ? calculatePercentage(totalScore, totalMaxScore) : 0;

    const isDark = theme === 'dark';

    if (loading || authLoading) return (
        <div className={`min-h-screen flex items-center justify-center font-mono text-sm animate-pulse ${isDark ? 'bg-[#050505] text-violet-400' : 'bg-gray-50 text-violet-600'}`}>
            SYNCING_CONSCIOUSNESS...
        </div>
    );

    return (
        <div className={`min-h-screen selection:bg-violet-500/30 selection:text-violet-200 overflow-x-hidden font-sans transition-colors duration-300 ${isDark ? 'bg-[#020204] text-white' : 'bg-gradient-to-br from-gray-50 via-violet-50/30 to-white text-gray-900'
            }`}>

            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] ${isDark ? 'bg-violet-900/10' : 'bg-violet-200/40'}`} />
                <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] ${isDark ? 'bg-blue-900/10' : 'bg-blue-200/30'}`} />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
                <div className={`max-w-7xl mx-auto backdrop-blur-xl rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white/80 border border-gray-200'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            E
                        </div>
                        <span className={`font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>ExamPortal</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/results" className={`text-sm transition-colors ${isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>History</Link>
                        <Link href="/profile" className={`text-sm transition-colors ${isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Profile</Link>
                        <div className={`h-4 w-[1px] ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                        <ThemeToggle />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.name}</div>
                                <div className={`text-[10px] font-mono uppercase ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>Student</div>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${isDark ? 'bg-white/10 text-white' : 'bg-violet-100 text-violet-700'}`}>
                                {user?.name?.charAt(0)}
                            </div>
                            <button onClick={handleLogout} className={`transition-colors ${isDark ? 'text-neutral-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">

                {/* Welcome Hero */}
                <div className="mb-12 animate-fade-in-up">
                    <h1 className={`text-5xl font-light tracking-tight mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500 font-normal">excel</span> today?
                    </h1>
                    <p className={`max-w-xl text-lg font-light ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                        Your learning journey continues. You have <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{availableExams.length}</span> new challenges awaiting.
                    </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    {[
                        { label: 'Available', value: availableExams.length },
                        { label: 'Completed', value: attemptedExams.length },
                        { label: 'Avg. Score', value: `${averagePercentage}%` },
                        { label: 'Total Points', value: totalScore },
                    ].map((stat, index) => (
                        <div key={index} className={`backdrop-blur-2xl rounded-3xl p-6 text-center py-8 transition-all duration-300 hover:-translate-y-1 ${isDark
                                ? 'bg-white/5 border border-white/10 hover:border-white/20'
                                : 'bg-white border border-gray-200 hover:border-violet-300 shadow-sm'
                            }`}>
                            <div className={`text-3xl font-light mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                            <div className={`text-xs uppercase tracking-widest ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Section: Available Exams */}
                <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className={`text-xl font-light ${isDark ? 'text-white' : 'text-gray-900'}`}>New Challenges</h2>
                        <div className={`h-[1px] flex-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                    </div>

                    {availableExams.length === 0 ? (
                        <div className={`text-center py-20 rounded-3xl border border-dashed ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                            }`}>
                            <div className="text-4xl mb-4 opacity-50">✨</div>
                            <h3 className={`text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>All Caught Up</h3>
                            <p className={isDark ? 'text-neutral-500' : 'text-gray-400'}>You&apos;ve completed everything. Time to relax.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableExams.map((exam) => (
                                <div key={exam.id} className={`flex flex-col h-full rounded-3xl p-6 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] ${isDark
                                        ? 'bg-white/5 border border-white/10 hover:border-violet-500/30'
                                        : 'bg-white border border-gray-200 hover:border-violet-400 shadow-sm'
                                    }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-white/10 text-white' : 'bg-violet-100 text-violet-700'
                                            }`}>
                                            {exam.category || 'General'}
                                        </span>
                                        <span className={`text-xs font-mono ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
                                            {formatDuration(exam.duration)}
                                        </span>
                                    </div>

                                    <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{exam.title}</h3>
                                    <p className={`text-sm mb-6 flex-1 line-clamp-2 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                                        {exam.description || 'No description provided.'}
                                    </p>

                                    <div className={`flex items-center justify-between mt-auto pt-4 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                        <div className={`text-xs ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
                                            {exam.questionsCount} Questions • {exam.totalMarks} Marks
                                        </div>
                                        <Link href={`/exam/${exam.id}`}>
                                            <button className={`px-5 py-2 rounded-full text-xs font-bold transition-colors ${isDark
                                                    ? 'bg-white text-black hover:bg-violet-200'
                                                    : 'bg-violet-600 text-white hover:bg-violet-700'
                                                }`}>
                                                START
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Section: Recent History */}
                <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className={`text-xl font-light ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Achievements</h2>
                        <div className={`h-[1px] flex-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                        <Link href="/results" className={`text-xs transition-colors ${isDark ? 'text-neutral-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>View All</Link>
                    </div>

                    {attemptedExams.length === 0 ? (
                        <div className={`text-center py-12 font-light italic ${isDark ? 'text-neutral-600' : 'text-gray-400'}`}>
                            Your legacy begins with your first step.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {attemptedExams.slice(0, 3).map((exam) => {
                                const result = results.find((r) => r.examId === exam.id);
                                const percentage = result ? calculatePercentage(result.score, result.totalMarks) : 0;

                                return (
                                    <div key={exam.id} className={`flex items-center gap-6 rounded-3xl p-6 transition-all duration-300 ${isDark
                                            ? 'bg-white/5 border border-white/10 hover:border-white/20'
                                            : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'
                                        }`}>
                                        <ProgressRing
                                            percentage={percentage}
                                            size={64}
                                            color={percentage >= 60 ? 'text-emerald-400' : percentage >= 40 ? 'text-amber-400' : 'text-red-400'}
                                        />
                                        <div>
                                            <h4 className={`text-sm font-medium mb-1 line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{exam.title}</h4>
                                            <div className={`text-xs mb-1 ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>
                                                Score: <span className={isDark ? 'text-white' : 'text-gray-900'}>{result?.score}</span> / {result?.totalMarks}
                                            </div>
                                            <div className={`text-[10px] font-mono ${isDark ? 'text-neutral-600' : 'text-gray-400'}`}>
                                                {result?.dateCompleted ? formatTimestamp(result.dateCompleted) : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </main>

            <style jsx global>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
