import React from 'react';
import { GraduationCap, Target, User, Calendar, Award } from 'lucide-react';

export const AboutSection = ({ profile, education }) => {
  return (
    <section id="about" className="py-20 md:py-28 bg-slate-50/60 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
            Background & Profile
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            About Me
          </h3>
          <div className="w-12 h-1 bg-brand-500 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Bio & Career Goals (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Bio Card */}
            <div className="p-7 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle hover:shadow-card transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                  <User className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  Professional Summary
                </h4>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                {profile?.bio ||
                  'Dedicated full-stack software engineer with a passion for designing reliable web architectures, clean user interfaces, and high-performance backend microservices.'}
              </p>
            </div>

            {/* Career Goals Card */}
            <div className="p-7 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle hover:shadow-card transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                  <Target className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  Career Goals & Interests
                </h4>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                {profile?.careerGoals ||
                  'Focused on scaling cloud-native distributed systems, deepening expertise in cloud infrastructure, and building developer-centric applications that solve impactful real-world challenges.'}
              </p>
            </div>

          </div>

          {/* Right Column: Education Timeline (5 cols) */}
          <div className="lg:col-span-5">
            <div className="p-7 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  Education & Academics
                </h4>
              </div>

              <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {(education || []).map((edu, idx) => (
                  <div key={edu.id || idx} className="relative pl-9 group">
                    {/* Timeline bullet */}
                    <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-brand-500 border-4 border-white dark:border-slate-900 shadow-sm group-hover:scale-125 transition-transform" />
                    
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{edu.year}</span>
                    </div>

                    <h5 className="text-base font-bold text-slate-900 dark:text-white">
                      {edu.degree}
                    </h5>
                    
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {edu.institution}
                    </p>
                    
                    {edu.department && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {edu.department}
                      </p>
                    )}

                    {edu.achievements && (
                      <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                        <Award className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{edu.achievements}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
