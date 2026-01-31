'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/components/ui/Toast';

export default function ProfilePage() {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);

    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Profile Information</h2>
                </div>

                <div className="p-6">
                    <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                        Full Name
                                    </label>
                                    <p className="text-sm text-gray-900">{user?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                        Email Address
                                    </label>
                                    <p className="text-sm text-gray-900">{user?.email}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                        Role
                                    </label>
                                    <span className="inline-block px-2 py-0.5 text-xs font-medium text-purple-600 bg-purple-100 rounded">
                                        {user?.role}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                        User ID
                                    </label>
                                    <p className="text-sm text-gray-500 font-mono">{user?.uid}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Account Settings</h2>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                            <p className="text-xs text-gray-500">Receive email updates about exam results</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                            <p className="text-xs text-gray-500">Add an extra layer of security</p>
                        </div>
                        <button className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors">
                            Enable
                        </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Delete Account</p>
                            <p className="text-xs text-gray-500">Permanently remove your account and data</p>
                        </div>
                        <button className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
