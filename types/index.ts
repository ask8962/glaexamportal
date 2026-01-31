import { Timestamp } from 'firebase/firestore';

// User types - matches existing Firestore structure
export interface User {
    id: string; // Firebase UID stored as 'id'
    uid: string; // Also keep uid for compatibility
    name: string;
    email: string;
    role: 'admin' | 'student'; // Computed from email, not stored in Firestore
    examsCompleted?: number;
    examAttempts?: Record<string, number>; // Map of exam names to attempt counts
    lastExam?: {
        attemptNumber?: number;
        dateCompleted?: Timestamp;
        grade?: string;
        score?: number;
        type?: string;
        name?: string;
    };
    createdAt: Timestamp;
}

export interface UserFormData {
    name: string;
    email: string;
    password: string;
}

// Exam types
export interface Exam {
    id: string;
    title: string;
    description: string;
    duration: number; // in minutes
    totalMarks: number;
    questionsCount: number;
    isPublished: boolean;
    category?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface ExamFormData {
    title: string;
    description: string;
    duration: number;
    totalMarks: number;
    isPublished: boolean;
    category?: string;
}

// Question types
export interface Question {
    id: string;
    examId: string;
    question: string;
    options: string[];
    correctIndex: number;
    marks: number;
    order: number;
}

export interface QuestionFormData {
    question: string;
    options: string[];
    correctIndex: number;
    marks: number;
}

// Result types - matches existing examResults collection
export interface Result {
    id: string;
    userId: string; // maps to uid
    uid: string; // alias for userId
    userEmail: string;
    userName: string;
    examId?: string;
    examTitle: string;
    examType: string; // exam name like "String And String Builder"
    score: number;
    totalMarks: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers?: number;
    unanswered?: number;
    percentage: number;
    grade: string;
    timeSpent: number; // in seconds
    timeTaken?: number; // alias for timeSpent
    answers?: Record<string, number>;
    submittedAt?: Timestamp;
    dateCompleted: Timestamp;
}

export interface ResultSummary {
    id: string;
    examTitle: string;
    score: number;
    totalMarks: number;
    percentage: number;
    submittedAt: Timestamp;
}

// Exam attempt state
export interface ExamState {
    examId: string;
    currentQuestionIndex: number;
    answers: Record<string, number>;
    startTime: number;
    timeRemaining: number;
}

// Auth context types
export interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
}

// Admin analytics types
export interface AdminAnalytics {
    totalStudents: number;
    totalExams: number;
    totalAttempts: number;
    averageScore: number;
    recentAttempts: Result[];
}

// API response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Table column types for admin tables
export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
}

// Filter options
export interface FilterOptions {
    examId?: string;
    startDate?: Date;
    endDate?: Date;
    searchQuery?: string;
}

// Job Portal types
export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    locationType: 'Remote' | 'Onsite' | 'Hybrid';
    type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
    salary?: string;
    description: string;
    tags: string[];
    applyLink: string;
    logo?: string;
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface JobFormData {
    title: string;
    company: string;
    location: string;
    locationType: 'Remote' | 'Onsite' | 'Hybrid';
    type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
    salary?: string;
    description: string;
    tags: string[];
    applyLink: string;
    logo?: string;
    isActive: boolean;
}

// Job Application types
export interface JobApplication {
    id: string;
    jobId: string;
    jobTitle: string;
    company: string;
    applicantName: string;
    applicantEmail: string;
    phone: string;
    yearsOfExperience: number;
    currentRole?: string;
    skills: string[];
    coverLetter?: string;
    resumeUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
    appliedAt: Timestamp;
}

export interface JobApplicationFormData {
    applicantName: string;
    applicantEmail: string;
    phone: string;
    yearsOfExperience: number;
    currentRole?: string;
    skills: string[];
    coverLetter?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
}
