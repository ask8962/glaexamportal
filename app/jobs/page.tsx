'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme, ThemeToggle } from '@/contexts/ThemeContext';

// Mock Data
const MOCK_JOBS = [
    {
        id: 1,
        title: 'Frontend Developer',
        company: 'TechCorp Solutions',
        location: 'Remote',
        type: 'Full-time',
        salary: '$80k - $120k',
        tags: ['React', 'Next.js', 'Tailwind'],
        posted: '2 days ago',
        logo: 'TC'
    },
    {
        id: 2,
        title: 'Product Designer',
        company: 'Creative Studio',
        location: 'New York, NY',
        type: 'Full-time',
        salary: '$90k - $130k',
        tags: ['Figma', 'UI/UX', 'Mobile'],
        posted: '4 hours ago',
        logo: 'CS'
    },
    {
        id: 3,
        title: 'Backend Intern',
        company: 'StartUp Inc',
        location: 'Bangalore, IN',
        type: 'Internship',
        salary: '₹25k/month',
        tags: ['Node.js', 'Python', 'SQL'],
        posted: '1 day ago',
        logo: 'SI'
    },
    {
        id: 4,
        title: 'DevOps Engineer',
        company: 'CloudSystems',
        location: 'Remote',
        type: 'Contract',
        salary: '$60/hr',
        tags: ['AWS', 'Docker', 'K8s'],
        posted: '3 days ago',
        logo: 'CS'
    }
];

export default function JobPortalPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('All');

    const filteredJobs = MOCK_JOBS.filter(job =>
        (selectedType === 'All' || job.type === selectedType) &&
        (job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 ${isDark ? 'bg-[#050505] text-white' : 'bg-gray-50 text-gray-900'}`}>

            {/* Header */}
            <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${isDark ? 'bg-black/50 border-white/10' : 'bg-white/80 border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">J</div>
                        <span className="font-bold text-lg tracking-tight">GlaJobs</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium">BETA</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link href="https://glaexamportal.site" className={`text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
                            Back to Portal
                        </Link>
                        <button className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                            Post a Job
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <div className="relative pt-20 pb-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className={`text-5xl md:text-6xl font-extrabold tracking-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">dream job</span>
                    </h1>
                    <p className={`text-lg mb-10 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Browse thousands of job openings from top companies and startups.
                    </p>

                    {/* Search Bar */}
                    <div className={`p-2 rounded-2xl flex items-center gap-2 shadow-2xl max-w-2xl mx-auto ${isDark ? 'bg-white/10 border border-white/10' : 'bg-white border border-gray-200'}`}>
                        <div className="pl-4 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Job title, keywords, or company"
                            className="flex-1 bg-transparent border-none outline-none px-2 py-3 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">

                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
                    <div>
                        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Job Type</h3>
                        <div className="space-y-2">
                            {['All', 'Full-time', 'Part-time', 'Internship', 'Contract'].map(type => (
                                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedType === type ? 'border-blue-500' : 'border-gray-500 group-hover:border-gray-400'}`}>
                                        {selectedType === type && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                    </div>
                                    <input type="radio" name="jobType" className="hidden" checked={selectedType === type} onChange={() => setSelectedType(type)} />
                                    <span className={`text-sm ${selectedType === type ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-gray-500' : 'text-gray-600')}`}>
                                        {type}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Job List */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Showing {filteredJobs.length} results
                        </span>
                    </div>

                    {filteredJobs.map(job => (
                        <div key={job.id} className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.01] cursor-pointer ${isDark ? 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-lg'}`}>
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                    {job.logo}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className={`text-lg font-semibold mb-1 group-hover:text-blue-500 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {job.title}
                                            </h3>
                                            <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {job.company} • {job.location}
                                            </p>
                                        </div>
                                        {job.type === 'Internship' && (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                                Internship
                                            </span>
                                        )}
                                        {job.type === 'Full-time' && (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                                Full-time
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center flex-wrap gap-2 mt-2">
                                        {job.tags.map(tag => (
                                            <span key={tag} className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${isDark ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {job.salary}
                                    </span>
                                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {job.posted}
                                    </span>
                                    <button className="mt-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50">
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
