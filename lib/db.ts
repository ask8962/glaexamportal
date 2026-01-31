import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import {
    Exam,
    ExamFormData,
    Question,
    QuestionFormData,
    Result,
    User,
    AdminAnalytics,
} from '@/types';

// ============ EXAM OPERATIONS ============

// Get all exams
export const getExams = async (): Promise<Exam[]> => {
    const examsRef = collection(db, 'exams');
    const q = query(examsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Exam[];
};

// Get published exams only (for students)
export const getPublishedExams = async (): Promise<Exam[]> => {
    const examsRef = collection(db, 'exams');
    const q = query(
        examsRef,
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Exam[];
};

// Get single exam by ID
export const getExamById = async (examId: string): Promise<Exam | null> => {
    const examRef = doc(db, 'exams', examId);
    const examSnap = await getDoc(examRef);

    if (examSnap.exists()) {
        return { id: examSnap.id, ...examSnap.data() } as Exam;
    }

    return null;
};

// Create new exam
export const createExam = async (examData: ExamFormData): Promise<string> => {
    const examsRef = collection(db, 'exams');
    const docRef = await addDoc(examsRef, {
        ...examData,
        questionsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return docRef.id;
};

// Update exam
export const updateExam = async (
    examId: string,
    examData: Partial<ExamFormData>
): Promise<void> => {
    const examRef = doc(db, 'exams', examId);
    await updateDoc(examRef, {
        ...examData,
        updatedAt: serverTimestamp(),
    });
};

// Delete exam and its questions
export const deleteExam = async (examId: string): Promise<void> => {
    const batch = writeBatch(db);

    // Delete all questions for this exam
    const questionsRef = collection(db, 'exams', examId, 'questions');
    const questionsSnapshot = await getDocs(questionsRef);
    questionsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    // Delete the exam itself
    const examRef = doc(db, 'exams', examId);
    batch.delete(examRef);

    await batch.commit();
};

// ============ QUESTION OPERATIONS ============

// Get all questions for an exam
export const getQuestions = async (examId: string): Promise<Question[]> => {
    const questionsRef = collection(db, 'exams', examId, 'questions');
    const q = query(questionsRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        examId,
        ...doc.data(),
    })) as Question[];
};

// Get single question by ID
export const getQuestionById = async (
    examId: string,
    questionId: string
): Promise<Question | null> => {
    const questionRef = doc(db, 'exams', examId, 'questions', questionId);
    const questionSnap = await getDoc(questionRef);

    if (questionSnap.exists()) {
        return { id: questionSnap.id, examId, ...questionSnap.data() } as Question;
    }

    return null;
};

// Add question to exam
export const addQuestion = async (
    examId: string,
    questionData: QuestionFormData,
    order: number
): Promise<string> => {
    const questionsRef = collection(db, 'exams', examId, 'questions');
    const docRef = await addDoc(questionsRef, {
        ...questionData,
        order,
    });

    // Update exam's question count
    const examRef = doc(db, 'exams', examId);
    const examSnap = await getDoc(examRef);
    if (examSnap.exists()) {
        const currentCount = examSnap.data().questionsCount || 0;
        await updateDoc(examRef, {
            questionsCount: currentCount + 1,
            updatedAt: serverTimestamp(),
        });
    }

    return docRef.id;
};

// Update question
export const updateQuestion = async (
    examId: string,
    questionId: string,
    questionData: Partial<QuestionFormData>
): Promise<void> => {
    const questionRef = doc(db, 'exams', examId, 'questions', questionId);
    await updateDoc(questionRef, questionData);

    // Update exam's updatedAt
    const examRef = doc(db, 'exams', examId);
    await updateDoc(examRef, { updatedAt: serverTimestamp() });
};

// Delete question
export const deleteQuestion = async (
    examId: string,
    questionId: string
): Promise<void> => {
    const questionRef = doc(db, 'exams', examId, 'questions', questionId);
    await deleteDoc(questionRef);

    // Update exam's question count
    const examRef = doc(db, 'exams', examId);
    const examSnap = await getDoc(examRef);
    if (examSnap.exists()) {
        const currentCount = examSnap.data().questionsCount || 0;
        await updateDoc(examRef, {
            questionsCount: Math.max(0, currentCount - 1),
            updatedAt: serverTimestamp(),
        });
    }
};

// ============ RESULT OPERATIONS ============

// Save exam result - saves to examResults collection
export const saveResult = async (
    result: Omit<Result, 'id' | 'dateCompleted'>
): Promise<string> => {
    const resultId = `${result.userId || result.uid}_${result.examType || result.examId}`;
    const resultRef = doc(db, 'examResults', resultId);

    const dataToSave = {
        ...result,
        id: resultId,
        dateCompleted: serverTimestamp(),
    };

    await updateDoc(resultRef, dataToSave).catch(async () => {
        // Document doesn't exist, create it
        const { setDoc } = await import('firebase/firestore');
        await setDoc(resultRef, dataToSave);
    });

    return resultId;
};

// Get all results (admin) - from examResults collection
export const getAllResults = async (): Promise<Result[]> => {
    const resultsRef = collection(db, 'examResults');
    const q = query(resultsRef, orderBy('dateCompleted', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Result[];
};

// Get results by user - from examResults collection
export const getResultsByUser = async (uid: string): Promise<Result[]> => {
    const resultsRef = collection(db, 'examResults');
    const q = query(
        resultsRef,
        where('userId', '==', uid),
        orderBy('dateCompleted', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Result[];
};

// Get results by exam - from examResults collection
export const getResultsByExam = async (examId: string): Promise<Result[]> => {
    const resultsRef = collection(db, 'examResults');
    const q = query(
        resultsRef,
        where('examType', '==', examId),
        orderBy('dateCompleted', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Result[];
};

// Get single result from examResults
export const getResultById = async (resultId: string): Promise<Result | null> => {
    const resultRef = doc(db, 'examResults', resultId);
    const resultSnap = await getDoc(resultRef);

    if (resultSnap.exists()) {
        return { id: resultSnap.id, ...resultSnap.data() } as Result;
    }

    return null;
};

// Check if user has attempted an exam
export const hasAttemptedExam = async (
    uid: string,
    examId: string
): Promise<boolean> => {
    const resultsRef = collection(db, 'examResults');
    const q = query(
        resultsRef,
        where('userId', '==', uid),
        where('examType', '==', examId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
};

// ============ USER OPERATIONS ============

// Get all students (all users - role is computed from email)
export const getStudents = async (): Promise<User[]> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const ADMIN_EMAIL = 'ganukalp70@gmail.com';
    return snapshot.docs
        .map((doc) => {
            const data = doc.data();
            return {
                id: data.id || doc.id,
                uid: data.id || doc.id,
                name: data.name || 'Unknown',
                email: data.email || '',
                examsCompleted: data.examsCompleted || 0,
                examAttempts: data.examAttempts || {},
                lastExam: data.lastExam || null,
                role: data.email === ADMIN_EMAIL ? 'admin' : 'student',
                createdAt: data.createdAt,
            } as User;
        })
        .filter(u => u.role === 'student');
};

// Get user by ID
export const getUserById = async (uid: string): Promise<User | null> => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return { uid: userSnap.id, ...userSnap.data() } as User;
    }

    return null;
};

// ============ ANALYTICS OPERATIONS ============

// Get admin analytics
export const getAdminAnalytics = async (): Promise<AdminAnalytics> => {
    // Get total students (all users except admin)
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const ADMIN_EMAIL = 'ganukalp70@gmail.com';
    const totalStudents = usersSnapshot.docs.filter(doc => doc.data().email !== ADMIN_EMAIL).length;

    // Get total exams
    const examsSnapshot = await getDocs(collection(db, 'exams'));
    const totalExams = examsSnapshot.size;

    // Get all results for analytics from examResults collection
    const resultsRef = collection(db, 'examResults');
    const resultsSnapshot = await getDocs(resultsRef);
    const totalAttempts = resultsSnapshot.size;

    // Calculate average score
    let totalScore = 0;
    let totalMaxScore = 0;
    resultsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        totalScore += data.score || 0;
        totalMaxScore += data.totalMarks || 0;
    });
    const averageScore = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

    // Get recent attempts from examResults
    const recentQuery = query(
        resultsRef,
        orderBy('dateCompleted', 'desc'),
        limit(10)
    );
    const recentSnapshot = await getDocs(recentQuery);
    const recentAttempts = recentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Result[];

    return {
        totalStudents,
        totalExams,
        totalAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        recentAttempts,
    };
};

// ============ UTILITY FUNCTIONS ============

// Convert Firestore Timestamp to Date string
export const formatTimestamp = (timestamp: Timestamp): string => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Format duration (minutes) to readable string
export const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Calculate percentage with safety checks
export const calculatePercentage = (score: number | undefined | null, total: number | undefined | null): number => {
    const safeScore = typeof score === 'number' ? score : 0;
    const safeTotal = typeof total === 'number' ? total : 0;
    if (safeTotal === 0) return 0;
    return Math.round((safeScore / safeTotal) * 100);
};
