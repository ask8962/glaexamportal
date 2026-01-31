'use client';

import { useEffect, useState, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getExamById, getQuestions, saveResult, hasAttemptedExam } from '@/lib/db';
import { Exam, Question, Result } from '@/types';
import { Button, Card } from '@/components/ui';
import { showToast } from '@/components/ui/Toast';
import Timer from '@/components/exam/Timer';
import QuestionCard from '@/components/exam/QuestionCard';
import QuestionNavigator from '@/components/exam/QuestionNavigator';
import { ConfirmModal } from '@/components/ui/Modal';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ExamPage({ params }: PageProps) {
    const { id: examId } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [exam, setExam] = useState<Exam | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [examStarted, setExamStarted] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);

    const [violationCount, setViolationCount] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showViolationModal, setShowViolationModal] = useState(false);
    const [violationMessage, setViolationMessage] = useState('');
    const MAX_VIOLATIONS = 3;

    // Camera & Audio State
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const [audioLevel, setAudioLevel] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Advanced Security: Fullscreen & Tab Switching Enforcement
    useEffect(() => {
        if (!examStarted) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleViolation('Tab switching or minimizing is not allowed.');
            }
        };

        const handleBlur = () => {
            // Optional: Strict focus loss detection (can be too sensitive, using visibility for now is safer)
            // handleViolation('Window focus lost.');
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
                handleViolation('Exiting fullscreen is strictly prohibited.');
            } else {
                setIsFullscreen(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        // window.addEventListener('blur', handleBlur); 

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            // window.removeEventListener('blur', handleBlur);
        };
    }, [examStarted, violationCount]);

    const handleViolation = (message: string) => {
        const newCount = violationCount + 1;
        setViolationCount(newCount);
        setViolationMessage(message);
        setShowViolationModal(true);

        if (newCount >= MAX_VIOLATIONS) {
            // Auto-submit logic handled in modal or effect
        }
    };

    // Camera & Audio Setup
    const setupMedia = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240, facingMode: 'user' },
                audio: true
            });

            setStream(mediaStream);
            setCameraPermission('granted');

            // Audio Analysis Setup
            // @ts-ignore
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(mediaStream);

            microphone.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength) as any;

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            dataArrayRef.current = dataArray;

            analyzeAudio();

            if (mediaStream.getVideoTracks()[0]) {
                mediaStream.getVideoTracks()[0].onended = () => {
                    handleViolation('Camera feed interrupted.');
                };
            }

        } catch (err) {
            console.error('Error accessing media devices:', err);
            setCameraPermission('denied');
            showToast.error('Camera access is required.');
        }
    };

    const analyzeAudio = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
        const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
        setAudioLevel(average);
        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
            if (audioContextRef.current) audioContextRef.current.close();
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [stream]);

    // Attach stream
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, examStarted]);

    const enterFullscreen = async () => {
        try {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } catch (err) {
            console.error('Error attempting to enable fullscreen:', err);
            showToast.error('Fullscreen is required for this exam.');
        }
    };

    // Existing Anti-cheat: input disabling
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            showToast.error('Right-click is disabled during exam');
        };

        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            showToast.error('Copying is disabled during exam');
        };

        const handleCut = (e: ClipboardEvent) => {
            e.preventDefault();
            showToast.error('Cutting is disabled during exam');
        };

        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault();
            showToast.error('Pasting is disabled during exam');
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Disable F12, Ctrl+Shift+I, Ctrl+U, Alt+Tab (hard to block but good to try)
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.key === 'u') ||
                (e.altKey && e.key === 'Tab')
            ) {
                e.preventDefault();
                showToast.error('System navigation is restricted.');
            }
            // Disable Ctrl+C, Ctrl+V, Ctrl+X
            if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
                e.preventDefault();
                showToast.error('Clipboard shortcuts are disabled.');
            }
        };

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = 'Exam in progress. Leaving will submit your current progress.';
        };

        if (examStarted) {
            document.addEventListener('contextmenu', handleContextMenu);
            document.addEventListener('copy', handleCopy);
            document.addEventListener('cut', handleCut);
            document.addEventListener('paste', handlePaste);
            document.addEventListener('keydown', handleKeyDown);
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('cut', handleCut);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [examStarted]);

    // Load exam data
    useEffect(() => {
        const loadExam = async () => {
            if (!user) return;

            try {
                // Check if already attempted
                const attempted = await hasAttemptedExam(user.uid, examId);
                if (attempted) {
                    showToast.error('You have already attempted this exam');
                    router.push('/dashboard');
                    return;
                }

                const [examData, questionsData] = await Promise.all([
                    getExamById(examId),
                    getQuestions(examId),
                ]);

                if (!examData) {
                    showToast.error('Exam not found');
                    router.push('/dashboard');
                    return;
                }

                if (!examData.isPublished) {
                    showToast.error('This exam is not available');
                    router.push('/dashboard');
                    return;
                }

                setExam(examData);
                setQuestions(questionsData);
            } catch (error) {
                console.error('Error loading exam:', error);
                showToast.error('Failed to load exam');
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && user) {
            loadExam();
        }
    }, [user, authLoading, examId, router]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleStartExam = () => {
        if (cameraPermission !== 'granted') {
            showToast.error('Please enable camera/microphone permissions');
            setupMedia();
            return;
        }
        enterFullscreen();
        setExamStarted(true);
        setStartTime(Date.now());
    };

    const handleSelectAnswer = (index: number) => {
        const questionId = questions[currentIndex].id;
        setAnswers((prev) => ({ ...prev, [questionId]: index }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNavigate = (index: number) => {
        setCurrentIndex(index);
    };

    const calculateScore = useCallback(() => {
        let score = 0;
        let correct = 0;
        let wrong = 0;

        questions.forEach((question) => {
            const selectedAnswer = answers[question.id];
            if (selectedAnswer !== undefined) {
                if (selectedAnswer === question.correctIndex) {
                    score += question.marks;
                    correct++;
                } else {
                    wrong++;
                }
            }
        });

        return { score, correct, wrong, unanswered: questions.length - correct - wrong };
    }, [questions, answers]);

    const handleSubmit = useCallback(async () => {
        if (!user || !exam) return;

        setSubmitting(true);
        const { score, correct, wrong, unanswered } = calculateScore();
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);

        try {
            // Dynamic Scoring Logic
            const maxScore = questions.reduce((sum, q) => sum + (q.marks || 1), 0) || exam.totalMarks || 100;
            const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
            const currentGrade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';

            const resultData: Omit<Result, 'id' | 'dateCompleted'> = {
                userId: user.uid,
                uid: user.uid,
                userEmail: user.email,
                userName: user.name,
                examId: exam.id,
                examType: exam.title,
                examTitle: exam.title,
                score,
                totalMarks: maxScore,
                totalQuestions: questions.length,
                correctAnswers: correct,
                wrongAnswers: wrong,
                unanswered,
                percentage,
                grade: currentGrade,
                timeSpent: timeTaken,
                timeTaken,
                answers,
            };

            await saveResult(resultData);
            showToast.success(violationCount >= MAX_VIOLATIONS ? 'Exam terminated due to security violations.' : 'Exam submitted successfully!');
            router.push('/results');
        } catch (error) {
            console.error('Error submitting exam:', error);
            showToast.error('Failed to submit exam. Please try again.');
        } finally {
            setSubmitting(false);
            setShowSubmitModal(false);
        }
    }, [user, exam, questions, answers, startTime, calculateScore, router, violationCount]);

    const handleTimerComplete = useCallback(() => {
        showToast.error('Time is up! Auto-submitting your exam...');
        handleSubmit();
    }, [handleSubmit]);

    // Force Termination on max violations
    const handleForceSubmit = () => {
        setShowViolationModal(false);
        handleSubmit();
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading exam...</p>
                </div>
            </div>
        );
    }

    if (!exam || questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Card variant="glass" className="max-w-md text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Exam Not Available
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        This exam is either not found or has no questions.
                    </p>
                    <Button onClick={() => router.push('/dashboard')}>
                        Back to Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    // Pre-exam screen
    if (!examStarted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 p-4">
                <Card variant="glass" className="max-w-lg w-full">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {exam.title}
                        </h1>

                        {/* Camera Preview */}
                        <div className="mb-6">
                            {cameraPermission === 'granted' && stream ? (
                                <div className="relative w-48 h-36 mx-auto rounded-xl overflow-hidden border-2 border-green-500 bg-black shadow-lg">
                                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                                    <div className="absolute bottom-2 left-2 flex gap-1 items-center">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[10px] text-white font-mono">LIVE</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                                        <div className="h-full bg-green-500 transition-all duration-75" style={{ width: `${Math.min(audioLevel * 2, 100)}%` }} />
                                    </div>
                                </div>
                            ) : (
                                <div className="w-48 h-36 mx-auto rounded-xl bg-gray-200 dark:bg-gray-800 border-dashed border-2 border-gray-400 flex flex-col items-center justify-center p-4">
                                    <span className="text-xs text-center text-gray-500">Camera Access Required</span>
                                    <Button size="sm" onClick={setupMedia} className="mt-2">Enable Camera</Button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider border border-red-200 dark:border-red-800">
                                JEE Level Security
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {exam.description}
                        </p>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-gray-100 dark:bg-gray-700/50 rounded-xl p-4">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{exam.duration}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Minutes</p>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700/50 rounded-xl p-4">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{questions.length}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Questions</p>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700/50 rounded-xl p-4">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{exam.totalMarks}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Marks</p>
                            </div>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 mb-6 text-left">
                            <h3 className="font-semibold text-red-800 dark:text-red-400 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Strict Exam Rules
                            </h3>
                            <ul className="text-sm text-red-700 dark:text-red-500 space-y-2">
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span><strong>Fullscreen is mandatory.</strong> Exiting fullscreen is a violation.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Do not switch tabs or minimize the window.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Copying, pasting, and right-clicking are disabled.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>The exam will <strong>automatically terminate</strong> after {MAX_VIOLATIONS} violations.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="secondary" fullWidth onClick={() => router.push('/dashboard')}>
                                Cancel
                            </Button>
                            <Button fullWidth onClick={handleStartExam}>
                                Agree & Start Exam
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const answeredQuestions = new Set(
        Object.keys(answers).map((id) => questions.findIndex((q) => q.id === id))
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 exam-container select-none">
            {/* Live Proctoring Overlay */}
            <div className="fixed bottom-6 right-6 z-50 w-40 h-28 rounded-xl overflow-hidden border-2 border-red-500 bg-black shadow-2xl opacity-80 hover:opacity-100 transition-opacity pointer-events-none">
                {stream && (
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                )}
                <div className="absolute top-1 left-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[8px] text-white font-bold">REC</span>
                </div>
                <div className="absolute bottom-0 left-0 h-0.5 bg-green-500 transition-all" style={{ width: `${Math.min(audioLevel * 2, 100)}%` }} />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{exam.title}</h1>
                            {violationCount > 0 && (
                                <span className="px-2 py-0.5 rounded bg-red-100 text-red-600 text-xs font-bold">
                                    {violationCount} / {MAX_VIOLATIONS} Violations
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Question {currentIndex + 1} of {questions.length}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Timer
                            seconds={exam.duration * 60}
                            onComplete={handleTimerComplete}
                            size="md"
                        />
                        <Button
                            variant="danger"
                            onClick={() => setShowSubmitModal(true)}
                        >
                            Submit Exam
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Question Section */}
                    <div className="lg:col-span-3 space-y-6">
                        <QuestionCard
                            question={currentQuestion}
                            questionNumber={currentIndex + 1}
                            totalQuestions={questions.length}
                            selectedAnswer={answers[currentQuestion.id]}
                            onSelectAnswer={handleSelectAnswer}
                        />

                        {/* Navigation Buttons */}
                        <div className="flex justify-between">
                            <Button
                                variant="secondary"
                                onClick={handlePrevious}
                                disabled={currentIndex === 0}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </Button>

                            {currentIndex === questions.length - 1 ? (
                                <Button onClick={() => setShowSubmitModal(true)}>
                                    Finish Exam
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </Button>
                            ) : (
                                <Button onClick={handleNext}>
                                    Next
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Question Navigator */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28">
                            <QuestionNavigator
                                totalQuestions={questions.length}
                                currentIndex={currentIndex}
                                answeredQuestions={answeredQuestions}
                                onNavigate={handleNavigate}
                            />

                            <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400 mb-2">Proctoring Active</h4>
                                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-300">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    Monitoring behavior
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Submit Confirmation Modal */}
            <ConfirmModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                onConfirm={handleSubmit}
                title="Submit Exam"
                message={`Are you sure you want to submit? You have answered ${answeredQuestions.size} out of ${questions.length} questions. This action cannot be undone.`}
                confirmText="Submit"
                cancelText="Continue Exam"
                isLoading={submitting}
                variant="info"
            />

            {/* Violation Warning Modal */}
            {showViolationModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 border-2 border-red-500 rounded-2xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.5)] animate-bounce-short">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-center text-red-600 mb-2">Security Warning</h3>
                        <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
                            {violationMessage}
                        </p>

                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mb-6 text-center">
                            <span className="text-sm font-medium text-red-800 dark:text-red-300">
                                Violation {violationCount} of {MAX_VIOLATIONS}
                            </span>
                            {violationCount >= MAX_VIOLATIONS && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-bold">
                                    Maximum limit reached. Exam terminating...
                                </p>
                            )}
                        </div>

                        {violationCount >= MAX_VIOLATIONS ? (
                            <Button fullWidth onClick={handleForceSubmit} variant="danger">
                                Terminate Exam
                            </Button>
                        ) : (
                            <Button fullWidth onClick={() => {
                                setShowViolationModal(false);
                                enterFullscreen();
                            }} variant="secondary">
                                I Understand, Return to Exam
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes bounce-short {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-short {
                    animation: bounce-short 0.3s ease-in-out;
                }
                .exam-container {
                    user-select: none;
                    -webkit-user-select: none;
                }
            `}</style>
        </div>
    );
}
