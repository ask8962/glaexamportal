import { ResumeFormData } from '@/types';

interface TemplateProps {
    data: ResumeFormData;
}

export default function ClassicTemplate({ data }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects } = data;

    // Hex colors
    const colors = {
        text: '#000000',
        textLight: '#444444',
        border: '#000000',
        borderLight: '#cccccc',
    };

    return (
        <div className="w-full h-full bg-white px-12 py-12 font-serif" style={{ color: colors.text }}>

            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>{personalInfo.fullName}</h1>
                <div className="flex justify-center flex-wrap gap-4 text-sm" style={{ color: colors.textLight }}>
                    {personalInfo.location && <span>{personalInfo.location}</span>}
                    {personalInfo.phone && <span style={{ borderLeft: '1px solid #ccc', paddingLeft: '16px' }}>{personalInfo.phone}</span>}
                    {personalInfo.email && <span style={{ borderLeft: '1px solid #ccc', paddingLeft: '16px' }}>{personalInfo.email}</span>}
                    {personalInfo.linkedin && <span style={{ borderLeft: '1px solid #ccc', paddingLeft: '16px' }}>LinkedIn</span>}
                </div>
            </div>

            {/* Separator */}
            <div className="w-full h-px mb-8" style={{ backgroundColor: colors.text }}></div>

            {/* Summary */}
            {personalInfo.summary && (
                <div className="mb-8">
                    <h3 className="font-bold text-sm uppercase tracking-widest mb-3 border-b pb-1 inline-block" style={{ borderBottomColor: colors.text }}>Professional Profile</h3>
                    <p className="text-sm leading-relaxed text-justify opacity-90">{personalInfo.summary}</p>
                </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <div className="mb-8">
                    <h3 className="font-bold text-sm uppercase tracking-widest mb-4 border-b pb-1 inline-block" style={{ borderBottomColor: colors.text }}>Experience</h3>
                    <div className="space-y-6">
                        {experience.map(exp => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-base">{exp.company}</h4>
                                    <span className="text-sm italic" style={{ color: colors.textLight }}>{exp.startDate} – {exp.endDate || 'Present'}</span>
                                </div>
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="italic font-medium">{exp.position}</span>
                                    <span className="text-xs" style={{ color: colors.textLight }}>{exp.location}</span>
                                </div>
                                <ul className="list-disc ml-4 space-y-1">
                                    {exp.bullets.map((bullet, i) => (
                                        bullet && <li key={i} className="text-sm leading-relaxed pl-1 opacity-90">{bullet}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
                <div className="mb-8">
                    <h3 className="font-bold text-sm uppercase tracking-widest mb-4 border-b pb-1 inline-block" style={{ borderBottomColor: colors.text }}>Key Projects</h3>
                    <div className="space-y-4">
                        {projects.map(proj => (
                            <div key={proj.id}>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <h4 className="font-bold text-sm">{proj.name}</h4>
                                    {proj.technologies.length > 0 && (
                                        <span className="text-xs italic" style={{ color: colors.textLight }}> — {proj.technologies.join(', ')}</span>
                                    )}
                                </div>
                                <div className="text-sm opacity-90 leading-relaxed">{proj.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-8">
                {/* Education */}
                {education.length > 0 && (
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-widest mb-4 border-b pb-1 inline-block" style={{ borderBottomColor: colors.text }}>Education</h3>
                        <div className="space-y-4">
                            {education.map(edu => (
                                <div key={edu.id}>
                                    <div className="font-bold text-sm">{edu.degree}</div>
                                    <div className="text-sm italic">{edu.institution}</div>
                                    <div className="text-xs mt-1" style={{ color: colors.textLight }}>{edu.startDate} – {edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-widest mb-4 border-b pb-1 inline-block" style={{ borderBottomColor: colors.text }}>Skills</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {skills.map(skill => (
                                <span key={skill} className="text-sm border-b border-dotted pb-0.5" style={{ borderColor: '#999' }}>{skill}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
