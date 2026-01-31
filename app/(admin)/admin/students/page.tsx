'use client';

import { useEffect, useState } from 'react';
import { getStudents, formatTimestamp } from '@/lib/db';
import { User } from '@/types';
import { showToast } from '@/components/ui/Toast';

export default function StudentsPage() {
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const data = await getStudents();
            setStudents(data);
        } catch (error) {
            console.error('Failed to load students:', error);
            showToast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-fade-in font-mono space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-green-500/20 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-green-400 tracking-[0.2em] uppercase">Operative_Directory</h2>
                    <p className="text-xs text-green-500/50 mt-1">&gt;&gt; ACCESSING CLASSIFIED RECORDS...</p>
                </div>

                <div className="flex items-center gap-2 bg-black border border-green-500/30 px-3 py-2 w-full md:w-80 group focus-within:border-green-500 focus-within:shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all">
                    <span className="text-green-500 text-xs animate-pulse">{'>'}</span>
                    <input
                        type="text"
                        placeholder="QUERY_DATABASE..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-none text-green-400 text-sm w-full focus:outline-none placeholder-green-500/30 uppercase tracking-widest"
                    />
                    <div className="w-2 h-4 bg-green-500/50 animate-pulse" />
                </div>
            </div>

            {/* Table Card */}
            <div className="border border-green-500/20 bg-black/50 relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500" />

                <div className="overflow-x-auto p-1">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-green-500/20 bg-green-500/5 text-green-500 uppercase tracking-widest">
                                <th className="px-6 py-4 font-normal">Identity</th>
                                <th className="px-6 py-4 font-normal">Contact_Link</th>
                                <th className="px-6 py-4 font-normal">Missions_Completed</th>
                                <th className="px-6 py-4 font-normal">Last_Deployment</th>
                                <th className="px-6 py-4 font-normal">Initiation_Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-green-500/10">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><div className="h-4 bg-green-500/10 w-32 animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-green-500/10 w-48 animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-green-500/10 w-16 animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-green-500/10 w-32 animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-green-500/10 w-24 animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-green-500/50">
                                        [!] NO MATCHING RECORDS FOUND IN ARCHIVES
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.uid} className="hover:bg-green-500/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="text-green-400 group-hover:text-white font-bold transition-colors">
                                                {student.name?.toUpperCase() || 'UNKNOWN'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-green-500/60 font-mono">
                                            {student.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-green-400 font-bold">
                                                [{student.examsCompleted || 0}]
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-green-500/60">
                                            {student.lastExam?.type || student.lastExam?.name || 'In_Stasis'}
                                        </td>
                                        <td className="px-6 py-4 text-green-500/40">
                                            {student.createdAt ? formatTimestamp(student.createdAt) : 'Unknown'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
