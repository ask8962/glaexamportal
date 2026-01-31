import { ResumeFormData } from '@/types';

interface TemplateProps {
    data: ResumeFormData;
}

export default function ModernTemplate({ data }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects } = data;

    // Using inline styles for colors to avoid Tailwind V4 'lab' color issues with html2canvas
    const colors = {
        primary: '#4f46e5', // Indigo-600
        secondary: '#4338ca', // Indigo-700
        accent: '#eef2ff', // Indigo-50
        text: '#111827', // Gray-900
        textLight: '#4b5563', // Gray-600
        border: '#e5e7eb', // Gray-200
    };

    return (
        <div className="w-full h-full bg-white p-8 font-sans" style={{ color: colors.text }}>
            {/* Header */}
            <div className="border-b-4 pb-6 mb-6" style={{ borderColor: colors.primary }}>
                <h1 className="text-4xl font-bold uppercase tracking-wider mb-2" style={{ color: colors.text }}>{personalInfo.fullName}</h1>
                <div className="text-sm font-medium flex flex-wrap gap-4" style={{ color: colors.textLight }}>
                    {personalInfo.email && (
                        <div className="flex items-center gap-1">
                            <span>📧</span> {personalInfo.email}
                        </div>
                    )}
                    {personalInfo.phone && (
                        <div className="flex items-center gap-1">
                            <span>📱</span> {personalInfo.phone}
                        </div>
                    )}
                    {personalInfo.location && (
                        <div className="flex items-center gap-1">
                            <span>📍</span> {personalInfo.location}
                        </div>
                    )}
                    {personalInfo.linkedin && (
                        <div className="flex items-center gap-1">
                            <span>🔗</span> {personalInfo.linkedin}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary */}
            {personalInfo.summary && (
                <div className="mb-6">
                    <p className="leading-relaxed text-sm" style={{ color: '#374151' }}>{personalInfo.summary}</p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="col-span-2 space-y-6">
                    {/* Experience */}
                    {experience.length > 0 && (
                        <section>
                            <h3 className="text-lg font-bold uppercase tracking-wide border-b pb-1 mb-3" style={{ color: colors.secondary, borderColor: colors.border }}>Experience</h3>
                            <div className="space-y-4">
                                {experience.map(exp => (
                                    <div key={exp.id}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold" style={{ color: colors.text }}>{exp.position}</h4>
                                            <span className="text-xs font-medium whitespace-nowrap" style={{ color: colors.textLight }}>
                                                {exp.startDate} - {exp.endDate || 'Present'}
                                            </span>
                                        </div>
                                        <div className="text-sm font-semibold mb-2" style={{ color: colors.primary }}>{exp.company} | {exp.location}</div>
                                        <ul className="list-disc list-outside ml-4 space-y-1">
                                            {exp.bullets.map((bullet, i) => (
                                                bullet && <li key={i} className="text-xs leading-relaxed pl-1" style={{ color: '#374151' }}>{bullet}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                        <section>
                            <h3 className="text-lg font-bold uppercase tracking-wide border-b pb-1 mb-3" style={{ color: colors.secondary, borderColor: colors.border }}>Projects</h3>
                            <div className="space-y-4">
                                {projects.map(proj => (
                                    <div key={proj.id}>
                                        <h4 className="font-bold text-sm flex items-center gap-2" style={{ color: colors.text }}>
                                            {proj.name}
                                            {proj.link && <a href={proj.link} className="hover:underline text-xs" style={{ color: colors.primary }}>↗</a>}
                                        </h4>
                                        <p className="text-xs mt-1" style={{ color: '#374151' }}>{proj.description}</p>
                                        <div className="flex gap-2 mt-1">
                                            {proj.technologies.map(tech => (
                                                <span key={tech} className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}>{tech}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Education */}
                    {education.length > 0 && (
                        <section>
                            <h3 className="text-lg font-bold uppercase tracking-wide border-b pb-1 mb-3" style={{ color: colors.secondary, borderColor: colors.border }}>Education</h3>
                            <div className="space-y-4">
                                {education.map(edu => (
                                    <div key={edu.id}>
                                        <div className="font-bold text-sm" style={{ color: colors.text }}>{edu.institution}</div>
                                        <div className="text-xs font-medium mb-1" style={{ color: colors.primary }}>{edu.degree} in {edu.field}</div>
                                        <div className="text-xs" style={{ color: colors.textLight }}>{edu.startDate} - {edu.endDate}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                        <section>
                            <h3 className="text-lg font-bold uppercase tracking-wide border-b pb-1 mb-3" style={{ color: colors.secondary, borderColor: colors.border }}>Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                    <span key={skill} className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: colors.accent, color: colors.secondary }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
