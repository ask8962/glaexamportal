import { ResumeFormData } from '@/types';

interface TemplateProps {
    data: ResumeFormData;
}

export default function ClassicTemplate({ data }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects } = data;

    return (
        <div className="w-full h-full bg-white text-gray-900 p-10 font-serif">
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
                <h1 className="text-3xl font-bold uppercase tracking-widest mb-3">{personalInfo.fullName}</h1>
                <div className="text-sm text-gray-700 flex flex-wrap justify-center gap-4">
                    {personalInfo.email && <span>{personalInfo.email}</span>}
                    {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                    {personalInfo.location && <span>• {personalInfo.location}</span>}
                    {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
                </div>
            </div>

            {/* Summary */}
            {personalInfo.summary && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase border-b border-gray-400 mb-2 pb-1">Professional Summary</h3>
                    <p className="text-sm leading-relaxed text-justify">{personalInfo.summary}</p>
                </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase border-b border-gray-400 mb-3 pb-1">Experience</h3>
                    <div className="space-y-4">
                        {experience.map(exp => (
                            <div key={exp.id}>
                                <div className="flex justify-between font-bold text-sm">
                                    <span>{exp.company}, {exp.location}</span>
                                    <span>{exp.startDate} – {exp.endDate || 'Present'}</span>
                                </div>
                                <div className="text-sm italic mb-1">{exp.position}</div>
                                <ul className="list-disc ml-5 space-y-0.5">
                                    {exp.bullets.map((bullet, i) => (
                                        bullet && <li key={i} className="text-xs leading-relaxed">{bullet}</li>
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
                    <h3 className="text-sm font-bold uppercase border-b border-gray-400 mb-3 pb-1">Education</h3>
                    <div className="space-y-2">
                        {education.map(edu => (
                            <div key={edu.id} className="flex justify-between text-sm">
                                <div>
                                    <span className="font-bold">{edu.institution}</span>
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
                    <h3 className="text-sm font-bold uppercase border-b border-gray-400 mb-2 pb-1">Skills</h3>
                    <p className="text-sm leading-relaxed">
                        {skills.join(' • ')}
                    </p>
                </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold uppercase border-b border-gray-400 mb-3 pb-1">Projects</h3>
                    <div className="space-y-3">
                        {projects.map(proj => (
                            <div key={proj.id}>
                                <div className="text-sm font-bold mb-0.5">
                                    {proj.name}
                                    {proj.technologies.length > 0 && <span className="font-normal italic"> ({proj.technologies.join(', ')})</span>}
                                </div>
                                <p className="text-xs leading-relaxed">{proj.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
