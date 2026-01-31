'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getAllApplications, updateApplicationStatus } from '@/lib/db';
import { JobApplication } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    reviewed: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    shortlisted: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

export default function AdminApplicationsPage() {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const isDark = theme === 'dark';

    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/dashboard');
        }
        if (isAdmin) loadApplications();
    }, [authLoading, isAdmin, router]);

    const loadApplications = async () => {
        try {
            const data = await getAllApplications();
            setApplications(data);
        } catch (error) {
            showToast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appId: string, newStatus: 'pending' | 'reviewed' | 'shortlisted' | 'rejected') => {
        try {
            await updateApplicationStatus(appId, newStatus);
            setApplications(apps => apps.map(a => a.id === appId ? { ...a, status: newStatus } : a));
            showToast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            showToast.error('Failed to update status');
        }
    };

    const filteredApplications = applications.filter(app =>
        (statusFilter === 'all' || app.status === statusFilter) &&
        (app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.company.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getTimeAgo = (timestamp: any) => {
        if (!timestamp) return 'Recently';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        if (diff < 1) return 'Just now';
        if (diff < 24) return `${diff}h ago`;
        const days = Math.floor(diff / 24);
        return `${days}d ago`;
    };

    if (authLoading || loading) {
        return <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Job Applications</h1>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>View and manage all job applications</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Total:</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{applications.length}</span>
                </div>
            </div>

            {/* Filters */}
            <div className={`p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-4 ${isDark ? 'bg-gray-800/50' : 'bg-white border border-gray-200'}`}>
                <input
                    type="text"
                    placeholder="Search by name, email, job title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
                <div className="flex items-center gap-2">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Pending', value: applications.filter(a => a.status === 'pending').length, color: 'yellow' },
                    { label: 'Reviewed', value: applications.filter(a => a.status === 'reviewed').length, color: 'blue' },
                    { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length, color: 'green' },
                    { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: 'red' },
                ].map(stat => (
                    <div key={stat.label} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white border border-gray-200'}`}>
                        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Applications Table */}
            <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-800/50' : 'bg-white border border-gray-200'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Applicant</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Job Applied</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Experience</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Applied</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        {applications.length === 0 ? 'No applications yet' : 'No matching applications'}
                                    </td>
                                </tr>
                            ) : (
                                filteredApplications.map(app => (
                                    <tr key={app.id} className={isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{app.applicantName}</div>
                                            <div className="text-sm text-gray-500">{app.applicantEmail}</div>
                                            <div className="text-xs text-gray-400">{app.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{app.jobTitle}</div>
                                            <div className="text-sm text-gray-500">{app.company}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {app.yearsOfExperience === 0 ? 'Fresher' : `${app.yearsOfExperience} yrs`}
                                            </span>
                                            {app.currentRole && (
                                                <div className="text-xs text-gray-500 mt-1">{app.currentRole}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={app.status}
                                                onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                                                className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_COLORS[app.status]}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="reviewed">Reviewed</option>
                                                <option value="shortlisted">Shortlisted</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {getTimeAgo(app.appliedAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button size="sm" variant="secondary" onClick={() => setSelectedApp(app)}>
                                                View Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Application Details Modal */}
            <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title="Application Details">
                {selectedApp && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedApp.applicantName}</h3>
                                    <p className="text-sm text-gray-500">{selectedApp.applicantEmail}</p>
                                    <p className="text-sm text-gray-500">{selectedApp.phone}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedApp.status]}`}>
                                    {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Job Info */}
                        <div>
                            <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Applied For</h4>
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedApp.jobTitle}</div>
                            <div className="text-sm text-gray-500">{selectedApp.company}</div>
                        </div>

                        {/* Experience */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Experience</h4>
                                <div className={isDark ? 'text-white' : 'text-gray-900'}>
                                    {selectedApp.yearsOfExperience === 0 ? 'Fresher' : `${selectedApp.yearsOfExperience} years`}
                                </div>
                            </div>
                            {selectedApp.currentRole && (
                                <div>
                                    <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Current Role</h4>
                                    <div className={isDark ? 'text-white' : 'text-gray-900'}>{selectedApp.currentRole}</div>
                                </div>
                            )}
                        </div>

                        {/* Skills */}
                        <div>
                            <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedApp.skills?.map(skill => (
                                    <span key={skill} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Links */}
                        {(selectedApp.linkedinUrl || selectedApp.portfolioUrl) && (
                            <div className="flex gap-4">
                                {selectedApp.linkedinUrl && (
                                    <a href={selectedApp.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm">
                                        LinkedIn Profile →
                                    </a>
                                )}
                                {selectedApp.portfolioUrl && (
                                    <a href={selectedApp.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm">
                                        Portfolio/GitHub →
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Cover Letter */}
                        {selectedApp.coverLetter && (
                            <div>
                                <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cover Letter</h4>
                                <div className={`p-4 rounded-xl text-sm whitespace-pre-wrap ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                    {selectedApp.coverLetter}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button variant="secondary" onClick={() => setSelectedApp(null)}>Close</Button>
                            {selectedApp.status === 'pending' && (
                                <>
                                    <Button variant="danger" onClick={() => { handleStatusChange(selectedApp.id, 'rejected'); setSelectedApp(null); }}>
                                        Reject
                                    </Button>
                                    <Button onClick={() => { handleStatusChange(selectedApp.id, 'shortlisted'); setSelectedApp(null); }}>
                                        Shortlist
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
