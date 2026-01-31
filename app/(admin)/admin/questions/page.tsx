'use client';

import { useState, useEffect } from 'react';
import { getExams, addQuestion } from '@/lib/db';
import { Exam, QuestionFormData } from '@/types';
import { showToast } from '@/components/ui/Toast';

export default function QuestionsPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState<QuestionFormData & { examId: string; category: string; topic: string }>({
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        marks: 1,
        examId: '',
        category: '',
        topic: '',
    });

    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = async () => {
        try {
            const data = await getExams();
            setExams(data);
            if (data.length > 0) {
                setForm(prev => ({ ...prev, examId: data[0].id }));
            }
        } catch (error) {
            console.error('Failed to load exams:', error);
            showToast.error('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.question.trim()) {
            showToast.error('Please enter a question');
            return;
        }

        if (form.options.some(opt => !opt.trim())) {
            showToast.error('Please fill in all options');
            return;
        }

        if (!form.examId) {
            showToast.error('Please select a subject');
            return;
        }

        setSaving(true);
        try {
            await addQuestion(form.examId, {
                question: form.question,
                options: form.options,
                correctIndex: form.correctIndex,
                marks: form.marks,
            }, 0);

            showToast.success('Question added successfully');

            // Reset form
            setForm({
                question: '',
                options: ['', '', '', ''],
                correctIndex: 0,
                marks: 1,
                examId: form.examId,
                category: '',
                topic: '',
            });
        } catch (error) {
            console.error('Failed to add question:', error);
            showToast.error('Failed to add question');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Question Management Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Question Management</h2>
                </div>

                <div className="p-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Add New Question</h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Question Text */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Question Text
                            </label>
                            <textarea
                                value={form.question}
                                onChange={(e) => setForm({ ...form, question: e.target.value })}
                                placeholder="Enter question text here..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Options */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                                Options
                            </label>
                            <div className="space-y-3">
                                {['A', 'B', 'C', 'D'].map((letter, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, correctIndex: index })}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${form.correctIndex === index
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {letter}
                                        </button>
                                        <input
                                            type="text"
                                            value={form.options[index]}
                                            onChange={(e) => {
                                                const newOptions = [...form.options];
                                                newOptions[index] = e.target.value;
                                                setForm({ ...form, options: newOptions });
                                            }}
                                            placeholder={`Option ${letter}`}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Click on the letter to set the correct answer</p>
                        </div>

                        {/* Subject, Category, Topic */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Subject
                                </label>
                                <select
                                    value={form.examId}
                                    onChange={(e) => setForm({ ...form, examId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    disabled={loading}
                                >
                                    {exams.map((exam) => (
                                        <option key={exam.id} value={exam.id}>
                                            {exam.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    placeholder="e.g. OOP, Loops, Data Structures"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Topic (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={form.topic}
                                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                                    placeholder="Specific topic within category"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setForm({
                                    question: '',
                                    options: ['', '', '', ''],
                                    correctIndex: 0,
                                    marks: 1,
                                    examId: form.examId,
                                    category: '',
                                    topic: '',
                                })}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Adding...' : 'Add Question'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
