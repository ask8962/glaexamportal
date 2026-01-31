'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, ThemeToggle } from '@/contexts/ThemeContext';
import { getResultsByUser, formatTimestamp, calculatePercentage } from '@/lib/db';
import { Result } from '@/types';
import { showToast } from '@/components/ui/Toast';
import { formatTimeHMS } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Premium Components ---

function ProgressRing({ percentage, size = 80, stroke = 6, color = 'text-violet-500' }: { percentage: number, size?: number, stroke?: number, color?: string }) {
    const { theme } = useTheme();
    const safePercentage = isNaN(percentage) ? 0 : percentage;
    const radius = (size - stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (safePercentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    className={theme === 'dark' ? 'text-white/5' : 'text-gray-200'}
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
            <span className={`absolute text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{safePercentage}%</span>
        </div>
    );
}

function ZenCard({ children, className = '', onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) {
    const { theme } = useTheme();

    return (
        <div
            onClick={onClick}
            className={`relative backdrop-blur-2xl rounded-3xl p-6 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className} ${theme === 'dark'
                ? 'bg-white/5 border border-white/10 hover:border-white/20'
                : 'bg-white border border-gray-200 hover:border-violet-300 shadow-sm'
                }`}
        >
            {children}
        </div>
    );
}

export default function ResultsPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState<Result | null>(null);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
        if (user) loadResults();
    }, [user, authLoading, router]);

    const loadResults = async () => {
        try {
            const data = await getResultsByUser(user!.uid);
            setResults(data);
            if (data.length > 0) setSelectedResult(data[0]);
        } catch (error) {
            showToast.error('Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    const getGradeColor = (grade?: string) => {
        if (grade === 'A' || grade === 'A+') return 'text-emerald-400';
        if (grade === 'F') return 'text-red-400';
        return 'text-amber-400';
    };

    const handleDownloadReport = () => {
        if (!selectedResult) return;

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // Header
            doc.setFillColor(124, 58, 237); // Violet
            doc.rect(0, 0, pageWidth, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text('Performance Report', 20, 25);

            doc.setFontSize(10);
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - 20, 25, { align: 'right' });

            // Exam Details
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(14);
            doc.text(selectedResult.examTitle || 'Exam Result', 20, 60);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Student: ${selectedResult.userName}`, 20, 70);
            doc.text(`Date: ${formatTimestamp(selectedResult.dateCompleted)}`, 20, 76);

            // Stats Grid
            const percentage = selectedResult.percentage || calculatePercentage(selectedResult.score, selectedResult.totalMarks);
            const passed = percentage >= 40; // Assuming 40% pass

            // Score Box
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(250, 250, 250);
            doc.roundedRect(120, 55, 70, 35, 3, 3, 'FD');

            doc.setFontSize(16);
            doc.setTextColor(124, 58, 237);
            doc.text(`${percentage}%`, 155, 70, { align: 'center' });

            doc.setFontSize(10);
            // Green or Red color logic
            if (passed) {
                doc.setTextColor(34, 197, 94); // Green 500
            } else {
                doc.setTextColor(239, 68, 68); // Red 500
            }
            doc.text(passed ? 'PASSED' : 'FAILED', 155, 80, { align: 'center' });

            // Data Table
            const tableData = [
                ['Total Score', `${selectedResult.score} / ${selectedResult.totalMarks}`],
                ['Correct Answers', `${selectedResult.correctAnswers || 0}`],
                ['Wrong Answers', `${selectedResult.wrongAnswers || 0}`],
                ['Time Taken', formatTimeHMS(selectedResult.timeSpent || 0)],
                ['Accuracy', `${selectedResult.correctAnswers && selectedResult.totalQuestions ? Math.round((selectedResult.correctAnswers / selectedResult.totalQuestions) * 100) : 0}%`]
            ];

            autoTable(doc, {
                startY: 100,
                head: [['Metric', 'Value']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [124, 58, 237], textColor: 255 },
                alternateRowStyles: { fillColor: [245, 245, 255] },
                styles: { fontSize: 11, cellPadding: 6 }
            });

            // Footer
            const finalY = (doc as any).lastAutoTable.finalY + 20;
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text('Powered by ExamPortal', pageWidth / 2, finalY, { align: 'center' });

            doc.save(`ExamReport_${selectedResult.examTitle.replace(/\s+/g, '_')}.pdf`);
            showToast.success('Report downloaded successfully');
        } catch (error) {
            console.error(error);
            showToast.error('Failed to generate report');
        }
    };

    const isDark = theme === 'dark';

    if (loading || authLoading) return (
        <div className={`min-h-screen flex items-center justify-center font-mono text-sm animate-pulse ${isDark ? 'bg-[#020204] text-violet-400' : 'bg-gray-50 text-violet-600'
            }`}>
            LOADING_RECORDS...
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
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">E</div>
                        <span className={`font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>ExamPortal</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className={`text-sm transition-colors ${isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Dashboard</Link>
                        <Link href="/profile" className={`text-sm transition-colors ${isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Profile</Link>
                        <div className={`h-4 w-[1px] ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                        <ThemeToggle />
                        <button onClick={handleLogout} className={`transition-colors ${isDark ? 'text-neutral-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">

                {/* Header */}
                <div className="mb-10 animate-fade-in-up">
                    <h1 className={`text-4xl font-light tracking-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Results</h1>
                    <p className={isDark ? 'text-neutral-400' : 'text-gray-500'}>A record of your academic journey.</p>
                </div>

                {results.length === 0 ? (
                    <ZenCard className="text-center py-20">
                        <div className="text-5xl mb-4 opacity-50">📊</div>
                        <h3 className={`text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Results Yet</h3>
                        <p className={`mb-6 ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>Complete your first exam to see results here.</p>
                        <Link href="/dashboard">
                            <button className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${isDark ? 'bg-white text-black hover:bg-violet-200' : 'bg-gray-900 text-white hover:bg-gray-800'
                                }`}>Go to Dashboard</button>
                        </Link>
                    </ZenCard>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
                        {/* Results List */}
                        <div className="lg:col-span-2 space-y-4">
                            {results.map((result) => {
                                const percentage = result.percentage || calculatePercentage(result.score, result.totalMarks);
                                const isSelected = selectedResult?.id === result.id;
                                const baseClasses = "flex items-center gap-6 group cursor-pointer";
                                const activeClasses = isDark
                                    ? "ring-2 ring-violet-500 border-violet-500/50 bg-white/10"
                                    : "ring-2 ring-violet-500 border-violet-500 bg-white";

                                return (
                                    <ZenCard
                                        key={result.id}
                                        onClick={() => setSelectedResult(result)}
                                        className={`${baseClasses} ${isSelected ? activeClasses : ''}`}
                                    >
                                        <ProgressRing
                                            percentage={percentage}
                                            size={64}
                                            color={percentage >= 60 ? 'text-emerald-400' : percentage >= 40 ? 'text-amber-400' : 'text-red-400'}
                                        />
                                        <div className="flex-1">
                                            <h3 className={`text-lg font-medium transition-colors group-hover:text-violet-400 ${isDark ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                {result.examTitle || result.examType}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                                                <span className={isDark ? 'text-neutral-400' : 'text-gray-500'}>{formatTimestamp(result.dateCompleted)}</span>
                                                <span className="w-1 h-1 rounded-full bg-neutral-700" />
                                                <span className={isDark ? 'text-neutral-400' : 'text-gray-500'}>
                                                    {formatTimeHMS(result.timeSpent || 0)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right hidden sm:block">
                                            <div className={`text-2xl font-light ${isDark ? 'text-white' : 'text-gray-900'}`}>{result.score} <span className="text-sm text-neutral-500">/ {result.totalMarks}</span></div>
                                            <div className={`text-xs font-bold uppercase tracking-wider ${result.grade === 'P' ? 'text-green-500' : 'text-red-500'}`}>
                                                {percentage >= 40 ? 'Passed' : 'Failed'}
                                            </div>
                                        </div>
                                    </ZenCard>
                                );
                            })}
                        </div>

                        {/* Detail Panel */}
                        <div className="lg:col-span-1">
                            {selectedResult && (
                                <div className={`sticky top-32 rounded-3xl p-8 border backdrop-blur-xl ${isDark ? 'bg-[#0a0a0a]/50 border-white/10' : 'bg-white/80 border-gray-200 shadow-xl'
                                    }`}>
                                    <div className="text-center mb-8">
                                        <div className={`text-sm uppercase tracking-widest mb-2 ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>Performance Score</div>
                                        <div className={`text-6xl font-light mb-2 ${getGradeColor(selectedResult.grade)
                                            }`}>
                                            {selectedResult.percentage || calculatePercentage(selectedResult.score, selectedResult.totalMarks)}%
                                        </div>
                                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200 text-gray-700'
                                            }`}>
                                            Grade: {selectedResult.grade || 'N/A'}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {[
                                            { label: 'Total Score', value: `${selectedResult.score} / ${selectedResult.totalMarks}` },
                                            { label: 'Time Taken', value: formatTimeHMS(selectedResult.timeSpent || 0) },
                                            { label: 'Correct Answers', value: selectedResult.correctAnswers || 0 },
                                            { label: 'Accuracy', value: `${selectedResult.totalQuestions > 0 ? Math.round((selectedResult.correctAnswers / selectedResult.totalQuestions) * 100) : 0}%` },
                                        ].map((stat, i) => (
                                            <div key={i} className={`flex justify-between items-center pb-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'
                                                }`}>
                                                <span className={isDark ? 'text-neutral-400' : 'text-gray-500'}>{stat.label}</span>
                                                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleDownloadReport}
                                        className={`w-full mt-8 py-3 rounded-xl font-medium transition-colors ${isDark
                                            ? 'bg-white/10 text-white hover:bg-white/20'
                                            : 'bg-violet-600 text-white hover:bg-violet-700'
                                            }`}>
                                        Download Report
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
