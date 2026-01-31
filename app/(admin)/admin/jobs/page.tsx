'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getAllJobs, createJob, updateJob, deleteJob, formatTimestamp } from '@/lib/db';
import { Job, JobFormData } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract'] as const;
const LOCATION_TYPES = ['Remote', 'Onsite', 'Hybrid'] as const;

export default function AdminJobsPage() {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const isDark = theme === 'dark';

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState<JobFormData>({
        title: '',
        company: '',
        location: '',
        locationType: 'Remote',
        type: 'Full-time',
        salary: '',
        description: '',
        tags: [],
        applyLink: '',
        logo: '',
        isActive: true,
    });

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/dashboard');
        }
        if (isAdmin) loadJobs();
    }, [authLoading, isAdmin, router]);

    const loadJobs = async () => {
        try {
            const data = await getAllJobs();
            setJobs(data);
        } catch (error) {
            showToast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (job?: Job) => {
        if (job) {
            setEditingJob(job);
            setFormData({
                title: job.title,
                company: job.company,
                location: job.location,
                locationType: job.locationType,
                type: job.type,
                salary: job.salary || '',
                description: job.description,
                tags: job.tags || [],
                applyLink: job.applyLink,
                logo: job.logo || '',
                isActive: job.isActive,
            });
        } else {
            setEditingJob(null);
            setFormData({
                title: '',
                company: '',
                location: '',
                locationType: 'Remote',
                type: 'Full-time',
                salary: '',
                description: '',
                tags: [],
                applyLink: '',
                logo: '',
                isActive: true,
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingJob) {
                await updateJob(editingJob.id, formData);
                showToast.success('Job updated successfully');
            } else {
                await createJob(formData);
                showToast.success('Job created successfully');
            }
            setModalOpen(false);
            loadJobs();
        } catch (error) {
            showToast.error('Failed to save job');
        }
    };

    const handleDelete = async (jobId: string) => {
        try {
            await deleteJob(jobId);
            showToast.success('Job deleted');
            setDeleteConfirm(null);
            loadJobs();
        } catch (error) {
            showToast.error('Failed to delete job');
        }
    };

    const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const input = e.currentTarget;
            const tag = input.value.trim();
            if (tag && !formData.tags.includes(tag)) {
                setFormData({ ...formData, tags: [...formData.tags, tag] });
            }
            input.value = '';
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (authLoading || loading) {
        return <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Job Management</h1>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Manage job postings for the Job Portal</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    + Add New Job
                </Button>
            </div>

            {/* Search */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white border border-gray-200'}`}>
                <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                />
            </div>

            {/* Jobs Table */}
            <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-800/50' : 'bg-white border border-gray-200'}`}>
                <table className="w-full">
                    <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Job Title</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Company</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredJobs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No jobs found. Create your first job posting!
                                </td>
                            </tr>
                        ) : (
                            filteredJobs.map(job => (
                                <tr key={job.id} className={isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{job.title}</div>
                                        <div className="text-sm text-gray-500">{job.location}</div>
                                    </td>
                                    <td className="px-6 py-4">{job.company}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.type === 'Full-time' ? 'bg-green-100 text-green-700' :
                                            job.type === 'Internship' ? 'bg-purple-100 text-purple-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {job.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {job.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenModal(job)}>Edit</Button>
                                        <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(job.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingJob ? 'Edit Job' : 'Add New Job'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Job Title *</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Company *</label>
                            <input
                                type="text"
                                required
                                value={formData.company}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Location *</label>
                            <input
                                type="text"
                                required
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g., New York, NY or Bangalore"
                                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Location Type</label>
                            <select
                                value={formData.locationType}
                                onChange={e => setFormData({ ...formData, locationType: e.target.value as any })}
                                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            >
                                {LOCATION_TYPES.map(lt => <option key={lt} value={lt}>{lt}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Job Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            >
                                {JOB_TYPES.map(jt => <option key={jt} value={jt}>{jt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Salary (Optional)</label>
                            <input
                                type="text"
                                value={formData.salary}
                                onChange={e => setFormData({ ...formData, salary: e.target.value })}
                                placeholder="e.g., $80k - $120k"
                                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description *</label>
                        <textarea
                            required
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                    </div>



                    <div>
                        <label className="block text-sm font-medium mb-1">Tags (Press Enter to add)</label>
                        <input
                            type="text"
                            onKeyDown={handleTagInput}
                            placeholder="e.g., React, Python, AWS"
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">&times;</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                            className="rounded"
                        />
                        <label htmlFor="isActive" className="text-sm">Active (visible on job portal)</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit">{editingJob ? 'Update Job' : 'Create Job'}</Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Job">
                <p className="mb-6">Are you sure you want to delete this job posting? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                    <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
                </div>
            </Modal>
        </div>
    );
}
