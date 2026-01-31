'use client';

import { useEffect, useState } from 'react';
import { getAllResults, formatTimestamp, calculatePercentage } from '@/lib/db';
import { getGrade } from '@/lib/utils';
import { Result } from '@/types';
import { showToast } from '@/components/ui/Toast';

export default function ResultsPage() {
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        try {
            const data = await getAllResults();
            setResults(data);
        } catch (error) {
            console.error('Failed to load results:', error);
            showToast.error('Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    const filteredResults = results.filter(r =>
        r.examType?.toLowerCase().includes(filter.toLowerCase()) ||
        r.userName?.toLowerCase().includes(filter.toLowerCase())
    );

    const exportCSV = () => {
        const headers = ['Student', 'Email', 'Exam', 'Score', 'Percentage', 'Grade', 'Date'];
        const rows = filteredResults.map(r => [
            r.userName || 'Unknown',
            r.userEmail || '',
            r.examType || r.examTitle,
            `${r.score}/${r.totalMarks || r.totalQuestions}`,
            `${r.percentage || 0}%`,
            r.grade || 'N/A',
            formatTimestamp(r.dateCompleted),
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exam-results-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Stats - use percentage from data or calculate
    const totalAttempts = results.length;
    const avgScore = totalAttempts > 0
        ? Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / totalAttempts)
        : 0;
    const passCount = results.filter(r => (r.percentage || 0) >= 60).length;
    const passRate = totalAttempts > 0 ? Math.round((passCount / totalAttempts) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Attempts</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '...' : totalAttempts}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '...' : `${avgScore}%`}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Pass Rate</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '...' : `${passRate}%`}</p>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">All Exam Results</h2>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Search results..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-48"
                        />
                        <button
                            onClick={exportCSV}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                        >
                            Export CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                                <th className="px-4 py-3 font-medium">Student</th>
                                <th className="px-4 py-3 font-medium">Exam</th>
                                <th className="px-4 py-3 font-medium">Score</th>
                                <th className="px-4 py-3 font-medium">Percentage</th>
                                <th className="px-4 py-3 font-medium">Grade</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-8" /></td>
                                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                                    </tr>
                                ))
                            ) : filteredResults.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                        No results found
                                    </td>
                                </tr>
                            ) : (
                                filteredResults.map((result) => {
                                    return (
                                        <tr key={result.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">{result.userName || 'Unknown'}</td>
                                            <td className="px-4 py-3 text-sm text-purple-600">{result.examType || result.examTitle}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{result.score}/{result.totalMarks || result.totalQuestions}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{result.percentage || 0}%</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-sm font-medium ${result.grade === 'A' ? 'text-green-600' :
                                                        result.grade === 'F' ? 'text-red-600' :
                                                            'text-gray-600'
                                                    }`}>
                                                    {result.grade || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-purple-600">{formatTimestamp(result.dateCompleted)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
