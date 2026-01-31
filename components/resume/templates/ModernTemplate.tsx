import { ResumeFormData } from '@/types';

interface TemplateProps {
    data: ResumeFormData;
}

export default function ModernTemplate({ data }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects } = data;

    return (
        <div className="w-full h-full bg-white text-gray-800 p-8 font-sans">
            {/* Header */}
            <div className="border-b-4 border-indigo-600 pb-6 mb-6">
                <h1 className="text-4xl font-bold uppercase tracking-wider text-gray-900 mb-2">{personalInfo.fullName}</h1>
                <div className="text-sm font-medium text-gray-600 flex flex-wrap gap-4">
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
                    <p className="text-gray-700 leading-relaxed text-sm">{personalInfo.summary}</p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="col-span-2 space-y-6">
                    {/* Experience */}
                    {experience.length > 0 && (
                        <section>
                            <h3 className="text-lg font-bold uppercase tracking-wide border-b border-gray-200 pb-1 mb-3 text-indigo-700">Experience</h3>
                            <div className="space-y-4">
                                {experience.map(exp => (
                                    <div key={exp.id}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-gray-900">{exp.position}</h4>
                                            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                                                {exp.startDate} - {exp.endDate || 'Present'}
                                            </span>
                                        </div>
                                        <div className="text-sm font-semibold text-indigo-600 mb-2">{exp.company} | {exp.location}</div>
                                        <ul className="list-disc list-outside ml-4 space-y-1">
                                            {exp.bullets.map((bullet, i) => (
                                                bullet && <li key={i} className="text-xs text-gray-700 leading-relaxed pl-1">{bullet}</li>
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
                            <h3 className="text-lg font-bold uppercase tracking-wide border-b border-gray-200 pb-1 mb-3 text-indigo-700">Projects</h3>
                            <div className="space-y-4">
                                {projects.map(proj => (
                                    <div key={proj.id}>
                                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                            {proj.name}
                                            {proj.link && <a href={proj.link} className="text-indigo-500 hover:underline text-xs">↗</a>}
                                        </h4>
                                        <p className="text-xs text-gray-700 mt-1">{proj.description}</p>
                                        <div className="flex gap-2 mt-1">
                                            {proj.technologies.map(tech => (
                                                <span key={tech} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{tech}</span>
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
                            <h3 className="text-lg font-bold uppercase tracking-wide border-b border-gray-200 pb-1 mb-3 text-indigo-700">Education</h3>
                            <div className="space-y-4">
                                {education.map(edu => (
                                    <div key={edu.id}>
                                        <div className="font-bold text-gray-900 text-sm">{edu.institution}</div>
                                        <div className="text-xs text-indigo-600 font-medium mb-1">{edu.degree} in {edu.field}</div>
                                        <div className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                        <section>
                            <h3 className="text-lg font-bold uppercase tracking-wide border-b border-gray-200 pb-1 mb-3 text-indigo-700">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                    <span key={skill} className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
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
