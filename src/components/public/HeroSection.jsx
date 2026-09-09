import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Download,
  Github,
  Linkedin,
  Mail,
  Twitter,
  Instagram,
  CheckCircle,
  FileText
} from 'lucide-react';

export const HeroSection = ({ profile, onOpenResume }) => {
  const phrases = profile?.typingPhrases?.length
    ? profile.typingPhrases
    : ['Full Stack Developer', 'Cloud Engineer', 'Problem Solver'];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(120);

  useEffect(() => {
    const handleTyping = () => {
      const fullPhrase = phrases[currentPhraseIndex];

      if (isDeleting) {
        setCurrentText(fullPhrase.substring(0, currentText.length - 1));
        setTypingSpeed(50);
      } else {
        setCurrentText(fullPhrase.substring(0, currentText.length + 1));
        setTypingSpeed(100);
      }

      if (!isDeleting && currentText === fullPhrase) {
        setTimeout(() => setIsDeleting(true), 1800);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        setTypingSpeed(250);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentPhraseIndex, phrases, typingSpeed]);

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Subtle clean background accent */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 dark:opacity-20 pointer-events-none">
        <div className="w-[500px] h-[500px] bg-brand-200/50 dark:bg-brand-900/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Left Text Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{profile?.statusBadge || 'Available for New Opportunities'}</span>
            </div>

            {/* Intro greeting */}
            <p className="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400 mb-2">
              Hello, I'm
            </p>

            {/* Name */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
              {profile?.name || 'Alex Morgan'}
            </h1>

            {/* Typing dynamic role */}
            <div className="h-10 sm:h-12 flex items-center justify-center lg:justify-start mb-5">
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-brand-600 to-sky-500 bg-clip-text text-transparent">
                {currentText}
              </span>
              <span className="inline-block w-0.5 h-7 sm:h-8 ml-1 bg-brand-500 animate-pulse" />
            </div>

            {/* Tagline / Intro Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              {profile?.tagline || 'I build modern and scalable web applications.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span>View Projects</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              {/* Automated PDF Resume button */}
              <button
                type="button"
                onClick={onOpenResume}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Download className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Download Resume (PDF)</span>
              </button>
            </div>

            {/* Social Media Links (Including Instagram) */}
            <div className="flex items-center justify-center lg:justify-start space-x-4 text-slate-500 dark:text-slate-400">
              {profile?.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
              {profile?.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {profile?.instagram && (
                <a
                  href={profile.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-lg hover:text-pink-600 dark:hover:text-pink-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {profile?.twitter && (
                <a
                  href={profile.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-lg hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="p-2.5 rounded-lg hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Right Profile Photo / Card */}
          <div className="flex-shrink-0 relative">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group">
              <img
                src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'}
                alt={profile?.name || 'Profile'}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=600';
                }}
              />
            </div>
            <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-brand-500/10 dark:bg-brand-400/10 rounded-2xl -z-10 blur-xl" />
          </div>

        </div>
      </div>
    </section>
  );
};
