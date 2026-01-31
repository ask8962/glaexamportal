'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme, ThemeToggle } from '@/contexts/ThemeContext';
import { getJobs } from '@/lib/db';
import { Job } from '@/types';
import { showToast } from '@/components/ui/Toast';

export default function JobPortalPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedLocation, setSelectedLocation] = useState('All');

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const data = await getJobs();
            setJobs(data);
        } catch (error) {
            console.error('Error loading jobs:', error);
            showToast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job =>
        (selectedType === 'All' || job.type === selectedType) &&
        (selectedLocation === 'All' || job.locationType === selectedLocation) &&
        (job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location.toLowerCase().includes(searchQuery.toLowerCase()))
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

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#fafafa] text-gray-900'}`}>

            {/* Professional Header */}
            <header className={`sticky top-0 z-50 border-b ${isDark ? 'bg-[#0a0a0a]/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-md`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="h-16 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href="/jobs" className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <span className="text-white font-bold text-lg">G</span>
                                </div>
                                <div>
                                    <span className="font-bold text-lg tracking-tight">GLA Careers</span>
                                </div>
                            </Link>
                            <nav className="hidden md:flex items-center gap-6">
                                <Link href="/jobs" className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Find Jobs</Link>
                                <Link href="#companies" className={`text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Companies</Link>
                                <Link href="#resources" className={`text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Resources</Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <Link href="/" className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}>
                                ExamPortal
                            </Link>
                            <Link href="/admin/jobs" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
                                Post a Job
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className={`relative py-20 ${isDark ? 'bg-gradient-to-b from-indigo-950/20 to-transparent' : 'bg-gradient-to-b from-indigo-50 to-transparent'}`}>
                <div className="max-w-4xl mx-auto px-6 text-center">
                    {/* Trust Badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>Verified & Trusted Job Listings</span>
                    </div>

                    <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Find Your Perfect
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Career Opportunity</span>
                    </h1>
                    <p className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Discover curated job openings from verified companies. Your next career move starts here.
                    </p>

                    {/* Search Bar */}
                    <div className={`p-1.5 rounded-2xl flex items-center gap-2 shadow-2xl max-w-2xl mx-auto ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-xl'}`}>
                        <div className="pl-4 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Job title, company, or keyword..."
                            className={`flex-1 bg-transparent border-none outline-none px-2 py-3.5 text-base ${isDark ? 'placeholder:text-gray-500' : 'placeholder:text-gray-400'}`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40">
                            Search
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center justify-center gap-8 md:gap-12 mt-12">
                        <div className="text-center">
                            <div className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{jobs.length}+</div>
                            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Active Jobs</div>
                        </div>
                        <div className={`w-px h-10 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                        <div className="text-center">
                            <div className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>50+</div>
                            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Companies</div>
                        </div>
                        <div className={`w-px h-10 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                        <div className="text-center">
                            <div className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>100%</div>
                            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Verified</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8">

                {/* Sidebar Filters */}
                <aside className={`w-full lg:w-72 flex-shrink-0 space-y-6 p-6 rounded-2xl h-fit lg:sticky lg:top-24 ${isDark ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <div>
                        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                            Job Type
                        </h3>
                        <div className="space-y-2">
                            {['All', 'Full-time', 'Part-time', 'Internship', 'Contract'].map(type => (
                                <label key={type} className="flex items-center gap-3 cursor-pointer group py-1">
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selectedType === type ? 'border-indigo-500 bg-indigo-500' : isDark ? 'border-gray-600 group-hover:border-gray-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                        {selectedType === type && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                    </div>
                                    <input type="radio" name="jobType" className="hidden" checked={selectedType === type} onChange={() => setSelectedType(type)} />
                                    <span className={`text-sm ${selectedType === type ? (isDark ? 'text-white font-medium' : 'text-gray-900 font-medium') : (isDark ? 'text-gray-400' : 'text-gray-600')}`}>
                                        {type}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={`w-full h-px ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />

                    <div>
                        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Location
                        </h3>
                        <div className="space-y-2">
                            {['All', 'Remote', 'Onsite', 'Hybrid'].map(loc => (
                                <label key={loc} className="flex items-center gap-3 cursor-pointer group py-1">
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selectedLocation === loc ? 'border-indigo-500 bg-indigo-500' : isDark ? 'border-gray-600 group-hover:border-gray-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                        {selectedLocation === loc && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                    </div>
                                    <input type="radio" name="location" className="hidden" checked={selectedLocation === loc} onChange={() => setSelectedLocation(loc)} />
                                    <span className={`text-sm ${selectedLocation === loc ? (isDark ? 'text-white font-medium' : 'text-gray-900 font-medium') : (isDark ? 'text-gray-400' : 'text-gray-600')}`}>
                                        {loc}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Job List */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {loading ? 'Loading opportunities...' : `${filteredJobs.length} opportunities found`}
                        </span>
                        <select className={`text-sm px-3 py-1.5 rounded-lg border ${isDark ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border-gray-200'}`}>
                            <option>Most Recent</option>
                            <option>Highest Salary</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-40 rounded-2xl animate-pulse ${isDark ? 'bg-gray-800/50' : 'bg-gray-200'}`} />
                            ))}
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className={`text-center py-20 rounded-2xl border-2 border-dashed ${isDark ? 'border-gray-800 bg-gray-900/30' : 'border-gray-200 bg-gray-50'}`}>
                            <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <svg className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Positions Available</h3>
                            <p className={`mb-6 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>We're actively adding new opportunities. Check back soon!</p>
                            <button onClick={() => { setSelectedType('All'); setSelectedLocation('All'); setSearchQuery(''); }} className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        filteredJobs.map(job => (
                            <div key={job.id} className={`group relative p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg ${isDark ? 'bg-gray-900/50 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-indigo-200 hover:shadow-indigo-100'}`}>
                                <div className="flex items-start gap-5">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${isDark ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'}`}>
                                        {job.logo || job.company.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className={`text-lg font-semibold mb-1 group-hover:text-indigo-500 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {job.title}
                                                </h3>
                                                <div className={`flex items-center gap-2 text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    <span className="font-medium">{job.company}</span>
                                                    <span>•</span>
                                                    <span>{job.location}</span>
                                                    <span>•</span>
                                                    <span className={`inline-flex items-center gap-1 ${job.locationType === 'Remote' ? 'text-green-500' : ''}`}>
                                                        {job.locationType === 'Remote' && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                                                        {job.locationType}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.type === 'Internship' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                                                    job.type === 'Full-time' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                                        job.type === 'Contract' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                                                            'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                                                    }`}>
                                                    {job.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center flex-wrap gap-2">
                                            {job.tags?.slice(0, 4).map(tag => (
                                                <span key={tag} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                                                    {tag}
                                                </span>
                                            ))}
                                            {job.tags && job.tags.length > 4 && (
                                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>+{job.tags.length - 4} more</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-3 flex-shrink-0">
                                        {job.salary && (
                                            <span className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {job.salary}
                                            </span>
                                        )}
                                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {getTimeAgo(job.createdAt)}
                                        </span>
                                        <Link
                                            href={`/jobs/${job.id}/apply`}
                                            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                                        >
                                            Apply Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className={`mt-20 border-t ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold">G</span>
                            </div>
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                © 2026 GLA Careers. All jobs are verified.
                            </span>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy" className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Privacy</Link>
                            <Link href="/terms" className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Terms</Link>
                            <Link href="/contact" className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Contact</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
