'use client';

import React, { useState } from 'react';
import { projectsData, ProjectItem } from '@/data/projects';
import { useLanguage } from '@/context/LanguageContext';
import { FolderGit2, ExternalLink, AlertCircle, Clock } from 'lucide-react';

export function ProjectsSection() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'live' | 'in-progress' | 'future-idea'>('live');

  const liveProjects = projectsData.filter((p) => p.status === 'live');
  const inProgressProjects = projectsData.filter((p) => p.status === 'in-progress');
  const futureIdeasProjects = projectsData.filter((p) => p.status === 'future-idea');

  const currentList: ProjectItem[] =
    activeTab === 'live'
      ? liveProjects
      : activeTab === 'in-progress'
      ? inProgressProjects
      : futureIdeasProjects;

  return (
    <section
      id="projects"
      aria-label="My Projects Section"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#1e293b]"
    >
      {/* Section Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0b0f17] border border-[#38e8ff]/30 text-[#38e8ff] font-mono text-xs uppercase tracking-widest mb-3">
          <FolderGit2 className="w-3.5 h-3.5 text-[#38e8ff]" />
          <span>{t.projects.sectionTag}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          {t.projects.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl font-normal">
          {t.projects.subtitle}
        </p>
      </div>

      {/* Grouping Tabs: Live / In Progress / Future Ideas */}
      <div className="flex items-center gap-3 mb-10 pb-4 border-b border-[#1e293b]">
        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-xs font-mono uppercase tracking-wider transition-all border cursor-pointer ${
            activeTab === 'live'
              ? 'bg-[#38e8ff]/10 border-[#38e8ff] text-[#38e8ff] shadow-[0_0_12px_rgba(56,232,255,0.2)]'
              : 'bg-[#0b0f17] border-[#1e293b] text-slate-400 hover:text-white'
          }`}
        >
          <span>{t.projects.tabs.live}</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-[#070a0f] border border-[#1e293b]">
            {liveProjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('in-progress')}
          className={`flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-xs font-mono uppercase tracking-wider transition-all border cursor-pointer ${
            activeTab === 'in-progress'
              ? 'bg-[#38e8ff]/10 border-[#38e8ff] text-[#38e8ff] shadow-[0_0_12px_rgba(56,232,255,0.2)]'
              : 'bg-[#0b0f17] border-[#1e293b] text-slate-400 hover:text-white'
          }`}
        >
          <span>{t.projects.tabs.inProgress}</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-[#070a0f] border border-[#1e293b]">
            {inProgressProjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('future-idea')}
          className={`flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-xs font-mono uppercase tracking-wider transition-all border cursor-pointer ${
            activeTab === 'future-idea'
              ? 'bg-[#38e8ff]/10 border-[#38e8ff] text-[#38e8ff] shadow-[0_0_12px_rgba(56,232,255,0.2)]'
              : 'bg-[#0b0f17] border-[#1e293b] text-slate-400 hover:text-white'
          }`}
        >
          <span>{t.projects.tabs.futureIdeas}</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-[#070a0f] border border-[#1e293b]">
            {futureIdeasProjects.length}
          </span>
        </button>
      </div>

      {/* Projects Grid or Honest Coming Soon State */}
      {currentList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentList.map((project) => (
            <div
              key={project.id}
              className="flex flex-col justify-between p-6 bg-[#0b0f17] border border-[#1e293b] hover:border-[#38e8ff]/50 transition-colors hud-frame"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#070a0f] border border-[#38e8ff]/30 text-[#38e8ff] text-[10px] font-mono uppercase">
                    {project.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{project.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {project.tagline}
                </p>
                {project.description && (
                  <p className="text-xs text-slate-400 font-sans">
                    {project.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.techTags.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-[#070a0f] border border-[#1e293b] text-[10px] font-mono text-slate-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {project.url && (
                <div className="pt-6 border-t border-[#1e293b] mt-4">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111723] hover:bg-[#38e8ff] hover:text-[#05070a] border border-[#1e293b] hover:border-[#38e8ff] text-xs font-mono uppercase tracking-wider transition-colors min-h-[44px]"
                  >
                    <span>{t.projects.visit}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Honest Coming Soon State (Per Master Spec Section 0 & 3) */
        <div className="p-8 sm:p-12 bg-[#0b0f17] border border-[#1e293b] text-center max-w-2xl mx-auto hud-frame">
          <div className="w-12 h-12 bg-[#070a0f] border border-[#ffb020]/40 flex items-center justify-center text-[#ffb020] mx-auto mb-4">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>

          <h3 className="text-lg font-bold text-white uppercase font-mono tracking-wider mb-2">
            Portfolio Curation in Progress
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto mb-6">
            {t.projects.pendingNotice}
          </p>

          <div className="p-4 bg-[#070a0f] border border-[#1e293b] text-[11px] font-mono text-slate-400 flex items-start gap-2.5 text-left">
            <AlertCircle className="w-4 h-4 text-[#38e8ff] shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold block mb-0.5">
                Honesty Protocol:
              </span>
              Per the master build specification, no fictitious projects, client statistics, or simulated ratings are fabricated. Real deployments will be listed directly from <code className="text-[#38e8ff]">data/projects.ts</code> as supplied by owner Aliya Khan.
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
