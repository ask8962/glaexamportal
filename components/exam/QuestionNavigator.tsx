'use client';

interface QuestionNavigatorProps {
    totalQuestions: number;
    currentIndex: number;
    answeredQuestions: Set<number>;
    onNavigate: (index: number) => void;
}

export default function QuestionNavigator({
    totalQuestions,
    currentIndex,
    answeredQuestions,
    onNavigate,
}: QuestionNavigatorProps) {
    return (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-4 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Question Navigator
            </h3>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-purple-500" />
                    <span className="text-gray-600 dark:text-gray-400">Current</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Answered</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
                    <span className="text-gray-600 dark:text-gray-400">Not Answered</span>
                </div>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: totalQuestions }).map((_, index) => {
                    const isCurrent = index === currentIndex;
                    const isAnswered = answeredQuestions.has(index);

                    return (
                        <button
                            key={index}
                            onClick={() => onNavigate(index)}
                            className={`
                w-full aspect-square rounded-lg font-medium text-sm transition-all
                ${isCurrent
                                    ? 'bg-purple-500 text-white ring-2 ring-purple-300 ring-offset-2'
                                    : isAnswered
                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }
              `}
                        >
                            {index + 1}
                        </button>
                    );
                })}
            </div>

            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Answered:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                        {answeredQuestions.size} / {totalQuestions}
                    </span>
                </div>
            </div>
        </div>
    );
}
