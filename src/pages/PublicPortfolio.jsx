import React, { useState, useEffect } from 'react';
import { portfolioService } from '../services/portfolioService';
import { Navbar } from '../components/public/Navbar';
import { HeroSection } from '../components/public/HeroSection';
import { AboutSection } from '../components/public/AboutSection';
import { SkillsSection } from '../components/public/SkillsSection';
import { ProjectsSection } from '../components/public/ProjectsSection';
import { CertificatesSection } from '../components/public/CertificatesSection';
import { ContactSection } from '../components/public/ContactSection';
import { Footer } from '../components/public/Footer';
import { ResumeModal } from '../components/common/ResumeModal';
import { Loader2 } from 'lucide-react';

export const PublicPortfolio = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  const loadData = async () => {
    try {
      const result = await portfolioService.getAllData();
      setData(result);
    } catch (err) {
      console.error('Error loading portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('portfolio-data-updated', handleUpdate);
    return () => window.removeEventListener('portfolio-data-updated', handleUpdate);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading portfolio...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-brand-500 selection:text-white">
      <Navbar profile={data?.profile} onOpenResume={() => setIsResumeOpen(true)} />
      
      <main className="flex-grow">
        <HeroSection profile={data?.profile} onOpenResume={() => setIsResumeOpen(true)} />
        <AboutSection profile={data?.profile} education={data?.education} />
        <SkillsSection skills={data?.skills} />
        <ProjectsSection projects={data?.projects} />
        <CertificatesSection certificates={data?.certificates} />
        <ContactSection profile={data?.profile} />
      </main>

      <Footer profile={data?.profile} />

      {/* Automated Resume PDF Preview & Download Modal */}
      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        data={data}
      />
    </div>
  );
};
