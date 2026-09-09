import React from 'react';
import { ArrowUp, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = ({ profile }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand / Copyright */}
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {profile?.name || 'Developer'} &copy; {new Date().getFullYear()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Built with React, Tailwind CSS & Firebase
            </p>
          </div>

          {/* Center / Right actions */}
          <div className="flex items-center gap-4">
            {/* Back to top */}
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/60 dark:border-slate-800 transition-colors"
              aria-label="Scroll back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            {/* Subtle Admin Entrance */}
            <Link
              to="/admin/login"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title="Admin Portal Access"
              aria-label="Admin Login"
            >
              <Lock className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
};
