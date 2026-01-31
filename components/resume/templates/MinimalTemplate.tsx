import { ResumeFormData } from '@/types';

interface TemplateProps {
    data: ResumeFormData;
}

export default function MinimalTemplate({ data }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects } = data;

    // Hex colors for Minimal template
    const colors = {
        text: '#111827', // Gray-900
        textLight: '#4b5563', // Gray-600
        textLighter: '#9ca3af', // Gray-400
        border: '#e5e7eb', // Gray-200
        accent: '#2563eb', // Blue-600
    };

    return (
        <div className="w-full h-full bg-white p-8 font-sans" style={{ color: colors.text }}>
            {/* Header */}
            <div>
                <h1 className="text-3xl font-light mb-4 tracking-tight" style={{ color: colors.text }}>{personalInfo.fullName}</h1>
                <div className="text-xs space-y-1.5 font-medium" style={{ color: colors.textLight }}>
                    {personalInfo.email && <div className="block">{personalInfo.email}</div>}
                    {personalInfo.phone && <div className="block">{personalInfo.phone}</div>}
                    {personalInfo.location && <div className="block">{personalInfo.location}</div>}
                    {personalInfo.linkedin && <div className="block" style={{ color: colors.accent }}>{personalInfo.linkedin}</div>}
                </div>
            </div>

            <div className="flex gap-12 mt-8">
                {/* Left Sidebar */}
                <div className="w-1/3 space-y-8">
                    {/* Education */}
                    {education.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: colors.textLighter }}>Education</h3>
                            <div className="space-y-4">
                                {education.map(edu => (
                                    <div key={edu.id}>
                                        <div className="font-semibold text-sm" style={{ color: colors.text }}>{edu.institution}</div>
                                        <div className="text-xs mb-1" style={{ color: colors.textLight }}>{edu.degree}</div>
                                        <div className="text-[10px] uppercase tracking-wide" style={{ color: colors.textLighter }}>{edu.startDate} - {edu.endDate}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: colors.textLighter }}>Skills</h3>
                            <div className="flex flex-col gap-2">
                                {skills.map(skill => (
                                    <span key={skill} className="text-sm font-medium pb-1 border-b" style={{ color: colors.textLight, borderColor: '#f3f4f6' }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="w-2/3 space-y-10">
                    {/* Summary */}
                    {personalInfo.summary && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: colors.textLighter }}>Profile</h3>
                            <p className="text-sm leading-7 font-light" style={{ color: colors.textLight }}>{personalInfo.summary}</p>
                        </div>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: colors.textLighter }}>Experience</h3>
                            <div className="space-y-8 border-l pl-6 ml-1" style={{ borderColor: colors.border }}>
                                {experience.map(exp => (
                                    <div key={exp.id} className="relative">
                                        <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: colors.border }}></div>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-semibold" style={{ color: colors.text }}>{exp.position}</h4>
                                            <span className="text-[10px] uppercase tracking-wide" style={{ color: colors.textLighter }}>{exp.startDate} - {exp.endDate}</span>
                                        </div>
                                        <div className="text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: colors.textLight }}>{exp.company}</div>
                                        <ul className="space-y-1.5">
                                            {exp.bullets.map((bullet, i) => (
                                                bullet && <li key={i} className="text-sm leading-relaxed font-light" style={{ color: colors.textLight }}>{bullet}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: colors.textLighter }}>Projects</h3>
                            <div className="grid grid-cols-1 gap-6">
                                {projects.map(proj => (
                                    <div key={proj.id}>
                                        <h4 className="font-semibold text-sm mb-1" style={{ color: colors.text }}>{proj.name}</h4>
                                        <p className="text-sm font-light mb-2" style={{ color: colors.textLight }}>{proj.description}</p>
                                        <div className="flex gap-2">
                                            {proj.technologies.map(tech => (
                                                <span key={tech} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#f3f4f6', color: colors.textLight }}>{tech}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
