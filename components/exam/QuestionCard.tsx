'use client';

import { Question } from '@/types';

interface QuestionCardProps {
    question: Question;
    questionNumber: number;
    totalQuestions: number;
    selectedAnswer: number | undefined;
    onSelectAnswer: (index: number) => void;
    showResult?: boolean;
}

export default function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    selectedAnswer,
    onSelectAnswer,
    showResult = false,
}: QuestionCardProps) {
    const getOptionClass = (index: number) => {
        const baseClass = 'w-full p-4 rounded-xl text-left transition-all duration-200 border-2';

        if (showResult) {
            if (index === question.correctIndex) {
                return `${baseClass} bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400`;
            }
            if (selectedAnswer === index && index !== question.correctIndex) {
                return `${baseClass} bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400`;
            }
            return `${baseClass} bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300`;
        }

        if (selectedAnswer === index) {
            return `${baseClass} bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-700 dark:text-purple-400`;
        }

        return `${baseClass} bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300`;
    };

    return (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Question {questionNumber} of {totalQuestions}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium">
                    {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-6">
                <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                />
            </div>

            {/* Question Text */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {question.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
                {question.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => !showResult && onSelectAnswer(index)}
                        disabled={showResult}
                        className={getOptionClass(index)}
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                  ${selectedAnswer === index
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                    }
                  ${showResult && index === question.correctIndex ? 'bg-green-500 text-white' : ''}
                  ${showResult && selectedAnswer === index && index !== question.correctIndex ? 'bg-red-500 text-white' : ''}
                `}
                            >
                                {String.fromCharCode(65 + index)}
                            </span>
                            <span className="flex-1">{option}</span>
                            {showResult && index === question.correctIndex && (
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                            {showResult && selectedAnswer === index && index !== question.correctIndex && (
                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
