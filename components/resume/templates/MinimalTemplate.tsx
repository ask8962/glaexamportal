import { ResumeFormData } from '@/types';

interface TemplateProps {
    data: ResumeFormData;
}

export default function MinimalTemplate({ data }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects } = data;

    return (
        <div className="w-full h-full bg-white text-gray-800 p-8 font-sans">
            <div className="flex gap-12">

                {/* Left Sidebar */}
                <div className="w-1/3 space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-light mb-4 text-gray-900 tracking-tight">{personalInfo.fullName}</h1>
                        <div className="text-xs text-gray-500 space-y-1.5 font-medium">
                            {personalInfo.email && <div className="block">{personalInfo.email}</div>}
                            {personalInfo.phone && <div className="block">{personalInfo.phone}</div>}
                            {personalInfo.location && <div className="block">{personalInfo.location}</div>}
                            {personalInfo.linkedin && <div className="block text-blue-600">{personalInfo.linkedin}</div>}
                        </div>
                    </div>

                    {/* Education */}
                    {education.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Education</h3>
                            <div className="space-y-4">
                                {education.map(edu => (
                                    <div key={edu.id}>
                                        <div className="font-semibold text-sm text-gray-900">{edu.institution}</div>
                                        <div className="text-xs text-gray-600 mb-1">{edu.degree}</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wide">{edu.startDate} - {edu.endDate}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Skills</h3>
                            <div className="flex flex-col gap-2">
                                {skills.map(skill => (
                                    <span key={skill} className="text-sm font-medium text-gray-700 pb-1 border-b border-gray-100">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="w-2/3 space-y-10 pt-2">
                    {/* Summary */}
                    {personalInfo.summary && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Profile</h3>
                            <p className="text-sm leading-7 text-gray-600 font-light">{personalInfo.summary}</p>
                        </div>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Experience</h3>
                            <div className="space-y-8 border-l border-gray-200 pl-6 ml-1">
                                {experience.map(exp => (
                                    <div key={exp.id} className="relative">
                                        <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full bg-gray-200 border-2 border-white"></div>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wide">{exp.startDate} - {exp.endDate}</span>
                                        </div>
                                        <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">{exp.company}</div>
                                        <ul className="space-y-1.5">
                                            {exp.bullets.map((bullet, i) => (
                                                bullet && <li key={i} className="text-sm text-gray-600 leading-relaxed font-light">{bullet}</li>
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
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Projects</h3>
                            <div className="grid grid-cols-1 gap-6">
                                {projects.map(proj => (
                                    <div key={proj.id}>
                                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{proj.name}</h4>
                                        <p className="text-sm text-gray-600 font-light mb-2">{proj.description}</p>
                                        <div className="flex gap-2">
                                            {proj.technologies.map(tech => (
                                                <span key={tech} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{tech}</span>
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
