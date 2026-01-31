import { ResumeFormData } from '@/types';

interface TemplateProps {
    data: ResumeFormData;
}

export default function ClassicTemplate({ data }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects } = data;

    // Hex colors for Classic template
    const colors = {
        text: '#111827', // Gray-900
        textLight: '#374151', // Gray-700
        border: '#1f2937', // Gray-800
        borderLight: '#9ca3af', // Gray-400
    };

    return (
        <div className="w-full h-full bg-white p-10 font-serif" style={{ color: colors.text }}>
            {/* Header */}
            <div className="text-center mb-8 border-b-2 pb-6" style={{ borderColor: colors.border }}>
                <h1 className="text-3xl font-bold uppercase tracking-widest mb-3" style={{ color: colors.text }}>{personalInfo.fullName}</h1>
                <div className="text-sm flex flex-wrap justify-center gap-4" style={{ color: colors.textLight }}>
                    {personalInfo.email && <span>{personalInfo.email}</span>}
                    {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                    {personalInfo.location && <span>• {personalInfo.location}</span>}
                    {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
                </div>
            </div>

            {/* Summary */}
            {personalInfo.summary && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase border-b mb-2 pb-1" style={{ borderColor: colors.borderLight, color: colors.text }}>Professional Summary</h3>
                    <p className="text-sm leading-relaxed text-justify" style={{ color: colors.textLight }}>{personalInfo.summary}</p>
                </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase border-b mb-3 pb-1" style={{ borderColor: colors.borderLight, color: colors.text }}>Experience</h3>
                    <div className="space-y-4">
                        {experience.map(exp => (
                            <div key={exp.id}>
                                <div className="flex justify-between font-bold text-sm" style={{ color: colors.text }}>
                                    <span>{exp.company}, {exp.location}</span>
                                    <span>{exp.startDate} – {exp.endDate || 'Present'}</span>
                                </div>
                                <div className="text-sm italic mb-1" style={{ color: colors.textLight }}>{exp.position}</div>
                                <ul className="list-disc ml-5 space-y-0.5">
                                    {exp.bullets.map((bullet, i) => (
                                        bullet && <li key={i} className="text-xs leading-relaxed" style={{ color: colors.textLight }}>{bullet}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {education.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase border-b mb-3 pb-1" style={{ borderColor: colors.borderLight, color: colors.text }}>Education</h3>
                    <div className="space-y-2">
                        {education.map(edu => (
                            <div key={edu.id} className="flex justify-between text-sm" style={{ color: colors.textLight }}>
                                <div>
                                    <span className="font-bold" style={{ color: colors.text }}>{edu.institution}</span>
                                    <span className="italic"> — {edu.degree} in {edu.field}</span>
                                </div>
                                <span className="text-right">{edu.startDate} – {edu.endDate}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase border-b mb-2 pb-1" style={{ borderColor: colors.borderLight, color: colors.text }}>Skills</h3>
                    <p className="text-sm leading-relaxed" style={{ color: colors.textLight }}>
                        {skills.join(' • ')}
                    </p>
                </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold uppercase border-b mb-3 pb-1" style={{ borderColor: colors.borderLight, color: colors.text }}>Projects</h3>
                    <div className="space-y-3">
                        {projects.map(proj => (
                            <div key={proj.id}>
                                <div className="text-sm font-bold mb-0.5" style={{ color: colors.text }}>
                                    {proj.name}
                                    {proj.technologies.length > 0 && <span className="font-normal italic" style={{ color: colors.textLight }}> ({proj.technologies.join(', ')})</span>}
                                </div>
                                <p className="text-xs leading-relaxed" style={{ color: colors.textLight }}>{proj.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
