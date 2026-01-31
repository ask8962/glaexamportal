import { ResumeFormData } from '@/types';

interface TemplateProps {
    data: ResumeFormData;
}

export default function ModernTemplate({ data }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects } = data;

    // Hex colors
    const colors = {
        sidebarBg: '#1e293b', // Slate-800
        sidebarText: '#f8fafc', // Slate-50
        sidebarTextMuted: '#94a3b8', // Slate-400
        mainBg: '#ffffff',
        mainText: '#334155', // Slate-700
        headerText: '#0f172a', // Slate-900
        accent: '#3b82f6', // Blue-500
        border: '#e2e8f0', // Slate-200
    };

    return (
        <div className="w-full h-full flex font-sans" style={{ backgroundColor: colors.mainBg }}>
            {/* Left Sidebar */}
            <div className="w-1/3 min-h-full p-8 flex flex-col gap-8" style={{ backgroundColor: colors.sidebarBg, color: colors.sidebarText }}>
                {/* Profile Photo Placeholder (Optional) */}
                {/* <div className="w-32 h-32 mx-auto bg-gray-600 rounded-full mb-4"></div> */}

                {/* Contact Info */}
                <div className="space-y-4 text-sm">
                    <h3 className="uppercase tracking-widest text-xs font-bold border-b pb-2 mb-4" style={{ borderColor: '#334155', color: colors.sidebarTextMuted }}>Contact</h3>

                    {personalInfo.email && (
                        <div className="break-all">
                            <div className="text-xs mb-0.5" style={{ color: colors.sidebarTextMuted }}>Email</div>
                            <div>{personalInfo.email}</div>
                        </div>
                    )}

                    {personalInfo.phone && (
                        <div>
                            <div className="text-xs mb-0.5" style={{ color: colors.sidebarTextMuted }}>Phone</div>
                            <div>{personalInfo.phone}</div>
                        </div>
                    )}

                    {personalInfo.location && (
                        <div>
                            <div className="text-xs mb-0.5" style={{ color: colors.sidebarTextMuted }}>Location</div>
                            <div>{personalInfo.location}</div>
                        </div>
                    )}

                    {personalInfo.linkedin && (
                        <div className="break-all">
                            <div className="text-xs mb-0.5" style={{ color: colors.sidebarTextMuted }}>LinkedIn</div>
                            <div>{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</div>
                        </div>
                    )}
                </div>

                {/* Education (Moved to sidebar for modern look) */}
                {education.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="uppercase tracking-widest text-xs font-bold border-b pb-2 mb-4" style={{ borderColor: '#334155', color: colors.sidebarTextMuted }}>Education</h3>
                        {education.map(edu => (
                            <div key={edu.id}>
                                <div className="font-bold text-sm" style={{ color: colors.sidebarText }}>{edu.degree}</div>
                                <div className="text-xs mb-1" style={{ color: colors.sidebarTextMuted }}>{edu.institution}</div>
                                <div className="text-[10px] opacity-75">{edu.startDate} - {edu.endDate}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="uppercase tracking-widest text-xs font-bold border-b pb-2 mb-4" style={{ borderColor: '#334155', color: colors.sidebarTextMuted }}>Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map(skill => (
                                <span key={skill} className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#334155', color: colors.sidebarText }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="w-2/3 p-8 p-l-10 space-y-8" style={{ color: colors.mainText }}>
                {/* Header Name */}
                <div className="border-b pb-8" style={{ borderColor: colors.border }}>
                    <h1 className="text-4xl font-extrabold uppercase tracking-tight mb-2" style={{ color: colors.headerText }}>{personalInfo.fullName}</h1>
                    <p className="text-lg font-light tracking-wide text-blue-600" style={{ color: colors.accent }}>Resume</p>
                </div>

                {/* Profile Summary */}
                {personalInfo.summary && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3" style={{ color: colors.headerText }}>
                            <span className="w-8 h-1" style={{ backgroundColor: colors.accent }}></span>
                            Profile
                        </h2>
                        <p className="text-sm leading-relaxed text-justify opacity-90">
                            {personalInfo.summary}
                        </p>
                    </div>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3" style={{ color: colors.headerText }}>
                            <span className="w-8 h-1" style={{ backgroundColor: colors.accent }}></span>
                            Experience
                        </h2>
                        <div className="space-y-6">
                            {experience.map(exp => (
                                <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: '#f1f5f9' }}>
                                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.accent }}></div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900" style={{ color: colors.headerText }}>{exp.position}</h3>
                                        <span className="text-xs font-medium" style={{ color: '#64748b' }}>{exp.startDate} - {exp.endDate || 'Present'}</span>
                                    </div>
                                    <div className="text-sm font-semibold mb-2" style={{ color: colors.accent }}>{exp.company} | {exp.location}</div>
                                    <ul className="list-disc list-outside ml-4 space-y-1">
                                        {exp.bullets.map((bullet, i) => (
                                            bullet && <li key={i} className="text-xs leading-relaxed pl-1" style={{ color: colors.mainText }}>{bullet}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3" style={{ color: colors.headerText }}>
                            <span className="w-8 h-1" style={{ backgroundColor: colors.accent }}></span>
                            Projects & Hackathons
                        </h2>
                        <div className="grid grid-cols-1 gap-5">
                            {projects.map(proj => (
                                <div key={proj.id} className="p-4 rounded-lg border" style={{ backgroundColor: '#f8fafc', borderColor: colors.border }}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-sm" style={{ color: colors.headerText }}>{proj.name}</h3>
                                        {proj.link && (
                                            <a href={proj.link} className="text-[10px] px-2 py-1 rounded bg-white border shadow-sm no-underline" style={{ color: colors.accent, borderColor: colors.border }}>
                                                View Link ↗
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-xs mb-3 opacity-90 leading-relaxed">{proj.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {proj.technologies.map(tech => (
                                            <span key={tech} className="text-[10px] px-1.5 py-0.5 rounded border bg-white" style={{ borderColor: colors.border, color: '#64748b' }}>
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
