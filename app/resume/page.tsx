'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Resume, ResumeFormData } from '@/types';
import { saveResume, getUserResumes } from '@/lib/db';
import { showToast } from '@/components/ui/Toast';
import ResumeForm from '@/components/resume/ResumeForm';
import ResumePreview from '@/components/resume/ResumePreview';

const INITIAL_DATA: ResumeFormData = {
    title: 'My Resume',
    template: 'modern',
    personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
};

export default function ResumeBuilderPage() {
    const { user, loading: authLoading } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [resumeData, setResumeData] = useState<ResumeFormData>(INITIAL_DATA);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

    useEffect(() => {
        if (user?.email) {
            setResumeData(prev => ({
                ...prev,
                personalInfo: {
                    ...prev.personalInfo,
                    fullName: user.name || '',
                    email: user.email || '',
                }
            }));
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await saveResume(user.uid, resumeData);
            showToast.success('Resume saved successfully!');
        } catch (error) {
            console.error(error);
            showToast.error('Failed to save resume');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return null;

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <header className={`sticky top-0 z-50 border-b ${isDark ? 'bg-[#0a0a0a]/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-md`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">R</span>
                        </div>
                        <span className="font-bold text-lg">Resume Builder</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex md:hidden bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('editor')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'editor' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
                            >
                                Editor
                            </button>
                            <button
                                onClick={() => setActiveTab('preview')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
                            >
                                Preview
                            </button>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                            )}
                            Save Draft
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8 h-[calc(100vh-64px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                    {/* Editor Panel */}
                    <div className={`h-full overflow-y-auto pr-2 ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`}>
                        <ResumeForm data={resumeData} onChange={setResumeData} />
                    </div>

                    {/* Preview Panel */}
                    <div className={`h-full bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 ${activeTab === 'editor' ? 'hidden md:block' : 'block'}`}>
                        <div className="h-full overflow-y-auto p-8 flex justify-center">
                            <ResumePreview data={resumeData} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
