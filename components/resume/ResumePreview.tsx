'use client';

import { ResumeFormData } from '@/types';
import ModernTemplate from './templates/ModernTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef, useState } from 'react';
import { showToast } from '@/components/ui/Toast';

interface ResumePreviewProps {
    data: ResumeFormData;
}

export default function ResumePreview({ data }: ResumePreviewProps) {
    const resumeRef = useRef<HTMLDivElement>(null);
    const [generating, setGenerating] = useState(false);

    const downloadPDF = async () => {
        if (!resumeRef.current) return;
        setGenerating(true);

        try {
            const canvas = await html2canvas(resumeRef.current, {
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${data.personalInfo.fullName || 'resume'}.pdf`);
            showToast.success('Resume downloaded!');
        } catch (error) {
            console.error('PDF Generation Error:', error);
            showToast.error('Failed to generate PDF');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-[210mm]">
            {/* Actions Bar */}
            <div className="w-full flex justify-end">
                <button
                    onClick={downloadPDF}
                    disabled={generating}
                    className="px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-xl shadow-lg flex items-center gap-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {generating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download PDF
                        </>
                    )}
                </button>
            </div>

            {/* A4 Resume Container */}
            <div className="w-full bg-white shadow-2xl overflow-hidden relative" style={{ aspectRatio: '210/297' }}>
                <div ref={resumeRef} className="w-full h-full">
                    {data.template === 'modern' && <ModernTemplate data={data} />}
                    {data.template === 'classic' && <ClassicTemplate data={data} />}
                    {data.template === 'minimal' && <MinimalTemplate data={data} />}
                </div>
            </div>
        </div>
    );
}
