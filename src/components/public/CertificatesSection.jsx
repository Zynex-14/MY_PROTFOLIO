import React from 'react';
import { Award, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';

export const CertificatesSection = ({ certificates }) => {
  return (
    <section id="certificates" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
            Credentials & Honors
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Professional Certifications
          </h3>
          <div className="w-12 h-1 bg-brand-500 mx-auto mt-4 rounded-full" />
          <p className="text-slate-600 dark:text-slate-300 mt-4 text-base">
            Verified industry certifications, specializations, and professional qualifications.
          </p>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(certificates || []).map((cert) => (
            <div
              key={cert.id}
              className="flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle hover:shadow-card transition-all group"
            >
              {/* Certificate Image / Header Graphic */}
              <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={cert.imageUrl || 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&q=80&w=600'}
                  alt={cert.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&q=80&w=600';
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span className="p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 text-brand-600 dark:text-brand-400 backdrop-blur-md shadow-sm flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {cert.title}
                  </h4>

                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    {cert.issuer}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-5">
                    {cert.issueDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Issued: {cert.issueDate}</span>
                      </div>
                    )}
                    {cert.credentialId && (
                      <div className="font-mono bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                        ID: {cert.credentialId}
                      </div>
                    )}
                  </div>
                </div>

                {/* Link / Verification */}
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 dark:bg-slate-800 dark:hover:bg-brand-950 dark:hover:text-brand-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {(certificates || []).length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            No certificates added yet.
          </div>
        )}

      </div>
    </section>
  );
};
