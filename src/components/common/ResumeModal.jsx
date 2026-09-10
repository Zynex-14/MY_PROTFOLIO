import React, { useRef, useState } from 'react';
import {
  Download,
  Printer,
  X,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Github,
  Linkedin,
  Instagram,
  FileText,
  Check,
  Sparkles
} from 'lucide-react';

export const ResumeModal = ({ isOpen, onClose, data }) => {
  const [downloading, setDownloading] = useState(false);
  const [resumeMode, setResumeMode] = useState('single'); // 'single' (1-page ATS) | 'twopage' (detailed CV)
  const singlePageRef = useRef(null);
  const page1Ref = useRef(null);
  const page2Ref = useRef(null);

  if (!isOpen || !data) return null;

  const { profile, education, skills, projects, certificates } = data;

  // Group skills by category
  const skillsByCategory = (skills || []).reduce((acc, s) => {
    const cat = s.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s.name);
    return acc;
  }, {});

  const handleDownloadPDF = async () => {
    setDownloading(true);

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm

      if (resumeMode === 'single') {
        // --- 1-PAGE ATS MODE: Capture single container and scale precisely to 1 page ---
        if (!singlePageRef.current) return;
        const element = singlePageRef.current;
        const canvas = await html2canvas(element, {
          scale: 2.5,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        // If height fits or slightly exceeds, scale cleanly to 297mm
        if (imgHeight <= pdfHeight) {
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
        } else {
          // Fit perfectly on one page without cutting off
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }
      } else {
        // --- 2-PAGE DETAILED MODE: Capture Page 1 then Page 2 with zero cross-page cuts ---
        if (page1Ref.current) {
          const canvas1 = await html2canvas(page1Ref.current, {
            scale: 2.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
          });
          const imgData1 = canvas1.toDataURL('image/jpeg', 0.98);
          pdf.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }

        if (page2Ref.current) {
          pdf.addPage();
          const canvas2 = await html2canvas(page2Ref.current, {
            scale: 2.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
          });
          const imgData2 = canvas2.toDataURL('image/jpeg', 0.98);
          pdf.addImage(imgData2, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }
      }

      const safeName = (profile?.name || 'Developer').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`${safeName}_Resume.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. You can also use the Print button to Save as PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Split projects for 2-page mode
  const halfProjects = Math.ceil((projects || []).length / 2);
  const page1Projects = (projects || []).slice(0, halfProjects);
  const page2Projects = (projects || []).slice(halfProjects);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[96vh] overflow-hidden">
        
        {/* Modal Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Professional Resume Studio
              </h3>
              <p className="text-[11px] text-slate-400">Auto-generated & formatted for ATS standard</p>
            </div>
          </div>

          {/* Mode Selector & Actions */}
          <div className="flex items-center gap-2">
            {/* Format Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setResumeMode('single')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  resumeMode === 'single'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                1-Page (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setResumeMode('twopage')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  resumeMode === 'twopage'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                2-Page Detailed
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              title="Print Resume"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container for Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center gap-8 bg-slate-200/70 dark:bg-slate-900/70">
          
          {/* ============================================================
              VIEW 1: SINGLE-PAGE ATS STANDARD (Cleanly fits everything)
             ============================================================ */}
          {resumeMode === 'single' ? (
            <div
              ref={singlePageRef}
              className="w-full max-w-[210mm] bg-white text-slate-900 shadow-xl px-8 py-7 font-sans leading-tight border border-slate-200 rounded-sm"
              style={{
                width: '210mm',
                minHeight: '297mm',
                maxHeight: '297mm',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-2.5 mb-3 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                    {profile?.name || 'Alex Morgan'}
                  </h1>
                  <p className="text-xs font-bold text-brand-700 tracking-wide uppercase">
                    {profile?.designation || 'Full Stack Software Engineer & Cloud Developer'}
                  </p>
                </div>

                {/* Contact meta row with Instagram */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3.5 gap-y-1 text-[10.5px] text-slate-700 mt-2 font-medium">
                  {profile?.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>{profile.email}</span>
                    </span>
                  )}
                  {profile?.whatsapp && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{profile.whatsapp}</span>
                    </span>
                  )}
                  {profile?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{profile.location}</span>
                    </span>
                  )}
                  {profile?.linkedin && (
                    <span className="flex items-center gap-1">
                      <Linkedin className="w-3 h-3 text-slate-500" />
                      <span>{profile.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>
                    </span>
                  )}
                  {profile?.github && (
                    <span className="flex items-center gap-1">
                      <Github className="w-3 h-3 text-slate-500" />
                      <span>{profile.github.replace(/^https?:\/\/(www\.)?/, '')}</span>
                    </span>
                  )}
                  {profile?.instagram && (
                    <span className="flex items-center gap-1">
                      <Instagram className="w-3 h-3 text-slate-500" />
                      <span>{profile.instagram.replace(/^https?:\/\/(www\.)?/, '')}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Professional Summary */}
              {profile?.bio && (
                <div className="mb-3">
                  <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                    Professional Summary
                  </h2>
                  <p className="text-[10px] text-slate-700 leading-snug text-justify">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Technical Skills */}
              {Object.keys(skillsByCategory).length > 0 && (
                <div className="mb-3">
                  <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                    Technical Skills & Competencies
                  </h2>
                  <div className="grid grid-cols-1 gap-0.5 text-[10px]">
                    {Object.entries(skillsByCategory).slice(0, 7).map(([category, skillList]) => (
                      <div key={category} className="flex">
                        <span className="font-bold text-slate-900 w-36 flex-shrink-0">
                          {category}:
                        </span>
                        <span className="text-slate-700 flex-1 truncate">
                          {skillList.join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Projects */}
              {(projects || []).length > 0 && (
                <div className="mb-3">
                  <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                    Featured Projects
                  </h2>
                  <div className="space-y-2">
                    {(projects || []).slice(0, 3).map((proj) => {
                      const techList = Array.isArray(proj.technologies)
                        ? proj.technologies.join(', ')
                        : proj.technologies || '';

                      return (
                        <div key={proj.id} className="text-[10px]">
                          <div className="flex items-baseline justify-between">
                            <span className="font-bold text-slate-900">
                              {proj.title}
                            </span>
                            {proj.date && (
                              <span className="text-[9.5px] text-slate-500 font-semibold">
                                {proj.date}
                              </span>
                            )}
                          </div>

                          {techList && (
                            <p className="text-[9.5px] font-semibold text-brand-700 mb-0.5">
                              Technologies: {techList}
                            </p>
                          )}

                          <p className="text-slate-700 leading-snug line-clamp-2">
                            {proj.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Education History */}
              {(education || []).length > 0 && (
                <div className="mb-3">
                  <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                    Education & Academics
                  </h2>
                  <div className="space-y-1.5">
                    {(education || []).map((edu) => {
                      const isSchool =
                        edu.educationType === 'school' ||
                        Boolean(edu.standard) ||
                        Boolean(edu.board) ||
                        (edu.degree && /10th|12th|class 10|class 11|class 12|school|matric|cbse|state board|icse|sslc|hsc/i.test(edu.degree));
                      const title = isSchool
                        ? edu.standard
                          ? `${edu.standard} (${edu.board || 'School'})`
                          : edu.degree || 'School Education'
                        : edu.degree;
                      const score = isSchool ? (edu.percentage || edu.score) : (edu.cgpa || edu.score);

                      return (
                        <div key={edu.id} className="text-[10px]">
                          <div className="flex items-baseline justify-between">
                            <span className="font-bold text-slate-900">
                              {title}
                            </span>
                            <span className="text-[9.5px] text-slate-500 font-semibold">
                              {edu.year}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-slate-700">
                            {edu.institution} {edu.department ? `— ${edu.department}` : edu.board ? `— ${edu.board}` : ''}
                            {score ? ` | ${isSchool ? 'Marks' : 'CGPA'}: ${score}` : ''}
                          </p>
                          {edu.achievements && (
                            <p className="text-[9px] text-slate-600 italic">
                              Honors: {edu.achievements}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Certifications & Credentials - FULLY VISIBLE ON PAGE 1 */}
              {(certificates || []).length > 0 && (
                <div>
                  <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
                    Certifications & Credentials
                  </h2>
                  <div className="space-y-1 text-[10px]">
                    {(certificates || []).map((cert) => (
                      <div key={cert.id} className="flex justify-between items-baseline">
                        <span className="text-slate-800">
                          <strong className="text-slate-900">{cert.title}</strong> — {cert.issuer}
                          {cert.credentialId ? ` (ID: ${cert.credentialId})` : ''}
                        </span>
                        {cert.issueDate && (
                          <span className="text-[9.5px] text-slate-500 font-semibold flex-shrink-0 ml-2">
                            {cert.issueDate}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* ============================================================
               VIEW 2: TWO-PAGE DETAILED CV (Page 1 & Page 2 cleanly split)
               ============================================================ */
            <div className="flex flex-col gap-6 items-center">
              
              {/* PAGE 1 */}
              <div
                ref={page1Ref}
                className="w-full max-w-[210mm] bg-white text-slate-900 shadow-xl p-10 font-sans leading-relaxed border border-slate-200 rounded-sm"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  maxHeight: '297mm',
                  boxSizing: 'border-box'
                }}
              >
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-3 mb-5">
                  <h1 className="text-3xl font-black tracking-tight text-slate-950 uppercase">
                    {profile?.name || 'Alex Morgan'}
                  </h1>
                  <p className="text-sm font-bold text-brand-700 tracking-wide uppercase mt-0.5">
                    {profile?.designation || 'Full Stack Software Engineer & Cloud Developer'}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-700 mt-3 font-medium">
                    {profile?.email && <span>Email: {profile.email}</span>}
                    {profile?.whatsapp && <span>Phone: {profile.whatsapp}</span>}
                    {profile?.location && <span>Location: {profile.location}</span>}
                    {profile?.linkedin && <span>LinkedIn: {profile.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                    {profile?.github && <span>GitHub: {profile.github.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                    {profile?.instagram && <span>Instagram: {profile.instagram.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                  </div>
                </div>

                {/* Professional Summary */}
                {profile?.bio && (
                  <div className="mb-5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                      Professional Summary
                    </h2>
                    <p className="text-xs text-slate-700 leading-relaxed text-justify">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Career Goals */}
                {profile?.careerGoals && (
                  <div className="mb-5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                      Career Focus & Goals
                    </h2>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {profile.careerGoals}
                    </p>
                  </div>
                )}

                {/* Technical Skills */}
                {Object.keys(skillsByCategory).length > 0 && (
                  <div className="mb-5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                      Technical Skills & Competencies
                    </h2>
                    <div className="space-y-1.5 text-[11px]">
                      {Object.entries(skillsByCategory).map(([category, skillList]) => (
                        <div key={category} className="flex">
                          <span className="font-bold text-slate-900 w-44 flex-shrink-0">
                            {category}:
                          </span>
                          <span className="text-slate-700 flex-1">
                            {skillList.join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Projects (Part 1) */}
                {page1Projects.length > 0 && (
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
                      Featured Engineering Projects
                    </h2>
                    <div className="space-y-3.5">
                      {page1Projects.map((proj) => (
                        <div key={proj.id} className="text-xs">
                          <div className="flex items-baseline justify-between font-bold text-slate-900">
                            <span>{proj.title}</span>
                            <span className="text-[11px] text-slate-500 font-normal">{proj.date}</span>
                          </div>
                          <p className="text-[10.5px] font-semibold text-brand-700">
                            Technologies: {(Array.isArray(proj.technologies) ? proj.technologies : []).join(', ')}
                          </p>
                          <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 text-right text-[10px] text-slate-400">
                  Page 1 of 2
                </div>
              </div>

              {/* PAGE 2 */}
              <div
                ref={page2Ref}
                className="w-full max-w-[210mm] bg-white text-slate-900 shadow-xl p-10 font-sans leading-relaxed border border-slate-200 rounded-sm"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  maxHeight: '297mm',
                  boxSizing: 'border-box'
                }}
              >
                {/* Page 2 Mini Header */}
                <div className="border-b border-slate-300 pb-2 mb-5 flex justify-between items-center text-xs text-slate-500">
                  <span className="font-bold text-slate-800">{profile?.name} &bull; Resume</span>
                  <span>Page 2 of 2</span>
                </div>

                {/* Remaining Projects */}
                {page2Projects.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
                      Additional Software Projects
                    </h2>
                    <div className="space-y-3.5">
                      {page2Projects.map((proj) => (
                        <div key={proj.id} className="text-xs">
                          <div className="flex items-baseline justify-between font-bold text-slate-900">
                            <span>{proj.title}</span>
                            <span className="text-[11px] text-slate-500 font-normal">{proj.date}</span>
                          </div>
                          <p className="text-[10.5px] font-semibold text-brand-700">
                            Technologies: {(Array.isArray(proj.technologies) ? proj.technologies : []).join(', ')}
                          </p>
                          <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {(education || []).length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
                      Education & Academic Background
                    </h2>
                    <div className="space-y-3">
                      {(education || []).map((edu) => {
                        const isSchool =
                          edu.educationType === 'school' ||
                          Boolean(edu.standard) ||
                          Boolean(edu.board) ||
                          (edu.degree && /10th|12th|class 10|class 11|class 12|school|matric|cbse|state board|icse|sslc|hsc/i.test(edu.degree));
                        const title = isSchool
                          ? edu.standard
                            ? `${edu.standard} (${edu.board || 'School'})`
                            : edu.degree || 'School Education'
                          : edu.degree;
                        const score = isSchool ? (edu.percentage || edu.score) : (edu.cgpa || edu.score);

                        return (
                          <div key={edu.id} className="text-xs">
                            <div className="flex items-baseline justify-between font-bold text-slate-900">
                              <span>{title}</span>
                              <span className="text-[11px] text-slate-500 font-normal">{edu.year}</span>
                            </div>
                            <p className="text-[11px] text-slate-700">
                              {edu.institution} {edu.department ? `• ${edu.department}` : edu.board ? `• ${edu.board}` : ''}
                              {score ? ` | ${isSchool ? 'Marks' : 'CGPA'}: ${score}` : ''}
                            </p>
                            {edu.achievements && (
                              <p className="text-[10.5px] text-slate-600 mt-0.5 italic">Honors: {edu.achievements}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Certifications & Qualifications */}
                {(certificates || []).length > 0 && (
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
                      Certifications & Professional Credentials
                    </h2>
                    <div className="space-y-2 text-xs">
                      {(certificates || []).map((cert) => (
                        <div key={cert.id} className="flex justify-between items-baseline">
                          <span className="text-slate-800">
                            <strong className="text-slate-900">{cert.title}</strong> &mdash; {cert.issuer}
                            {cert.credentialId ? ` (Credential ID: ${cert.credentialId})` : ''}
                          </span>
                          {cert.issueDate && (
                            <span className="text-[10.5px] text-slate-500 font-semibold ml-2">
                              {cert.issueDate}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
