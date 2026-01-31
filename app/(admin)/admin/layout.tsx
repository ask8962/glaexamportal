'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/components/ui/Toast';

const navItems = [
    { href: '/admin', label: 'COMMAND_CENTER', icon: 'M4 6h16M4 12h16M4 18h16' }, // Bars
    { href: '/admin/students', label: 'OPERATIVES', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }, // Users
    { href: '/admin/questions', label: 'DATA_BANKS', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' }, // Database
    { href: '/admin/exams', label: 'SIMULATIONS', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }, // Screen
    { href: '/admin/take-exam', label: 'TEST_DRIVE', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' }, // Play
    { href: '/admin/results', label: 'TELEMETRY', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }, // Chart
    { href: '/admin/profile', label: 'CONFIG', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }, // Cog
]

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, signOut, isAdmin } = useAuth();
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }) + '.' + Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0'));
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // Auth Check
    if (!loading && (!user || !isAdmin)) {
        if (typeof window !== 'undefined') router.push('/login');
        return null;
    }

    if (loading) return <div className="bg-black text-green-500 h-screen font-mono flex items-center justify-center">INITIALIZING_NEURAL_LINK...</div>;

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch {
            showToast.error('Disconnection failed');
        }
    };

    return (
        <div className="min-h-screen bg-black text-green-400 font-mono overflow-hidden relative selection:bg-green-500 selection:text-black">

            {/* --- SCIFI BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none perspective-container z-0">
                {/* Grid Floor */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(1000px)_rotateX(60deg)_translateY(-100px)_scale(2)] origin-top opacity-50" />
                {/* Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.2))] bg-[size:100%_4px] opacity-10 pointer-events-none" />
                <div className="absolute inset-x-0 h-[2px] bg-green-500/20 blur-sm animate-scanline" />
            </div>

            {/* --- TOP HUD BAR --- */}
            <header className="fixed top-0 left-0 right-0 h-14 bg-black/80 backdrop-blur-md border-b border-green-500/20 z-50 flex items-center justify-between px-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-bold tracking-widest text-green-500">SYS_ONLINE</span>
                    </div>
                    <div className="h-6 w-[1px] bg-green-500/20" />
                    <div className="text-xs text-green-500/70 tracking-widest">
                        SECURE_CONN_ESTABLISHED
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-green-500/50 uppercase tracking-widest">Universal Time</div>
                        <div className="text-sm font-bold text-green-400 font-mono">{currentTime}</div>
                    </div>
                    <div className="flex items-center gap-3 border-l border-green-500/20 pl-6">
                        <div className="text-right">
                            <div className="text-xs font-bold text-white tracking-wider">{user?.name?.toUpperCase()}</div>
                            <div className="text-[10px] text-green-500/70">LVL_9_ADMIN</div>
                        </div>
                        <button onClick={handleLogout} className="p-2 hover:bg-green-500/10 rounded-sm border border-transparent hover:border-green-500/30 transition-all text-red-500/80 hover:text-red-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* --- SIDEBAR HUD --- */}
            <aside className="fixed top-14 left-0 bottom-0 w-64 bg-black/90 border-r border-green-500/20 z-40 flex flex-col pt-6 backdrop-blur-sm">
                <div className="px-6 mb-8">
                    <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600" style={{ textShadow: '0 0 20px rgba(74, 222, 128, 0.5)' }}>
                        NEXUS<span className="text-white text-base not-italic ml-1 font-light opacity-50">OS</span>
                    </h1>
                    <div className="mt-1 h-[1px] w-full bg-gradient-to-r from-green-500/50 to-transparent" />
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative group flex items-center gap-4 px-4 py-3 text-xs font-bold tracking-widest uppercase transition-all duration-200 border-l-2 ${isActive
                                    ? 'bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                                    : 'border-transparent text-green-500/40 hover:text-green-400 hover:bg-green-500/5 hover:border-green-500/30'
                                    }`}
                            >
                                <svg className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                {item.label}
                                {isActive && <div className="absolute right-2 w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6">
                    <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                        <div className="text-[10px] text-green-500/60 uppercase mb-1">System Load</div>
                        <div className="flex items-end gap-1 h-8 mt-2">
                            <div className="flex-1 bg-green-500/20 h-full relative group">
                                <div className="absolute bottom-0 w-full bg-green-500 animate-[pulse_1s_infinite] h-[40%]" />
                            </div>
                            <div className="flex-1 bg-green-500/20 h-full relative group">
                                <div className="absolute bottom-0 w-full bg-green-500 animate-[pulse_1.5s_infinite] h-[70%]" />
                            </div>
                            <div className="flex-1 bg-green-500/20 h-full relative group">
                                <div className="absolute bottom-0 w-full bg-green-500 animate-[pulse_0.8s_infinite] h-[50%]" />
                            </div>
                            <div className="flex-1 bg-green-500/20 h-full relative group">
                                <div className="absolute bottom-0 w-full bg-green-500 animate-[pulse_1.2s_infinite] h-[85%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="ml-64 pt-14 min-h-screen relative z-10 p-8">
                {/* Holographic Container Effect for Children */}
                <div className="relative animate-fade-in-up">
                    {children}
                </div>
            </main>

            <style jsx global>{`
                @keyframes scanline {
                    0% { top: -10%; }
                    100% { top: 110%; }
                }
                .animate-scanline {
                    animation: scanline 8s linear infinite;
                }
                 /* Custom Scrollbar */
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: #000;
                }
                ::-webkit-scrollbar-thumb {
                    background: #064e3b;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #22c55e;
                }
            `}</style>
        </div>
    );
}
