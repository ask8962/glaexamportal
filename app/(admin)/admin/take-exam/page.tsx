'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getExams } from '@/lib/db';
import { Exam } from '@/types';
import { showToast } from '@/components/ui/Toast';

export default function TakeExamsPage() {
    const router = useRouter();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = async () => {
        try {
            const data = await getExams();
            setExams(data.filter(e => e.isPublished));
        } catch (error) {
            console.error('Failed to load exams:', error);
            showToast.error('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const startExam = (examId: string) => {
        router.push(`/exam/${examId}`);
    };

    return (
        <div className="space-y-6">
            {/* Available Exams Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Available Exams</h2>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                                    <div className="h-8 bg-gray-200 rounded w-full" />
                                </div>
                            ))}
                        </div>
                    ) : exams.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">📝</div>
                            <p className="text-gray-500">No exams available at the moment</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {exams.map((exam) => (
                                <div key={exam.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <h3 className="font-semibold text-gray-900 mb-1">{exam.title}</h3>
                                    <p className="text-sm text-gray-500 mb-3">
                                        {exam.questionsCount || 0} questions • {exam.duration} minutes
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                                        <span>Total: {exam.totalMarks} marks</span>
                                        <span className="text-green-500 font-medium">Active</span>
                                    </div>
                                    <button
                                        onClick={() => startExam(exam.id)}
                                        className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
                                    >
                                        Start Exam
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
