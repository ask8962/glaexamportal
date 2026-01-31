'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { getJobById, submitJobApplication } from '@/lib/db';
import { Job, JobApplicationFormData } from '@/types';
import { showToast } from '@/components/ui/Toast';

export default function ApplyJobPage() {
    const { theme } = useTheme();
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;
    const isDark = theme === 'dark';

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState<JobApplicationFormData>({
        applicantName: '',
        applicantEmail: '',
        phone: '',
        yearsOfExperience: 0,
        currentRole: '',
        skills: [],
        coverLetter: '',
        linkedinUrl: '',
        portfolioUrl: '',
    });

    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        loadJob();
    }, [jobId]);

    const loadJob = async () => {
        try {
            const data = await getJobById(jobId);
            if (!data) {
                showToast.error('Job not found');
                router.push('/jobs');
                return;
            }
            setJob(data);
        } catch (error) {
            showToast.error('Failed to load job');
            router.push('/jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const skill = skillInput.trim();
            if (skill && !formData.skills.includes(skill)) {
                setFormData({ ...formData, skills: [...formData.skills, skill] });
            }
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!job) return;

        // Validation
        if (!formData.applicantName || !formData.applicantEmail || !formData.phone) {
            showToast.error('Please fill in all required fields');
            return;
        }

        if (formData.skills.length === 0) {
            showToast.error('Please add at least one skill');
            return;
        }

        setSubmitting(true);
        try {
            await submitJobApplication(job.id, job.title, job.company, formData);
            setSubmitted(true);
            showToast.success('Application submitted successfully!');
        } catch (error) {
            console.error(error);
            showToast.error('Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (submitted) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                <div className={`max-w-md w-full mx-4 p-8 rounded-2xl text-center ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-xl'}`}>
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Application Submitted!</h1>
                    <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Thank you for applying to <span className="font-semibold">{job?.title}</span> at {job?.company}.
                        We'll review your application and get back to you soon.
                    </p>
                    <Link href="/jobs" className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
                        Browse More Jobs
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <header className={`sticky top-0 z-50 border-b ${isDark ? 'bg-[#0a0a0a]/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-md`}>
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/jobs" className="flex items-center gap-2">
                        <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Back to Jobs</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">G</span>
                        </div>
                        <span className="font-bold">GLA Careers</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Job Summary Card */}
                <div className={`p-6 rounded-2xl mb-8 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}`}>
                            {job?.logo || job?.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h1 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{job?.title}</h1>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                {job?.company} • {job?.location} • {job?.locationType}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${job?.type === 'Full-time' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                job?.type === 'Internship' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                                    'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                            }`}>
                            {job?.type}
                        </span>
                    </div>
                </div>

                {/* Application Form */}
                <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Apply for this position</h2>
                    <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Please fill out the form below. Fields marked with * are required.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.applicantName}
                                    onChange={e => setFormData({ ...formData, applicantName: e.target.value })}
                                    placeholder="John Doe"
                                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${isDark ? 'bg-gray-800 border-gray-700 focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-500'}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.applicantEmail}
                                    onChange={e => setFormData({ ...formData, applicantEmail: e.target.value })}
                                    placeholder="john@example.com"
                                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${isDark ? 'bg-gray-800 border-gray-700 focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-500'}`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${isDark ? 'bg-gray-800 border-gray-700 focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-500'}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Years of Experience *</label>
                                <select
                                    required
                                    value={formData.yearsOfExperience}
                                    onChange={e => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
                                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${isDark ? 'bg-gray-800 border-gray-700 focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-500'}`}
                                >
                                    <option value={0}>Fresher (0 years)</option>
                                    <option value={1}>1 year</option>
                                    <option value={2}>2 years</option>
                                    <option value={3}>3 years</option>
                                    <option value={4}>4 years</option>
                                    <option value={5}>5+ years</option>
                                    <option value={10}>10+ years</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Current Role / Designation</label>
                            <input
                                type="text"
                                value={formData.currentRole}
                                onChange={e => setFormData({ ...formData, currentRole: e.target.value })}
                                placeholder="e.g., Software Developer at XYZ Company"
                                className={`w-full px-4 py-3 rounded-xl border transition-colors ${isDark ? 'bg-gray-800 border-gray-700 focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-500'}`}
                            />
                        </div>

                        {/* Skills */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Skills * (Press Enter to add)</label>
                            <input
                                type="text"
                                value={skillInput}
                                onChange={e => setSkillInput(e.target.value)}
                                onKeyDown={handleSkillAdd}
                                placeholder="e.g., React, Python, AWS"
                                className={`w-full px-4 py-3 rounded-xl border transition-colors ${isDark ? 'bg-gray-800 border-gray-700 focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-500'}`}
                            />
                            {formData.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.skills.map(skill => (
                                        <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-medium">
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 ml-1">×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Links */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>LinkedIn Profile</label>
                                <input
                                    type="url"
                                    value={formData.linkedinUrl}
                                    onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${isDark ? 'bg-gray-800 border-gray-700 focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-500'}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Portfolio / GitHub</label>
                                <input
                                    type="url"
                                    value={formData.portfolioUrl}
                                    onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })}
                                    placeholder="https://github.com/yourusername"
                                    className={`w-full px-4 py-3 rounded-xl border transition-colors ${isDark ? 'bg-gray-800 border-gray-700 focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-500'}`}
                                />
                            </div>
                        </div>

                        {/* Cover Letter */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Cover Letter / Why should we hire you?</label>
                            <textarea
                                rows={5}
                                value={formData.coverLetter}
                                onChange={e => setFormData({ ...formData, coverLetter: e.target.value })}
                                placeholder="Tell us about yourself, your experience, and why you're a great fit for this role..."
                                className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${isDark ? 'bg-gray-800 border-gray-700 focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-500'}`}
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex items-center justify-between pt-4">
                            <Link href="/jobs" className={`px-6 py-3 rounded-xl font-medium transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                            >
                                {submitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
