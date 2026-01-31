'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, ThemeToggle } from '@/contexts/ThemeContext';
import { showToast } from '@/components/ui/Toast';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deleteUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function StudentProfilePage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();

    // Edit name state
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [savingName, setSavingName] = useState(false);

    // Delete account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);

    // Doubt session state
    const [showDoubtModal, setShowDoubtModal] = useState(false);
    const [doubtMessage, setDoubtMessage] = useState('');
    const [doubtCategory, setDoubtCategory] = useState('general');
    const [sendingDoubt, setSendingDoubt] = useState(false);

    useEffect(() => {
        if (user) {
            setNewName(user.name || '');
        }
    }, [user]);

    if (authLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center font-mono text-sm animate-pulse ${theme === 'dark' ? 'bg-[#020204] text-violet-400' : 'bg-gray-50 text-violet-600'}`}>
                LOADING_PROFILE...
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    const handleSaveName = async () => {
        if (!newName.trim()) {
            showToast.error('Name cannot be empty');
            return;
        }

        setSavingName(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { name: newName.trim() });
            showToast.success('Name updated successfully');
            setIsEditingName(false);
            // Refresh the page to get updated user data
            window.location.reload();
        } catch (error) {
            console.error('Failed to update name:', error);
            showToast.error('Failed to update name');
        } finally {
            setSavingName(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            showToast.error('Please type DELETE to confirm');
            return;
        }

        setDeleting(true);
        try {
            // Delete user data from Firestore
            const userRef = doc(db, 'users', user.uid);
            await deleteDoc(userRef);

            // Delete Firebase Auth account
            if (auth.currentUser) {
                await deleteUser(auth.currentUser);
            }

            showToast.success('Account deleted successfully');
            router.push('/login');
        } catch (error: unknown) {
            console.error('Failed to delete account:', error);
            if (error instanceof Error && error.message?.includes('requires-recent-login')) {
                showToast.error('Please sign out and sign in again before deleting your account');
            } else {
                showToast.error('Failed to delete account');
            }
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleSendDoubt = async () => {
        if (!doubtMessage.trim()) {
            showToast.error('Please enter your question');
            return;
        }

        setSendingDoubt(true);
        try {
            // Store doubt in Firestore
            const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
            await addDoc(collection(db, 'doubts'), {
                userId: user.uid,
                userName: user.name,
                userEmail: user.email,
                category: doubtCategory,
                message: doubtMessage.trim(),
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            showToast.success('Your doubt has been submitted! We\'ll get back to you soon.');
            setDoubtMessage('');
            setShowDoubtModal(false);
        } catch (error) {
            console.error('Failed to submit doubt:', error);
            showToast.error('Failed to submit doubt. Please try again.');
        } finally {
            setSendingDoubt(false);
        }
    };

    const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen selection:bg-violet-500/30 selection:text-violet-200 overflow-x-hidden font-sans transition-colors duration-300 ${isDark ? 'bg-[#020204] text-white' : 'bg-gradient-to-br from-gray-50 via-violet-50/30 to-white text-gray-900'
            }`}>

            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] ${isDark ? 'bg-violet-900/10' : 'bg-violet-200/40'}`} />
                <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] ${isDark ? 'bg-blue-900/10' : 'bg-blue-200/30'}`} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
                <div className={`max-w-7xl mx-auto backdrop-blur-xl rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white/80 border border-gray-200'
                    }`}>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                E
                            </div>
                        </Link>
                        <span className={`font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>ExamPortal</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className={`text-sm transition-colors ${isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Dashboard</Link>
                        <Link href="/results" className={`text-sm transition-colors ${isDark ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>History</Link>
                        <div className={`h-4 w-[1px] ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                        <ThemeToggle />
                        <button onClick={handleLogout} className={`transition-colors ${isDark ? 'text-neutral-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-20">

                {/* Profile Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl mb-6">
                        {initials}
                    </div>
                    <h1 className={`text-3xl font-light tracking-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</h1>
                    <p className={isDark ? 'text-neutral-500' : 'text-gray-500'}>{user.email}</p>
                    <span className="inline-block mt-3 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-medium border border-violet-500/20">
                        Student Account
                    </span>
                </div>

                {/* Profile Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

                    {/* Account Info - Editable */}
                    <div className={`backdrop-blur-xl border rounded-3xl p-6 transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
                        }`}>
                        <h3 className={`text-sm font-medium uppercase tracking-widest mb-4 ${isDark ? 'text-neutral-400' : 'text-gray-400'}`}>Account Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className={`text-xs block mb-1 ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>Full Name</label>
                                {isEditingName ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                            placeholder="Enter your name"
                                        />
                                        <button
                                            onClick={handleSaveName}
                                            disabled={savingName}
                                            className="px-3 py-2 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
                                        >
                                            {savingName ? '...' : 'Save'}
                                        </button>
                                        <button
                                            onClick={() => { setIsEditingName(false); setNewName(user.name || ''); }}
                                            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
                                        <button
                                            onClick={() => setIsEditingName(true)}
                                            className="text-xs text-violet-500 hover:text-violet-600 transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className={`text-xs block mb-1 ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>Email Address</label>
                                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.email}</div>
                            </div>
                            <div>
                                <label className={`text-xs block mb-1 ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>Account Type</label>
                                <div className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.role}</div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className={`backdrop-blur-xl border rounded-3xl p-6 transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
                        }`}>
                        <h3 className={`text-sm font-medium uppercase tracking-widest mb-4 ${isDark ? 'text-neutral-400' : 'text-gray-400'}`}>Performance Overview</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className={isDark ? 'text-neutral-400' : 'text-gray-500'}>Exams Completed</span>
                                <span className={`text-2xl font-light ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.examsCompleted || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={isDark ? 'text-neutral-400' : 'text-gray-500'}>Last Activity</span>
                                <span className={`text-sm ${isDark ? 'text-neutral-500' : 'text-gray-600'}`}>{user.lastExam?.type || 'None'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={isDark ? 'text-neutral-400' : 'text-gray-500'}>Last Grade</span>
                                <span className={`text-lg font-medium ${user.lastExam?.grade === 'A' ? 'text-emerald-400' :
                                        user.lastExam?.grade === 'F' ? 'text-red-400' : 'text-amber-400'
                                    }`}>
                                    {user.lastExam?.grade || '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Doubt Session Card */}
                <div className={`mt-6 backdrop-blur-xl border rounded-3xl p-6 animate-fade-in-up transition-colors duration-300 ${isDark
                        ? 'bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20 border-violet-500/20'
                        : 'bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-100 shadow-sm'
                    }`} style={{ animationDelay: '0.15s' }}>
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>💬 Doubt Session</h3>
                            <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Have a question? Connect with our support team directly.</p>
                        </div>
                        <button
                            onClick={() => setShowDoubtModal(true)}
                            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity shadow-lg"
                        >
                            Ask a Doubt
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <Link href="/dashboard">
                        <button className={`w-full sm:w-auto px-8 py-3 rounded-full text-sm font-medium transition-colors ${isDark ? 'bg-white text-black hover:bg-violet-200' : 'bg-gray-900 text-white hover:bg-gray-800'
                            }`}>
                            Back to Dashboard
                        </button>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className={`w-full sm:w-auto px-8 py-3 rounded-full border text-sm font-medium transition-colors ${isDark
                                ? 'bg-transparent border-white/20 text-white hover:bg-white/5'
                                : 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Sign Out
                    </button>
                </div>

                {/* Danger Zone */}
                <div className={`mt-12 pt-8 border-t animate-fade-in-up ${isDark ? 'border-white/5' : 'border-gray-200'}`} style={{ animationDelay: '0.25s' }}>
                    <h3 className="text-sm font-medium text-red-500 uppercase tracking-widest mb-4">Danger Zone</h3>
                    <div className={`border rounded-2xl p-4 ${isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Account</h4>
                                <p className={`text-xs mt-1 ${isDark ? 'text-neutral-500' : 'text-gray-600'}`}>Permanently delete your account and all data. This cannot be undone.</p>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>

            </main>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className={`border rounded-2xl p-6 max-w-md w-full shadow-2xl transition-colors ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'
                        }`}>
                        <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Account</h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                            This action is permanent. All your data, including exam results and history, will be deleted forever.
                        </p>
                        <div className="mb-4">
                            <label className={`text-xs block mb-2 ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>Type DELETE to confirm</label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                                placeholder="DELETE"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleting || deleteConfirmText !== 'DELETE'}
                                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {deleting ? 'Deleting...' : 'Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Doubt Session Modal */}
            {showDoubtModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className={`border rounded-2xl p-6 max-w-lg w-full shadow-2xl transition-colors ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'
                        }`}>
                        <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>💬 Ask a Doubt</h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
                            Submit your question and our team will get back to you soon.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className={`text-xs block mb-2 ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>Category</label>
                                <select
                                    value={doubtCategory}
                                    onChange={(e) => setDoubtCategory(e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                        }`}
                                >
                                    <option value="general">General Query</option>
                                    <option value="technical">Technical Issue</option>
                                    <option value="exam">Exam Related</option>
                                    <option value="account">Account Issue</option>
                                    <option value="feedback">Feedback</option>
                                </select>
                            </div>

                            <div>
                                <label className={`text-xs block mb-2 ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}>Your Question</label>
                                <textarea
                                    value={doubtMessage}
                                    onChange={(e) => setDoubtMessage(e.target.value)}
                                    rows={4}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 resize-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                        }`}
                                    placeholder="Describe your doubt or question in detail..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setShowDoubtModal(false); setDoubtMessage(''); }}
                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendDoubt}
                                disabled={sendingDoubt || !doubtMessage.trim()}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {sendingDoubt ? 'Sending...' : 'Submit Doubt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
