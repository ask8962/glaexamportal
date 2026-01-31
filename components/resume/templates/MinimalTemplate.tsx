import { ResumeFormData } from '@/types';

interface TemplateProps {
    data: ResumeFormData;
}

export default function MinimalTemplate({ data }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects } = data;

    // Hex colors
    const colors = {
        black: '#000000',
        darkGray: '#333333',
        gray: '#666666',
        lightGray: '#e5e5e5',
        white: '#ffffff',
    };

    return (
        <div className="w-full h-full bg-white p-12 font-sans text-sm selection:bg-black selection:text-white">

            {/* Header Name Huge */}
            <div className="mb-16">
                <h1 className="text-6xl font-light tracking-tighter mb-4" style={{ color: colors.black, lineHeight: '0.9' }}>
                    {personalInfo.fullName.split(' ').map((name, i) => (
                        <span key={i} className="block">{name}</span>
                    ))}
                </h1>

                <div className="flex gap-6 text-xs uppercase tracking-widest mt-6" style={{ color: colors.gray }}>
                    {personalInfo.location && <span>{personalInfo.location}</span>}
                    {personalInfo.email && <span>{personalInfo.email}</span>}
                    {personalInfo.phone && <span>{personalInfo.phone}</span>}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">

                {/* Left Column (Labels) */}
                <div className="col-span-3 space-y-12 text-xs font-bold uppercase tracking-widest" style={{ color: colors.black }}>
                    {personalInfo.summary && <div>About</div>}
                    {experience.length > 0 && <div>Experience</div>}
                    {projects.length > 0 && <div>Projects</div>}
                    {education.length > 0 && <div>Education</div>}
                    {skills.length > 0 && <div>Expertise</div>}
                </div>

                {/* Right Column (Content) */}
                <div className="col-span-9 space-y-12">

                    {/* Summary */}
                    {personalInfo.summary && (
                        <div className="leading-relaxed opacity-80 text-base font-light" style={{ color: colors.darkGray }}>
                            {personalInfo.summary}
                        </div>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <div className="space-y-8">
                            {experience.map(exp => (
                                <div key={exp.id} className="grid grid-cols-1 gap-1">
                                    <div className="flex justify-between items-baseline border-b pb-2 mb-2" style={{ borderColor: colors.lightGray }}>
                                        <h3 className="font-bold text-base" style={{ color: colors.black }}>{exp.position}</h3>
                                        <span className="font-normal text-xs" style={{ color: colors.gray }}>{exp.startDate} — {exp.endDate || 'Present'}</span>
                                    </div>
                                    <div className="text-xs uppercase tracking-wide mb-2" style={{ color: colors.gray }}>{exp.company}, {exp.location}</div>
                                    <ul className="space-y-1">
                                        {exp.bullets.map((bullet, i) => (
                                            bullet && <li key={i} className="leading-6 opacity-80" style={{ color: colors.darkGray }}>{bullet}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                        <div className="space-y-6">
                            {projects.map(proj => (
                                <div key={proj.id}>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <h3 className="font-bold" style={{ color: colors.black }}>{proj.name}</h3>
                                        {proj.link && <span className="text-xs opacity-50">↗</span>}
                                    </div>
                                    <p className="opacity-80 leading-relaxed mb-2" style={{ color: colors.darkGray }}>{proj.description}</p>
                                    <div className="flex gap-2">
                                        {proj.technologies.map(tech => (
                                            <span key={tech} className="text-[10px] px-1.5 py-0.5 border rounded-full" style={{ borderColor: colors.lightGray, color: colors.gray }}>
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Education & Skills (Grid) */}
                    <div className="grid grid-cols-2 gap-8">
                        {education.length > 0 && (
                            <div className="space-y-4">
                                {education.map(edu => (
                                    <div key={edu.id}>
                                        <div className="font-bold" style={{ color: colors.black }}>{edu.institution}</div>
                                        <div className="opacity-80">{edu.degree}</div>
                                        <div className="text-xs mt-1 opacity-50">{edu.startDate} — {edu.endDate}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 content-start">
                                {skills.map(skill => (
                                    <span key={skill} className="text-xs font-medium border-b border-transparent hover:border-black transition-colors" style={{ color: colors.darkGray }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
