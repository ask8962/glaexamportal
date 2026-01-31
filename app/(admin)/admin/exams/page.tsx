'use client';

import { useEffect, useState } from 'react';
import {
    getExams,
    createExam,
    updateExam,
    deleteExam,
    getQuestions,
    formatDuration,
} from '@/lib/db';
import { Exam, ExamFormData, Question } from '@/types';
import Modal from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';

export default function TestsPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [expandedExam, setExpandedExam] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState<ExamFormData>({
        title: '',
        description: '',
        duration: 30,
        totalMarks: 100,
        isPublished: false,
    });

    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = async () => {
        try {
            const data = await getExams();
            setExams(data);
        } catch (error) {
            console.error('Failed to load exams:', error);
            showToast.error('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedExam(null);
        setForm({
            title: '',
            description: '',
            duration: 30,
            totalMarks: 100,
            isPublished: false,
        });
        setShowModal(true);
    };

    const handleEdit = (exam: Exam) => {
        setSelectedExam(exam);
        setForm({
            title: exam.title,
            description: exam.description,
            duration: exam.duration,
            totalMarks: exam.totalMarks,
            isPublished: exam.isPublished,
        });
        setShowModal(true);
    };

    const handleDelete = async (exam: Exam) => {
        if (!confirm(`Are you sure you want to delete "${exam.title}"?`)) return;

        try {
            await deleteExam(exam.id);
            showToast.success('Test deleted successfully');
            loadExams();
        } catch (error) {
            console.error('Failed to delete exam:', error);
            showToast.error('Failed to delete test');
        }
    };

    const handleSave = async () => {
        if (!form.title.trim()) {
            showToast.error('Please enter a test name');
            return;
        }

        setSaving(true);
        try {
            if (selectedExam) {
                await updateExam(selectedExam.id, form);
                showToast.success('Test updated successfully');
            } else {
                await createExam(form);
                showToast.success('Test created successfully');
            }
            setShowModal(false);
            loadExams();
        } catch (error) {
            console.error('Failed to save exam:', error);
            showToast.error('Failed to save test');
        } finally {
            setSaving(false);
        }
    };

    const togglePublish = async (exam: Exam) => {
        try {
            await updateExam(exam.id, { isPublished: !exam.isPublished });
            showToast.success(exam.isPublished ? 'Test hidden from students' : 'Test visible to students');
            loadExams();
        } catch (error) {
            console.error('Failed to update exam:', error);
            showToast.error('Failed to update test');
        }
    };

    return (
        <div className="space-y-6">
            {/* Test Management Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">Test Management</h2>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
                    >
                        Create New Test
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                                <th className="px-4 py-3 font-medium">Test Name</th>
                                <th className="px-4 py-3 font-medium">Subject</th>
                                <th className="px-4 py-3 font-medium">Questions</th>
                                <th className="px-4 py-3 font-medium">Time (min)</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                                    </tr>
                                ))
                            ) : exams.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                        No tests created yet
                                    </td>
                                </tr>
                            ) : (
                                exams.map((exam) => (
                                    <>
                                        <tr key={exam.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">{exam.title}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{exam.title}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{exam.questionsCount || 0}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{exam.duration}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-medium ${exam.isPublished ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {exam.isPublished ? 'Active' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(exam)}
                                                        className="px-2.5 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(exam)}
                                                        className="px-2.5 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Expanded details row */}
                                        {expandedExam === exam.id && (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-4 bg-yellow-50 border-t border-yellow-200">
                                                    <div className="space-y-3">
                                                        <h3 className="text-sm font-semibold text-purple-600">{exam.title}</h3>
                                                        <p className="text-xs text-gray-600">{exam.description || `Create and manage a ${exam.title} test using the built-in question bank.`}</p>
                                                        <div className="flex items-center gap-2">
                                                            <button className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded hover:bg-purple-700 transition-colors">
                                                                Create {exam.title} Test
                                                            </button>
                                                            <button
                                                                onClick={() => togglePublish(exam)}
                                                                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-500 rounded hover:bg-indigo-600 transition-colors"
                                                            >
                                                                {exam.isPublished ? 'Hide from Students' : 'Make Test Visible to Students'}
                                                            </button>
                                                            <button className="px-3 py-1.5 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 transition-colors">
                                                                Update Test to Use All Questions
                                                            </button>
                                                            <button className="px-3 py-1.5 text-xs font-medium text-white bg-orange-500 rounded hover:bg-orange-600 transition-colors">
                                                                Import Questions from Database
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedExam ? 'Edit Test' : 'Create New Test'}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Java Programming Exam"
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Enter test description..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                            <input
                                type="number"
                                value={form.duration}
                                onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })}
                                min={1}
                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                            <input
                                type="number"
                                value={form.totalMarks}
                                onChange={(e) => setForm({ ...form, totalMarks: parseInt(e.target.value) || 0 })}
                                min={1}
                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.isPublished}
                            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                            className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Make visible to students immediately</span>
                    </label>
                    <div className="flex gap-3 pt-4 justify-end">
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : selectedExam ? 'Update' : 'Create'} Test
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
