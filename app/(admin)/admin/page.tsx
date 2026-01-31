'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminAnalytics, formatTimestamp, calculatePercentage } from '@/lib/db';
import { AdminAnalytics } from '@/types';
import { showToast } from '@/components/ui/Toast';

// --- HUD Components ---

function HudCard({ label, value, icon, trend, color = 'green' }: { label: string, value: string | number, icon: any, trend?: string, color?: 'green' | 'amber' | 'cyan' | 'fuchsia' }) {
    const colors = {
        green: 'text-green-500 border-green-500/30 bg-green-900/10',
        amber: 'text-amber-500 border-amber-500/30 bg-amber-900/10',
        cyan: 'text-cyan-500 border-cyan-500/30 bg-cyan-900/10',
        fuchsia: 'text-fuchsia-500 border-fuchsia-500/30 bg-fuchsia-900/10',
    };

    const glowColors = {
        green: 'shadow-[0_0_20px_rgba(34,197,94,0.1)] hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]',
        amber: 'shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
        cyan: 'shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]',
        fuchsia: 'shadow-[0_0_20px_rgba(217,70,239,0.1)] hover:shadow-[0_0_30px_rgba(217,70,239,0.2)]',
    };

    return (
        <div className={`relative border p-6 transition-all duration-300 group ${colors[color]} ${glowColors[color]}`}>
            {/* Corner Brackets */}
            <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 opacity-50 ${color === 'green' ? 'border-green-500' : color === 'amber' ? 'border-amber-500' : color === 'cyan' ? 'border-cyan-500' : 'border-fuchsia-500'}`} />
            <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 opacity-50 ${color === 'green' ? 'border-green-500' : color === 'amber' ? 'border-amber-500' : color === 'cyan' ? 'border-cyan-500' : 'border-fuchsia-500'}`} />
            <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 opacity-50 ${color === 'green' ? 'border-green-500' : color === 'amber' ? 'border-amber-500' : color === 'cyan' ? 'border-cyan-500' : 'border-fuchsia-500'}`} />
            <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 opacity-50 ${color === 'green' ? 'border-green-500' : color === 'amber' ? 'border-amber-500' : color === 'cyan' ? 'border-cyan-500' : 'border-fuchsia-500'}`} />

            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">{label}</h3>
                    <div className="text-4xl font-mono font-bold tracking-tighter">{value}</div>
                    {trend && <div className="mt-2 text-[10px] font-mono opacity-60">&gt;&gt; {trend}</div>}
                </div>
                <div className="opacity-20 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12">
                    {icon}
                </div>
            </div>

            {/* Scanline overlay relative to card */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_2px] pointer-events-none opacity-20" />
        </div>
    );
}

function TerminalHeader({ title }: { title: string }) {
    return (
        <div className="flex items-end gap-2 mb-6 border-b border-green-500/20 pb-2">
            <h2 className="text-lg font-bold text-green-400 tracking-widest uppercase">{title}</h2>
            <div className="text-[10px] text-green-500/50 mb-1 font-mono">_init_module</div>
            <div className="flex-1" />
            <div className="flex gap-1">
                <div className="w-10 h-2 bg-green-500/20" />
                <div className="w-2 h-2 bg-green-500/40" />
                <div className="w-2 h-2 bg-green-500/60" />
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const data = await getAdminAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
            showToast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const passRate = analytics?.totalAttempts && analytics.totalAttempts > 0
        ? Math.round((analytics.recentAttempts?.filter(r => calculatePercentage(r.score, r.totalMarks) >= 60).length || 0) / analytics.totalAttempts * 100)
        : 0;

    return (
        <div className="animate-fade-in pb-20">

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <HudCard
                    label="USERS_REGISTERED"
                    value={loading ? '----' : (analytics?.totalStudents || 0).toString().padStart(4, '0')}
                    color="cyan"
                    icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                />
                <HudCard
                    label="EXAMS_DEPLOYED"
                    value={loading ? '----' : (analytics?.totalExams || 0).toString().padStart(4, '0')}
                    color="amber"
                    icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
                />
                <HudCard
                    label="TOTAL_ATTEMPTS"
                    value={loading ? '----' : (analytics?.totalAttempts || 0).toString().padStart(4, '0')}
                    color="fuchsia"
                    icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <HudCard
                    label="SUCCESS_RATE"
                    value={loading ? '--%' : `${passRate}%`}
                    trend="OPTIMAL"
                    color="green"
                    icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Data Feed */}
                <div className="lg:col-span-2">
                    <TerminalHeader title="LIVE_DATA_FEED" />

                    <div className="border border-green-500/20 bg-green-500/5 relative">
                        {/* Table Header Decoration */}
                        <div className="h-1 bg-green-500/20 w-full" />

                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono text-sm">
                                <thead>
                                    <tr className="border-b border-green-500/20 text-green-500/40 uppercase text-[10px] tracking-widest">
                                        <th className="px-4 py-2">Entity_ID</th>
                                        <th className="px-4 py-2">Module</th>
                                        <th className="px-4 py-2">Performance</th>
                                        <th className="px-4 py-2">Status</th>
                                        <th className="px-4 py-2">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-green-500/10">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-4 py-8 text-center text-green-500/40 animate-pulse">Scanning database...</td></tr>
                                    ) : !analytics?.recentAttempts || analytics.recentAttempts.length === 0 ? (
                                        <tr><td colSpan={5} className="px-4 py-8 text-center text-green-500/40">No records found within search parameters.</td></tr>
                                    ) : (
                                        analytics.recentAttempts.map((result) => (
                                            <tr key={result.id} className="hover:bg-green-500/10 transition-colors group cursor-crosshair">
                                                <td className="px-4 py-3 text-green-500 group-hover:text-white transition-colors flex items-center gap-2">
                                                    <span className="w-1 h-1 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    {result.userName || 'UNKNOWN'}
                                                </td>
                                                <td className="px-4 py-3 text-green-500/70">{result.examType || 'GENERIC'}</td>
                                                <td className="px-4 py-3 text-green-400 font-bold">{result.percentage || 0}<span className="text-[10px] opacity-50">%</span></td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] px-1 py-0.5 border ${result.grade === 'A' ? 'border-green-500 text-green-400 bg-green-500/10' :
                                                        result.grade === 'F' ? 'border-red-500 text-red-400 bg-red-500/10' :
                                                            'border-amber-500 text-amber-400 bg-amber-500/10'
                                                        }`}>
                                                        {result.grade === 'A' ? 'PASSED' : result.grade === 'F' ? 'FAILED' : 'PENDING'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-[10px] text-green-500/40">{formatTimestamp(result.dateCompleted)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* System Status Panel */}
                <div>
                    <TerminalHeader title="SYSTEM_DIAGNOSTICS" />

                    <div className="bg-black border border-green-500/20 p-4 space-y-6 relative overflow-hidden">
                        {/* Background Grid inside panel */}
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

                        <div className="relative z-10">
                            <div className="text-[10px] text-green-500/40 uppercase mb-1 flex justify-between">
                                <span>Core Temperature</span>
                                <span>34°C</span>
                            </div>
                            <div className="h-1 bg-green-900 w-full mb-4 overflow-hidden">
                                <div className="h-full bg-green-500 w-[30%] animate-[pulse_3s_infinite]" />
                            </div>

                            <div className="text-[10px] text-green-500/40 uppercase mb-1 flex justify-between">
                                <span>Memory Usage</span>
                                <span>{passRate}%</span>
                            </div>
                            <div className="h-1 bg-green-900 w-full mb-4 overflow-hidden">
                                <div className="h-full bg-green-500 animate-[pulse_5s_infinite]" style={{ width: `${passRate}%` }} />
                            </div>

                            <div className="text-[10px] text-green-500/40 uppercase mb-1 flex justify-between">
                                <span>Network Latency</span>
                                <span>12ms</span>
                            </div>
                            <div className="h-1 bg-green-900 w-full mb-4 overflow-hidden">
                                <div className="h-full bg-green-500 w-[12%] animate-pulse" />
                            </div>
                        </div>

                        <div className="mt-8 border-t border-green-500/20 pt-4">
                            <div className="font-mono text-[10px] text-green-500/60 leading-relaxed">
                                <p>&gt; SYSTEM CHECK COMPLETE.</p>
                                <p>&gt; {analytics?.totalAttempts || 0} RECORDS ANALYZED.</p>
                                <p>&gt; NO ANOMALIES DETECTED.</p>
                                <p className="animate-pulse">&gt; WAITING FOR INPUT_</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
