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

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 animate-pulse">
        {/* Skeleton Navbar */}
        <header className="fixed top-0 left-0 right-0 h-16 border-b border-slate-100 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
            <div className="hidden md:flex gap-6">
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          </div>
        </header>

        {/* Skeleton Hero Section */}
        <section className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-4 w-full">
              <div className="h-6 w-44 bg-emerald-100 dark:bg-emerald-950/40 rounded-full"></div>
              <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              <div className="h-6 w-1/2 bg-brand-100 dark:bg-brand-950/40 rounded-lg"></div>
              <div className="h-20 w-full bg-slate-100 dark:bg-slate-900 rounded-xl"></div>
              <div className="flex gap-4 pt-2">
                <div className="h-11 w-36 bg-brand-500/20 rounded-xl"></div>
                <div className="h-11 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              </div>
            </div>
            <div className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
          </div>
        </section>

        {/* Skeleton Project Cards */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-md mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60"></div>
            ))}
          </div>
        </section>
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
