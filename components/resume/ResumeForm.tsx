'use client';

import { ResumeFormData, ResumeEducation, ResumeExperience, ResumeProject } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

interface ResumeFormProps {
    data: ResumeFormData;
    onChange: (data: ResumeFormData) => void;
}

export default function ResumeForm({ data, onChange }: ResumeFormProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [activeSection, setActiveSection] = useState<string>('personal');

    const updatePersonalInfo = (field: string, value: string) => {
        onChange({
            ...data,
            personalInfo: { ...data.personalInfo, [field]: value }
        });
    };

    const addEducation = () => {
        const newEdu: ResumeEducation = {
            id: Date.now().toString(),
            institution: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
        };
        onChange({ ...data, education: [...data.education, newEdu] });
    };

    const updateEducation = (id: string, field: keyof ResumeEducation, value: any) => {
        onChange({
            ...data,
            education: data.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
        });
    };

    const removeEducation = (id: string) => {
        onChange({ ...data, education: data.education.filter(edu => edu.id !== id) });
    };

    const addExperience = () => {
        const newExp: ResumeExperience = {
            id: Date.now().toString(),
            company: '',
            position: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            bullets: [''],
        };
        onChange({ ...data, experience: [...data.experience, newExp] });
    };

    const updateExperience = (id: string, field: keyof ResumeExperience, value: any) => {
        onChange({
            ...data,
            experience: data.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
        });
    };

    const removeExperience = (id: string) => {
        onChange({ ...data, experience: data.experience.filter(exp => exp.id !== id) });
    };

    const handleSkillInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = e.currentTarget.value.trim();
            if (val && !data.skills.includes(val)) {
                onChange({ ...data, skills: [...data.skills, val] });
            }
            e.currentTarget.value = '';
        }
    };

    const removeSkill = (skill: string) => {
        onChange({ ...data, skills: data.skills.filter(s => s !== skill) });
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Template Selection */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Choose Template</h3>
                <div className="grid grid-cols-3 gap-4">
                    {['modern', 'classic', 'minimal'].map(t => (
                        <button
                            key={t}
                            onClick={() => onChange({ ...data, template: t as any })}
                            className={`p-3 rounded-xl border-2 transition-all text-sm font-medium capitalize ${data.template === t
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                    : isDark ? 'border-gray-700 hover:border-gray-600 text-gray-400' : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Personal Info */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Personal Information</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Full Name</label>
                            <input
                                type="text"
                                value={data.personalInfo.fullName}
                                onChange={e => updatePersonalInfo('fullName', e.target.value)}
                                className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Email</label>
                            <input
                                type="email"
                                value={data.personalInfo.email}
                                onChange={e => updatePersonalInfo('email', e.target.value)}
                                className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Phone</label>
                            <input
                                type="text"
                                value={data.personalInfo.phone}
                                onChange={e => updatePersonalInfo('phone', e.target.value)}
                                className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Location</label>
                            <input
                                type="text"
                                value={data.personalInfo.location}
                                onChange={e => updatePersonalInfo('location', e.target.value)}
                                placeholder="City, Country"
                                className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">LinkedIn (Optional)</label>
                            <input
                                type="text"
                                value={data.personalInfo.linkedin || ''}
                                onChange={e => updatePersonalInfo('linkedin', e.target.value)}
                                className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Portfolio/Website (Optional)</label>
                            <input
                                type="text"
                                value={data.personalInfo.portfolio || ''}
                                onChange={e => updatePersonalInfo('portfolio', e.target.value)}
                                className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Professional Summary</label>
                        <textarea
                            rows={4}
                            value={data.personalInfo.summary}
                            onChange={e => updatePersonalInfo('summary', e.target.value)}
                            className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                            placeholder="Briefly describe your professional background and goals..."
                        />
                    </div>
                </div>
            </div>

            {/* Experience */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Work Experience</h3>
                    <button onClick={addExperience} className="text-sm text-indigo-500 font-medium hover:underline">+ Add Position</button>
                </div>
                <div className="space-y-6">
                    {data.experience.map((exp, index) => (
                        <div key={exp.id} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-end mb-2">
                                <button onClick={() => removeExperience(exp.id)} className="text-red-500 hover:text-red-600 text-sm">Remove</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Company Name"
                                    value={exp.company}
                                    onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                                    className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                                />
                                <input
                                    type="text"
                                    placeholder="Job Title"
                                    value={exp.position}
                                    onChange={e => updateExperience(exp.id, 'position', e.target.value)}
                                    className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Start Date (e.g., Jan 2023)"
                                    value={exp.startDate}
                                    onChange={e => updateExperience(exp.id, 'startDate', e.target.value)}
                                    className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                                />
                                <input
                                    type="text"
                                    placeholder="End Date (or Present)"
                                    value={exp.endDate}
                                    onChange={e => updateExperience(exp.id, 'endDate', e.target.value)}
                                    className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                                />
                            </div>
                            <textarea
                                rows={3}
                                placeholder="Description / Key Achievements (Bullet points)"
                                value={exp.bullets[0]}
                                onChange={e => updateExperience(exp.id, 'bullets', [e.target.value])}
                                className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Education */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Education</h3>
                    <button onClick={addEducation} className="text-sm text-indigo-500 font-medium hover:underline">+ Add Education</button>
                </div>
                <div className="space-y-6">
                    {data.education.map((edu, index) => (
                        <div key={edu.id} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-end mb-2">
                                <button onClick={() => removeEducation(edu.id)} className="text-red-500 hover:text-red-600 text-sm">Remove</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Institution / University"
                                    value={edu.institution}
                                    onChange={e => updateEducation(edu.id, 'institution', e.target.value)}
                                    className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Degree"
                                        value={edu.degree}
                                        onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
                                        className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Field of Study"
                                        value={edu.field}
                                        onChange={e => updateEducation(edu.id, 'field', e.target.value)}
                                        className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Start Year"
                                    value={edu.startDate}
                                    onChange={e => updateEducation(edu.id, 'startDate', e.target.value)}
                                    className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                                />
                                <input
                                    type="text"
                                    placeholder="End Year"
                                    value={edu.endDate}
                                    onChange={e => updateEducation(edu.id, 'endDate', e.target.value)}
                                    className={`w-full p-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Skills</h3>
                <input
                    type="text"
                    placeholder="Type a skill and press Enter (e.g., React, Node.js)"
                    onKeyDown={handleSkillInput}
                    className={`w-full p-2 rounded-lg border mb-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                />
                <div className="flex flex-wrap gap-2">
                    {data.skills.map(skill => (
                        <span key={skill} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-medium flex items-center gap-2">
                            {skill}
                            <button onClick={() => removeSkill(skill)} className="hover:text-red-500">×</button>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
