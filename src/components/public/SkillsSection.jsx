import React, { useState, useMemo } from 'react';
import {
  Code,
  Cpu,
  Box,
  Layers,
  Layout,
  Palette,
  Server,
  Flame,
  Database,
  GitBranch,
  Cloud,
  Check,
  Smartphone,
  Shield,
  Brain,
  Wrench
} from 'lucide-react';

// Icon resolver helper
const getSkillIcon = (name = '', category = '') => {
  const lowerName = name.toLowerCase();
  const lowerCat = category.toLowerCase();

  if (lowerCat.includes('mobile') || lowerName.includes('flutter') || lowerName.includes('react native') || lowerName.includes('android') || lowerName.includes('ios')) {
    return <Smartphone className="w-5 h-5 text-indigo-500" />;
  }
  if (lowerCat.includes('ai') || lowerCat.includes('machine') || lowerName.includes('pytorch') || lowerName.includes('tensor') || lowerName.includes('ai')) {
    return <Brain className="w-5 h-5 text-purple-500" />;
  }
  if (lowerCat.includes('design') || lowerCat.includes('ui') || lowerName.includes('figma')) {
    return <Palette className="w-5 h-5 text-pink-500" />;
  }
  if (lowerCat.includes('cloud') || lowerCat.includes('devops') || lowerName.includes('docker') || lowerName.includes('aws') || lowerName.includes('kubernetes')) {
    return <Cloud className="w-5 h-5 text-sky-500" />;
  }
  if (lowerCat.includes('database') || lowerName.includes('mongo') || lowerName.includes('sql') || lowerName.includes('postgres') || lowerName.includes('redis')) {
    return <Database className="w-5 h-5 text-blue-500" />;
  }
  if (lowerCat.includes('backend') || lowerName.includes('node') || lowerName.includes('express') || lowerName.includes('spring') || lowerName.includes('django')) {
    return <Server className="w-5 h-5 text-emerald-500" />;
  }
  if (lowerCat.includes('frontend') || lowerName.includes('react') || lowerName.includes('vue') || lowerName.includes('angular') || lowerName.includes('next')) {
    return <Layers className="w-5 h-5 text-cyan-500" />;
  }
  if (lowerCat.includes('core') || lowerName.includes('algo') || lowerName.includes('structure')) {
    return <Cpu className="w-5 h-5 text-amber-500" />;
  }
  if (lowerName.includes('object') || lowerName.includes('oop')) {
    return <Box className="w-5 h-5 text-violet-500" />;
  }
  if (lowerName.includes('git') || lowerCat.includes('tools')) {
    return <GitBranch className="w-5 h-5 text-rose-500" />;
  }
  if (lowerName.includes('html') || lowerName.includes('css')) {
    return <Layout className="w-5 h-5 text-orange-500" />;
  }
  if (lowerCat.includes('language') || lowerName.includes('java') || lowerName.includes('script') || lowerName.includes('python') || lowerName.includes('c++') || lowerName.includes('go')) {
    return <Code className="w-5 h-5 text-brand-500" />;
  }
  return <Check className="w-5 h-5 text-brand-500" />;
};

export const SkillsSection = ({ skills }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(['All']);
    (skills || []).forEach(s => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [skills]);

  // Filter skills
  const filteredSkills = useMemo(() => {
    if (activeCategory === 'All') return skills || [];
    return (skills || []).filter(s => s.category === activeCategory);
  }, [skills, activeCategory]);

  return (
    <section id="skills" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
            Technical Proficiency
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Skills & Competencies
          </h3>
          <div className="w-12 h-1 bg-brand-500 mx-auto mt-4 rounded-full" />
          <p className="text-slate-600 dark:text-slate-300 mt-4 text-base">
            Technical competencies, engineering frameworks, and architectural proficiencies categorized for clarity.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredSkills.map((skill) => {
            const level = skill.level || 85;
            return (
              <div
                key={skill.id}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle hover:shadow-card transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform flex-shrink-0">
                      {getSkillIcon(skill.name, skill.category)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                        {skill.name}
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block truncate">
                        {skill.category || 'General'}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex-shrink-0">
                    {level}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-sky-400 transition-all duration-700 ease-out"
                    style={{ width: `${level}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {filteredSkills.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            No skills found in this category.
          </div>
        )}

      </div>
    </section>
  );
};
